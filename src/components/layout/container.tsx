import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Centered content column (max 80rem) with fluid side padding. `bleed` widens to 90rem. */
export function Container({
  className,
  bleed,
  ...props
}: ComponentProps<"div"> & { bleed?: boolean }) {
  return (
    <div
      {...props}
      className={cn("container-content", bleed && "max-w-(--container-bleed)", className)}
    />
  );
}
