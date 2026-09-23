import { mkdir,readFile,writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { validateBrief } from "./lib/topic-research.mjs";
const arg=(name,fallback)=>process.argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3)??fallback;
const topics=JSON.parse(await readFile(arg("topics","generated/weekly/topic-map.json"),"utf8"));
const [schema,prompt]=await Promise.all([readFile("schemas/article.schema.json","utf8").then(JSON.parse),readFile("prompts/article-system-prompt.md","utf8")]);
const output=arg("out","generated/batches/article-generation.jsonl");
const requests=topics.map(topic=>{
 validateBrief(topic.slug,topic.editorialBrief,topic);
 return {custom_id:`article-${topic.slug}`,method:"POST",url:"/v1/responses",body:{model:process.env.OPENAI_MODEL||"gpt-5.5",input:[{role:"system",content:prompt},{role:"user",content:`Write the approved article using this brief. Honor its original contribution, exclusions and evidence requirements. Do not invent hands-on experience. Use ${new Date().toISOString().slice(0,10)} for provisional dates. Editorial metadata belongs in the prompt, not extra output fields.\n${JSON.stringify(topic,null,2)}`}],text:{format:{type:"json_schema",name:"portfolio_article",schema,strict:true}}}};
});
await mkdir(dirname(output),{recursive:true});await writeFile(output,requests.map(r=>JSON.stringify(r)).join("\n")+(requests.length?"\n":""));
console.log(`Prepared ${requests.length} offline Batch API requests. No API calls made.`);
