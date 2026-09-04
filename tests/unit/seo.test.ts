import { describe, expect, it } from "vitest";
import { jsonLdString } from "@/lib/json-ld";
import { extractHeadings } from "@/lib/headings";
import { alternatesFor } from "@/lib/seo";

describe("alternatesFor", () => {
  it("builds canonical + hreflang for the default locale without a prefix", () => {
    const a = alternatesFor("/about", "en");
    expect(a.canonical).toBe("/about");
    expect(a.languages).toEqual({ en: "/about", es: "/es/about", "x-default": "/about" });
  });

  it("prefixes Spanish and keeps the root clean", () => {
    expect(alternatesFor("/", "es").canonical).toBe("/es");
    expect(alternatesFor("/", "en").canonical).toBe("/");
    expect(alternatesFor("/work/compass-pos", "es").languages?.es).toBe("/es/work/compass-pos");
  });
});

describe("jsonLdString", () => {
  it("escapes < so injected strings cannot close the script tag", () => {
    const out = jsonLdString({ name: "</script><img src=x onerror=alert(1)>" });
    expect(out).not.toContain("</script>");
    expect(out).toContain("\\u003c/script>");
  });
});

describe("extractHeadings", () => {
  it("matches rehype-slug ids and ignores MDX comments", () => {
    const body = `{/* ## Not a heading */}\n\n## Context & goal\n\nText\n\n### My role & team\n\n## Results & learnings`;
    expect(extractHeadings(body)).toEqual([
      { id: "context--goal", text: "Context & goal", level: 2 },
      { id: "my-role--team", text: "My role & team", level: 3 },
      { id: "results--learnings", text: "Results & learnings", level: 2 },
    ]);
  });

  it("de-duplicates repeated headings the way github-slugger does", () => {
    const ids = extractHeadings("## Users\n\n## Users").map((h) => h.id);
    expect(ids).toEqual(["users", "users-1"]);
  });
});
