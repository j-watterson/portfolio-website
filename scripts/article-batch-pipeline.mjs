import { spawn } from "node:child_process";
import { appendFile, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalKey } from "./lib/local-env.mjs";

const ACTIVE_BATCH_STATUSES = new Set([
  "validating",
  "in_progress",
  "finalizing",
  "cancelling"
]);
const TERMINAL_BATCH_STATUSES = new Set([
  "completed",
  "failed",
  "expired",
  "cancelled"
]);
const PIPELINE_PHASES = new Set(["idle", "active", "finalized", "failed"]);

export const DEFAULT_STATE_PATH = "generated/article-batch-state.json";
export const DEFAULT_BATCH_INPUT_PATH = "generated/batches/article-generation.jsonl";
export const DEFAULT_BATCH_RESULTS_PATH = "generated/batches/article-results.jsonl";
export const DEFAULT_BATCH_ERRORS_PATH = "generated/batches/article-errors.jsonl";
export const DEFAULT_REVIEW_PATH = "generated/weekly/generated-articles.json";

export function createOpenAIClient({ apiKey, apiBase = "https://api.openai.com/v1", fetchImpl = fetch }) {
  if (!apiKey) throw new Error("OPENAI_API_KEY is required.");

  async function requestJson(method, path, payload) {
    const response = await fetchImpl(`${apiBase}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...(payload === undefined ? {} : { "Content-Type": "application/json" })
      },
      body: payload === undefined ? undefined : JSON.stringify(payload)
    });
    return parseApiResponse(response, method, path);
  }

  return {
    async uploadBatchFile(path) {
      const form = new FormData();
      form.append("purpose", "batch");
      form.append("file", new Blob([await readFile(path)], { type: "application/jsonl" }), "article-generation.jsonl");
      const response = await fetchImpl(`${apiBase}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form
      });
      return parseApiResponse(response, "POST", "/files");
    },

    createBatch(inputFileId) {
      return requestJson("POST", "/batches", {
        input_file_id: inputFileId,
        endpoint: "/v1/responses",
        completion_window: "24h",
        metadata: { brand: "jon-watterson" }
      });
    },

    getBatch(batchId) {
      return requestJson("GET", `/batches/${encodeURIComponent(batchId)}`);
    },

    async downloadFile(fileId) {
      const response = await fetchImpl(`${apiBase}/files/${encodeURIComponent(fileId)}/content`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      if (!response.ok) await throwApiError(response, "GET", "/files/{file_id}/content");
      return response.text();
    }
  };
}

