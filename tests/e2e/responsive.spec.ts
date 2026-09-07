import { expect, test } from "@playwright/test";

/**
 * Phase 9 responsive gate (docs/10 §9): every page at every width, both themes —
 * no horizontal scroll, every interactive element ≥ 44px tall, and a screenshot per combo
 * saved under test-results/responsive/ for review (not committed).
 */
const widths = [390, 412, 768, 1024, 1280, 1536, 1920] as const;
const pages = [
  "/",
  "/work",
  "/work/compass-pos",
  "/work/mintavibe",
  "/services",
  "/about",
  "/contact",
] as const;
const themes = ["light", "dark"] as const;

test.describe("responsive", () => {
  test.describe.configure({ mode: "parallel" });
  test.skip(({ isMobile }) => isMobile, "viewport matrix runs on the desktop project only");

  for (const path of pages) {
    for (const width of widths) {
      test(`${path} @ ${width}px`, async ({ page }) => {
        await page.context().clearCookies();
        await page.setViewportSize({ width, height: 900 });
        for (const theme of themes) {
          await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
          await page.goto(path, { waitUntil: "load" });
          // Not networkidle: the Turnstile widget on /services and /contact polls in the background.
          await page.waitForTimeout(600);

          const { scrollWidth, clientWidth } = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
          }));
          expect(
            scrollWidth,
            `horizontal overflow on ${path} @ ${width} (${theme})`,
          ).toBeLessThanOrEqual(clientWidth + 1);

          // WIDE_BLEED: content that overflows to the LEFT is clipped silently, with no scrollbar
          // and no effect on scrollWidth, so it has to be measured directly. A wide <Figure> or
          // <Gallery> whose negative margin exceeds the container padding disappears off the edge.
          const clipped = await page.evaluate(() => {
            const out: string[] = [];
            for (const el of document.querySelectorAll<HTMLElement>("figure, ul, li, img")) {
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              if (r.left < -1) out.push(`${el.tagName.toLowerCase()} left=${Math.round(r.left)}`);
            }
            return out.slice(0, 5);
          });
          expect(
            clipped,
            `content clipped off the left edge on ${path} @ ${width} (${theme})`,
          ).toEqual([]);

          // Tap targets: visible links/buttons/inputs must be ≥ 44px tall (inline text links exempt).
          const small = await page.evaluate(() => {
            const out: string[] = [];
            const els = document.querySelectorAll<HTMLElement>(
              'button, input:not([type="hidden"]), select, textarea, a.inline-flex, [role="button"]',
            );
            for (const el of els) {
              const r = el.getBoundingClientRect();
              const style = getComputedStyle(el);
              if (r.width === 0 || r.height === 0 || style.visibility === "hidden") continue;
              if (el.closest("[hidden], dialog:not([open])")) continue;
              if (el.hasAttribute("data-inline")) continue; // inline text links are exempt
              if (el.closest('[aria-hidden="true"]')) continue; // honeypot etc.
              if (r.height < 44 && r.height > 0)
                out.push(
                  `${el.tagName.toLowerCase()} ${Math.round(r.height)}px: ${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30)}`,
                );
            }
            return out;
          });
          expect(small, `tap targets < 44px on ${path} @ ${width} (${theme})`).toEqual([]);

          // WIDE_BLEED: figures and galleries share the article's left edge. A wide image is allowed
          // to run past the text on the RIGHT, into the gutter, but never to start further left,
          // which would give the column two ragged edges.
          const ragged = await page.evaluate(() => {
            const article = document.querySelector("article.case-body");
            if (!article) return [];
            const left = Math.round(article.getBoundingClientRect().left);
            const media = [
              ...article.querySelectorAll("figure"),
              ...[...article.querySelectorAll("ul")].filter((el) => el.querySelector("img")),
            ];
            const out: string[] = [];
            for (const el of media) {
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              if (Math.abs(Math.round(r.left) - left) > 1)
                out.push(`${el.tagName.toLowerCase()} left ${Math.round(r.left)} vs text ${left}`);
            }
            return out.slice(0, 5);
          });
          expect(
            ragged,
            `media not left-aligned with text on ${path} @ ${width} (${theme})`,
          ).toEqual([]);

          await page.screenshot({
            path: `test-results/responsive/${path.replace(/\W+/g, "_") || "home"}-${width}-${theme}.png`,
            fullPage: true,
          });
        }
      });
    }
  }
});
