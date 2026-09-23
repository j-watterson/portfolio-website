export const AUDIENCES = ["practitioners", "leaders", "founders"];
export const UPDATE_FREQUENCIES = ["monthly", "quarterly", "semiannual", "annual", "never"];

export function slugify(value) {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function parseCsv(value) {
  const rows = [];
  let row = [], field = "", quoted = false;
  value = value.replace(/^\uFEFF/, "");
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char === '"' && quoted && value[i + 1] === '"') { field += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ""; }
    else if (/[\r\n]/.test(char) && !quoted) {
      if (char === '\r' && value[i + 1] === '\n') i++;
      row.push(field);
      if (row.some(cell => cell.trim())) rows.push(row);
      row = []; field = "";
    } else field += char;
  }
  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  row.push(field);
  if (row.some(cell => cell.trim())) rows.push(row);
  return rows;
}

export function readTopicCsv(value) {
  const [headers = [], ...rows] = parseCsv(value);
  const names = headers.map(cell => cell.trim().toLowerCase());
  if (new Set(names).size !== names.length) throw new Error("CSV has duplicate column names.");
  const topic = names.indexOf("topic") >= 0 ? names.indexOf("topic") : names.indexOf("keyword");
  if (topic < 0) throw new Error("Keyword CSV needs a topic or keyword column (recommended: topic,url,status).");
  if (rows.some(row => row.length > headers.length)) throw new Error("CSV row has extra columns; quote keywords containing commas.");
  for (const name of ["url", "status"]) {
    if (!names.includes(name)) { names.push(name); headers.push(name); }
  }
  for (const row of rows) while (row.length < headers.length) row.push("");
  const indexes = { topic, url: names.indexOf("url"), status: names.indexOf("status"),
    audience: names.indexOf("audience"), update_frequency: names.indexOf("update_frequency") };
  if ((indexes.audience >= 0) !== (indexes.update_frequency >= 0)) {
    throw new Error("Research CSV must include both audience and update_frequency columns.");
  }
  for (const [index, row] of rows.entries()) {
    if (indexes.audience >= 0 && (!AUDIENCES.includes(row[indexes.audience].trim()) ||
        !UPDATE_FREQUENCIES.includes(row[indexes.update_frequency].trim()))) {
      throw new Error(`CSV row ${index + 2}: invalid audience or update_frequency.`);
    }
  }
  return { headers, rows, indexes };
}

export function writeCsv(rows) {
  return rows.map(row => row.map(value => /[",\r\n]/.test(String(value))
    ? `"${String(value).replaceAll('"', '""')}"` : value).join(",")).join("\n") + "\n";
}

export function selectTopics(csv, articles, count) {
  if (!Number.isInteger(count) || count < 1 || count > 10000) throw new Error("Count must be an integer from 1 to 10000.");
  const { rows, indexes } = readTopicCsv(csv);
  const used = new Set(articles.flatMap(a => [a.slug, slugify(a.primaryKeyword || ""), slugify(a.title || "")]));
  const eligible = new Set(["", "not written", "pending", "ready"]);
  const topics = [];
  for (const row of rows) {
    const keyword = row[indexes.topic].trim();
    const slug = slugify(keyword);
    if (!keyword) continue;
    if (!slug) throw new Error(`Keyword cannot produce a URL slug: ${keyword}`);
    if (row[indexes.url].trim() || !eligible.has(row[indexes.status].trim().toLowerCase()) || used.has(slug)) continue;
    used.add(slug);
    topics.push({ slug, title: keyword, primaryKeyword: keyword, relatedKeywords: [keyword],
      ...(indexes.audience >= 0 ? { audience: row[indexes.audience].trim(), updateFrequency: row[indexes.update_frequency].trim() } : {}),
      intent: `Teach ${keyword} clearly for Jon Watterson’s technical readers.`, format: "Guide", status: "review" });
    if (topics.length === count) break;
  }
  return topics;
}