export async function submitBatch(options = {}) {
  const root = resolve(options.root || process.cwd());
  const count = clampCount(options.count ?? 10);
  const model = options.model || process.env.OPENAI_MODEL || "gpt-5.5";
  const statePath = join(root, options.statePath || DEFAULT_STATE_PATH);
  const batchInputPath = join(root, options.batchInputPath || DEFAULT_BATCH_INPUT_PATH);
  const topicPath = join(root, "generated/weekly/topic-map.json");
  const state = await readState(statePath);

  assertCanSubmit(state);
  const week = weekStart(options.now || new Date());
  const used = state.submissionWeek === week ? (state.submittedThisWeek || 0) : 0;
  const available = Math.min(count, 10 - used);
  if (available <= 0) {
    console.log("This week’s 10-article submission allowance is already used.");
    return state;
  }

  const runCommand = options.runCommand || runNodeScript;
  await runCommand(root, "scripts/generate-topics.mjs", [`--count=${available}`], { ...process.env, OPENAI_MODEL: model });
  await runCommand(root, "scripts/prepare-openai-batch.mjs", [
    "--topics=generated/weekly/topic-map.json",
    "--out=generated/batches/article-generation.jsonl"
  ], { ...process.env, OPENAI_MODEL: model });

  const topics = JSON.parse(await readFile(topicPath, "utf8"));
  if (!Array.isArray(topics) || topics.length > available) {
    throw new Error(`Expected at most ${available} generated topics, received ${Array.isArray(topics) ? topics.length : "invalid JSON"}.`);
  }

  if (!topics.length) {
    console.log("No unwritten keywords. Add rows to scripts/topic-concepts.csv.");
    return state;
  }

  const requests = (await readFile(batchInputPath, "utf8")).split(/\r?\n/).filter(line => line.trim()).map(JSON.parse);
  const expectedIds = topics.map(topic => `article-${topic.slug}`).sort();
  const actualIds = requests.map(request => request.custom_id).sort();
  if (JSON.stringify(expectedIds) !== JSON.stringify(actualIds)) {
    throw new Error("Prepared batch requests do not match selected keywords; no batch was submitted.");
  }

  const client = options.client || createOpenAIClient({ apiKey: options.apiKey || process.env.OPENAI_API_KEY });
  const uploaded = await client.uploadBatchFile(batchInputPath);
  if (!uploaded?.id) throw new Error("OpenAI file upload did not return an id.");

  const batch = await client.createBatch(uploaded.id);
  if (!batch?.id) throw new Error("OpenAI batch creation did not return an id.");

  const nextState = {
    version: 1,
    phase: "active",
    batchId: batch.id,
    inputFileId: uploaded.id,
    model,
    topicCount: topics.length,
    submissionWeek: week,
    submittedThisWeek: used + topics.length,
    topicSlugs: topics.map((topic) => topic.slug),
    submittedAt: new Date().toISOString(),
    batchStatus: batch.status || "validating",
    outputFileId: null,
    errorFileId: null,
    successfulCount: 0,
    failedCount: 0,
    publishedCount: 0,
    failures: []
  };
  await writeJson(statePath, nextState);
  await writeJson(join(root, `generated/weekly/topics-${batch.id}.json`), topics);
  console.log(`Submitted OpenAI batch ${batch.id} for ${topics.length} articles using ${model}.`);
  return nextState;
}

export async function finalizeBatch(options = {}) {
  const root = resolve(options.root || process.cwd());
  const statePath = join(root, options.statePath || DEFAULT_STATE_PATH);
  const state = await readState(statePath);

  if (state.phase !== "active") {
    console.log(`No active article batch to finalize (phase: ${state.phase || "idle"}).`);
    return { outcome: "noop", state };
  }

  const client = options.client || createOpenAIClient({ apiKey: options.apiKey || process.env.OPENAI_API_KEY });
  const batch = await client.getBatch(state.batchId);
  const batchStatus = batch?.status;

  if (ACTIVE_BATCH_STATUSES.has(batchStatus)) {
    console.log(`OpenAI batch ${state.batchId} is still ${batchStatus}.`);
    return { outcome: "pending", state: { ...state, batchStatus } };
  }
  if (!TERMINAL_BATCH_STATUSES.has(batchStatus)) {
    throw new Error(`OpenAI batch ${state.batchId} returned unknown status: ${batchStatus || "missing"}.`);
  }

  const resultTexts = [];
  if (batch.output_file_id) {
    const output = await client.downloadFile(batch.output_file_id);
    await writeText(join(root, options.resultsPath || DEFAULT_BATCH_RESULTS_PATH), output);
    resultTexts.push(output);
  }
  if (batch.error_file_id) {
    const errors = await client.downloadFile(batch.error_file_id);
    await writeText(join(root, options.errorsPath || DEFAULT_BATCH_ERRORS_PATH), errors);
    resultTexts.push(errors);
  }

  const extracted = extractBatchArticles(resultTexts.join("\n"), state.topicSlugs || []);
  const reviewPath = join(root, options.reviewPath || DEFAULT_REVIEW_PATH);
  await writeJson(reviewPath, extracted.articles);
  await writeJson(join(root, `generated/weekly/batch-${state.batchId}.json`), extracted.articles);

  let publishedCount = 0;
  if (extracted.articles.length) {
    const articlePath = join(root, "content/articles.json");
    const before = JSON.parse(await readFile(articlePath, "utf8"));
    const runCommand = options.runCommand || runNodeScript;
    const paths = ["content/articles.json", "scripts/topic-concepts.csv"];
    const snapshots = await Promise.all(paths.map(async path => {
      try { return await readFile(join(root, path)); }
      catch (error) { if (error.code === "ENOENT") return null; throw error; }
    }));
    try {
      await runCommand(root, "scripts/publish-reviewed-articles.mjs", [
        "--articles=generated/weekly/generated-articles.json"
      ], process.env);
      await runCommand(root, "scripts/validate-writing.mjs", [], process.env);
      await runCommand(root, "scripts/update-topic-concepts-from-articles.mjs", [], process.env);
    } catch (error) {
      for (const [index, path] of paths.entries()) {
        if (snapshots[index] !== null) await writeFile(join(root, path), snapshots[index]);
      }
      throw error;
    }
    const after = JSON.parse(await readFile(articlePath, "utf8"));
    publishedCount = Math.max(0, after.length - before.length);
  }

  // Preserve policy-adjusted review statuses in the durable archive.
  if (extracted.articles.length) await writeJson(join(root, `generated/weekly/batch-${state.batchId}.json`), JSON.parse(await readFile(reviewPath, "utf8")));

  const nextState = {
    ...state,
    phase: extracted.articles.length ? "finalized" : "failed",
    batchStatus,
    outputFileId: batch.output_file_id || null,
    errorFileId: batch.error_file_id || null,
    finalizedAt: new Date().toISOString(),
    successfulCount: extracted.articles.length,
    failedCount: extracted.failures.length,
    publishedCount,
    failures: extracted.failures
  };
  await writeJson(statePath, nextState);

  if (!extracted.articles.length) {
    const error = new Error(`OpenAI batch ${state.batchId} produced no publishable articles.`);
    error.stateWritten = true;
    throw error;
  }

  console.log(`Finalized batch ${state.batchId}: ${extracted.articles.length} successful, ${extracted.failures.length} failed, ${publishedCount} newly published.`);
  return { outcome: "finalized", state: nextState, articles: extracted.articles };
}

