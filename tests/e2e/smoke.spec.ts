import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("home responds and has a single H1", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("no console errors on home", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      const text = msg.text();
      // Playwright points consent.cookiebot.com at nothing on purpose (see playwright.config.ts),
      // so the browser reports a failed load and the Cookiebot tag's own error Event. Both are
      // this harness refusing to reach a third party, not the site misbehaving.
      if (/ERR_NAME_NOT_RESOLVED/.test(text) || text === "Event") return;
      errors.push(text);
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
});
