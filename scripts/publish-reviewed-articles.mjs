import { readFile,writeFile } from "node:fs/promises";
import { validateArticle } from "./lib/article-validation.mjs";
const arg=(name,fallback)=>process.argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3)??fallback;
const json=async path=>JSON.parse(await readFile(path,"utf8"));
const reviewPath=arg("articles","generated/weekly/generated-articles.json");
const [incoming,existing,schema,categories,notes,topics]=await Promise.all([json(reviewPath),json("content/articles.json"),json("schemas/article.schema.json"),json("content/categories.json"),json("content/planned-notes.json"),json(arg("topics","generated/weekly/topic-map.json"))]);
const approve=process.argv.includes("--approve-review"), bySlug=new Map(topics.map(t=>[t.slug,t]));
const used=new Set([...existing,...notes].map(a=>a.slug));const pending=[];const received=new Set();
for (const article of incoming) {
 validateArticle(article,schema,categories);
 if(received.has(article.slug)) throw new Error(`Duplicate incoming article: ${article.slug}`);received.add(article.slug);
 const topic=bySlug.get(article.slug);
 if(!topic || article.sourceHash!==topic.sourceHash || article.primaryKeyword!==topic.primaryKeyword || article.category!==topic.category) throw new Error(`Article does not match submitted topic: ${article.slug}`);
 if(used.has(article.slug)) continue;
 if((article.requiresVerification || article.status==="review" || topic.editorialBrief.content_type==="tool-specific") && !approve) {article.status="review";continue;}
 const today=new Date().toISOString().slice(0,10);
 pending.push({...article,status:"published",requiresVerification:false,datePublished:today,dateModified:today});used.add(article.slug);
}
// Validate everything before appending; existing records are never overwritten.
await writeFile("content/articles.json",JSON.stringify([...existing,...pending],null,2)+"\n");
await writeFile(reviewPath,JSON.stringify(incoming,null,2)+"\n");
console.log(`Published ${pending.length} articles; other valid results stay in review.`);
