import type { ReactNode } from "react";
import { Lightbulb, Lock, Signpost } from "lucide-react";
import { cn } from "@/lib/cn";

export type CalloutKind = "constraint" | "insight" | "decision";

const kinds: Record<CalloutKind, { icon: typeof Lock; label: string }> = {
  constraint: { icon: Lock, label: "Constraint" },
  insight: { icon: Lightbulb, label: "Insight" },
  decision: { icon: Signpost, label: "Decision" },
};

/** Left-accented aside used inside case studies. */
export function Callout({
  kind = "insight",
  title,
  children,
  className,
}: {
  kind?: CalloutKind;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, label } = kinds[kind];
  return (
    <aside
      className={cn(
        "my-8 rounded-md border border-l-2 border-border border-l-accent bg-surface p-5 md:p-6",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-eyebrow text-accent-strong">
        <Icon aria-hidden className="size-4" />
        {title ?? label}
      </p>
      <div className="mt-3 text-fg [&>p]:m-0 [&>p+p]:mt-3">{children}</div>
    </aside>
  );
}
