import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";

type Item = { pain: string; answer: string };

/** Client pains → how I solve each. */
export async function SoundFamiliar() {
  const t = await getTranslations("home.familiar");
  const items = t.raw("items") as Item[];

  return (
    <Section id="familiar">
      <Container>
        <SectionHeader
          number="03"
          eyebrow={t("eyebrow")}
          title={t("title")}
          action={
            <Button variant="ghost" href="/contact">
              {t("cta")}
            </Button>
          }
        />
        <ul className="mt-12 divide-y divide-border border-y border-border">
          {items.map((item, i) => (
            <li
              key={i}
              className="group grid gap-4 py-7 transition-colors duration-200 md:grid-cols-12 md:gap-8 md:py-8"
            >
              <p className="font-mono text-xs text-accent md:col-span-1">0{i + 1}</p>
              <p className="text-h3 md:col-span-5">“{item.pain}”</p>
              <p className="text-fg-muted transition-colors duration-200 group-hover:text-fg md:col-span-6">
                {item.answer}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
