import { useTranslations } from "next-intl";

/** Visually hidden until focused; jumps keyboard users past the header. */
export function SkipLink() {
  const t = useTranslations("nav");
  return (
    <a
      href="#main"
      className="sr-only z-[100] rounded-sm bg-accent px-4 py-2 font-medium text-accent-fg focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:outline-2 focus:outline-offset-2 focus:outline-focus"
    >
      {t("skipToContent")}
    </a>
  );
}
