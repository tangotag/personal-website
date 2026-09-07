import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Link } from "@/i18n/navigation";
import { getServices } from "@/lib/data";
import { pick } from "@/types/content";

export async function ServicesTeaser({ locale }: { locale: string }) {
  const t = await getTranslations("home.services");
  const services = getServices();

  return (
    <Section id="services" className="border-y border-border bg-surface">
      <Container>
        <SectionHeader
          number="04"
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
          action={
            <Button variant="ghost" href="/services">
              {t("all")}
            </Button>
          }
        />
        <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s, i) => (
            <RevealItem as="li" key={s.slug} i={i}>
              <Link
                href={`/services#${s.slug}`}
                className="group flex h-full flex-col gap-4 rounded-md border border-border bg-bg p-6 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:border-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-safe:hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-h3">{pick(s.title, locale)}</h3>
                  <ArrowUpRight
                    aria-hidden
                    className="mt-1 size-5 shrink-0 text-fg-muted transition-[color,transform] duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-strong"
                  />
                </div>
                <p className="text-fg-muted">{pick(s.scope, locale)}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {s.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </Link>
            </RevealItem>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
