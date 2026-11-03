import { describe, expect, it } from "vitest";
import { canonicalOrigin, site } from "@/data/site";
import { jsonLdString } from "@/lib/json-ld";
import { extractHeadings } from "@/lib/headings";
import { absoluteUrl, alternatesFor } from "@/lib/seo";

/**
 * Production serves the apex and www 308-redirects to it. A canonical that names the redirecting
 * host is Lighthouse's "points to another hreflang location" failure, and it has shipped twice:
 * once in September, once on 2026-11-03 when the redirect was flipped at the DNS and the rule here
 * was not. These assertions name the live direction so the next flip breaks a test, not the SEO.
 */
describe("canonicalOrigin", () => {
  it("normalises www to the apex", () => {
    expect(canonicalOrigin("https://www.raheelqureshi.com")).toBe("https://raheelqureshi.com");
    expect(canonicalOrigin("https://www.raheelqureshi.com/es/work")).toBe(
      "https://raheelqureshi.com",
    );
  });

  it("leaves the apex alone", () => {
    expect(canonicalOrigin("https://raheelqureshi.com")).toBe("https://raheelqureshi.com");
  });

  it("does not touch preview or local origins", () => {
    expect(canonicalOrigin("http://localhost:3100")).toBe("http://localhost:3100");
    expect(canonicalOrigin("https://personal-website-git-main.vercel.app")).toBe(
      "https://personal-website-git-main.vercel.app",
    );
  });

  it("passes a value it cannot parse straight through", () => {
    expect(canonicalOrigin("not a url")).toBe("not a url");
  });

  it("keeps every absolute URL on the host that answers 200", () => {
    expect(site.url).not.toContain("www.");
    expect(absoluteUrl("/work/compass-pos")).toBe("https://raheelqureshi.com/work/compass-pos");
    expect(absoluteUrl("/")).toBe("https://raheelqureshi.com/");
  });
});

describe("alternatesFor", () => {
  it("builds canonical + hreflang for the default locale without a prefix", () => {
    const a = alternatesFor("/about", "de");
    expect(a.canonical).toBe("/about");
    expect(a.languages).toEqual({ de: "/about", es: "/es/about", "x-default": "/about" });
  });

  it("prefixes Spanish and keeps the root clean", () => {
    expect(alternatesFor("/", "es").canonical).toBe("/es");
    expect(alternatesFor("/", "de").canonical).toBe("/");
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
