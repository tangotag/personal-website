import { afterEach, describe, expect, it, vi } from "vitest";

// The loader reads NODE_ENV at import time, so each scenario imports a fresh module instance.
async function loadWith(env: "development" | "production") {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", env);
  return import("@/lib/content");
}

afterEach(() => vi.unstubAllEnvs());

describe("content loader", () => {
  it("lists slugs from the German files and orders the hero first", async () => {
    const { getWorkSlugs, getAllWork } = await loadWith("development");
    expect(getWorkSlugs()).toContain("compass-pos");
    const all = getAllWork("de");
    expect(all[0]?.slug).toBe("compass-pos");
    expect(all[0]?.tier).toBe("hero");
    // Featured entries follow in featuredOrder.
    const featured = all.filter((e) => e.tier === "featured").map((e) => e.featuredOrder);
    expect(featured).toEqual([...featured].sort((a, b) => (a ?? 99) - (b ?? 99)));
  });

  // The loader falls back to the German body when a Spanish one is missing, which renders German
  // prose under a Spanish URL. Every entry is translated today, so the guarantee worth asserting is
  // that none of them is relying on that fallback — add a .de.mdx without its .es.mdx and this
  // fails by name.
  it("serves every published entry in both locales without falling back", async () => {
    const { getWorkSlugs, getWork } = await loadWith("development");
    const slugs = getWorkSlugs();
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) {
      for (const locale of ["de", "es"] as const) {
        const entry = getWork(slug, locale);
        expect(entry, `${slug}.${locale}.mdx is missing`).not.toBeNull();
        expect(entry?.fallback, `${slug}.${locale}.mdx falls back`).toBe(false);
        expect(entry?.locale).toBe(locale);
      }
    }
  });

  it("returns null for unknown slugs", async () => {
    const { getWork } = await loadWith("development");
    expect(getWork("does-not-exist", "de")).toBeNull();
  });

  it("strips placeholder results and hides drafts in production only", async () => {
    const dev = await loadWith("development");
    const devEntry = dev.getWork("compass-pos", "de");
    expect(devEntry?.results.some((r) => r.status === "confirm")).toBe(true);

    const prod = await loadWith("production");
    const prodEntry = prod.getWork("compass-pos", "de");
    expect(prodEntry?.results.some((r) => r.status === "confirm")).toBe(false);
    expect(prod.getAllWork("de").some((e) => e.draft)).toBe(false);

    // Whatever drafts the catalogue holds are readable in development and absent from production.
    // Asserting over the set rather than one slug keeps this true as entries are published.
    for (const draft of dev.getAllWork("de").filter((e) => e.draft)) {
      expect(dev.getWork(draft.slug, "de")).not.toBeNull();
      expect(prod.getWork(draft.slug, "de")).toBeNull();
    }
  });

  it("wraps prev/next around the listing", async () => {
    const { getAllWork, getAdjacentWork } = await loadWith("development");
    const all = getAllWork("de");
    const first = getAdjacentWork(all[0]!.slug, "de");
    expect(first.next?.slug).toBe(all[1]?.slug);
    expect(first.prev?.slug).toBe(all[all.length - 1]?.slug);
  });

  it("filters by the /work filter keys", async () => {
    const { getAllWork, filterWork } = await loadWith("development");
    const all = getAllWork("de");
    expect(filterWork(all, "all")).toHaveLength(all.length);
    for (const e of filterWork(all, "games")) expect(e.filters).toContain("games");
  });
});
