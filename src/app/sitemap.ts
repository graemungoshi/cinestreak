import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Slice 2: generate title/episode sitemaps from the D1 database.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE, changeFrequency: "daily", priority: 1 }];
}
