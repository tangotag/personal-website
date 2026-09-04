import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const styles =
  "group/link inline-flex items-center gap-1 text-fg underline decoration-fg/40 decoration-1 underline-offset-[0.2em] " +
  "transition-colors duration-150 hover:text-accent hover:decoration-accent " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus rounded-xs";

type Internal = Omit<ComponentProps<typeof Link>, "className" | "children"> & {
  href: ComponentProps<typeof Link>["href"];
  external?: false;
};
type External = Omit<ComponentProps<"a">, "className" | "children" | "href"> & {
  href: string;
  external: true;
};

export type TextLinkProps = (Internal | External) & {
  children: ReactNode;
  className?: string;
  /** Hide the ↗ on external links. */
  plain?: boolean;
};

/** Inline text link. External links open in a new tab and carry the ↗ glyph. */
export function TextLink({ children, className, plain, ...props }: TextLinkProps) {
  if (props.external) {
    const { external: _e, ...rest } = props;
    return (
      <a
        {...rest}
        data-inline
        className={cn(styles, className)}
        target="_blank"
        rel="noreferrer noopener"
      >
        {children}
        {!plain ? (
          <ArrowUpRight
            aria-hidden
            className="size-[0.9em] transition-transform duration-150 group-hover/link:translate-x-px group-hover/link:-translate-y-px"
          />
        ) : null}
      </a>
    );
  }
  const { external: _e, ...rest } = props as Internal;
  return (
    <Link {...rest} data-inline className={cn(styles, className)}>
      {children}
    </Link>
  );
}
