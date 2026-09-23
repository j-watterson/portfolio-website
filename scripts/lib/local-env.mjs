import { readFile } from "node:fs/promises";

export async function loadLocalKey(root) {
  if (process.env.OPENAI_API_KEY) return;
  let text;
  try { text = await readFile(`${root}/.env.local`, "utf8"); }
  catch (error) { if (error.code === "ENOENT") return; throw error; }
  const line = text.split(/\r?\n/).find(line => /^\s*(?:export\s+)?OPENAI_API_KEY\s*=/.test(line));
  if (!line) return;
  let value = line.slice(line.indexOf("=") + 1).trim();
  if (/^["']/.test(value)) {
    if (value.at(-1) !== value[0]) throw new Error("Malformed OPENAI_API_KEY quoting in .env.local.");
    value = value.slice(1, -1);
  } else value = value.replace(/\s+#.*$/, "");
  if (value) process.env.OPENAI_API_KEY = value;
}
