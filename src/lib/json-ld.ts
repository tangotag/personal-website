/**
 * Serialises structured data for a <script type="application/ld+json"> tag.
 * `<` is escaped so user-influenced strings can never close the script tag (XSS).
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
