import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  assertCanSubmit,
  createOpenAIClient,
  extractBatchArticles,
  finalizeBatch,
  readState,
  responseText,
  submitBatch
} from "../scripts/article-batch-pipeline.mjs";

const fixtures = JSON.parse(await readFile(new URL("./fixtures/article-batch-api.json", import.meta.url), "utf8"));

test("state parsing accepts valid state and rejects malformed state", async () => {
  const root = await mkdtemp(join(tmpdir(), "iu-batch-state-"));
  const statePath = join(root, "state.json");
  await writeFile(statePath, JSON.stringify({ version: 1, phase: "active", batchId: "batch-123", topicSlugs: ["alpha"] }));
  assert.equal((await readState(statePath)).batchId, "batch-123");

  await writeFile(statePath, "[]");
  await assert.rejects(readState(statePath), /State must be a JSON object/);

  await writeFile(statePath, JSON.stringify({ version: 1, phase: "mystery" }));
  await assert.rejects(readState(statePath), /Unknown pipeline phase/);
});

test("submission guard blocks active state and permits terminal state", () => {
  assert.throws(() => assertCanSubmit({ phase: "active", batchId: "batch-123" }), /still active/);
  assert.doesNotThrow(() => assertCanSubmit({ phase: "finalized" }));
  assert.doesNotThrow(() => assertCanSubmit({ phase: "failed" }));
});

test("OpenAI client uses upload, create, retrieve, and download API fixtures", async () => {
  const calls = [];
  const responses = [fixtures.upload, fixtures.created, fixtures.inProgress, "result-body"];
  const client = createOpenAIClient({
    apiKey: "test-key",
    fetchImpl: async (url, init = {}) => {
      calls.push({ url, init });
      const value = responses.shift();
      return new Response(typeof value === "string" ? value : JSON.stringify(value), { status: 200 });
    }
  });
  const root = await mkdtemp(join(tmpdir(), "iu-batch-api-"));
  const inputPath = join(root, "input.jsonl");
  await writeFile(inputPath, "{}\n");

  assert.equal((await client.uploadBatchFile(inputPath)).id, fixtures.upload.id);
  assert.equal((await client.createBatch(fixtures.upload.id)).id, fixtures.created.id);
  assert.equal((await client.getBatch(fixtures.created.id)).status, "in_progress");
  assert.equal(await client.downloadFile("file-output-123"), "result-body");
  assert.deepEqual(calls.map((call) => new URL(call.url).pathname), [
    "/v1/files",
    "/v1/batches",
    "/v1/batches/batch-123",
    "/v1/files/file-output-123/content"
  ]);
  assert.match(calls[0].init.headers.Authorization, /^Bearer test-key$/);
});

test("mocked submission generates topics and persists non-secret active state", async () => {
  const root = await mkdtemp(join(tmpdir(), "iu-batch-submit-"));
  const runCommand = async (cwd, script, args) => {
    if (script.endsWith("generate-topics.mjs")) {
      const count = Number(args.find((arg) => arg.startsWith("--count=")).split("=")[1]);
      await mkdir(join(cwd, "generated/weekly"), { recursive: true });
      await writeFile(join(cwd, "generated/weekly/topic-map.json"), JSON.stringify(
        Array.from({ length: count }, (_, index) => ({ slug: `topic-${index + 1}` }))
      ));
      return;
    }
    await mkdir(join(cwd, "generated/batches"), { recursive: true });
    const topics = JSON.parse(await readFile(join(cwd, "generated/weekly/topic-map.json"), "utf8"));
    await writeFile(join(cwd, "generated/batches/article-generation.jsonl"), topics.map(topic => JSON.stringify({custom_id: `article-${topic.slug}`})).join("\n"));
  };
  const client = {
    uploadBatchFile: async () => fixtures.upload,
    createBatch: async () => fixtures.created
  };

  const state = await submitBatch({ root, count: 2, model: "gpt-5.5", runCommand, client });
  const persisted = await readFile(join(root, "generated/article-batch-state.json"), "utf8");
  assert.equal(state.phase, "active");
  assert.equal(state.topicCount, 2);
  assert.equal(JSON.parse(persisted).batchId, "batch-123");
  assert.doesNotMatch(persisted, /test-key|OPENAI_API_KEY/);
});

test("response text supports top-level and nested Responses API output", () => {
  assert.equal(responseText({ output_text: "top" }), "top");
  assert.equal(responseText({ output: [{ content: [{ type: "output_text", text: "nested" }] }] }), "nested");
  assert.throws(() => responseText({ output: [] }), /Could not find generated text/);
});

test("completed output preserves topic order", () => {
  const result = extractBatchArticles([
    resultLine("beta", { slug: "beta", title: "Beta" }),
    resultLine("alpha", { slug: "alpha", title: "Alpha" })
  ].join("\n"), ["alpha", "beta"]);

  assert.deepEqual(result.articles.map((article) => article.slug), ["alpha", "beta"]);
  assert.equal(result.failures.length, 0);
});

