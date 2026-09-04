import type { ComponentProps } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/cn";

/** Page section with the fluid vertical rhythm from the design system. Content reveals on scroll unless `reveal={false}`. */
export function Section({
  className,
  tight,
  reveal = true,
  children,
  ...props
}: ComponentProps<"section"> & { tight?: boolean; reveal?: boolean }) {
  return (
    <section
      {...props}
      className={cn(tight ? "py-12 md:py-16" : "section-y", "scroll-mt-(--header-h)", className)}
    >
      {reveal ? <Reveal>{children}</Reveal> : children}
    </section>
  );
}
