import type { Metadata } from "next";
import { site } from "@/data/site";
import { routing } from "@/i18n/routing";

/**
 * Locale-aware path for a route. English is unprefixed (`localePrefix: "as-needed"`), Spanish
 * lives under /es.
 */
export function hrefFor(path: string, locale: string) {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

/** Absolute URL on the canonical origin. Structured data needs absolute URLs; metadata does not. */
export function absoluteUrl(path: string) {
  return path === "/" ? `${site.url}/` : `${site.url}${path}`;
}

/** Absolute-path canonical + hreflang alternates for a route, e.g. alternatesFor("/about", "es"). */
export function alternatesFor(path: string, locale: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: hrefFor(path, locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, hrefFor(path, l)])),
      "x-default": hrefFor(path, routing.defaultLocale),
    },
  };
}

/**
 * Everything a page needs to be addressable: the canonical, the hreflang set, and og:url — which
 * Next does not derive from the canonical, so without this the Open Graph card has no identity of
 * its own and social platforms fall back to the shared URL.
 */
export function addressFor(path: string, locale: string) {
  return {
    alternates: alternatesFor(path, locale),
    canonicalUrl: absoluteUrl(hrefFor(path, locale)),
  };
}

export type Crumb = { name: string; path: string };

/**
 * schema.org BreadcrumbList. Every page passes the trail that ends at itself, the last crumb
 * being the current page, so the graph matches what the header shows.
 */
export function breadcrumbLd(crumbs: Crumb[], locale: string) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(hrefFor(crumbs[crumbs.length - 1]!.path, locale))}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(hrefFor(c.path, locale)),
    })),
  };
}
