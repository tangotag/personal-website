import { expect, test } from "@playwright/test";

test.describe("work listing", () => {
  test.beforeEach(async ({ page }) => page.context().clearCookies());

  test("lists every published case study with the hero first", async ({ page }) => {
    await page.goto("/work");
    const cards = page.locator("main ul li a[href^='/work/']");
    await expect(cards.first()).toHaveAttribute("href", "/work/compass-pos");
    expect(await cards.count()).toBeGreaterThanOrEqual(3);
  });

  test("?f=games deep-links to the games filter", async ({ page }) => {
    await page.goto("/work?f=games");
    await expect(page.getByRole("button", { name: "Games" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const hrefs = await page
      .locator("main ul li a[href^='/work/']")
      .evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs).toContain("/work/open-omaha");
    expect(hrefs).not.toContain("/work/compass-pos");
  });

  test("unknown filter falls back to all", async ({ page }) => {
    await page.goto("/work?f=nope");
    await expect(page.getByRole("button", { name: "All", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("chips update the URL and the grid", async ({ page }) => {
    await page.goto("/work");
    await page.getByRole("button", { name: "SaaS" }).click();
    await expect(page).toHaveURL(/\?f=saas$/);
    await expect(page.getByRole("button", { name: "SaaS" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator("main ul li a[href='/work/compass-pos']")).toBeVisible();
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page).not.toHaveURL(/f=/);
  });

  test("mobile app designs sits in the grid, under Mobile, and opens its own page", async ({
    page,
  }) => {
    await page.goto("/work");
    const card = page.locator("main ul li a[href='/work/mobile-app-designs']");
    await expect(card).toBeVisible();

    // It is a mobile entry, so it filters alongside Mintavibe rather than standing apart.
    await page.getByRole("button", { name: "Mobile", exact: true }).click();
    await expect(page).toHaveURL(/\?f=mobile$/);
    await expect(card).toBeVisible();
    await expect(page.locator("main ul li a[href='/work/mintavibe']")).toBeVisible();

    await card.click();
    await expect(page).toHaveURL(/\/work\/mobile-app-designs$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Mobile App Designs");
    // Every screen of every app is on the page; there is no second click to reach them.
    await expect(page.locator("article figure img")).toHaveCount(14);
    await expect(page.getByRole("heading", { name: "Cinema booking" })).toBeVisible();
  });
});
