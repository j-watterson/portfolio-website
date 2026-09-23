import { slugify, AUDIENCES, UPDATE_FREQUENCIES } from "./topic-csv.mjs";
import { validSourceUrl } from "./article-validation.mjs";
export function validateBrief(slug, brief, topic) {
  const fail = message => { throw new Error(`Research brief ${slug}: ${message}`); };
  if (!brief || slugify(brief.topic) !== slug) fail("missing or mismatched topic");
  if (!AUDIENCES.includes(brief.audience) || !UPDATE_FREQUENCIES.includes(brief.update_frequency)) fail("invalid editorial labels");
  if (!["durable","tool-specific"].includes(brief.content_type)) fail("invalid content type");
  for (const key of ["primary_question","category","cluster","original_contribution","portfolio_context","cross_brand_boundary"]) if (!brief[key]?.trim()) fail(`missing ${key}`);
  for (const key of ["scope","exclusions","evidence_requirements"]) if (!Array.isArray(brief[key]) || !brief[key].length || brief[key].some(v=>typeof v!=="string" || !v.trim())) fail(`invalid ${key}`);
  for (const key of ["prerequisites","secondary_keywords"]) if (!Array.isArray(brief[key]) || brief[key].some(v=>typeof v!=="string")) fail(`invalid ${key}`);
  if (!Array.isArray(brief.sources) || !brief.sources.length || brief.sources.some(s=>!s.source_id || !s.title || !validSourceUrl(s.url) || !Number.isFinite(Date.parse(s.accessed_at)))) fail("missing source provenance");
  if (topic && (topic.title !== brief.topic || topic.audience !== brief.audience || topic.updateFrequency !== brief.update_frequency)) fail("CSV metadata does not match brief");
  return brief;
}
