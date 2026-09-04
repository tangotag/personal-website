import { expect, test, type Page } from "@playwright/test";

/** When a Turnstile widget is on the page (test site key in CI/e2e builds), wait for its token. */
async function awaitTurnstile(page: Page) {
  if ((await page.locator("[data-turnstile]").count()) === 0) return;
  await expect
    .poll(async () => page.locator('input[name="cf-turnstile-response"]').inputValue(), {
      timeout: 20_000,
    })
    .not.toBe("");
}

test.describe("services", () => {
  test.beforeEach(async ({ page }) => page.context().clearCookies());

  test("lists seven services, models, process, FAQ and the quote form", async ({ page }) => {
    await page.goto("/services");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Senior product design");
    await expect(page.locator("main li[id]")).toHaveCount(7);
    await expect(
      page.getByRole("heading", { name: "Project, retainer or embedded." }),
    ).toBeVisible();
    await expect(page.locator("details")).toHaveCount(6);
    await expect(page.locator("#quote form")).toBeVisible();
    // Structured data present and parseable.
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    const parsed = JSON.parse(ld!);
    expect(parsed[0]["@type"]).toBe("ProfessionalService");
    expect(parsed[0].makesOffer).toHaveLength(7);
    expect(parsed[1]["@type"]).toBe("FAQPage");
  });

  test("service card links deep-link into the quote form", async ({ page }) => {
    await page.goto("/services");
    const first = page.locator("main li[id]").first();
    await first.getByRole("link", { name: /Request a quote for this/ }).click();
    await expect(page).toHaveURL(/\/services\?service=end-to-end-product-design#quote$/);
  });
});

test.describe("about", () => {
  test.beforeEach(async ({ page }) => page.context().clearCookies());

  test("renders story, timeline, skills, awards and the resume link", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Games taught me engagement",
    );
    await expect(page.locator("#experience ol > li")).toHaveCount(6);
    await expect(page.getByText("Cygnus Payments").first()).toBeVisible();
    await expect(page.getByText("The Brainiac Award")).toBeVisible();
    const resume = page.getByRole("link", { name: /Download resume/ }).first();
    await expect(resume).toHaveAttribute("href", /\.pdf$/);
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(JSON.parse(ld!)["@type"]).toBe("Person");
  });
});

test.describe("contact", () => {
  test.beforeEach(async ({ page }) => page.context().clearCookies());

  test("shows validation errors for an empty submit and keeps input on error", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel(/^Name/).fill("R");
    await page.getByLabel(/^Email/).fill("not-an-email");
    await page.getByLabel(/^Message/).fill("short");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Please tell me your name.")).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
    await expect(page.getByText(/at least 10 characters/)).toBeVisible();
    // Values survive the round trip.
    await expect(page.getByLabel(/^Email/)).toHaveValue("not-an-email");
  });

  test("submits successfully in dev mode (no email/Turnstile keys)", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel(/^Name/).fill("Playwright Tester");
    await page.getByLabel(/^Email/).fill("tester@example.com");
    await page.getByLabel(/^Message/).fill("This is an end-to-end test message from Playwright.");
    await awaitTurnstile(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByTestId("contact-success")).toBeVisible();
    await expect(page.getByTestId("contact-success")).toContainText("within 24 hours");
  });

  test("honeypot submissions are silently accepted", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel(/^Name/).fill("Bot");
    await page.getByLabel(/^Email/).fill("bot@example.com");
    await page.getByLabel(/^Message/).fill("Buy cheap things now please thanks.");
    await page.locator('input[name="website"]').fill("http://spam.example");
    await awaitTurnstile(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByTestId("contact-success")).toBeVisible();
  });

  test("shows the copy-email button", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("button", { name: /connect@raheelqureshi.com/ })).toBeVisible();
  });
});
