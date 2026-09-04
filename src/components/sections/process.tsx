import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { RevealItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

type Step = { title: string; text: string; gets: string };

export async function Process() {
  const t = await getTranslations("home.process");
  const steps = t.raw("steps") as Step[];

  return (
    <Section id="process" className="border-y border-border bg-surface">
      <Container>
        <SectionHeader
          number="07"
          eyebrow={t("eyebrow")}
          title={t("title")}
          action={
            <Button variant="ghost" href="/services">
              {t("cta")}
            </Button>
          }
        />
        <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <RevealItem
              as="li"
              key={i}
              i={i}
              className="relative flex flex-col gap-3 border-t border-border pt-5"
            >
              <span aria-hidden className="absolute -top-px left-0 h-px w-10 bg-accent" />
              <p className="font-mono text-xs text-accent">0{i + 1}</p>
              <h3 className="text-h3">{step.title}</h3>
              <p className="text-fg-muted">{step.text}</p>
              <p className="mt-auto text-sm text-fg">{step.gets}</p>
            </RevealItem>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
