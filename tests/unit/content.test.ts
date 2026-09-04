import { afterEach, describe, expect, it, vi } from "vitest";

// The loader reads NODE_ENV at import time, so each scenario imports a fresh module instance.
async function loadWith(env: "development" | "production") {
  vi.resetModules();
  vi.stubEnv("NODE_ENV", env);
  return import("@/lib/content");
}

afterEach(() => vi.unstubAllEnvs());

describe("content loader", () => {
  it("lists slugs from the English files and orders the hero first", async () => {
    const { getWorkSlugs, getAllWork } = await loadWith("development");
    expect(getWorkSlugs()).toContain("compass-pos");
    const all = getAllWork("en");
    expect(all[0]?.slug).toBe("compass-pos");
    expect(all[0]?.tier).toBe("hero");
    // Featured entries follow in featuredOrder.
    const featured = all.filter((e) => e.tier === "featured").map((e) => e.featuredOrder);
    expect(featured).toEqual([...featured].sort((a, b) => (a ?? 99) - (b ?? 99)));
  });

  it("falls back to English for a missing Spanish file and flags it", async () => {
    const { getWork } = await loadWith("development");
    const es = getWork("compass-pos", "es");
    expect(es?.fallback).toBe(true);
    expect(es?.locale).toBe("en");
    const en = getWork("compass-pos", "en");
    expect(en?.fallback).toBe(false);
  });

  it("returns null for unknown slugs", async () => {
    const { getWork } = await loadWith("development");
    expect(getWork("does-not-exist", "en")).toBeNull();
  });

  it("strips placeholder results and hides drafts in production only", async () => {
    const dev = await loadWith("development");
    const devEntry = dev.getWork("compass-pos", "en");
    expect(devEntry?.results.some((r) => r.status === "confirm")).toBe(true);
    expect(dev.getWork("kompete", "en")).not.toBeNull(); // draft visible in dev

    const prod = await loadWith("production");
    const prodEntry = prod.getWork("compass-pos", "en");
    expect(prodEntry?.results.some((r) => r.status === "confirm")).toBe(false);
    expect(prod.getWork("kompete", "en")).toBeNull(); // draft hidden in production
    expect(prod.getAllWork("en").some((e) => e.draft)).toBe(false);
  });

  it("wraps prev/next around the listing", async () => {
    const { getAllWork, getAdjacentWork } = await loadWith("development");
    const all = getAllWork("en");
    const first = getAdjacentWork(all[0]!.slug, "en");
    expect(first.next?.slug).toBe(all[1]?.slug);
    expect(first.prev?.slug).toBe(all[all.length - 1]?.slug);
  });

  it("filters by the /work filter keys", async () => {
    const { getAllWork, filterWork } = await loadWith("development");
    const all = getAllWork("en");
    expect(filterWork(all, "all")).toHaveLength(all.length);
    for (const e of filterWork(all, "games")) expect(e.filters).toContain("games");
  });
});
