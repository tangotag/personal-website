import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import type { WorkEntry } from "@/types/work";

type Props = { prev: WorkEntry | null; next: WorkEntry | null };

function Card({ entry, label, dir }: { entry: WorkEntry; label: string; dir: "prev" | "next" }) {
  const Icon = dir === "prev" ? ArrowLeft : ArrowRight;
  return (
    <Link
      href={`/work/${entry.slug}`}
      className={`group flex flex-col gap-3 rounded-md border border-border bg-surface p-6 transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${dir === "next" ? "md:items-end md:text-right" : ""}`}
    >
      <p className="inline-flex items-center gap-2 text-eyebrow text-fg-muted">
        {dir === "prev" ? <Icon aria-hidden className="size-3.5" /> : null}
        {label}
        {dir === "next" ? (
          <Icon aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
        ) : null}
      </p>
      <p className="text-h3">{entry.title}</p>
      <p className="text-sm text-fg-muted">{entry.client}</p>
    </Link>
  );
}

/** Previous / next case study in listing order — every case study ends in the next one. */
export async function NextProject({ prev, next }: Props) {
  const t = await getTranslations("caseStudy");
  if (!prev && !next) return null;
  return (
    <Container className="mt-20 grid gap-4 md:grid-cols-2">
      {prev ? <Card entry={prev} label={t("prev")} dir="prev" /> : <span />}
      {next ? <Card entry={next} label={t("next")} dir="next" /> : null}
    </Container>
  );
}
