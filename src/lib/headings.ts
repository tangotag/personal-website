import GithubSlugger from "github-slugger";

export type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * Pulls `##`/`###` headings out of raw MDX for the sticky TOC. Uses the same slugger as
 * rehype-slug so ids match exactly ("Context & goal" → "context--goal"). Comments are ignored.
 * Pure module (no React/components) so it can be unit-tested directly.
 */
export function extractHeadings(body: string): Heading[] {
  const clean = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
  const slugger = new GithubSlugger();
  const out: Heading[] = [];
  for (const line of clean.split("\n")) {
    const m = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const text = m[2].replace(/[*_`]/g, "");
    out.push({ id: slugger.slug(text), text, level: m[1].length as 2 | 3 });
  }
  return out;
}
