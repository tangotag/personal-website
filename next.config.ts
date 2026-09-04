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
  images: {
    formats: ["image/avif", "image/webp"],
    // Case-study covers are 1600×1000; add sizes as needed.
    deviceSizes: [390, 640, 768, 1024, 1280, 1536, 1920],
  },
  // Cache Components stay off: the site is fully static via generateStaticParams.
};

export default withNextIntl(nextConfig);
