import { Children, type CSSProperties, type ReactNode } from "react";

/**
 * Hero text reveal, pure CSS (globals.css `.line-reveal`): each line is clipped and slides up from
 * 110% over 800ms, staggered 90ms; reduced motion fades instead. Server component — no JS.
 * Wrap each line in its own element.
 */
export function SplitReveal({
  children,
  delayMs = 0,
  className,
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const lines = Children.toArray(children);
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <span
            className="line-reveal block"
            style={{ "--i": i, "--reveal-delay": `${delayMs}ms` } as CSSProperties}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * Fades content in after the headline lines have landed (lead paragraph, buttons).
 *
 * `rise` swaps the fade for a translate-only entrance. Use it for anything above the fold: an
 * element first painted at opacity 0 is never reconsidered as an LCP candidate, so a fading hero
 * gives the metric away to whatever paints later (globals.css `.rise-up`).
 */
export function FadeUp({
  children,
  delayMs = 300,
  className = "",
  rise = false,
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  rise?: boolean;
}) {
  return (
    <div
      className={`${rise ? "rise-up" : "fade-up"} ${className}`}
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
