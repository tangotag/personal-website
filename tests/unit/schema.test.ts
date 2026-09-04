import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { experiencesSchema, faqsSchema, servicesSchema, testimonialsSchema } from "@/types/content";
import { workFrontmatterSchema } from "@/types/work";

const valid = {
  slug: "example-project",
  title: "Example project",
  hook: "A hook",
  template: "standard",
  tier: "featured",
  client: "Client",
  role: "Designer",
  timeline: "2024",
  platforms: ["Web"],
  industry: ["SaaS"],
  tags: ["A"],
  filters: ["saas"],
};

describe("work frontmatter schema", () => {
  it("accepts a minimal valid entry with defaults applied", () => {
    const r = workFrontmatterSchema.parse(valid);
    expect(r.results).toEqual([]);
    expect(r.credits).toEqual([]);
    expect(r.draft).toBe(false);
  });

  it("rejects non-kebab slugs, unknown filters and too many tags", () => {
    expect(workFrontmatterSchema.safeParse({ ...valid, slug: "Bad Slug" }).success).toBe(false);
    expect(workFrontmatterSchema.safeParse({ ...valid, filters: ["nope"] }).success).toBe(false);
    expect(
      workFrontmatterSchema.safeParse({ ...valid, tags: ["1", "2", "3", "4", "5", "6", "7"] })
        .success,
    ).toBe(false);
  });

  it("requires cover paths to start with / and results to carry value + label", () => {
    expect(workFrontmatterSchema.safeParse({ ...valid, cover: "cover.jpg" }).success).toBe(false);
    expect(workFrontmatterSchema.safeParse({ ...valid, results: [{ value: "1" }] }).success).toBe(
      false,
    );
    expect(
      workFrontmatterSchema.safeParse({
        ...valid,
        results: [{ value: "1", label: "x", status: "confirm" }],
      }).success,
    ).toBe(true);
  });
});

describe("JSON content", () => {
  const read = (name: string) => JSON.parse(readFileSync(`src/content/${name}.json`, "utf8"));

  it("services.json matches its schema and has seven offerings", () => {
    const r = servicesSchema.parse(read("services"));
    expect(r).toHaveLength(7);
    expect(new Set(r.map((s) => s.slug)).size).toBe(7);
  });

  it("experience.json matches its schema with exactly one open-ended current role per company", () => {
    const r = experiencesSchema.parse(read("experience"));
    expect(r.length).toBeGreaterThanOrEqual(6);
    expect(r.filter((x) => !x.end).map((x) => x.company)).toContain("Cygnus Payments");
  });

  it("faq.json and testimonials.json parse", () => {
    expect(faqsSchema.parse(read("faq")).filter((f) => f.page === "services").length).toBe(6);
    expect(Array.isArray(testimonialsSchema.parse(read("testimonials")))).toBe(true);
  });
});
