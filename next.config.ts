import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./src/i18n/request.ts",
  experimental: {
    // Generates a type declaration from the English catalog so t("key") is type-checked.
    createMessagesDeclaration: "./messages/en.json",
  },
});

const nextConfig: NextConfig = {
  typedRoutes: true,
  experimental: {
    // The stylesheet is one 12 KB Tailwind chunk and it was blocking first render for ~450ms on
    // slow 4G. Inlining it into <head> removes the round trip; the trade-off the Next docs name —
    // returning visitors losing a cached stylesheet — is the wrong side of the bargain for a
    // portfolio, where almost every visit is a first visit.
    inlineCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Case-study covers are 1600×1000; add sizes as needed.
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920],
  },
  // Cache Components stay off: the site is fully static via generateStaticParams.

  /**
   * The resume downloads rather than opening in the browser's PDF viewer, even when the URL is
   * hit directly. The `download` attribute on the links is the client-side half of this; the
   * header covers the case where someone pastes or shares the file URL.
   */
  async headers() {
    return [
      {
        source: "/Raheel-Ahmad-Qureshi-Senior-Product-Designer.pdf",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="Raheel-Ahmad-Qureshi-Senior-Product-Designer.pdf"',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
