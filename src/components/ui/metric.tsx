import type { ReactNode } from "react";
import { CountUp } from "@/components/motion/count-up";
import { cn } from "@/lib/cn";

export type MetricProps = {
  /** Numeric part; animated when provided. Use `display` for non-numeric values like "< 30 min". */
  value?: number;
  display?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: ReactNode;
  note?: ReactNode;
  className?: string;
};

/** Display-size number + label (+ optional source note). Numbers count up on reveal. */
export function Metric({
  value,
  display,
  prefix,
  suffix,
  decimals,
  label,
  note,
  className,
}: MetricProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-stat text-fg">
        {typeof value === "number" ? (
          <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        ) : (
          display
        )}
      </p>
      <p className="text-sm text-fg-muted">{label}</p>
      {note ? <p className="font-mono text-xs text-fg-muted">{note}</p> : null}
    </div>
  );
}
