import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { alternatesFor } from "@/lib/seo";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { ProjectCard } from "@/components/portfolio/project-card";
import { WorkGrid, type GridItem } from "@/components/portfolio/work-grid";
import { ContactCta } from "@/components/sections/contact-cta";
import { Button } from "@/components/ui/button";
import { getAllWork } from "@/lib/content";

export async function generateMetadata({
  params,
}: Omit<PageProps<"/[locale]/work">, "searchParams">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.work" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: alternatesFor("/work", locale),
  };
}

export default async function WorkPage({ params }: PageProps<"/[locale]/work">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.work");
  const tc = await getTranslations("common");

  // Cards render on the server; the client grid only filters and animates them.
  const items: GridItem[] = getAllWork(locale).map((entry, i) => ({
    slug: entry.slug,
    tier: entry.tier,
    filters: entry.filters,
    node: (
      <ProjectCard
        entry={entry}
        variant={entry.tier === "hero" ? "hero" : "standard"}
        readLabel={tc("readCase")}
        headingLevel="h2"
        priority={i === 0}
        className="h-full"
      />
    ),
  }));

  return (
    <main id="main" className="flex-1">
      <Section>
        <Container>
          <SectionHeader as="h1" number="01" eyebrow={t("title")} title={t("description")} />
          <div className="mt-12">
            <Suspense fallback={null}>
              <WorkGrid items={items} />
            </Suspense>
          </div>
        </Container>
      </Section>

      <Section tight className="border-y border-border bg-surface">
        <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-h3">{t("ctaTitle")}</h2>
            <p className="mt-2 max-w-xl text-fg-muted">{t("ctaText")}</p>
          </div>
          <Button href="/contact" arrow>
            {t("cta")}
          </Button>
        </Container>
      </Section>

      <ContactCta />
    </main>
  );
}
