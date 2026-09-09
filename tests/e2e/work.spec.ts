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

  test("mobile app cards open a dialog of screens instead of a detail page", async ({ page }) => {
    await page.goto("/work");
    const section = page.locator("section", { has: page.getByText("Mobile App Design") });
    const cards = section.locator("ul > li > button");
    await expect(cards).toHaveCount(4);
    // Concept work, not case studies: a card is a button, never a link to a write-up.
    await expect(section.locator("a")).toHaveCount(0);

    await cards.first().click();
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "Cinema booking" })).toBeVisible();
    await expect(dialog.locator("figure img")).toHaveCount(3);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