test("partial output publishes valid responses and sanitizes failures", () => {
  const result = extractBatchArticles([
    resultLine("alpha", { slug: "alpha", title: "Alpha" }),
    JSON.stringify({ custom_id: "article-beta", error: { code: "batch_expired", message: "Timed out" } })
  ].join("\n"), ["alpha", "beta"]);

  assert.deepEqual(result.articles.map((article) => article.slug), ["alpha"]);
  assert.deepEqual(result.failures, [{ customId: "article-beta", code: "batch_expired", message: "Timed out" }]);
});

test("malformed, mismatched, and missing responses are failures", () => {
  const result = extractBatchArticles([
    "not-json",
    resultLine("alpha", { slug: "wrong-slug" }),
    JSON.stringify({ custom_id: "article-unexpected", response: { status_code: 500 } })
  ].join("\n"), ["alpha", "beta"]);

  assert.equal(result.articles.length, 0);
  assert.ok(result.failures.some((failure) => failure.code === "invalid_jsonl"));
  assert.ok(result.failures.some((failure) => failure.code === "invalid_article"));
  assert.ok(result.failures.some((failure) => failure.code === "unexpected_custom_id"));
  assert.ok(result.failures.some((failure) => failure.code === "missing_output"));
});

test("already finalized state is a no-op without an API call", async () => {
  const root = await mkdtemp(join(tmpdir(), "iu-batch-finalized-"));
  await mkdir(join(root, "generated"), { recursive: true });
  await writeFile(join(root, "generated/article-batch-state.json"), JSON.stringify({ version: 1, phase: "finalized" }));
  const client = new Proxy({}, { get: () => () => { throw new Error("API should not be called"); } });

  const result = await finalizeBatch({ root, client });
  assert.equal(result.outcome, "noop");
});

test("in-progress fixture exits pending without rewriting state", async () => {
  const root = await activeStateRoot();
  const statePath = join(root, "generated/article-batch-state.json");
  const before = await readFile(statePath, "utf8");
  const result = await finalizeBatch({ root, client: { getBatch: async () => fixtures.inProgress } });

  assert.equal(result.outcome, "pending");
  assert.equal(await readFile(statePath, "utf8"), before);
});

test("total failure fixture records terminal state and throws", async () => {
  const root = await activeStateRoot();
  await assert.rejects(
    finalizeBatch({ root, client: { getBatch: async () => fixtures.totalFailure } }),
    /produced no publishable articles/
  );
  const state = await readState(join(root, "generated/article-batch-state.json"));
  assert.equal(state.phase, "failed");
  assert.equal(state.batchStatus, "failed");
  assert.equal(state.failedCount, 2);
});

test("partial completion publishes successes and records failed requests", async () => {
  const root = await activeStateRoot();
  await mkdir(join(root, "content"), { recursive: true });
  await writeFile(join(root, "content/articles.json"), "[]\n");
  const runCommand = async (cwd, script) => {
    if (!script.endsWith("publish-reviewed-articles.mjs")) return;
    const review = JSON.parse(await readFile(join(cwd, "generated/weekly/generated-articles.json"), "utf8"));
    await writeFile(join(cwd, "content/articles.json"), `${JSON.stringify(review)}\n`);
  };
  const client = {
    getBatch: async () => fixtures.partial,
    downloadFile: async (fileId) => fileId === "file-output-123"
      ? resultLine("alpha", { slug: "alpha", title: "Alpha" })
      : JSON.stringify({ custom_id: "article-beta", error: { code: "batch_expired", message: "Timed out" } })
  };

  const result = await finalizeBatch({ root, client, runCommand });
  assert.equal(result.outcome, "finalized");
  assert.equal(result.state.successfulCount, 1);
  assert.equal(result.state.failedCount, 1);
  assert.equal(result.state.publishedCount, 1);
  assert.equal(result.state.failures[0].customId, "article-beta");
});

test("expired fixture can extract partial successful output", () => {
  assert.equal(fixtures.expired.status, "expired");
  const result = extractBatchArticles(resultLine("alpha", { slug: "alpha" }), ["alpha", "beta"]);
  assert.equal(result.articles.length, 1);
  assert.equal(result.failures[0].code, "missing_output");
});

async function activeStateRoot() {
  const root = await mkdtemp(join(tmpdir(), "iu-batch-active-"));
  await mkdir(join(root, "generated"), { recursive: true });
  await writeFile(join(root, "generated/article-batch-state.json"), JSON.stringify({
    version: 1,
    phase: "active",
    batchId: "batch-123",
    topicSlugs: ["alpha", "beta"]
  }));
  return root;
}

function resultLine(slug, article) {
  return JSON.stringify({
    custom_id: `article-${slug}`,
    response: {
      status_code: 200,
      body: { output_text: JSON.stringify(article) }
    }
  });
}
