import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

const base =
  "inline-flex h-7 items-center rounded-xs border px-2 font-mono text-[0.6875rem] uppercase tracking-[0.08em] whitespace-nowrap";

export function tagStyles(selected?: boolean, className?: string) {
  return cn(
    base,
    selected
      ? "border-accent/40 bg-accent-soft text-accent-strong"
      : "border-border bg-transparent text-fg-muted",
    className,
  );
}

/** Static tag — used for project/industry labels. */
export function Tag({
  className,
  selected,
  ...props
}: ComponentProps<"span"> & { selected?: boolean }) {
  return <span {...props} className={tagStyles(selected, className)} />;
}

/** Toggle chip — used for filters. Exposes state via aria-pressed. */
export function ChipButton({
  className,
  pressed,
  ...props
}: Omit<ComponentProps<"button">, "aria-pressed"> & { pressed: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      {...props}
      className={cn(
        tagStyles(pressed, className),
        "h-11 px-4 transition-colors duration-150 hover:border-fg hover:text-fg",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        pressed && "hover:border-accent hover:text-accent-strong",
      )}
    />
  );
}
