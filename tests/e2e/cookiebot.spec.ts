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

/**
 * Cookiebot's auto-blocking rewrites the inline scripts it processes, stamping a `type` on them.
 * That happens before React hydrates, so React finds attributes it did not render and reports a
 * mismatch it "won't patch up" — on every page. Our own inline scripts carry
 * `data-cookieconsent="ignore"` and an explicit `type` so neither outcome moves the DOM.
 *
 * The real pass cannot run here (uc.js refuses an unauthorised domain, and this suite does not
 * reach Cookiebot at all), so the rewrite is simulated: stamp every un-typed inline script before
 * hydration, once honouring `ignore` and once not. Remove either attribute from the layout and the
 * second case fails.
 */
test.describe("cookiebot auto-blocking does not break hydration", () => {
  for (const honoursIgnore of [true, false]) {
    test(`inline scripts survive a rewrite that ${honoursIgnore ? "honours" : "ignores"} data-cookieconsent`, async ({
      page,
    }) => {
      await page.addInitScript((honours: boolean) => {
        const stamp = () => {
          for (const s of document.querySelectorAll("script")) {
            if (s.src) continue;
            if (honours && s.getAttribute("data-cookieconsent") === "ignore") continue;
            if (!s.hasAttribute("type")) s.setAttribute("type", "text/javascript");
          }
        };
        new MutationObserver(stamp).observe(document, { childList: true, subtree: true });
        document.addEventListener("readystatechange", stamp, true);
        stamp();
      }, honoursIgnore);

      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });

      for (const path of ["/", "/work", "/work/compass-pos", "/es", "/es/work/kompete"]) {
        await page.goto(path, { waitUntil: "load" });
        await page.waitForTimeout(800);
      }

      expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
      // The reveal rules never release without this class, so a blocked marker is a blank page.
      await expect(page.locator("html.js")).toHaveCount(1);
    });
  }

  test("structured data is exempt from blocking", async ({ page }) => {
    await page.goto("/work/compass-pos", { waitUntil: "load" });
    const marks = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-cookieconsent")));
    expect(marks.length).toBeGreaterThan(0);
    // A CMP that re-types one of these takes the page's structured data with it.
    expect(marks.every((m) => m === "ignore")).toBe(true);
  });
});
