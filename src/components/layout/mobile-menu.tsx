"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { LocaleSwitch } from "@/components/ui/locale-switch";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { StatusPill } from "@/components/ui/status-pill";
import { TextLink } from "@/components/ui/text-link";
import { navItems } from "@/data/nav";
import { site } from "@/data/site";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type Props = { open: boolean; onClose: () => void };

/**
 * Full-screen navigation for < md. Uses a native <dialog> so focus trapping, Esc and the
 * top layer come for free; body scroll is locked via `body:has(dialog[open])` in globals.css.
 */
export function MobileMenu({ open, onClose }: Props) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Close when the route changes (link clicked) — the dialog would otherwise stay open.
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to navigation
  }, [pathname]);

  return (
    <dialog
      ref={ref}
      id="mobile-menu"
      aria-label={t("menu")}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className={cn(
        "m-0 h-dvh max-h-none w-full max-w-none bg-bg p-0 text-fg backdrop:bg-bg/60",
        "open:flex open:flex-col",
        // Entry/exit — progressive (needs @starting-style support); otherwise it just appears.
        "motion-safe:transition-[opacity,translate] motion-safe:duration-300 motion-safe:ease-out",
        "motion-safe:starting:open:-translate-y-4 motion-safe:starting:open:opacity-0",
      )}
    >
      <div className="container-content flex h-(--header-h) shrink-0 items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm font-medium tracking-[0.12em] uppercase"
          aria-label={`${site.shortName} · ${site.name}`}
        >
          {site.shortName}
        </Link>
        <div className="flex items-center gap-1">
          <LocaleSwitch />
          <ThemeToggle />
          <IconButton aria-label={t("closeMenu")} onClick={onClose} autoFocus>
            <X className="size-5" />
          </IconButton>
        </div>
      </div>

      <nav aria-label="Primary" className="container-content flex flex-1 flex-col justify-center">
        <ul className="flex flex-col gap-2">
          {navItems.map((item, i) => {
            const active =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <li
                key={item.key}
                className="motion-safe:animate-[menu-item_400ms_var(--ease-out)_both]"
                style={{ animationDelay: `${80 + i * 50}ms` }}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex items-baseline gap-4 py-2 text-h1 transition-colors",
                    active ? "text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  <span className="font-mono text-xs tracking-[0.12em] text-accent">0{i + 1}</span>
                  {t(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="container-content flex shrink-0 flex-col gap-5 border-t border-border py-6">
        <StatusPill>{tc("available")}</StatusPill>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <TextLink external href={`mailto:${site.email}`}>
            {tc("email")}
          </TextLink>
          <TextLink external href={site.social.linkedin}>
            LinkedIn
          </TextLink>
          <TextLink external href={site.social.behance}>
            Behance
          </TextLink>
        </div>
      </div>
    </dialog>
  );
}
