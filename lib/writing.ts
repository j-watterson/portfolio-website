import articleData from "@/content/articles.json";
import plannedNotes from "@/content/planned-notes.json";

export const SITE_URL = "https://jwatterson.com";
export type Article = {
  slug: string; title: string; description: string; primaryKeyword: string; relatedKeywords: string[];
  category: string; level: string; readTime: string; datePublished: string; dateModified: string;
  canonicalUrl: string; status: "published" | "review"; sourceHash: string; lead: string;
  sections: { id: string; heading: string; paragraphs: string[]; bullets: string[]; codeExamples: { language: string; code: string }[] }[];
  takeaways: string[]; sources: { title: string; url: string }[]; requiresVerification: boolean; verificationNotes: string[];
};
export const articles = (articleData as Article[])
  .filter(article => article.status === "published" && !article.requiresVerification)
  .sort((a,b) => b.datePublished.localeCompare(a.datePublished) || a.slug.localeCompare(b.slug));
export { plannedNotes };
export const getArticle = (slug: string) => articles.find(article => article.slug === slug);
export const displayDate = (value: string) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
export const safeJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
