import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/** Absolute-path canonical + hreflang alternates for a route, e.g. alternatesFor("/about", "es"). */
export function alternatesFor(path: string, locale: string): NonNullable<Metadata["alternates"]> {
  const clean = path === "/" ? "" : path;
  const href = (l: string) => (l === routing.defaultLocale ? clean || "/" : `/${l}${clean}`);
  return {
    canonical: href(locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, href(l)])),
      "x-default": href(routing.defaultLocale),
    },
  };
}
