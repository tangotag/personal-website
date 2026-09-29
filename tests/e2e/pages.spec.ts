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
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Senior Product Design");
    await expect(page.locator("main li[id]")).toHaveCount(7);
    await expect(
      page.getByRole("heading", { name: "Projekt, Retainer oder im Team." }),
    ).toBeVisible();
    await expect(page.locator("details")).toHaveCount(6);
    await expect(page.locator("#quote form")).toBeVisible();
    // Structured data is one @graph per page; the nodes are addressed by type, not by index.
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    const graph = JSON.parse(ld!)["@graph"] as { "@type": string; [k: string]: unknown }[];
    const node = (type: string) => graph.find((n) => n["@type"] === type);
    expect(node("ProfessionalService")?.makesOffer).toHaveLength(7);
    expect(node("FAQPage")).toBeTruthy();
    expect(node("BreadcrumbList")?.itemListElement).toHaveLength(2);
  });

  test("service card links deep-link into the quote form", async ({ page }) => {
    await page.goto("/services");
    const first = page.locator("main li[id]").first();
    await first.getByRole("link", { name: /Dafür ein Angebot anfragen/ }).click();
    await expect(page).toHaveURL(/\/services\?service=end-to-end-product-design#quote$/);
  });
});

test.describe("about", () => {
  test.beforeEach(async ({ page }) => page.context().clearCookies());

  test("renders story, timeline, skills, awards and the resume link", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Games haben mir Engagement beigebracht",
    );
    await expect(page.locator("#experience ol > li")).toHaveCount(6);
    await expect(page.getByText("Cygnus Payments").first()).toBeVisible();
    await expect(page.getByText("The Brainiac Award")).toBeVisible();
    const resume = page.getByRole("link", { name: /Lebenslauf herunterladen/ }).first();
    await expect(resume).toHaveAttribute("href", /\.pdf$/);
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    const graph = JSON.parse(ld!)["@graph"] as { "@type": string; [k: string]: unknown }[];
    expect(graph.find((n) => n["@type"] === "Person")?.name).toBe("Raheel Ahmad Qureshi");
    expect(graph.find((n) => n["@type"] === "ProfilePage")).toBeTruthy();
  });
});

test.describe("contact", () => {
  test.beforeEach(async ({ page }) => page.context().clearCookies());

  test("shows validation errors for an empty submit and keeps input on error", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel(/^Name/).fill("R");
    await page.getByLabel(/^E-Mail/).fill("not-an-email");
    await page.getByLabel(/^Nachricht/).fill("short");
    await page.getByRole("button", { name: "Nachricht senden" }).click();
    await expect(page.getByText("Bitte nennen Sie mir Ihren Namen.")).toBeVisible();
    await expect(page.getByText("Bitte geben Sie eine gültige E-Mail-Adresse ein.")).toBeVisible();
    await expect(page.getByText(/mindestens 10 Zeichen/i)).toBeVisible();
    // Values survive the round trip.
    await expect(page.getByLabel(/^E-Mail/)).toHaveValue("not-an-email");
  });

  test("submits successfully in dev mode (no email/Turnstile keys)", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel(/^Name/).fill("Playwright Tester");
    await page.getByLabel(/^E-Mail/).fill("tester@example.com");
    await page.getByLabel(/^Nachricht/).fill("This is an end-to-end test message from Playwright.");
    await awaitTurnstile(page);
    await page.getByRole("button", { name: "Nachricht senden" }).click();
    await expect(page.getByTestId("contact-success")).toBeVisible();
    await expect(page.getByTestId("contact-success")).toContainText("innerhalb von 24 Stunden");
  });

  test("honeypot submissions are silently accepted", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel(/^Name/).fill("Bot");
    await page.getByLabel(/^E-Mail/).fill("bot@example.com");
    await page.getByLabel(/^Nachricht/).fill("Buy cheap things now please thanks.");
    await page.locator('input[name="website"]').fill("http://spam.example");
    await awaitTurnstile(page);
    await page.getByRole("button", { name: "Nachricht senden" }).click();
    await expect(page.getByTestId("contact-success")).toBeVisible();
  });

  test("shows the copy-email button", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("button", { name: /connect@raheelqureshi.com/ })).toBeVisible();
  });
});
