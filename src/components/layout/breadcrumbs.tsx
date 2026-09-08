import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { Crumb } from "@/lib/seo";

/**
 * The trail that leads to the current page. The last crumb is the page itself and is not a link;
 * it carries aria-current so a screen reader announces where the trail ends.
 *
 * The matching BreadcrumbList lives in each page's JSON-LD graph, built from the same array, so
 * what a crawler reads and what a visitor sees cannot drift apart.
 */
export function Breadcrumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("text-eyebrow text-fg-muted", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-x-2">
              {last ? (
                <span aria-current="page" className="text-fg">
                  {c.name}
                </span>
              ) : (
                <Link
                  href={c.path}
                  className="rounded-xs transition-colors hover:text-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  {c.name}
                </Link>
              )}
              {last ? null : (
                <span aria-hidden className="text-fg-faint">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
