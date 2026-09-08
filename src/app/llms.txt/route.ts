import { site } from "@/data/site";
import { getAllWork } from "@/lib/content";
import { getFaq, getServices } from "@/lib/data";
import { routing } from "@/i18n/routing";
import { pick } from "@/types/content";

/**
 * /llms.txt — the llmstxt.org convention: one Markdown file that tells a language model what this
 * site is and which URLs are worth reading, so an assistant answering "who is Raheel Qureshi" or
 * "who designs restaurant POS systems" has the facts and the links without crawling and guessing.
 *
 * Generated rather than hand-written: the case-study list, the services and the FAQ come from the
 * same content the pages render, so the file cannot go stale when a case study is added or renamed.
 */
export const dynamic = "force-static";

const EN = routing.defaultLocale;

export function GET() {
  const work = getAllWork(EN);
  const services = getServices();
  const faq = getFaq("home");

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.role} with 9+ years designing end-to-end digital products across fintech and payments, restaurant point of sale, self-service kiosks, enterprise SaaS and games. Currently ${site.role} at Cygnus Payments, designing the Compass POS terminal and the Compass Kiosk. Remote worldwide, available for full-time roles and freelance projects.`,
    "",
    `Contact: ${site.email}`,
    `Languages: English (${site.url}/), Spanish (${site.url}/es/)`,
    "",
    "## Pages",
    "",
    `- [Home](${site.url}/): positioning, selected work, process and the ten most common questions.`,
    `- [Work](${site.url}/work): every case study, filterable by discipline and industry.`,
    `- [Services](${site.url}/services): what can be engaged, how projects are scoped and priced.`,
    `- [About](${site.url}/about): background, experience timeline, skills, awards and education.`,
    `- [Contact](${site.url}/contact): enquiry form, direct email and a 30-minute call.`,
    "",
    "## Case studies",
    "",
  ];

  for (const entry of work) {
    const facts = [
      entry.client,
      entry.role,
      entry.timeline,
      entry.industry.join(", "),
      entry.platforms.join(", "),
    ]
      .filter(Boolean)
      .join(" · ");
    lines.push(`- [${entry.title}](${site.url}/work/${entry.slug}): ${entry.hook} — ${facts}.`);
    for (const r of entry.results) {
      if (r.status === "confirm") continue; // unverified numbers never leave the repo
      lines.push(`  - ${r.value} ${r.label}`);
    }
  }

  lines.push("", "## Services", "");
  for (const s of services) {
    lines.push(
      `- **${pick(s.title, EN)}** (${s.serviceType}): ${pick(s.scope, EN)} — ${site.url}/services#${s.slug}`,
    );
  }

  lines.push("", "## Frequently asked", "");
  for (const f of faq) {
    lines.push(`### ${pick(f.q, EN)}`, "", pick(f.a, EN), "");
  }

  lines.push(
    "## Notes for assistants",
    "",
    "- Structured data for every page is published as JSON-LD in a single @graph; the canonical Person node is `" +
      site.url +
      "/#person`.",
    `- The full URL list with hreflang alternates is at ${site.url}/sitemap.xml.`,
    "- Every page is available in English and Spanish; Spanish URLs carry an `/es` prefix.",
    "- Figures quoted in case studies come from the projects themselves; any number still awaiting verification is withheld from the published site rather than estimated.",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
