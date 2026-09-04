import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test.beforeEach(async ({ page }) => page.context().clearCookies());

  test("renders every section in order with one H1", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveCount(1);
    const ids = [
      "work",
      "numbers",
      "familiar",
      "services",
      "experience",
      "process",
      "faq",
      "contact-cta",
    ];
    let lastTop = -1;
    for (const id of ids) {
      const box = await page.locator(`#${id}`).boundingBox();
      expect(box, `#${id} should exist`).not.toBeNull();
      expect(box!.y).toBeGreaterThan(lastTop);
      lastTop = box!.y;
    }
  });

  test("hero CTAs route correctly", async ({ page }) => {
    await page.goto("/");
    const hero = page
      .locator("main")
      .getByRole("link", { name: /Start a project/ })
      .first();
    await expect(hero).toHaveAttribute("href", "/contact");
    const resume = page.getByRole("link", { name: /Download resume/ }).first();
    await expect(resume).toHaveAttribute(
      "href",
      /Raheel-Ahmad-Qureshi-Senior-Product-Designer\.pdf$/,
    );
    const res = await page.request.get((await resume.getAttribute("href"))!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("pdf");
  });

  test("selected work links to a case study", async ({ page }) => {
    await page.goto("/");
    const first = page.locator("#work a[href^='/work/']").first();
    const href = await first.getAttribute("href");
    await first.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("numbers show final values under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const numbers = page.locator("#numbers");
    await numbers.scrollIntoViewIfNeeded();
    await expect(numbers.getByText("9+", { exact: true })).toBeVisible();
    await expect(numbers.getByText("−25%", { exact: true })).toBeVisible();
  });

  test("email copy button announces success", async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permissions are chromium-only here");
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    const btn = page
      .locator("#contact-cta")
      .getByRole("button", { name: /connect@raheelqureshi.com/ });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await expect(btn).toContainText("Copied");
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toBe("connect@raheelqureshi.com");
  });
});
