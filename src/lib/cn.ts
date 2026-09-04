import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge cannot see the CSS-first theme, so it would treat the custom type-scale
 * utilities (`text-h1`, `text-lead`…) as colours and drop them when combined with `text-fg-*`.
 * Register them as font-size utilities so both survive in one class list.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-display",
        "text-h1",
        "text-h2",
        "text-h3",
        "text-lead",
        "text-eyebrow",
        "text-stat",
      ],
    },
  },
});

/** Merge class names with Tailwind-aware conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
