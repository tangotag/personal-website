import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@/components/layout/analytics";
import { ConsentBar } from "@/components/layout/consent-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SkipLink } from "@/components/layout/skip-link";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { site } from "@/data/site";
import { routing } from "@/i18n/routing";
import { addressFor } from "@/lib/seo";
import "../globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"], // Spanish is fully covered by the latin subset
  variable: "--font-bricolage",
  // Optical size axis gives the tight display cut at hero sizes.
  axes: ["opsz"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  preload: false, // metadata/eyebrows only — never the LCP element
  // "optional": if the mono font is not ready within ~100ms the fallback stays for that view,
  // which avoids the many small layout shifts a late swap causes on text-heavy case studies.
  display: "optional",
});

/** Default social card: the portrait over the evergreen ground, built by scripts/build-portrait.mts. */
const OG_IMAGE = "/images/og-default.jpg";

/** Only the namespaces client islands read — keeps the serialized RSC payload small. */
const CLIENT_NAMESPACES = ["nav", "common", "consent", "forms", "pages"] as const;

function clientMessages(all: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const ns of CLIENT_NAMESPACES) if (ns in all) out[ns] = all[ns];
  // Client code only needs the /work filter strings from "pages".
  const pages = all.pages as Record<string, unknown> | undefined;
  if (pages && typeof pages === "object") out.pages = { work: pages.work };
  return out;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Omit<LayoutProps<"/[locale]">, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const bing = process.env.NEXT_PUBLIC_BING_VERIFICATION;
  const { alternates, canonicalUrl } = addressFor("/", locale);

  return {
    metadataBase: new URL(site.url),
    title: {
      default: t("home.title"),
      template: t("titleTemplate"),
    },
    description: t("home.description"),
    applicationName: t("siteName"),
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    openGraph: {
      type: "website",
      siteName: t("siteName"),
      locale: locale === "es" ? "es_ES" : "en_US",
      url: canonicalUrl,
      // Case studies generate their own card; every other route falls back to this one.
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${site.name} · ${site.role}` }],
    },
    twitter: { card: "summary_large_image", images: [OG_IMAGE] },
    robots: { index: true, follow: true },
    alternates,
    verification: bing ? { other: { "msvalidate.01": bing } } : undefined,
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for every route under this layout.
  setRequestLocale(locale);
  const messages = clientMessages((await getMessages()) as Record<string, unknown>);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        {/* Marks JS as running so the CSS motion system may hide elements before they reveal. */}
        <script
          dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js")' }}
        />
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <SkipLink />
            <Header />
            <div id="top" className="flex flex-1 flex-col pt-(--header-h)">
              {children}
            </div>
            <Footer />
            <ConsentBar />
            <Analytics />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
