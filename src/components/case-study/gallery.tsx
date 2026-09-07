"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type GalleryItem = { src: string; alt: string; caption?: string };

type Props = {
  items: GalleryItem[];
  cols?: 2 | 3;
  /** Aspect ratio of each thumbnail, e.g. "16/10". */
  aspect?: string;
  /** Break out of the text column, matching <Figure wide>. */
  wide?: boolean;
};

/** Thumbnail grid that opens a native <dialog> lightbox with keyboard and swipe navigation. */
export function Gallery({ items, cols = 2, aspect = "16/10", wide }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, step]);

  const current = index !== null ? items[index] : null;

  return (
    <>
      <ul
        className={cn(
          "my-8 grid gap-4",
          cols === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2",
          // Same right-only bleed as MediaFrame; see the comment there.
          wide && "md:-mr-6 xl:-mr-16 2xl:-mr-32",
        )}
      >
        {items.map((item, i) => (
          <li key={item.src}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group block w-full overflow-hidden rounded-md border border-border bg-surface-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              aria-label={item.alt}
            >
              <span className="relative block" style={{ aspectRatio: aspect }}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </span>
            </button>
            {item.caption ? (
              <p className="mt-2 font-mono text-xs text-fg-muted">{item.caption}</p>
            ) : null}
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
        aria-label={current?.alt}
        className="m-auto h-dvh max-h-none w-full max-w-none bg-black/95 p-0 text-white backdrop:bg-black/80"
        onTouchStart={(e) => (touchStart.current = e.touches[0]?.clientX ?? null)}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          const end = e.changedTouches[0]?.clientX;
          if (start !== null && end !== undefined && Math.abs(end - start) > 40)
            step(end < start ? 1 : -1);
          touchStart.current = null;
        }}
      >
        {current ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="font-mono text-xs text-white/70">
                {(index ?? 0) + 1} / {items.length}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                autoFocus
                className="inline-flex size-11 items-center justify-center rounded-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative flex-1">
              <Image
                key={current.src}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous"
                    className="absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next"
                    className="absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              ) : null}
            </div>
            {current.caption ? (
              <p className="px-4 py-3 text-center font-mono text-xs text-white/70">
                {current.caption}
              </p>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
