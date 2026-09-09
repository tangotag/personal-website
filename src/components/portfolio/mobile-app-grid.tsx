"use client";

import { ArrowUpRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tag } from "@/components/ui/tag";

export type AppScreen = { src: string; label: string; alt: string };
export type AppCard = {
  slug: string;
  name: string;
  tags: string[];
  summary: string;
  cover: string;
  coverAlt: string;
  /** Pluralised on the server, e.g. "4 screens" — the client never formats messages. */
  countLabel: string;
  screens: AppScreen[];
};

type Labels = {
  /** Card eyebrow, e.g. "Concept · Mobile app". */
  eyebrow: string;
  /** Card action, e.g. "View screens". */
  view: string;
  close: string;
};

/**
 * Two up rather than the case-study grid's three: there are exactly four apps, and three columns
 * leave the fourth card alone on a row looking like something failed to load.
 */
const COVER_SIZES = "(min-width: 768px) 46vw, 100vw";

/**
 * A screen in a device shell. The shell is drawn rather than baked into the image so the bezel
 * takes the theme's surface and border instead of shipping a grey frame that suits one background.
 */
function Phone({ screen, sizes }: { screen: AppScreen; sizes: string }) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="rounded-[1.75rem] border border-border-strong bg-surface-2 p-1.5">
        {/* 430x932 is the source size of every screen, so the shell never crops one. */}
        <div className="relative aspect-[430/932] overflow-hidden rounded-[1.4rem] bg-surface">
          <Image src={screen.src} alt={screen.alt} fill sizes={sizes} className="object-cover" />
        </div>
      </div>
      <figcaption className="text-center font-mono text-xs text-fg-muted">
        {screen.label}
      </figcaption>
    </figure>
  );
}

/**
 * Mobile App Design grid. The cards are shaped like the case-study cards above them so the page
 * reads as one system, but each opens a dialog of that app's screens rather than navigating to a
 * detail route — these are concept apps, not case studies, and there is no write-up behind them.
 */
export function MobileAppGrid({ apps, labels }: { apps: AppCard[]; labels: Labels }) {
  const [open, setOpen] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const current = apps.find((a) => a.slug === open) ?? null;

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (current && !d.open) d.showModal();
    if (!current && d.open) d.close();
  }, [current]);

  return (
    <>
      <ul className="grid gap-6 md:grid-cols-2">
        {apps.map((app) => (
          <li key={app.slug}>
            <button
              type="button"
              onClick={() => setOpen(app.slug)}
              aria-haspopup="dialog"
              // Without this the button's name is computed from the whole card — eyebrow, summary,
              // tags and all — which announces a paragraph and collides with other controls.
              aria-label={`${app.name} — ${labels.view}`}
              className="group flex h-full w-full cursor-pointer flex-col gap-5 rounded-lg border border-border bg-surface p-3 text-left transition-[border-color,box-shadow] duration-300 ease-out hover:border-accent-strong hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            >
              <span className="relative block aspect-[16/10] overflow-hidden rounded-md bg-surface-2">
                <Image
                  src={app.cover}
                  alt={app.coverAlt}
                  fill
                  sizes={COVER_SIZES}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </span>

              <span className="flex flex-col gap-3 pb-2">
                <span className="text-eyebrow text-fg-muted">{labels.eyebrow}</span>
                <span className="text-h3">{app.name}</span>
                <span className="text-fg-muted">{app.summary}</span>
                <span className="mt-1 inline-flex w-fit items-center gap-2 rounded-xs bg-accent-soft px-2 py-1 font-mono text-xs text-accent-strong">
                  {app.countLabel}
                </span>
                <span className="mt-2 flex flex-wrap gap-2">
                  {app.tags.slice(0, 3).map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </span>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-fg group-hover:text-accent-strong">
                  {labels.view}
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={close}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        aria-label={current?.name}
        className="m-auto max-h-[92dvh] w-[min(72rem,94vw)] rounded-lg border border-border bg-bg p-0 text-fg backdrop:bg-black/70"
      >
        {current ? (
          <div className="flex max-h-[92dvh] flex-col">
            <div className="flex items-start justify-between gap-6 border-b border-border p-5 md:p-6">
              <div>
                <p className="text-eyebrow text-fg-muted">{labels.eyebrow}</p>
                <h3 className="mt-2 text-h3">{current.name}</h3>
                <p className="mt-2 max-w-[60ch] text-sm text-fg-muted">{current.summary}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={labels.close}
                autoFocus
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-fg-muted transition-colors hover:bg-surface hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                <X className="size-5" />
              </button>
            </div>

            <ul className="grid grid-cols-2 gap-x-5 gap-y-8 overflow-y-auto p-5 sm:grid-cols-3 md:p-6 lg:grid-cols-4">
              {current.screens.map((screen) => (
                <li key={screen.src}>
                  <Phone screen={screen} sizes="(min-width: 1024px) 260px, 40vw" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