export function assertCanSubmit(state) {
  if (state.phase === "active") {
    throw new Error(`Batch ${state.batchId || "unknown"} is still active; finalize it before submitting another batch.`);
  }
}

export function extractBatchArticles(jsonl, topicSlugs) {
  const expectedIds = topicSlugs.map((slug) => `article-${slug}`);
  const expected = new Set(expectedIds);
  const articlesById = new Map();
  const failuresById = new Map();

  for (const [index, line] of String(jsonl || "").split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    let item;
    try {
      item = JSON.parse(line);
    } catch {
      failuresById.set(`line-${index + 1}`, sanitizeFailure({
        customId: null,
        code: "invalid_jsonl",
        message: `Could not parse result line ${index + 1}.`
      }));
      continue;
    }

    const customId = item.custom_id || null;
    if (!customId || !expected.has(customId)) {
      failuresById.set(customId || `line-${index + 1}`, sanitizeFailure({
        customId,
        code: "unexpected_custom_id",
        message: "Result custom_id was missing or not part of this batch."
      }));
      continue;
    }
    if (articlesById.has(customId) || failuresById.has(customId)) {
      failuresById.set(customId, sanitizeFailure({ customId, code: "duplicate_result", message: "Duplicate result received." }));
      articlesById.delete(customId);
      continue;
    }
    if (item.error) {
      failuresById.set(customId, sanitizeFailure({ customId, ...item.error }));
      continue;
    }

    const response = item.response || {};
    if (response.status_code !== 200) {
      failuresById.set(customId, sanitizeFailure({
        customId,
        statusCode: response.status_code,
        code: "http_error",
        message: response.body?.error?.message || `OpenAI returned HTTP ${response.status_code || "unknown"}.`
      }));
      continue;
    }

    try {
      const article = JSON.parse(responseText(response.body || {}));
      const expectedSlug = customId.slice("article-".length);
      if (!article || Array.isArray(article) || typeof article !== "object") throw new Error("Response was not an article object.");
      if (article.slug !== expectedSlug) throw new Error(`Article slug ${article.slug || "missing"} did not match ${expectedSlug}.`);
      articlesById.set(customId, article);
    } catch (error) {
      failuresById.set(customId, sanitizeFailure({ customId, code: "invalid_article", message: error.message }));
    }
  }

  for (const customId of expectedIds) {
    if (!articlesById.has(customId) && !failuresById.has(customId)) {
      failuresById.set(customId, sanitizeFailure({ customId, code: "missing_output", message: "No result was returned." }));
    }
  }

  return {
    articles: expectedIds.filter((id) => articlesById.has(id)).map((id) => articlesById.get(id)),
    failures: [...failuresById.values()]
  };
}

