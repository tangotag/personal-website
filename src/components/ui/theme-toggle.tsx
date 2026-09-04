"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { IconButton } from "@/components/ui/icon-button";

const noop = () => () => {};

/** Sun/moon toggle. Renders a neutral placeholder until hydrated to avoid a theme mismatch. */
export function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations("common.theme");
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  const isDark = hydrated && resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <IconButton
      aria-label={hydrated ? `${t("toggle")}: ${t(next)}` : t("toggle")}
      title={hydrated ? t(next) : undefined}
      onClick={() => setTheme(next)}
      className={className}
    >
      {hydrated ? (
        isDark ? (
          <Sun className="size-5" />
        ) : (
          <Moon className="size-5" />
        )
      ) : (
        <span aria-hidden className="size-5" />
      )}
    </IconButton>
  );
}
