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
    const toc = page.getByRole("navigation", { name: "Auf dieser Seite" });
    const toggle = toc.getByRole("button", { name: "Auf dieser Seite" });
    if (await toggle.isVisible()) await toggle.click();
    await expect(toc.getByRole("link").first()).toBeVisible();
    const target = await toc.getByRole("link").first().getAttribute("href");
    await expect(page.locator(target!)).toBeVisible();
    // Next project card exists and links to another case study.
    const next = page.getByRole("link", { name: /Nächstes Projekt/ });
    await expect(next).toHaveAttribute("href", /^\/work\/(?!compass-pos)/);
  });

  test("placeholder metrics are hidden in production", async ({ page }) => {
    await page.goto("/work/compass-pos");
    await expect(page.getByText("[CONFIRM]")).toHaveCount(0);
  });

  // Every entry is translated, so the Spanish URL must serve Spanish prose. The fallback notice is
  // still built and still correct; it has nothing left to announce, and its reappearance here would
  // mean a case study shipped without its .es.mdx.
  test("Spanish serves the Spanish body, not a German fallback", async ({ page }) => {
    await page.goto("/es/work/compass-pos");
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByText("solo está disponible en alemán")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "el terminal con el que un restaurante pasa todo el día",
    );
    await expect(page.getByText("Diseñador de Producto Senior").first()).toBeVisible();
    // The shared catalogues used to leak English tag chips into both locales.
    await expect(page.getByText("Sistema de diseño").first()).toBeVisible();
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
