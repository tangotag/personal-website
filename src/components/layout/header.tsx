"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { LocaleSwitch } from "@/components/ui/locale-switch";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navItems } from "@/data/nav";
import { site } from "@/data/site";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/**
 * True once the page has scrolled past the hero top, which is when the header takes its background,
 * blur and hairline.
 *
 * The header deliberately never hides. It used to slide away on a downward scroll while the
 * case-study reading bar stayed pinned at top: var(--header-h), so the accent line was left
 * floating over the content with nothing above it and read as a rule cutting the page in half.
 */
function useHeaderState() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrolled(window.scrollY > 80);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { scrolled };
}

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { scrolled } = useHeaderState();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 h-(--header-h) transition-[transform,background-color,border-color] duration-200 ease-out",
          scrolled
            ? "border-b border-border bg-surface/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-content flex h-full items-center justify-between gap-4">
          <Link
            href="/"
            className="rounded-xs font-mono text-sm font-medium tracking-[0.12em] text-fg uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            aria-label={`${site.shortName} · ${site.name}`}
          >
            {site.shortName}
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative inline-flex h-11 items-center rounded-xs px-3 text-sm font-medium transition-colors duration-150",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                        active ? "text-fg" : "text-fg-muted hover:text-fg",
                        // Accent dot under the active label.
                        "after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-accent-strong after:opacity-0 after:transition-opacity",
                        active && "after:opacity-100",
                      )}
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <LocaleSwitch />
            <ThemeToggle />
            <Button href="/contact" size="md" arrow className="hidden md:inline-flex">
              {t("cta")}
            </Button>
            <IconButton
              aria-label={t("openMenu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="md:hidden"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-5" />
            </IconButton>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
