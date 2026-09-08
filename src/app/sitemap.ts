import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { routing } from "@/i18n/routing";
import { getWorkSlugs, getWork } from "@/lib/content";

const staticPaths = ["", "/work", "/services", "/about", "/contact"] as const;

function localized(path: string, locale: string) {
  return locale === routing.defaultLocale ? `${site.url}${path}` : `${site.url}/${locale}${path}`;
}

/**
 * The hreflang set for a route. x-default matters as much here as it does in the page markup:
 * without it Google has no instruction for a visitor whose language matches neither entry.
 */
function languagesFor(path: string) {
  return {
    ...Object.fromEntries(routing.locales.map((l) => [l, localized(path, l)])),
    "x-default": localized(path, routing.defaultLocale),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    for (const locale of routing.locales) {
      entries.push({
        url: localized(path, locale),
        lastModified: now,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.8,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  for (const slug of getWorkSlugs()) {
    // Skip drafts (getWork returns null for drafts in production).
    if (!getWork(slug, routing.defaultLocale)) continue;
    const path = `/work/${slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localized(path, locale),
        lastModified: now,
        changeFrequency: "yearly",
        priority: 0.7,
        alternates: { languages: languagesFor(path) },
      });
    }
  }

  return entries;
}
