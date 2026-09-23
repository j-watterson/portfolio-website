export const SITE_URL = "https://jwatterson.com";
export function validateSchema(value, schema, path = "article") {
  const actual = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
  if (actual !== schema.type) throw new Error(`${path}: expected ${schema.type}, got ${actual}`);
  if (schema.enum && !schema.enum.includes(value)) throw new Error(`${path}: unsupported value`);
  if (schema.type === "object") {
    for (const key of schema.required || []) if (!(key in value)) throw new Error(`${path}: missing ${key}`);
    for (const [key, item] of Object.entries(value)) {
      if (!schema.properties[key]) throw new Error(`${path}: unknown property ${key}`);
      validateSchema(item, schema.properties[key], `${path}.${key}`);
    }
  }
  if (schema.type === "array") value.forEach((v,i) => validateSchema(v,schema.items,`${path}[${i}]`));
}
export function validSourceUrl(value) {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}
export function validateArticle(article, schema, categories) {
  validateSchema(article, schema);
  const fail = message => { throw new Error(`${article.slug}: ${message}`); };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) fail("invalid slug");
  if (article.canonicalUrl !== `${SITE_URL}/writing/${article.slug}`) fail("canonical URL does not match portfolio slug");
  if (!categories.some(c => c.title === article.category)) fail("unknown category");
  for (const key of ["title","description","primaryKeyword","sourceHash","lead","readTime"]) if (!article[key].trim()) fail(`empty ${key}`);
  for (const key of ["datePublished","dateModified"]) {
    const v=article[key];if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString().slice(0,10)!==v) fail(`invalid ${key}`);
  }
  if (article.sections.length < 3 || article.takeaways.length < 3 || !article.sources.length) fail("missing substantive sections, takeaways, or sources");
  const ids = new Set(["takeaways", "sources"]);
  for (const section of article.sections) {
    if (!/^[a-z][a-z0-9-]*$/.test(section.id) || ids.has(section.id)) fail("duplicate or invalid section anchor");
    ids.add(section.id);
    if (!section.heading.trim() || !section.paragraphs.length || section.paragraphs.some(p => !p.trim())) fail("empty article section");
  }
  if (article.sources.some(s => !s.title.trim() || !validSourceUrl(s.url))) fail("sources need a title and HTTPS URL");
  // Body fields are plain strings rendered by React, never executable Markdown/MDX or raw HTML.
  return article;
}
