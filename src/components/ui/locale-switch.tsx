"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/** EN · ES segmented switch. Preserves the current route (next-intl's usePathname is locale-agnostic). */
export function LocaleSwitch({ className }: { className?: string }) {
  const t = useTranslations("common.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(next: Locale) {
    if (next === locale) return;
    // String hrefs only: the object form with `params` is for localized `pathnames`, which we don't use.
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "inline-flex h-11 items-center overflow-hidden rounded-sm border border-border font-mono text-[0.6875rem] tracking-[0.08em] uppercase",
        className,
      )}
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            aria-label={`${code.toUpperCase()} · ${t(code)}`}
            onClick={() => switchTo(code)}
            className={cn(
              "h-11 px-3 transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              active ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
            )}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
