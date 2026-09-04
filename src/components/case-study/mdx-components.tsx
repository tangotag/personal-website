import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactNode } from "react";
import { Compare } from "@/components/case-study/compare";
import { Figure } from "@/components/case-study/figure";
import { Gallery } from "@/components/case-study/gallery";
import { Callout } from "@/components/ui/callout";
import { Metric } from "@/components/ui/metric";
import { TextLink } from "@/components/ui/text-link";
import { cn } from "@/lib/cn";

/** Numbered section header used inside case studies: `<Section n="03" title="Context & goal">`. */
function CaseSection({
  n,
  title,
  children,
  className,
}: {
  n: string;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("case-section mt-16 first:mt-0", className)}>
      <p className="text-eyebrow text-fg-muted">
        <span className="text-accent">{n} / </span>
        {title}
      </p>
      {children}
    </section>
  );
}

/** Three-bullet summary shown right under the hero. */
function TLDR({ items, label = "TL;DR" }: { items: string[]; label?: string }) {
  return (
    <aside className="rounded-md border border-border bg-surface p-6 md:p-8">
      <p className="text-eyebrow text-accent">{label}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-fg">
            <span className="font-mono text-xs text-fg-muted">0{i + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Quote({ children, by }: { children: ReactNode; by?: string }) {
  return (
    <figure className="my-10 border-l-2 border-accent pl-6">
      <blockquote className="text-lead text-fg">{children}</blockquote>
      {by ? <figcaption className="mt-3 font-mono text-xs text-fg-muted">— {by}</figcaption> : null}
    </figure>
  );
}

/** Results block: up to four metrics in a row. */
function Results({ children }: { children: ReactNode }) {
  return <div className="my-10 grid gap-8 md:grid-cols-3">{children}</div>;
}

export const mdxComponents: MDXComponents = {
  h2: ({ className, ...props }: ComponentProps<"h2">) => (
    <h2 {...props} className={cn("mt-14 scroll-mt-24 text-h2 first:mt-0", className)} />
  ),
  h3: ({ className, ...props }: ComponentProps<"h3">) => (
    <h3 {...props} className={cn("mt-10 scroll-mt-24 text-h3", className)} />
  ),
  p: ({ className, ...props }: ComponentProps<"p">) => (
    <p {...props} className={cn("mt-5 text-fg-muted first:mt-0", className)} />
  ),
  ul: ({ className, ...props }: ComponentProps<"ul">) => (
    <ul {...props} className={cn("mt-5 list-disc space-y-2 pl-5 text-fg-muted", className)} />
  ),
  ol: ({ className, ...props }: ComponentProps<"ol">) => (
    <ol {...props} className={cn("mt-5 list-decimal space-y-2 pl-5 text-fg-muted", className)} />
  ),
  li: ({ className, ...props }: ComponentProps<"li">) => (
    <li {...props} className={cn("pl-1 marker:text-accent", className)} />
  ),
  strong: ({ className, ...props }: ComponentProps<"strong">) => (
    <strong {...props} className={cn("font-semibold text-fg", className)} />
  ),
  a: ({ href = "", children, ...props }: ComponentProps<"a">) => {
    const external = /^https?:\/\//.test(href);
    if (external)
      return (
        <TextLink external href={href} {...props}>
          {children}
        </TextLink>
      );
    // Heading anchors (rehype-autolink) and in-page links.
    return (
      <a href={href} {...props} className="no-underline hover:text-accent">
        {children}
      </a>
    );
  },
  hr: () => <hr className="my-12 border-border" />,
  table: ({ className, ...props }: ComponentProps<"table">) => (
    <div className="mt-6 overflow-x-auto rounded-md border border-border">
      <table {...props} className={cn("w-full text-sm", className)} />
    </div>
  ),
  th: ({ className, ...props }: ComponentProps<"th">) => (
    <th
      {...props}
      className={cn("bg-surface-2 px-3 py-2 text-left font-mono text-xs uppercase", className)}
    />
  ),
  td: ({ className, ...props }: ComponentProps<"td">) => (
    <td {...props} className={cn("border-t border-border px-3 py-2 text-fg-muted", className)} />
  ),
  code: ({ className, ...props }: ComponentProps<"code">) => (
    <code
      {...props}
      className={cn("rounded-xs bg-surface-2 px-1 py-0.5 font-mono text-[0.875em]", className)}
    />
  ),
  // Case-study vocabulary (docs/06 §4)
  Section: CaseSection,
  TLDR,
  Figure,
  Gallery,
  Compare,
  Callout,
  Metric,
  Results,
  Quote,
};
