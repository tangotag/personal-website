import Image from "next/image";
import { ViewTransition } from "react";
import { Parallax } from "@/components/motion/parallax";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Tag } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";
import type { WorkEntry } from "@/types/work";

type Props = { entry: WorkEntry };

export async function CaseHero({ entry }: Props) {
  const t = await getTranslations("caseStudy");

  const meta: { label: string; value: string }[] = [
    { label: t("meta.role"), value: entry.role },
    { label: t("meta.client"), value: entry.client },
    { label: t("meta.timeline"), value: entry.timeline },
    { label: t("meta.platforms"), value: entry.platforms.join(" · ") },
    { label: t("meta.industry"), value: entry.industry.join(" · ") },
    ...(entry.team ? [{ label: t("meta.team"), value: entry.team }] : []),
  ];

  return (
    <header className="pt-6 md:pt-10">
      <Container bleed>
        <ViewTransition name={`cover-${entry.slug}`}>
          <Parallax
            amount={0.08}
            className="relative aspect-[16/9] overflow-hidden rounded-lg border border-border bg-surface-2"
          >
            {entry.cover ? (
              <Image
                src={entry.cover}
                alt={entry.coverAlt ?? ""}
                fill
                priority
                sizes="(min-width: 1536px) 1440px, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-end bg-[repeating-linear-gradient(-45deg,var(--border)_0_12px,transparent_12px_26px)] p-6">
                <span className="font-mono text-xs tracking-[0.12em] text-fg-muted uppercase">
                  {entry.client} · cover pending
                </span>
              </div>
            )}
          </Parallax>
        </ViewTransition>
      </Container>

      <Container className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="text-eyebrow text-fg-muted">
            <span className="text-accent-strong">{entry.client}</span> · {entry.timeline}
          </p>
          <h1 className="mt-4 text-h1">{entry.title}</h1>
          <p className="mt-5 max-w-2xl text-lead text-fg-muted">{entry.hook}</p>

          {entry.results.length ? (
            <ul className="mt-8 flex flex-wrap gap-2">
              {entry.results.map((r) => (
                <li
                  key={r.label}
                  className="inline-flex items-center gap-2 rounded-xs bg-accent-soft px-2.5 py-1.5 font-mono text-xs text-accent-strong"
                >
                  <span className="font-semibold">{r.value}</span>
                  <span>{r.label}</span>
                  {r.status === "confirm" ? <span className="opacity-70">[CONFIRM]</span> : null}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start lg:col-span-4 lg:grid-cols-1 lg:border-l lg:border-border lg:pl-8">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="font-mono text-[0.6875rem] tracking-[0.1em] text-fg-muted uppercase">
                {m.label}
              </dt>
              <dd className="mt-1 text-sm text-fg">{m.value}</dd>
            </div>
          ))}
          <div>
            <dt className="font-mono text-[0.6875rem] tracking-[0.1em] text-fg-muted uppercase">
              {t("meta.readingTime")}
            </dt>
            <dd className="mt-1 text-sm text-fg">
              {t("minutes", { count: entry.readingMinutes })}
            </dd>
          </div>
          {entry.externalUrl ? (
            <div>
              <dt className="font-mono text-[0.6875rem] tracking-[0.1em] text-fg-muted uppercase">
                {t("meta.link")}
              </dt>
              <dd className="mt-1 text-sm">
                <TextLink external href={entry.externalUrl}>
                  {new URL(entry.externalUrl).hostname.replace(/^www\./, "")}
                </TextLink>
              </dd>
            </div>
          ) : null}
        </dl>
      </Container>

      {entry.fallback ? (
        <Container className="mt-8">
          <p className="rounded-md border border-border bg-surface px-4 py-3 font-mono text-xs text-fg-muted">
            {t("fallbackNotice")}
          </p>
        </Container>
      ) : null}
    </header>
  );
}
