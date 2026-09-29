import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "es"],
  defaultLocale: "de",
  // German lives at "/", Spanish at "/es/...".
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
