import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { projects } from "@/content/projects";
import { journal } from "@/content/site";

const BASE = "https://samiradadashi.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/works", "/about", "/journal", "/cv", "/contact"];
  const projectPaths = projects.map((p) => `/works/${p.slug}`);
  const notePaths = journal.map((n) => `/journal/${n.slug}`);
  const all = [...staticPaths, ...projectPaths, ...notePaths];

  return locales.flatMap((l) =>
    all.map((path) => ({
      url: `${BASE}/${l}${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((x) => [x, `${BASE}/${x}${path}`])),
      },
    }))
  );
}
