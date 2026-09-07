import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  /** Two-digit section number, e.g. "02". */
  number?: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Right-aligned action (usually a ghost Button). */
  action?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

/** Numbered mono eyebrow + display heading + optional lead and action. */
export function SectionHeader({
  number,
  eyebrow,
  title,
  lead,
  action,
  as: Heading = "h2",
  className,
}: Props) {
  return (
    <div
      className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}
    >
      <div className="max-w-3xl">
        <p className="text-eyebrow text-fg-muted">
          {number ? <span className="text-accent-strong">{number} / </span> : null}
          {eyebrow}
        </p>
        <Heading className={cn("mt-4", Heading === "h1" ? "text-h1" : "text-h2")}>{title}</Heading>
        {lead ? <p className="mt-5 max-w-2xl text-lead text-fg-muted">{lead}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
