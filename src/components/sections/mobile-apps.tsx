import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { MobileAppGrid, type AppCard } from "@/components/portfolio/mobile-app-grid";
import { getMobileApps } from "@/lib/data";
import { pick } from "@/types/content";

/**
 * Mobile App Design — concept apps, deliberately not case studies. There is no client, no metric
 * and no process to walk through, so a card here opens a dialog of the app's screens instead of
 * navigating to a write-up that does not exist. The cards are shaped like the case-study cards
 * above them so the page still reads as one system.
 *
 * Every string is picked and pluralised here; the client component receives plain text.
 */
export async function MobileApps({ locale }: { locale: string }) {
  const t = await getTranslations("pages.work.mobileApps");

  const apps: AppCard[] = getMobileApps().map((app) => ({
    slug: app.slug,
    name: app.name,
    tags: app.tags,
    summary: pick(app.summary, locale),
    cover: app.cover,
    coverAlt: pick(app.coverAlt, locale),
    countLabel: t("screens", { count: app.screens.length }),
    screens: app.screens.map((s) => ({
      src: s.src,
      label: pick(s.label, locale),
      alt: pick(s.alt, locale),
    })),
  }));

  return (
    <Section>
      <Container>
        <SectionHeader
          as="h2"
          number="02"
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
        />
        <div className="mt-12">
          <MobileAppGrid
            apps={apps}
            labels={{ eyebrow: t("cardEyebrow"), view: t("view"), close: t("close") }}
          />
        </div>
      </Container>
    </Section>
  );
}
