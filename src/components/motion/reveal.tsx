"use client";

import { useEffect, useRef, type ComponentProps, type CSSProperties, type ReactNode } from "react";

/**
 * Section entrance driven by CSS (globals.css `[data-reveal]`): opacity 0→1 and a 24px rise once
 * 15% of the element is in view. Children marked <RevealItem i={n}> stagger 60ms apart.
 * The hidden state only applies under `html.js`, so content is never invisible without JavaScript.
 * Reduced motion: opacity only, 200ms.
 */
export function Reveal({
  children,
  delayMs = 0,
  style,
  ...rest
}: ComponentProps<"div"> & { children: ReactNode; delayMs?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.setAttribute("data-inview", "");
        observer.disconnect();
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-reveal
      style={{ ...style, "--reveal-delay": `${delayMs}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  );
}

/** A staggered child of <Reveal>; `i` is its 0-based position. */
export function RevealItem({
  i,
  children,
  className,
  as: Tag = "div",
}: {
  i: number;
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  return (
    <Tag data-reveal-item className={className} style={{ "--i": i } as CSSProperties}>
      {children}
    </Tag>
  );
}
