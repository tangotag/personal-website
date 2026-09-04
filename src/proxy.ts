import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

// Next.js 16: the request interceptor is `proxy`, not `middleware`.
const handleI18n = createIntlMiddleware(routing);

export function proxy(request: NextRequest) {
  return handleI18n(request);
}

export const config = {
  // Skip internals, API routes, Vercel, and any path with a file extension (assets, resume.pdf, sitemap.xml…).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
