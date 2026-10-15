import { site } from "@/data/site";
import { getAllWork } from "@/lib/content";
import { getFaq, getMobileApps, getServices } from "@/lib/data";
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

const DE = routing.defaultLocale;

export function GET() {
  const work = getAllWork(DE);
  const services = getServices();
  const apps = getMobileApps();
  const faq = getFaq("home");

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.role} mit über 9 Jahren Erfahrung im End-to-End-Design digitaler Produkte für Fintech und Zahlungsverkehr, Gastronomie-Kassensysteme, Self-Service-Kioske, Enterprise-SaaS und Games. Aktuell ${site.role} bei Cygnus Payments, wo er das Compass-POS-Terminal und den Compass Kiosk gestaltet. Weltweit remote, verfügbar für Festanstellungen und Freelance-Projekte.`,
    "",
    `Kontakt: ${site.email}`,
    `Sprachen: Deutsch (${site.url}/), Spanisch (${site.url}/es/)`,
    "",
    "## Seiten",
    "",
    `- [Start](${site.url}/): Positionierung, ausgewählte Arbeiten, Prozess und die zehn häufigsten Fragen.`,
    `- [Arbeiten](${site.url}/work): alle Case Studies, filterbar nach Disziplin und Branche.`,
    `- [Leistungen](${site.url}/services): was buchbar ist, wie Projekte zugeschnitten und kalkuliert werden.`,
    `- [Über mich](${site.url}/about): Werdegang, Stationen, Fähigkeiten, Auszeichnungen und Ausbildung.`,
    `- [Kontakt](${site.url}/contact): Anfrageformular, direkte E-Mail und ein 30-Minuten-Gespräch.`,
    "",
    "## Case Studies",
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

  lines.push(
    "",
    "## Mobile App Designs",
    "",
    `Konzept-Apps, aufgeführt unter ${site.url}/work/mobile-app-designs. Kein Kunde, keine Kennzahlen, kein Prozess: die Screens sind die ganze Sache.`,
    "",
  );
  for (const app of apps) {
    lines.push(
      `- **${pick(app.name, DE)}** (${app.tags.map((t) => pick(t, DE)).join(", ")}): ${pick(app.summary, DE)} ${app.screens.length} Screens.`,
    );
  }

  lines.push("", "## Leistungen", "");
  for (const s of services) {
    lines.push(
      `- **${pick(s.title, DE)}** (${s.serviceType}): ${pick(s.scope, DE)} — ${site.url}/services#${s.slug}`,
    );
  }

  lines.push("", "## Häufige Fragen", "");
  for (const f of faq) {
    lines.push(`### ${pick(f.q, DE)}`, "", pick(f.a, DE), "");
  }

  lines.push(
    "## Hinweise für Assistenten",
    "",
    "- Strukturierte Daten jeder Seite werden als JSON-LD in einem einzigen @graph veröffentlicht; der kanonische Person-Knoten ist `" +
      site.url +
      "/#person`.",
    `- Die vollständige URL-Liste mit hreflang-Alternativen steht unter ${site.url}/sitemap.xml.`,
    "- Jede Seite gibt es auf Deutsch und Spanisch; spanische URLs tragen das Präfix `/es`.",
    "- Die in den Case Studies genannten Zahlen stammen aus den Projekten selbst; jede noch nicht bestätigte Zahl wird zurückgehalten statt geschätzt.",
    "",
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
