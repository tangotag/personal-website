import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { ContactCta } from "@/components/sections/contact-cta";
import { ExperienceTimeline } from "@/components/sections/experience-timeline";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { site } from "@/data/site";
import { getExperience } from "@/lib/data";
import { jsonLdString } from "@/lib/json-ld";

const PORTRAIT = "/images/portrait.jpg";
const hasPortrait = existsSync(join(process.cwd(), "public", PORTRAIT));

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/about">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/about", locale),
  };
}

type Bring = { title: string; text: string };
type SkillGroup = { title: string; items: string[] };
type Award = { title: string; org: string; year: string };

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.about");
  const story = t.raw("story") as string[];
  const bring = t.raw("bring.items") as Bring[];
  const groups = t.raw("skills.groups") as SkillGroup[];
  const awards = t.raw("awards.items") as Award[];
  const certs = t.raw("awards.certs") as string[];
  const experience = getExperience();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    url: site.url,
    email: site.email,
    image: hasPortrait ? `${site.url}${PORTRAIT}` : undefined,
    sameAs: [site.social.linkedin, site.social.behance, site.social.upwork].filter(Boolean),
    worksFor: { "@type": "Organization", name: experience[0]?.company },
    alumniOf: { "@type": "CollegeOrUniversity", name: t("education.school") },
    award: awards.map((a) => `${a.title} · ${a.org}, ${a.year}`),
    hasCredential: certs.map((c) => ({ "@type": "EducationalOccupationalCredential", name: c })),
    knowsAbout: groups.flatMap((g) => g.items),
  };

  return (
    <main id="main" className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }}
      />

      <Section>
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg border border-border bg-surface-2 lg:mx-0">
              {hasPortrait ? (
                <Image
                  src={PORTRAIT}
                  alt={site.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-3 bg-[repeating-linear-gradient(-45deg,var(--border)_0_10px,transparent_10px_22px)]">
                  <span className="font-display text-6xl font-bold tracking-tight text-fg/80">
                    {site.shortName}
                  </span>
                  <span className="font-mono text-xs tracking-[0.12em] text-fg-muted uppercase">
                    portrait · pending
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-7">
            <SectionHeader
              as="h1"
              number="03"
              eyebrow={t("hero.eyebrow")}
              title={t("hero.title")}
            />
            <div className="mt-8 flex max-w-[68ch] flex-col gap-5 text-lg text-fg-muted">
              {story.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-8">
              <Button variant="secondary" external download href={site.resumePath}>
                {t("resume.cta")}
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-y border-border bg-surface">
        <Container>
          <SectionHeader number="04" eyebrow={t("bring.eyebrow")} title={t("bring.title")} />
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {bring.map((b, i) => (
              <li key={i} className="rounded-md border border-border bg-bg p-6">
                <p className="font-mono text-xs text-accent-strong">0{i + 1}</p>
                <h3 className="mt-3 text-h3">{b.title}</h3>
                <p className="mt-3 text-fg-muted">{b.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section id="experience">
        <Container>
          <SectionHeader number="05" eyebrow={t("timeline.eyebrow")} title={t("timeline.title")} />
          <div className="mt-12">
            <ExperienceTimeline locale={locale} />
          </div>
        </Container>
      </Section>

      <Section className="border-y border-border bg-surface">
        <Container>
          <SectionHeader number="06" eyebrow={t("skills.eyebrow")} title={t("skills.title")} />
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="text-eyebrow text-fg-muted">{g.title}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li key={item}>
                      <Tag>{item}</Tag>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeader number="07" eyebrow={t("awards.eyebrow")} title={t("awards.title")} />
            <ul className="mt-10 divide-y divide-border border-y border-border">
              {awards.map((a) => (
                <li key={a.title} className="flex items-baseline justify-between gap-6 py-4">
                  <div>
                    <p className="font-medium text-fg">{a.title}</p>
                    <p className="text-sm text-fg-muted">{a.org}</p>
                  </div>
                  <p className="font-mono text-xs text-fg-muted">{a.year}</p>
                </li>
              ))}
              {certs.map((c) => (
                <li key={c} className="flex items-baseline justify-between gap-6 py-4">
                  <p className="font-medium text-fg">{c}</p>
                  <p className="font-mono text-xs text-fg-muted">Google</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-5">
            <p className="text-eyebrow text-fg-muted">{t("education.title")}</p>
            <p className="mt-4 text-h3">{t("education.degree")}</p>
            <p className="mt-1 text-fg-muted">{t("education.school")}</p>
            <p className="mt-1 font-mono text-xs text-fg-muted">{t("education.years")}</p>
            <p className="mt-4 text-sm text-fg-muted">{t("education.coursework")}</p>

            <div className="mt-10 rounded-md border border-border bg-surface p-6">
              <p className="text-h3">{t("resume.title")}</p>
              <p className="mt-2 text-fg-muted">{t("resume.text")}</p>
              <div className="mt-5">
                <Button external download href={site.resumePath} arrow>
                  {t("resume.cta")}
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <ContactCta />
    </main>
  );
}
