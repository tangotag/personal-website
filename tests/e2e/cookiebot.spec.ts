import { expect, test } from "@playwright/test";

/**
 * Cookiebot is the consent manager and has to be on every page, or a visitor reaches a route with
 * no way to give or withhold consent. Playwright resolves consent.cookiebot.com to nothing (see
 * playwright.config.ts), so the tag is asserted without an automated run ever reaching Cookiebot.
 */
const PAGES = [
  "/",
  "/work",
  "/services",
  "/about",
  "/contact",
  "/work/compass-pos",
  "/work/compass-kiosk",
  "/work/mintavibe",
  "/work/kompete",
  "/work/open-omaha",
  "/work/texas-flip",
  "/work/mobile-app-designs",
] as const;

const CBID = "0a52951b-cf4e-4ef9-b5ca-74cb474cc686";

test.describe("cookiebot", () => {
  test.beforeEach(async ({ page }) => page.context().clearCookies());

  for (const [locale, prefix] of [
    ["de", ""],
    ["es", "/es"],
  ] as const) {
    test(`${locale}: the consent tag is on every page`, async ({ page }) => {
      for (const path of PAGES) {
        await page.goto(prefix + path || "/", { waitUntil: "load" });
        const tag = page.locator("script#Cookiebot");
        await expect(tag, `${prefix}${path} has no Cookiebot tag`).toHaveCount(1);
        await expect(tag).toHaveAttribute("src", "https://consent.cookiebot.com/uc.js");
        await expect(tag).toHaveAttribute("data-cbid", CBID);
        // Without auto blocking, a cookie-setting script runs before the visitor has chosen.
        await expect(tag).toHaveAttribute("data-blockingmode", "auto");
        // The banner follows the page, not the browser: /es must not greet a visitor in German.
        await expect(tag).toHaveAttribute("data-culture", locale.toUpperCase());
        // It belongs in the head, ahead of anything a visitor's consent should gate.
        await expect(page.locator("head script#Cookiebot")).toHaveCount(1);
      }
    });
  }

  test("no analytics cookie is set before consent", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const names = (await page.context().cookies()).map((c) => c.name);
    expect(names.filter((n) => /^_ga|^_gid|^_gat/.test(n))).toEqual([]);
  });
});
