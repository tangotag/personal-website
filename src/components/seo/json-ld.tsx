import { jsonLdString } from "@/lib/json-ld";

/**
 * A page's structured data.
 *
 * `data-cookieconsent="ignore"` keeps Cookiebot's auto-blocking off it. Nothing here sets a
 * cookie, and a consent manager that re-types this tag takes the page's structured data with it —
 * which is the whole SEO story, silently.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      data-cookieconsent="ignore"
      dangerouslySetInnerHTML={{ __html: jsonLdString(data) }}
    />
  );
}
