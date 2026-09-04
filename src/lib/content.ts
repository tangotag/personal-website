import "server-only";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { routing } from "@/i18n/routing";
import { workFrontmatterSchema, type WorkEntry, type WorkFilter } from "@/types/work";

const WORK_DIR = join(process.cwd(), "src", "content", "work");
const IS_PROD = process.env.NODE_ENV === "production";

const tierOrder = { hero: 0, featured: 1, secondary: 2, collection: 3 } as const;

function readingMinutes(body: string) {
  const words = body
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Parses one MDX file; throws with a readable message when the frontmatter is invalid. */
function parseFile(file: string, locale: string, fallback: boolean): WorkEntry {
  const raw = readFileSync(join(WORK_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const parsed = workFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid frontmatter in src/content/work/${file} — ${issues}`);
  }
  const fm = parsed.data;
  return {
    ...fm,
    // Placeholder metrics never reach production.
    results: IS_PROD ? fm.results.filter((r) => r.status !== "confirm") : fm.results,
    locale,
    fallback,
    body: content,
    readingMinutes: readingMinutes(content),
  };
}

function fileFor(slug: string, locale: string) {
  const files = readdirSync(WORK_DIR);
  const exact = `${slug}.${locale}.mdx`;
  if (files.includes(exact)) return { file: exact, fallback: false };
  const base = `${slug}.${routing.defaultLocale}.mdx`;
  if (files.includes(base)) return { file: base, fallback: locale !== routing.defaultLocale };
  return null;
}

/** All slugs that have at least a default-locale file. */
export function getWorkSlugs(): string[] {
  const suffix = `.${routing.defaultLocale}.mdx`;
  return readdirSync(WORK_DIR)
    .filter((f) => f.endsWith(suffix))
    .map((f) => f.slice(0, -suffix.length));
}

export function getWork(slug: string, locale: string): WorkEntry | null {
  const hit = fileFor(slug, locale);
  if (!hit) return null;
  const entry = parseFile(hit.file, hit.fallback ? routing.defaultLocale : locale, hit.fallback);
  if (IS_PROD && entry.draft) return null;
  return entry;
}

/** Every published entry, ordered hero → featured → secondary → collection, then featuredOrder, then title. */
export function getAllWork(locale: string): WorkEntry[] {
  return getWorkSlugs()
    .map((slug) => getWork(slug, locale))
    .filter((e): e is WorkEntry => e !== null)
    .sort(
      (a, b) =>
        tierOrder[a.tier] - tierOrder[b.tier] ||
        (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99) ||
        a.title.localeCompare(b.title),
    );
}

/** Hero + featured entries for the home page (max `limit`). */
export function getFeaturedWork(locale: string, limit = 4): WorkEntry[] {
  return getAllWork(locale)
    .filter((e) => e.tier === "hero" || e.tier === "featured")
    .slice(0, limit);
}

export function filterWork(entries: WorkEntry[], filter: WorkFilter | "all"): WorkEntry[] {
  return filter === "all" ? entries : entries.filter((e) => e.filters.includes(filter));
}

/** Previous/next entries in listing order, wrapping around. */
export function getAdjacentWork(slug: string, locale: string) {
  const all = getAllWork(locale);
  const i = all.findIndex((e) => e.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: all[(i - 1 + all.length) % all.length] ?? null,
    next: all[(i + 1) % all.length] ?? null,
  };
}
