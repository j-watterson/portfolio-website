import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { articles, SITE_URL } from "@/lib/writing";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["", "/projects", "/about", "/resume", "/writing", ...projects.map(p => `/projects/${p.slug}`)].map(path => ({ url: `${SITE_URL}${path}`, changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.8 })),
    ...articles.map(article => ({ url: article.canonicalUrl, lastModified: article.dateModified, changeFrequency: "yearly" as const, priority: 0.7 }))
  ];
}
