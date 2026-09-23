import { mkdir,readFile,writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { selectTopics } from "./lib/topic-csv.mjs";
import { validateBrief } from "./lib/topic-research.mjs";
const json=async path=>JSON.parse(await readFile(path,"utf8"));
const count=Number(process.argv.find(a=>a.startsWith("--count="))?.slice(8)??10);
const [csv,articles,notes,research]=await Promise.all([readFile("scripts/topic-concepts.csv","utf8"),json("content/articles.json"),json("content/planned-notes.json"),json("scripts/topic-research.json")]);
const topics=selectTopics(csv,[...articles,...notes],count).map(topic=>{
  const brief=validateBrief(topic.slug,research[topic.slug],topic);
  const record={...topic,category:brief.category,intent:brief.primary_question,relatedKeywords:[...new Set([topic.primaryKeyword,...brief.secondary_keywords])],editorialBrief:brief};
  return {...record,sourceHash:createHash("sha256").update(JSON.stringify(record)).digest("hex").slice(0,16)};
});
await mkdir("generated/weekly",{recursive:true});
await writeFile("generated/weekly/topic-map.json",JSON.stringify(topics,null,2)+"\n");
console.log(`Selected ${topics.length} of up to ${count} eligible topics; no automatic topic expansion.`);
