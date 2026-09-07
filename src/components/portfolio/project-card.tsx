import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { ViewTransition } from "react";
import { Tag } from "@/components/ui/tag";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { WorkEntry } from "@/types/work";

type Props = {
  entry: WorkEntry;
  /** `hero` lays media and text side by side on large screens. */
  variant?: "hero" | "standard" | "compact";
  readLabel: string;
  /** h3 under a section heading (home); h2 directly under a page H1 (/work). */
  headingLevel?: "h2" | "h3";
  className?: string;
  priority?: boolean;
};

/**
 * `sizes` has to match the grid or the browser fetches a far larger file than the slot needs. The
 * hero card takes eight of twelve columns; every other card sits in a grid that is three up from
 * xl, two up from md and one up below that. Getting this wrong cost /work three Lighthouse points.
 */
const COVER_SIZES = {
  hero: "(min-width: 1024px) 60vw, 100vw",
  grid: "(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 100vw",
} as const;

function Cover({
  entry,
  priority,
  variant,
}: {
  entry: WorkEntry;
  priority?: boolean;
  variant: "hero" | "standard" | "compact";
}) {
  if (entry.cover) {
    return (
      <Image
        src={entry.cover}
        alt={entry.coverAlt ?? ""}
        fill
        priority={priority}
        sizes={variant === "hero" ? COVER_SIZES.hero : COVER_SIZES.grid}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    );
  }
  // Branded placeholder until the cover asset lands in public/work/<slug>/.
  return (
    <div className="flex size-full items-end bg-[repeating-linear-gradient(-45deg,var(--border)_0_10px,transparent_10px_22px)] p-5">
      <span className="font-mono text-xs tracking-[0.12em] text-fg-muted uppercase">
        {entry.client} · cover pending
      </span>
    </div>
  );
}

/** Case-study card. Whole card is the link; hover raises the media and turns the hairline accent. */
export function ProjectCard({
  entry,
  variant = "standard",
  readLabel,
  headingLevel: Heading = "h3",
  className,
  priority,
}: Props) {
  const isHero = variant === "hero";
  const year = entry.timeline.match(/\d{4}/g)?.at(-1) ?? entry.timeline;

  return (
    <Link
      href={`/work/${entry.slug}`}
      className={cn(
        "group flex flex-col gap-5 rounded-lg border border-border bg-surface p-3 transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        isHero && "lg:grid lg:grid-cols-12 lg:gap-8",
        className,
      )}
    >
      <div
        className={cn(
          // 16:10 at every breakpoint, including the hero card. Letting the hero slot stretch to the
          // text column's height changed its ratio and cropped 13% off the cover.
          "relative aspect-[16/10] overflow-hidden rounded-md bg-surface-2",
          isHero && "lg:col-span-8",
        )}
      >
        <ViewTransition name={`cover-${entry.slug}`}>
          <div className="absolute inset-0">
            <Cover entry={entry} priority={priority} variant={variant} />
          </div>
        </ViewTransition>
      </div>

      <div
        className={cn(
          // No horizontal padding, so the text starts exactly where the cover image does, on the
          // p-3 inset of the card itself. With px-2 the title sat 8px right of the image edge.
          "flex flex-col gap-3 pb-2",
          isHero && "lg:col-span-4 lg:justify-center lg:py-6",
        )}
      >
        <p className="text-eyebrow text-fg-muted">
          {entry.role} · {year}
        </p>
        <Heading className={cn(isHero ? "text-h2" : "text-h3")}>{entry.title}</Heading>
        <p className="text-fg-muted">{entry.hook}</p>
        {entry.results[0] ? (
          <p className="mt-1 inline-flex w-fit items-center gap-2 rounded-xs bg-accent-soft px-2 py-1 font-mono text-xs text-accent-strong">
            <span className="font-semibold">{entry.results[0].value}</span>
            <span>{entry.results[0].label}</span>
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2">
          {entry.tags.slice(0, isHero ? 5 : 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-fg group-hover:text-accent-strong">
          {readLabel}
          <ArrowUpRight
            aria-hidden
            className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </p>
      </div>
    </Link>
  );
}
