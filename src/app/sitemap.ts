import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Slice 2: generate title/episode sitemaps from the D1 database.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/movies`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/tv`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE}/news`, changeFrequency: "hourly", priority: 0.6 },
  ];
}
