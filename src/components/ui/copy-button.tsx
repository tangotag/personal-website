"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Props = {
  value: string;
  label: string;
  copiedLabel: string;
  className?: string;
};

/** Copies `value` to the clipboard; shows "Copied" for 1.5 s. Falls back to a mailto link if the API is unavailable. */
export function CopyButton({ value, label, copiedLabel, className }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${value}`;
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-sm border border-border-strong px-4 font-mono text-sm text-fg transition-colors duration-150 hover:border-fg hover:bg-surface",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
    >
      {copied ? (
        <Check aria-hidden className="size-4 text-success" />
      ) : (
        <Copy aria-hidden className="size-4 text-fg-muted" />
      )}
      <span>{value}</span>
      <span className="sr-only">{copied ? copiedLabel : label}</span>
    </button>
  );
}
