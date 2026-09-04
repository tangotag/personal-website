import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm font-medium whitespace-nowrap select-none " +
  "transition-[background-color,color,border-color,transform,box-shadow] duration-150 ease-out " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
  "disabled:pointer-events-none disabled:opacity-40 motion-safe:hover:-translate-y-0.5";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-fg hover:bg-accent-hover",
  secondary: "border border-border-strong bg-transparent text-fg hover:border-fg hover:bg-surface",
  ghost: "min-h-11 bg-transparent px-0 py-2 text-fg hover:text-accent",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

/** Class builder shared by <Button> and any link that should look like one. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(base, variants[variant], variant === "ghost" ? "h-auto" : sizes[size], className);
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Appends the site's signature ↗ glyph. Defaults to true for ghost links. */
  arrow?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

type AsButton = Common &
  Omit<ComponentProps<"button">, "children" | "className"> & { href?: never };
type AsLink = Common &
  Omit<ComponentProps<typeof Link>, "children" | "className"> & {
    href: ComponentProps<typeof Link>["href"];
  };
type AsAnchor = Common &
  Omit<ComponentProps<"a">, "children" | "className" | "href"> & { href: string; external: true };

export type ButtonProps = AsButton | AsLink | AsAnchor;

function Arrow() {
  return <ArrowUpRight aria-hidden className="size-4 shrink-0" strokeWidth={2} />;
}

/**
 * Primary / secondary / ghost button. Renders a locale-aware <Link> when `href` is given,
 * a plain <a> for `external`, otherwise a <button>.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", arrow, loading, children, className } = props;
  const showArrow = arrow ?? variant === "ghost";
  const classes = buttonStyles({ variant, size, className });
  const content = (
    <>
      {loading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : null}
      {children}
      {showArrow && !loading ? <Arrow /> : null}
    </>
  );

  if ("external" in props && props.external) {
    const { variant: _v, size: _s, arrow: _a, loading: _l, external: _e, ...rest } = props;
    return (
      <a {...rest} className={classes} target="_blank" rel="noreferrer noopener">
        {content}
      </a>
    );
  }

  if ("href" in props && props.href !== undefined) {
    const { variant: _v, size: _s, arrow: _a, loading: _l, ...rest } = props as AsLink;
    return (
      <Link {...rest} className={classes}>
        {content}
      </Link>
    );
  }

  const { variant: _v, size: _s, arrow: _a, loading: _l, ...rest } = props as AsButton;
  return (
    <button type="button" {...rest} className={classes} aria-busy={loading || undefined}>
      {content}
    </button>
  );
}
