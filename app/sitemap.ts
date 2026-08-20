import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://jonathon-watterson-portfolio.sites.openai.com";
  return ["", "/projects", "/about", "/resume", "/writing", ...projects.map((p) => `/projects/${p.slug}`)].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.8 }));
}

