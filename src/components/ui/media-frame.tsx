import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type FrameKind = "plain" | "phone" | "desktop" | "pos" | "kiosk";

const frames: Record<FrameKind, string> = {
  plain: "",
  // Neutral device silhouettes — no notches, no bezel clichés.
  phone: "mx-auto max-w-[22rem] rounded-[2rem] p-2 [&>*]:rounded-[1.5rem]",
  desktop: "p-2 pt-7 [&>*]:rounded-[calc(var(--radius-lg)-0.5rem)]",
  // Photographic terminal/kiosk frames arrive with the Compass assets; until then, plain.
  pos: "",
  kiosk: "",
};

type Props = ComponentProps<"figure"> & {
  kind?: FrameKind;
  /** Aspect ratio applied to the media slot, e.g. "16/10". */
  aspect?: string;
  caption?: ReactNode;
  /** Break out of the text column in case studies. */
  wide?: boolean;
};

/** Hairline + radius-20 + surface-2 media frame with optional device treatment and caption. */
export function MediaFrame({
  kind = "plain",
  aspect,
  caption,
  wide,
  className,
  children,
  ...props
}: Props) {
  return (
    // The bleed can never exceed the container padding on the left, because content overflowing to
    // the left is silently clipped rather than scrollable. Each step stays inside the padding at
    // its own breakpoint: 24px from 768px up, 40px at 1280 (padding 51px), 96px at 1536 where the
    // container is capped and centred. See WIDE_BLEED in tests/e2e/responsive.spec.ts.
    <figure
      {...props}
      className={cn("my-8 first:mt-0", wide && "md:-mx-6 xl:-mx-10 2xl:-mx-24", className)}
    >
      <div
        data-frame={kind}
        className={cn(
          "relative overflow-hidden rounded-lg border border-border bg-surface-2",
          kind === "desktop" &&
            "before:absolute before:top-0 before:left-0 before:h-7 before:w-full before:border-b before:border-border",
          frames[kind],
        )}
      >
        <div
          className="relative overflow-hidden"
          style={aspect ? { aspectRatio: aspect } : undefined}
        >
          {children}
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-3 font-mono text-xs text-fg-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
