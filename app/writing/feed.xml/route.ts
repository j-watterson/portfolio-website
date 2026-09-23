import { articles, SITE_URL } from "@/lib/writing";
export const dynamic = "force-static";
const xml = (value: string) => value.replace(/[<>&"']/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]!));
export function GET() {
  const items = articles.slice(0,30).map(article => `<item><title>${xml(article.title)}</title><link>${xml(article.canonicalUrl)}</link><guid isPermaLink="true">${xml(article.canonicalUrl)}</guid><description>${xml(article.description)}</description><pubDate>${new Date(article.datePublished).toUTCString()}</pubDate></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Jon Watterson — Writing</title><link>${SITE_URL}/writing</link><description>Practical notes on reliable data engineering.</description><language>en-us</language>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
