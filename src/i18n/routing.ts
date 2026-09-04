import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  // English lives at "/", Spanish at "/es/...".
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
