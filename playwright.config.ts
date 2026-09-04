import { defineConfig, devices } from "@playwright/test";

// 3100, not 3000: the dev server owns 3000 (it is the port whitelisted in Cloudflare Turnstile).
const PORT = Number(process.env.PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

/**
 * E2E runs against the production build (`next build && next start`) so that
 * static generation, metadata and caching behave exactly as on Vercel.
 * Run `npm run test:e2e` (builds first) or `npm run e2e` (assumes a build exists).
 *
 * `reuseExistingServer` is deliberately off: a lingering `next start` from an earlier run
 * would serve a stale build and fail every request for the new chunks with 500s.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-android", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    // Tests must never reach real services: Cloudflare's always-pass test secret and no Resend key
    // (the action logs instead of sending). The matching test site key is inlined by `--build-only`.
    env: {
      ...process.env,
      TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
      RESEND_API_KEY: "",
      // No database either: the action logs "supabase not configured" instead of inserting rows.
      SUPABASE_PROJECT_URL: "",
      SUPABASE_ANON_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
  },
});
