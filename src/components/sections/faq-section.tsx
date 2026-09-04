import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Faq } from "@/components/ui/faq";
import { getFaq } from "@/lib/data";
import { jsonLdString } from "@/lib/json-ld";
import { pick } from "@/types/content";

/**
 * Ten profile-level questions written for search and answer engines (SEO/AEO/GEO): direct,
 * entity-rich answers plus FAQPage structured data. Rendered on the home page.
 */
export async function FaqSection({ locale }: { locale: string }) {
  const t = await getTranslations("home.faq");
  const items = getFaq("home").map((f) => ({ q: pick(f.q, locale), a: pick(f.a, locale) }));
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <Section id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Container className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeader number="08" eyebrow={t("eyebrow")} title={t("title")} />
        </div>
        <div className="lg:col-span-8">
          <Faq items={items} name="home-faq" />
        </div>
      </Container>
    </Section>
  );
}
