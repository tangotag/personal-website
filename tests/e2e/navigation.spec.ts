import { expect, test, type Page } from "@playwright/test";

/** The next-intl cookie would otherwise redirect "/" to the last chosen locale. */
async function resetLocale(page: Page) {
  await page.context().clearCookies();
}

test.describe("header & navigation", () => {
  test.beforeEach(async ({ page }) => resetLocale(page));

  test("desktop nav marks the current page and routes work", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop-only nav");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await expect(nav.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("mobile menu opens with the keyboard, traps focus, closes on Escape", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "mobile-only menu");
    await page.goto("/");
    const open = page.getByRole("button", { name: "Open menu" });
    await open.focus();
    await page.keyboard.press("Enter");

    const dialog = page.locator("dialog#mobile-menu");
    await expect(dialog).toHaveJSProperty("open", true);
    await expect(page.getByRole("button", { name: "Close menu" })).toBeFocused();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    // Focus stays inside the dialog while tabbing.
    for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
    const inside = await page.evaluate(() =>
      document.querySelector("dialog#mobile-menu")?.contains(document.activeElement),
    );
    expect(inside).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveJSProperty("open", false);
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });

  test("theme toggle persists across reloads", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");
    await page.getByRole("button", { name: /Toggle theme/ }).click();
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("locale switch keeps the current route", async ({ page, isMobile }) => {
    test.skip(isMobile, "switch lives in the desktop header on wide viewports");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about");
    // Header and footer both carry a switch; use the header one.
    await page
      .getByRole("banner")
      .getByRole("group", { name: "Language" })
      .getByRole("button", { name: "Spanish" })
      .click();
    await expect(page).toHaveURL(/\/es\/about$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("skip link jumps to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("unknown paths render the localized 404", async ({ page }) => {
    const res = await page.goto("/es/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Esta página no existe.");
    await expect(page.getByRole("link", { name: /Volver al inicio/ })).toBeVisible();
  });
});
