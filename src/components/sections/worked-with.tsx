import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";

/** Text-logos until marks/permissions arrive (docs/04 §1.07). */
const clients = [
  "Cygnus Payments",
  "360SynergyTech",
  "Fifty Cats",
  "Argon Tech",
  "Turtle Studios",
  "Metaverk",
  "Exat Homes",
  "TurnkeyTix",
];

export async function WorkedWith() {
  const t = await getTranslations("home.worked");

  return (
    <Section id="experience">
      <Container>
        <SectionHeader
          number="05"
          eyebrow={t("eyebrow")}
          title={t("title")}
          action={
            <Button variant="ghost" href="/about">
              {t("cta")}
            </Button>
          }
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          <p className="max-w-2xl text-lead text-fg-muted lg:col-span-7">{t("text")}</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 self-start lg:col-span-5">
            {clients.map((name) => (
              <li
                key={name}
                className="border-b border-border pb-3 font-display text-lg font-semibold tracking-tight text-fg-muted transition-colors hover:text-fg"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
