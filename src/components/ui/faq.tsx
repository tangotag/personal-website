import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export type FaqItem = { q: string; a: string };

/**
 * Native <details> accordion. The shared `name` makes the group exclusive (one open at a time)
 * in browsers that support it; others simply allow several open.
 */
export function Faq({
  items,
  name = "faq",
  className,
}: {
  items: FaqItem[];
  name?: string;
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-border border-y border-border", className)}>
      {items.map((item, i) => (
        <details key={i} name={name} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-lg font-medium text-fg marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown
              aria-hidden
              className="size-5 shrink-0 text-fg-muted transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <p className="max-w-[68ch] pb-6 text-fg-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