export function responseText(body) {
  if (typeof body.output_text === "string") return body.output_text;
  for (const output of body.output || []) {
    for (const content of output.content || []) {
      if (typeof content.text === "string") return content.text;
    }
  }
  throw new Error("Could not find generated text in the response body.");
}

export async function readState(path) {
  try {
    const state = JSON.parse(await readFile(path, "utf8"));
    if (!state || typeof state !== "object" || Array.isArray(state)) throw new Error("State must be a JSON object.");
    if (state.version !== 1) throw new Error("State version must be 1.");
    if (!PIPELINE_PHASES.has(state.phase)) throw new Error(`Unknown pipeline phase: ${state.phase || "missing"}.`);
    if (state.phase === "active") {
      if (!state.batchId) throw new Error("Active state must include batchId.");
      if (!Array.isArray(state.topicSlugs) || !state.topicSlugs.length) {
        throw new Error("Active state must include topicSlugs.");
      }
    }
    return state;
  } catch (error) {
    if (error.code === "ENOENT") return { version: 1, phase: "idle" };
    throw new Error(`Could not read article batch state: ${error.message}`);
  }
}

function sanitizeFailure(value) {
  return {
    customId: value.customId || null,
    code: String(value.code || "batch_error").slice(0, 100),
    message: String(value.message || "Batch request failed.").slice(0, 500),
    ...(value.statusCode ? { statusCode: Number(value.statusCode) } : {})
  };
}

function weekStart(now) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}

function clampCount(value) {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1 || count > 10) throw new Error("Article count must be an integer from 1 to 10.");
  return count;
}

async function parseApiResponse(response, method, path) {
  if (!response.ok) await throwApiError(response, method, path);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`OpenAI ${method} ${path} returned invalid JSON.`);
  }
}

async function throwApiError(response, method, path) {
  const text = await response.text();
  let message = text;
  try {
    message = JSON.parse(text)?.error?.message || text;
  } catch {
    // Use the response text, truncated below.
  }
  throw new Error(`OpenAI ${method} ${path} failed (${response.status}): ${String(message).slice(0, 500)}`);
}

async function runNodeScript(root, script, args, env) {
  await new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [script, ...args], { cwd: root, env, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => code === 0
      ? resolvePromise()
      : reject(new Error(`${script} exited with status ${code}.`)));
  });
}

async function writeJson(path, value) {
  await writeText(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeText(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value);
}

function getArg(name, fallback) {
  const value = process.argv.find((arg) => arg.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
  return value === undefined ? fallback : value;
}

async function main() {
  await loadLocalKey(process.cwd());
  const command = process.argv[2];
  if (command === "submit") {
    await submitBatch({ count: getArg("count", 10), model: getArg("model", process.env.OPENAI_MODEL || "gpt-5.5") });
    return;
  }
  if (command === "finalize") {
    const result = await finalizeBatch();
    if (process.env.GITHUB_OUTPUT) {
      await appendFile(process.env.GITHUB_OUTPUT, `outcome=${result.outcome}\npublished_count=${result.state.publishedCount || 0}\nstate_written=${result.outcome === "finalized"}\n`);
    }
    return;
  }
  throw new Error("Usage: node scripts/article-batch-pipeline.mjs <submit|finalize> [--count=10] [--model=gpt-5.5]");
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch(async (error) => {
    if (error.stateWritten && process.env.GITHUB_OUTPUT) {
      await appendFile(process.env.GITHUB_OUTPUT, "state_written=true\n");
    }
    console.error(error.message);
    process.exitCode = 1;
  });
}
