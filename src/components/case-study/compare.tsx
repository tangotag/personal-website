"use client";

import Image from "next/image";
import { useId, useState } from "react";

type Props = {
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  aspect?: string;
  labels?: { before: string; after: string };
  caption?: string;
};

/** Before/after slider driven by a range input — keyboard, touch and screen-reader friendly. */
export function Compare({
  before,
  after,
  aspect = "16/10",
  labels = { before: "Before", after: "After" },
  caption,
}: Props) {
  const [pos, setPos] = useState(50);
  const id = useId();

  return (
    <figure className="my-8">
      <div
        className="relative overflow-hidden rounded-lg border border-border bg-surface-2 select-none"
        style={{ aspectRatio: aspect }}
      >
        <Image
          src={after.src}
          alt={after.alt}
          fill
          sizes="(min-width: 1024px) 720px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }} aria-hidden>
          <Image
            src={before.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 720px, 100vw"
            className="object-cover"
            style={{ width: `${10000 / pos}%`, maxWidth: "none" }}
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-y-0 w-0.5 bg-accent"
          style={{ left: `calc(${pos}% - 1px)` }}
        >
          <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-bg font-mono text-[0.625rem] text-accent shadow-soft">
            ⇆
          </span>
        </div>
        <span className="absolute top-3 left-3 rounded-xs bg-bg/85 px-2 py-1 font-mono text-[0.6875rem] tracking-[0.08em] text-fg uppercase">
          {labels.before}
        </span>
        <span className="absolute top-3 right-3 rounded-xs bg-bg/85 px-2 py-1 font-mono text-[0.6875rem] tracking-[0.08em] text-fg uppercase">
          {labels.after}
        </span>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`${labels.before} / ${labels.after}`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 font-mono text-xs text-fg-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
