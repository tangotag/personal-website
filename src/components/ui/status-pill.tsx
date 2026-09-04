import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Availability pill: pulsing green dot + label. Pulse is suppressed under reduced motion. */
export function StatusPill({ className, children, ...props }: ComponentProps<"span">) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border border-border bg-surface pr-3 pl-2.5 font-mono text-[0.6875rem] tracking-[0.08em] text-fg-muted uppercase",
        className,
      )}
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full rounded-full bg-success opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex size-2 rounded-full bg-success" />
      </span>
      {children}
    </span>
  );
}
