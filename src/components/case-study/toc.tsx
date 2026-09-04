"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import type { Heading } from "@/lib/headings";
import { cn } from "@/lib/cn";

type Props = { headings: Heading[]; label: string };

/**
 * Sticky table of contents (desktop) / collapsible list (mobile).
 * The active entry follows the heading nearest the top of the viewport.
 */
export function Toc({ headings, label }: Props) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Prefer the top-most heading currently intersecting the upper band of the viewport.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  const list = (
    <ol className="flex flex-col gap-1.5">
      {headings.map((h) => (
        <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
          <a
            href={`#${h.id}`}
            aria-current={active === h.id ? "location" : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "block rounded-xs py-1 font-mono text-xs leading-snug transition-colors",
              active === h.id ? "text-accent" : "text-fg-muted hover:text-fg",
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <nav aria-label={label}>
      {/* Mobile: collapsible */}
      <div className="lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-sm border border-border bg-surface px-4 py-3 text-sm font-medium"
        >
          {label}
          <ChevronDown
            aria-hidden
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </button>
        <div hidden={!open} className="mt-3 rounded-sm border border-border bg-surface p-4">
          {list}
        </div>
      </div>
      {/* Desktop: sticky rail */}
      <div className="hidden lg:sticky lg:top-24 lg:block">
        <p className="mb-3 text-eyebrow text-fg-muted">{label}</p>
        {list}
      </div>
    </nav>
  );
}
