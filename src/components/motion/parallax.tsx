import type { CSSProperties, ReactNode } from "react";

/**
 * Transform-only parallax via CSS scroll-driven animations (`animation-timeline: view()`).
 * Browsers without support show the element static; reduced motion disables it in CSS.
 */
export function Parallax({
  children,
  amount = 0.08,
  className,
}: {
  children: ReactNode;
  /** Total travel as a fraction of the element height, e.g. 0.08 = 8%. */
  amount?: number;
  className?: string;
}) {
  return (
    <div className={className} style={{ overflow: "hidden" }}>
      <div className="parallax h-full" style={{ "--parallax": `${amount * 50}%` } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}
