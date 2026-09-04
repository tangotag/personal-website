import { getTranslations } from "next-intl/server";
import { Tag } from "@/components/ui/tag";
import { TextLink } from "@/components/ui/text-link";
import { getExperience } from "@/lib/data";
import { pick } from "@/types/content";

function fmt(ym: string, locale: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

/** Reverse-chronological experience list with the "Now" badge on the current role. */
export async function ExperienceTimeline({ locale }: { locale: string }) {
  const t = await getTranslations("pages.about.timeline");
  const items = getExperience();

  return (
    <ol className="divide-y divide-border border-y border-border">
      {items.map((x, i) => (
        <li
          key={`${x.company}-${x.start}`}
          className="grid gap-4 py-7 md:grid-cols-12 md:gap-8 md:py-8"
        >
          <div className="md:col-span-3">
            <p className="font-mono text-xs text-fg-muted">
              {fmt(x.start, locale)} — {x.end ? fmt(x.end, locale) : t("now")}
            </p>
            <p className="mt-1 font-mono text-[0.6875rem] tracking-[0.08em] text-fg-muted uppercase">
              {t(`kinds.${x.kind}`)}
            </p>
          </div>
          <div className="md:col-span-9">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-h3">
                {x.url ? (
                  <TextLink external href={x.url} plain className="no-underline hover:underline">
                    {x.company}
                  </TextLink>
                ) : (
                  x.company
                )}
              </h3>
              <p className="text-fg-muted">{pick(x.role, locale)}</p>
              {i === 0 && !x.end ? (
                <span className="rounded-xs bg-accent-soft px-1.5 py-0.5 font-mono text-[0.625rem] tracking-[0.08em] text-accent-strong uppercase">
                  {t("now")}
                </span>
              ) : null}
            </div>
            <p className="mt-3 max-w-[68ch] text-fg-muted">{pick(x.summary, locale)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {x.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
