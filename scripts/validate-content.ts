/**
 * Build-time content validation (runs via `prebuild`).
 *
 * 1. Message catalogs — every key in messages/en.json exists in every other locale with the
 *    same value type, and no locale carries stray keys.
 * 2. Case studies — every src/content/work/*.mdx has valid frontmatter (zod), a cover file on
 *    disk when `cover` is set, and a coverAlt whenever a cover exists.
 * 3. Filters — every /work filter matches at least one published entry.
 * 4. JSON data — services / experience / testimonials match their schemas.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { experiencesSchema, servicesSchema, testimonialsSchema } from "../src/types/content";
import { workFilters, workFrontmatterSchema } from "../src/types/work";

const root = process.cwd();
const errors: string[] = [];

// 1. Messages ------------------------------------------------------------------------------
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

function flatten(value: Json, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  if (Array.isArray(value)) {
    out.set(prefix, `array(${value.length})`);
    return out;
  }
  if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      for (const [ck, cv] of flatten(v, prefix ? `${prefix}.${k}` : k)) out.set(ck, cv);
    }
    return out;
  }
  out.set(prefix, typeof value);
  return out;
}

const messagesDir = join(root, "messages");
const catalogs = readdirSync(messagesDir).filter((f) => f.endsWith(".json"));
const base = "en.json";
if (!catalogs.includes(base)) errors.push(`messages/${base} is missing`);
const baseFlat = flatten(JSON.parse(readFileSync(join(messagesDir, base), "utf8")) as Json);

for (const file of catalogs) {
  if (file === base) continue;
  const flat = flatten(JSON.parse(readFileSync(join(messagesDir, file), "utf8")) as Json);
  for (const [key, type] of baseFlat) {
    if (!flat.has(key)) errors.push(`messages/${file}: missing key "${key}"`);
    else if (flat.get(key) !== type)
      errors.push(`messages/${file}: "${key}" is ${flat.get(key)}, expected ${type}`);
  }
  for (const key of flat.keys()) {
    if (!baseFlat.has(key))
      errors.push(`messages/${file}: unexpected key "${key}" (not in ${base})`);
  }
}

// 2 + 3. Case studies -----------------------------------------------------------------------
const workDir = join(root, "src", "content", "work");
const mdxFiles = readdirSync(workDir).filter((f) => f.endsWith(".mdx"));
const filterHits = new Map<string, number>(workFilters.map((f) => [f, 0]));
const slugsSeen = new Map<string, string>();

for (const file of mdxFiles) {
  const m = file.match(/^([a-z0-9-]+)\.([a-z]{2})\.mdx$/);
  if (!m) {
    errors.push(`work/${file}: file name must be <slug>.<locale>.mdx`);
    continue;
  }
  const [, fileSlug, locale] = m;
  const { data } = matter(readFileSync(join(workDir, file), "utf8"));
  const parsed = workFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    for (const issue of parsed.error.issues)
      errors.push(`work/${file}: ${issue.path.join(".") || "frontmatter"} — ${issue.message}`);
    continue;
  }
  const fm = parsed.data;
  if (fm.slug !== fileSlug)
    errors.push(`work/${file}: slug "${fm.slug}" ≠ file name "${fileSlug}"`);
  if (fm.cover) {
    if (!existsSync(join(root, "public", fm.cover)))
      errors.push(`work/${file}: cover "${fm.cover}" not found under public/`);
    if (!fm.coverAlt) errors.push(`work/${file}: coverAlt is required when cover is set`);
  }
  if (fm.loop && !existsSync(join(root, "public", fm.loop)))
    errors.push(`work/${file}: loop "${fm.loop}" not found under public/`);
  if (locale === "en" && !fm.draft) {
    slugsSeen.set(fm.slug, file);
    for (const f of fm.filters) filterHits.set(f, (filterHits.get(f) ?? 0) + 1);
  }
}

// Filters must never produce an empty grid (docs/08 §3). Warn until the catalogue is complete,
// error once at least five case studies exist.
for (const [filter, hits] of filterHits) {
  if (hits === 0) {
    const msg = `filter "${filter}" matches no published case study`;
    if (slugsSeen.size >= 5) errors.push(msg);
    else console.warn(`⚠ ${msg} (ignored while catalogue < 5 entries)`);
  }
}

// 4. JSON data -----------------------------------------------------------------------------
const jsonChecks = [
  ["services", servicesSchema],
  ["experience", experiencesSchema],
  ["testimonials", testimonialsSchema],
] as const;
for (const [name, schema] of jsonChecks) {
  const raw = JSON.parse(readFileSync(join(root, "src", "content", `${name}.json`), "utf8"));
  const r = schema.safeParse(raw);
  if (!r.success)
    for (const issue of r.error.issues)
      errors.push(`content/${name}.json: ${issue.path.join(".") || "root"} — ${issue.message}`);
}

// Report -----------------------------------------------------------------------------------
if (errors.length) {
  console.error(
    `✖ Content validation failed (${errors.length}):\n` + errors.map((e) => `  - ${e}`).join("\n"),
  );
  process.exit(1);
}

console.log(
  `✔ Content valid — ${catalogs.length} catalogs (${baseFlat.size} keys), ${slugsSeen.size} published case studies, ${mdxFiles.length} MDX files.`,
);
