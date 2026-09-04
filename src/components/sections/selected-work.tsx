import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { ProjectCard } from "@/components/portfolio/project-card";
import { Button } from "@/components/ui/button";
import { getFeaturedWork } from "@/lib/content";

export async function SelectedWork({ locale }: { locale: string }) {
  const t = await getTranslations("home.work");
  const tc = await getTranslations("common");
  const [hero, ...featured] = getFeaturedWork(locale, 4);
  if (!hero) return null;

  return (
    <Section id="work">
      <Container>
        <SectionHeader
          number="01"
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
          action={
            <Button variant="ghost" href="/work">
              {t("all")}
            </Button>
          }
        />
        <div className="mt-12 flex flex-col gap-6">
          <ProjectCard entry={hero} variant="hero" readLabel={tc("readCase")} priority />
          {featured.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((entry) => (
                <ProjectCard key={entry.slug} entry={entry} readLabel={tc("readCase")} />
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
