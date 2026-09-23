import { readFile } from "node:fs/promises";
import { validateArticle } from "./lib/article-validation.mjs";
const json = async path => JSON.parse(await readFile(path,"utf8"));
const [articles,schema,categories,notes] = await Promise.all([json("content/articles.json"),json("schemas/article.schema.json"),json("content/categories.json"),json("content/planned-notes.json")]);
const seen = new Set(notes.map(n => n.slug));
for (const article of articles) {
  validateArticle(article,schema,categories);
  if (article.status !== "published" || article.requiresVerification) throw new Error(`Unapproved article in public content: ${article.slug}`);
  if (seen.has(article.slug)) throw new Error(`Duplicate or reserved slug: ${article.slug}`);
  seen.add(article.slug);
}
console.log(`Validated ${articles.length} published articles and ${notes.length} preserved planned notes.`);
