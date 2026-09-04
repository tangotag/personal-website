import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Props = Omit<ComponentProps<"button">, "aria-label"> & {
  /** Required: icon-only controls must announce their purpose. */
  "aria-label": string;
};

/** 44px square icon control (theme toggle, menu, copy…). */
export function IconButton({ className, type = "button", ...props }: Props) {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-sm text-fg-muted transition-colors duration-150",
        "hover:bg-surface-2 hover:text-fg",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    />
  );
}
