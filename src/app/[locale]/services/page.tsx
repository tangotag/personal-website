import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/seo";
import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { ContactCta } from "@/components/sections/contact-cta";
import { Button } from "@/components/ui/button";
import { Faq } from "@/components/ui/faq";
import { Tag } from "@/components/ui/tag";
import { site } from "@/data/site";
import { getFaq, getServices } from "@/lib/data";
import { jsonLdString } from "@/lib/json-ld";
import { pick } from "@/types/content";

const IS_PROD = process.env.NODE_ENV === "production";

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/services">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.services" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/services", locale),
  };
}

type Step = { title: string; text: string; needs: string };
type Model = { title: string; text: string };

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.services");
  const services = getServices();
  const faq = getFaq("services").map((f) => ({ q: pick(f.q, locale), a: pick(f.a, locale) }));
  const models = t.raw("models.items") as Model[];
  const steps = t.raw("process.steps") as Step[];
  const next = t.raw("quote.next.items") as string[];
  const pageUrl = `${site.url}${locale === "es" ? "/es" : ""}/services`;

  // ProfessionalService + one Service per offering (required by the brief) + FAQPage.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "@id": `${site.url}#business`,
      name: `${site.name} — ${site.role}`,
      url: pageUrl,
      email: site.email,
      areaServed: "Worldwide",
      availableLanguage: ["en", "es"],
      founder: { "@type": "Person", name: site.name, url: site.url, jobTitle: site.role },
      makesOffer: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: pick(s.title, locale),
          serviceType: s.serviceType,
          description: pick(s.scope, locale),
          provider: { "@type": "Person", name: site.name },
          url: `${pageUrl}#${s.slug}`,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <main id="main" className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      <Section>
        <Container>
          <SectionHeader
            as="h1"
            number="02"
            eyebrow={t("title")}
            title={t("hero.title")}
            lead={t("hero.lead")}
            action={
              <Button href="/services#quote" arrow>
                {t("hero.cta")}
              </Button>
            }
          />

          <div className="mt-14">
            <p className="text-eyebrow text-fg-muted">{t("cardsEyebrow")}</p>
            <h2 className="mt-3 text-h2">{t("cardsTitle")}</h2>
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {services.map((s) => {
                const showTimeline = !(IS_PROD && s.timelineStatus === "confirm");
                return (
                  <li
                    key={s.slug}
                    id={s.slug}
                    className="flex scroll-mt-24 flex-col gap-5 rounded-md border border-border bg-surface p-6 md:p-8"
                  >
                    <div className="flex flex-wrap gap-2">
                      {s.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                    <h3 className="text-h3">{pick(s.title, locale)}</h3>
                    <p className="text-fg-muted">{pick(s.scope, locale)}</p>
                    <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
                      <div>
                        <p className="text-eyebrow text-fg-muted">{t("detail.deliverables")}</p>
                        <ul className="mt-2 space-y-1 text-sm text-fg">
                          {s.deliverables.map((d, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-accent">—</span>
                              {pick(d, locale)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {showTimeline ? (
                        <div className="sm:text-right">
                          <p className="text-eyebrow text-fg-muted">{t("detail.timeline")}</p>
                          <p className="mt-2 font-mono text-sm">
                            {pick(s.timeline, locale)}
                            {s.timelineStatus === "confirm" ? (
                              <span className="ml-2 text-fg-muted">[CONFIRM]</span>
                            ) : null}
                          </p>
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-auto pt-2">
                      <Button variant="ghost" href={`/services?service=${s.slug}#quote`}>
                        {t("detail.quote")}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-border bg-surface">
        <Container>
          <SectionHeader number="03" eyebrow={t("models.eyebrow")} title={t("models.title")} />
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {models.map((m, i) => (
              <li key={i} className="rounded-md border border-border bg-bg p-6">
                <p className="font-mono text-xs text-accent">0{i + 1}</p>
                <h3 className="mt-3 text-h3">{m.title}</h3>
                <p className="mt-3 text-fg-muted">{m.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionHeader number="04" eyebrow={t("process.eyebrow")} title={t("process.title")} />
          <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={i} className="relative flex flex-col gap-3 border-t border-border pt-5">
                <span aria-hidden className="absolute -top-px left-0 h-px w-10 bg-accent" />
                <p className="font-mono text-xs text-accent">0{i + 1}</p>
                <h3 className="text-h3">{step.title}</h3>
                <p className="text-fg-muted">{step.text}</p>
                <p className="mt-auto text-sm text-fg">{step.needs}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section id="quote" className="border-y border-border bg-surface">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeader
              number="05"
              eyebrow={t("quote.eyebrow")}
              title={t("quote.title")}
              lead={t("quote.lead")}
            />
            <div className="mt-10">
              <ContactForm
                variant="quote"
                defaultIntent="client"
                services={services.map((s) => ({ slug: s.slug, title: pick(s.title, locale) }))}
              />
            </div>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <p className="text-eyebrow text-fg-muted">{t("quote.next.title")}</p>
            <ol className="mt-4 space-y-4">
              {next.map((item, i) => (
                <li key={i} className="flex gap-3 text-fg-muted">
                  <span className="font-mono text-xs text-accent">0{i + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </aside>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-eyebrow text-fg-muted">{t("faqEyebrow")}</p>
            <h2 className="mt-3 text-h2">{t("faqTitle")}</h2>
          </div>
          <div className="lg:col-span-8">
            <Faq items={faq} name="services-faq" />
          </div>
        </Container>
      </Section>

      <ContactCta />
    </main>
  );
}
