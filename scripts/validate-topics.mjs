import { readFile } from "node:fs/promises";
import { readTopicCsv,slugify,AUDIENCES } from "./lib/topic-csv.mjs";
import { validateBrief } from "./lib/topic-research.mjs";
const json = async path => JSON.parse(await readFile(path,"utf8"));
const [csv,research,manifest,categories,notes] = await Promise.all([readFile("scripts/topic-concepts.csv","utf8"),json("scripts/topic-research.json"),json("scripts/research/source-manifest.json"),json("content/categories.json"),json("content/planned-notes.json")]);
const {rows,headers} = readTopicCsv(csv);
if (headers.join(",") !== "topic,url,status,audience,update_frequency") throw new Error("Use the five-column topic interface");
const seen=new Set(), aliases=new Map(), reserved=new Set(notes.flatMap(n=>[n.slug,slugify(n.title)])); let audience=0;
for (const [i,[title,url,status,reader,cadence]] of rows.entries()) {
  const slug=slugify(title);if(!slug || seen.has(slug) || reserved.has(slug)) throw new Error(`Duplicate or reserved topic: ${slug}`);
  const brief=validateBrief(slug,research[slug],{title,audience:reader,updateFrequency:cadence});
  const rank=AUDIENCES.indexOf(reader);if(rank<audience) throw new Error("Keep audience blocks in order");audience=rank;
  if(brief.publication_order!==i+1) throw new Error(`Incorrect order: ${slug}`);
  if(!categories.some(c=>c.title===brief.category)) throw new Error(`Unknown category: ${slug}`);
  if(!["not written","ready","pending","review","published","skip","failed"].includes(status)) throw new Error(`Invalid status: ${slug}`);
  if((url && (url!==`https://jwatterson.com/writing/${slug}` || status!=="published")) || (status==="published" && !url)) throw new Error(`Invalid publication URL/status: ${slug}`);
  for(const prerequisite of brief.prerequisites) if(!seen.has(prerequisite)) throw new Error(`Missing or forward prerequisite: ${slug} → ${prerequisite}`);
  for(const source of brief.sources) {const record=manifest[source.source_id];if(!record || record.error || record.url!==source.url || record.accessed_at!==source.accessed_at || !record.sha256) throw new Error(`Missing source record: ${slug}`);}
  for(const term of [title,...brief.secondary_keywords]) {const key=slugify(term);if(aliases.has(key)&&aliases.get(key)!==slug) throw new Error(`Ambiguous keyword: ${term}`);aliases.set(key,slug);}
  seen.add(slug);
}
if(Object.keys(research).length!==seen.size) throw new Error("CSV and briefs differ");
console.log(`Validated ${seen.size} independent portfolio topics, ordering, article boundaries, and source provenance.`);
