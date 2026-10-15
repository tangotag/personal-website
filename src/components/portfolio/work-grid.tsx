"use client";

import { useTranslations } from "next-intl";
import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { ChipButton } from "@/components/ui/tag";
import { workFilters, type WorkFilter } from "@/data/work-filters";

export type GridItem = {
  slug: string;
  tier: "hero" | "featured" | "secondary" | "collection";
  filters: WorkFilter[];
  /** Server-rendered card (ProjectCard) — passed through so the grid stays a thin client shell. */
  node: ReactNode;
};

type Props = { items: GridItem[] };
type Active = WorkFilter | "all";

const EVENT = "raq:filter-change";

function isFilter(v: string | null): v is WorkFilter {
  return v !== null && (workFilters as readonly string[]).includes(v);
}

function readFilter(): Active {
  const v = new URLSearchParams(window.location.search).get("f");
  return isFilter(v) ? v : "all";
}

function subscribe(cb: () => void) {
  window.addEventListener("popstate", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/**
 * Filter chips + grid. The active filter lives in `?f=` so views are shareable; unknown values
 * fall back to "all". The URL is read with useSyncExternalStore (server snapshot = "all"), so the
 * page stays static and every card is in the server HTML. Re-layouts animate with the View
 * Transitions API where available — no JS library. Each card is given a view-transition-name for
 * the length of that morph and not a moment longer; see setFilter.
 */
export function WorkGrid({ items }: Props) {
  const t = useTranslations("pages.work");
  const active = useSyncExternalStore(subscribe, readFilter, () => "all" as Active);
  const [morphing, setMorphing] = useState(false);

  const setFilter = useCallback((next: Active) => {
    const apply = () => {
      const url = new URL(window.location.href);
      if (next === "all") url.searchParams.delete("f");
      else url.searchParams.set("f", next);
      window.history.replaceState(null, "", url);
      // Synchronous re-render so the DOM change happens inside the view transition.
      flushSync(() => window.dispatchEvent(new Event(EVENT)));
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("startViewTransition" in document)) {
      apply();
      return;
    }
    // The per-card names exist only for the length of this morph. Left on permanently, every card
    // stays a named element in *any* later transition: clicking through to a case study animated
    // eight card groups out while the cover was morphing in and the root was crossfading, and the
    // root snapshot had eight holes in it. flushSync puts the names in the old snapshot before the
    // transition captures it, and `finished` takes them off once there is nothing left to pair.
    flushSync(() => setMorphing(true));
    const transition = document.startViewTransition(apply);
    void transition.finished.finally(() => setMorphing(false));
  }, []);

  const visible = useMemo(
    () => (active === "all" ? items : items.filter((i) => i.filters.includes(active))),
    [items, active],
  );

  return (
    <div>
      <div role="group" aria-label={t("filterLabel")} className="flex flex-wrap items-center gap-2">
        <ChipButton pressed={active === "all"} onClick={() => setFilter("all")}>
          {t("filters.all")}
        </ChipButton>
        {workFilters.map((f) => (
          <ChipButton key={f} pressed={active === f} onClick={() => setFilter(f)}>
            {t(`filters.${f}`)}
          </ChipButton>
        ))}
        <p className="ml-auto font-mono text-xs text-fg-muted" aria-live="polite">
          {t("count", { count: visible.length })}
        </p>
      </div>

      <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((item) => (
          <li
            key={item.slug}
            className={item.tier === "hero" ? "md:col-span-2 xl:col-span-3" : undefined}
            style={
              morphing ? ({ viewTransitionName: `card-${item.slug}` } as CSSProperties) : undefined
            }
          >
            {item.node}
          </li>
        ))}
      </ul>

      {visible.length === 0 ? (
        <p className="mt-10 rounded-md border border-dashed border-border p-6 font-mono text-xs text-fg-muted">
          {t("empty")}
        </p>
      ) : null}
    </div>
  );
}
