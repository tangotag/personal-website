import { expect, test } from "@playwright/test";

test.describe("case study", () => {
  test.beforeEach(async ({ page }) => page.context().clearCookies());

  test("renders hero, meta, body, TOC and next project", async ({ page }) => {
    await page.goto("/work/compass-pos");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Compass POS");
    await expect(page.getByText("Cygnus Payments").first()).toBeVisible();
    // Meta list carries role/timeline/platforms.
    await expect(page.getByText("Senior Product Designer").first()).toBeVisible();
    // TOC links to the body headings (collapsed behind a toggle on mobile).
    const toc = page.getByRole("navigation", { name: "On this page" });
    const toggle = toc.getByRole("button", { name: "On this page" });
    if (await toggle.isVisible()) await toggle.click();
    await expect(toc.getByRole("link").first()).toBeVisible();
    const target = await toc.getByRole("link").first().getAttribute("href");
    await expect(page.locator(target!)).toBeVisible();
    // Next project card exists and links to another case study.
    const next = page.getByRole("link", { name: /Next project/ });
    await expect(next).toHaveAttribute("href", /^\/work\/(?!compass-pos)/);
  });

  test("placeholder metrics are hidden in production", async ({ page }) => {
    await page.goto("/work/compass-pos");
    await expect(page.getByText("[CONFIRM]")).toHaveCount(0);
  });

  test("Spanish falls back to English with a notice", async ({ page }) => {
    await page.goto("/es/work/compass-pos");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByText("solo está disponible en inglés")).toBeVisible();
  });

  test("unknown slug is a 404", async ({ page }) => {
    const res = await page.goto("/work/does-not-exist");
    expect(res?.status()).toBe(404);
  });

  test("OG image is generated", async ({ page }) => {
    const res = await page.request.get("/work/compass-pos/opengraph-image");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});
