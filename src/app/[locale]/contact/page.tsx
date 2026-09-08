import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { addressFor } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Faq } from "@/components/ui/faq";
import { StatusPill } from "@/components/ui/status-pill";
import { TextLink } from "@/components/ui/text-link";
import { site } from "@/data/site";
import { jsonLdString, siteGraph, PERSON_ID } from "@/lib/json-ld";
import { getFaq } from "@/lib/data";
import { pick } from "@/types/content";

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/contact">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.contact" });
  const { alternates, canonicalUrl } = addressFor("/contact", locale);
  return {
    title: t("title"),
    description: t("description"),
    alternates,
    openGraph: { url: canonicalUrl, title: t("title"), description: t("description") },
  };
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-eyebrow text-fg-muted">{label}</p>
      <div>{children}</div>
    </div>
  );
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.contact");
  const tc = await getTranslations("common");
  const faq = getFaq("contact").map((f) => ({ q: pick(f.q, locale), a: pick(f.a, locale) }));

  const tn = await getTranslations("nav");
  const tm = await getTranslations("meta");
  const crumbs = [
    { name: tn("home"), path: "/" },
    { name: tn("contact"), path: "/contact" },
  ];

  const jsonLd = siteGraph({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("description"),
    siteName: tm("siteName"),
    crumbs,
    pageType: "ContactPage",
    pageProps: { mainEntity: { "@id": PERSON_ID } },
    extra: [
      {
        "@type": "FAQPage",
        mainEntity: faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  });

  return (
    <main id="main" className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />
      <Section>
        <Container>
          <Breadcrumbs crumbs={crumbs} className="mb-8" />
          <StatusPill>{tc("available")}</StatusPill>
          <SectionHeader
            as="h1"
            eyebrow={t("title")}
            title={t("hero.title")}
            lead={t("hero.lead")}
            className="mt-6"
          />

          <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-16">
            {/* Details first on mobile — email and calendar are the fastest paths. */}
            <aside className="order-1 flex flex-col gap-8 lg:order-2 lg:col-span-5 lg:col-start-8">
              <Detail label={t("details.email")}>
                <CopyButton value={site.email} label={tc("copyEmail")} copiedLabel={tc("copied")} />
              </Detail>
              <Detail label={t("details.calendar")}>
                {/* Until the Cal.com link is configured, "Book a call" opens a pre-filled email instead. */}
                <Button
                  external
                  href={
                    site.calendarUrl ||
                    `mailto:${site.email}?subject=${encodeURIComponent("20-minute call")}`
                  }
                  arrow
                >
                  {tc("bookCall")}
                </Button>
                <p className="mt-2 text-sm text-fg-muted">{t("details.calendarText")}</p>
              </Detail>
              <Detail label={t("details.socials")}>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <li>
                    <TextLink external href={site.social.linkedin}>
                      LinkedIn
                    </TextLink>
                  </li>
                  <li>
                    <TextLink external href={site.social.behance}>
                      Behance
                    </TextLink>
                  </li>
                  {site.social.upwork ? (
                    <li>
                      <TextLink external href={site.social.upwork}>
                        Upwork
                      </TextLink>
                    </li>
                  ) : null}
                </ul>
              </Detail>
              <p className="font-mono text-xs text-fg-muted">{t("details.response")}</p>
            </aside>

            <div className="order-2 lg:order-1 lg:col-span-7">
              <ContactForm variant="contact" />
            </div>
          </div>
        </Container>
      </Section>

      <Section tight className="border-t border-border">
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-eyebrow text-fg-muted">{t("faqEyebrow")}</p>
            <h2 className="mt-3 text-h2">{t("faqTitle")}</h2>
          </div>
          <div className="lg:col-span-8">
            <Faq items={faq} name="contact-faq" />
          </div>
        </Container>
      </Section>
    </main>
  );
}
