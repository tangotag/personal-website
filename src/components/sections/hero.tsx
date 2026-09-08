import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { FadeUp } from "@/components/motion/split-reveal";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { site } from "@/data/site";

const PORTRAIT = "/images/portrait.webp";
const hasPortrait = existsSync(join(process.cwd(), "public", PORTRAIT));

/**
 * Wraps the highlighted phrase in an accent underline-sweep. Painted as an inline background with
 * `box-decoration-break: clone`, so it follows every line fragment when the phrase wraps.
 */
function Highlighted({ text, highlight }: { text: string; highlight: string }) {
  const i = text.indexOf(highlight);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="-mx-[0.04em] bg-[linear-gradient(to_top,var(--accent-soft)_0.4em,transparent_0.4em)] [box-decoration-break:clone] px-[0.04em]">
        {highlight}
      </span>
      {text.slice(i + highlight.length)}
    </>
  );
}

export async function Hero() {
  const t = await getTranslations("home.hero");
  const tc = await getTranslations("common");

  return (
    <section className="section-y pt-10 md:pt-14 lg:pt-16">
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-8">
          <FadeUp rise delayMs={0}>
            <StatusPill>{tc("available")}</StatusPill>
            <p className="mt-6 text-eyebrow text-fg-muted">{t("eyebrow")}</p>
          </FadeUp>
          <FadeUp rise delayMs={120}>
            <h1 className="mt-5 max-w-[20ch] text-display">
              <Highlighted text={t("title")} highlight={t("highlight")} />
            </h1>
          </FadeUp>
          <FadeUp rise delayMs={320}>
            <p className="mt-8 max-w-2xl text-lead text-fg-muted">{t("lead")}</p>
          </FadeUp>
          <FadeUp
            rise
            delayMs={420}
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href="/contact" size="lg" arrow>
              {tc("startProject")}
            </Button>
            <Button variant="secondary" size="lg" external download href={site.resumePath}>
              {tc("downloadResume")}
            </Button>
          </FadeUp>
          <FadeUp rise delayMs={520}>
            <p className="mt-4 font-mono text-xs text-fg-muted">{t("replyTime")}</p>
          </FadeUp>
        </div>

        <FadeUp rise delayMs={200} className="lg:col-span-4">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg border border-border bg-surface-2 lg:ml-auto">
            {hasPortrait ? (
              <Image
                src={PORTRAIT}
                alt={site.name}
                fill
                priority
                sizes="(min-width: 420px) 384px, 100vw"
                className="object-cover"
              />
            ) : (
              // Placeholder until the portrait lands in public/images (see scripts/build-portrait.mts)
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
        </FadeUp>
      </Container>
    </section>
  );
}
