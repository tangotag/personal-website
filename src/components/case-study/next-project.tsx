import { ArrowLeft, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { WorkEntry } from "@/types/work";

type Props = { prev: WorkEntry | null; next: WorkEntry | null };

/**
 * These two are the only way out of a case study that is not the header, so they were the quietest
 * loud thing on the page: a hairline box with a muted label. Three changes make them read as
 * destinations without inventing a new colour — the label takes `--accent-strong` (the text-safe
 * accent: evergreen on light, lime on dark), an accent rule runs the width of the card on hover,
 * and the title picks up the accent the way every other card action on the site does.
 */
function Card({ entry, label, dir }: { entry: WorkEntry; label: string; dir: "prev" | "next" }) {
  const isNext = dir === "next";
  const Icon = isNext ? ArrowRight : ArrowLeft;

  return (
    <Link
      href={`/work/${entry.slug}`}
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-md border border-border bg-surface p-6",
        "transition-[border-color,box-shadow,transform] duration-300 ease-out",
        "hover:border-accent-strong hover:shadow-glow motion-safe:hover:-translate-y-0.5",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        isNext && "md:items-end md:text-right",
      )}
    >
      {/* The same 40px accent rule the process and services cards use, grown to the full width on
          hover so the card answers the pointer with something other than a border tint. */}
      <span
        aria-hidden
        className={cn(
          "absolute top-0 h-0.5 w-10 bg-accent-strong transition-[width] duration-300 ease-out group-hover:w-full",
          isNext ? "right-0" : "left-0",
        )}
      />
      <p className="inline-flex items-center gap-2 text-eyebrow text-accent-strong">
        {isNext ? null : (
          <Icon
            aria-hidden
            className="size-3.5 transition-transform duration-300 ease-out group-hover:-translate-x-1"
          />
        )}
        {label}
        {isNext ? (
          <Icon
            aria-hidden
            className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
          />
        ) : null}
      </p>
      <p className="text-h3 transition-colors duration-300 ease-out group-hover:text-accent-strong">
        {entry.title}
      </p>
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
