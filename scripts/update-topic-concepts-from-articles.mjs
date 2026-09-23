import { readFile, writeFile } from "node:fs/promises";
import { readTopicCsv, slugify, writeCsv } from "./lib/topic-csv.mjs";

const csvPath = "scripts/topic-concepts.csv";
const articles = JSON.parse(await readFile("content/articles.json", "utf8"));
const review = JSON.parse(await readFile("generated/weekly/generated-articles.json", "utf8"));
const bySlug = new Map([...review, ...articles].map(article => [article.slug, article]));
const csv = readTopicCsv(await readFile(csvPath, "utf8"));
let updated = 0;
for (const row of csv.rows) {
  const article = bySlug.get(slugify(row[csv.indexes.topic]));
  if (!article || row[csv.indexes.url].trim()) continue;
  const eligible = article.status === "published" ? ["", "not written", "pending", "ready", "review"] : ["", "not written", "pending", "ready"];
  if (!eligible.includes(row[csv.indexes.status].trim().toLowerCase())) continue;
  row[csv.indexes.status] = article.status === "published" ? "published" : "review";
  if (article.status === "published") row[csv.indexes.url] = article.canonicalUrl;
  updated++;
}
await writeFile(csvPath, writeCsv([csv.headers, ...csv.rows]));
console.log(`Updated ${updated} keyword statuses; skipped and failed keywords retain their status.`);
