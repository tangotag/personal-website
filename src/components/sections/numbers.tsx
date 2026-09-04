import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Metric } from "@/components/ui/metric";

const IS_PROD = process.env.NODE_ENV === "production";

/** Resume-backed stats. Anything marked `confirm` stays out of production until verified. */
const stats = [
  { key: "years", value: 9, suffix: "+" },
  { key: "devTime", value: 25, prefix: "−", suffix: "%" },
  { key: "conversion", value: 40, prefix: "+", suffix: "%", confirm: true },
  { key: "retention", value: 30, prefix: "+", suffix: "%" },
  { key: "awards", value: 3 },
] as const;

export async function Numbers() {
  const t = await getTranslations("home.numbers");
  const visible = stats.filter((s) => !("confirm" in s && s.confirm && IS_PROD));

  return (
    <Section id="numbers" className="border-y border-border bg-surface">
      <Container>
        <SectionHeader number="02" eyebrow={t("eyebrow")} title={t("title")} />
        <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-10">
          {visible.map((s) => (
            <li key={s.key} className="border-l border-border pl-5">
              <Metric
                value={s.value}
                prefix={"prefix" in s ? s.prefix : undefined}
                suffix={"suffix" in s ? s.suffix : undefined}
                label={t(s.key)}
                note={"confirm" in s && s.confirm ? "[CONFIRM]" : undefined}
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
