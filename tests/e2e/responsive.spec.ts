import { expect, test } from "@playwright/test";

/**
 * Responsive gate (docs/10 §9): every page at every width, in both locales —
 * no horizontal scroll, nothing clipped off the left edge, no text running out of its box,
 * no two blocks of text sitting on top of each other, and every interactive element ≥ 44px tall.
 *
 * Both locales, because the layout bugs here have all come from text length rather than from
 * breakpoint logic: German compounds ("Aufmerksamkeitsökonomie") and Spanish's longer phrases size
 * a grid track to their min-content width and push the page sideways. Geometry does not depend on
 * the theme, so the checks run in light and dark is sampled for the screenshots.
 *
 * Screenshots land in test-results/responsive/ for review and are not committed.
 */
const WIDTHS = [320, 360, 390, 412, 768, 1024, 1280, 1536, 1920] as const;
/** Narrow widths only: enough to catch a track that refuses to shrink, without 9× the runtime. */
const CASE_WIDTHS = [320, 390, 768, 1280] as const;
/** Dark mode changes colour and not geometry, so it is sampled rather than swept. */
const DARK_AT = new Set<number>([390, 1280]);

const CORE = ["/", "/work", "/services", "/about", "/contact"] as const;
const CASES = [
  "/work/compass-pos",
  "/work/compass-kiosk",
  "/work/mintavibe",
  "/work/kompete",
  "/work/open-omaha",
  "/work/texas-flip",
  "/work/mobile-app-designs",
] as const;

/** localePrefix is "as-needed": German is served from the bare path, Spanish under /es. */
const localized = (path: string, locale: "de" | "es") =>
  locale === "de" ? path : `/es${path === "/" ? "" : path}`;

const matrix = [
  ...CORE.flatMap((path) => WIDTHS.map((width) => ({ path, width }))),
  ...CASES.flatMap((path) => CASE_WIDTHS.map((width) => ({ path, width }))),
].flatMap(({ path, width }) =>
  (["de", "es"] as const).map((locale) => ({ path: localized(path, locale), width, locale })),
);

test.describe("responsive", () => {
  test.describe.configure({ mode: "parallel" });
  test.skip(({ isMobile }) => isMobile, "viewport matrix runs on the desktop project only");

  for (const { path, width, locale } of matrix) {
    test(`${path} @ ${width}px`, async ({ page }) => {
      await page.context().clearCookies();
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
      await page.goto(path, { waitUntil: "load" });
      // Not networkidle: the Turnstile widget on /services and /contact polls in the background.
      await page.waitForTimeout(600);

      const where = `${path} @ ${width} (${locale})`;

      await expect(page.locator("html")).toHaveAttribute("lang", locale);

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, `horizontal overflow on ${where}`).toBeLessThanOrEqual(clientWidth + 1);

      // WIDE_BLEED: content that overflows to the LEFT is clipped silently, with no scrollbar
      // and no effect on scrollWidth, so it has to be measured directly. A wide <Figure> or
      // <Gallery> whose negative margin exceeds the container padding disappears off the edge.
      const offLeft = await page.evaluate(() => {
        const out: string[] = [];
        for (const el of document.querySelectorAll<HTMLElement>("figure, ul, li, img")) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (r.left < -1) out.push(`${el.tagName.toLowerCase()} left=${Math.round(r.left)}`);
        }
        return out.slice(0, 5);
      });
      expect(offLeft, `content clipped off the left edge on ${where}`).toEqual([]);

      // Text running out of its own box. Nothing on this site clamps or ellipsises, so an element
      // that clips and still scrolls is hiding words from the reader — which is what a long German
      // compound in a fixed-height card does.
      const clipped = await page.evaluate(() => {
        const out: string[] = [];
        const sel = "h1,h2,h3,h4,p,li,dd,dt,figcaption,label,td,th,button,a";
        for (const el of document.querySelectorAll<HTMLElement>(sel)) {
          if (el.closest('[hidden], dialog:not([open]), [aria-hidden="true"], [role="marquee"]'))
            continue;
          // A collapsed <details> keeps laying its answer out somewhere; only the summary shows.
          if (el.closest("details:not([open])") && !el.closest("summary")) continue;
          const text = (el.textContent ?? "").trim();
          if (!text) continue;
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") continue;
          if (style.textOverflow === "ellipsis") continue; // deliberate truncation
          // Tailwind's .sr-only hides by clipping — exactly what this check looks for, so the
          // skip link has to opt out by the idiom rather than by size (px-4 beats its padding: 0).
          if (style.clipPath === "inset(50%)") continue;
          const r = el.getBoundingClientRect();
          if (r.width < 4 || r.height < 4) continue;
          const clipsX = style.overflowX === "hidden" || style.overflowX === "clip";
          const clipsY = style.overflowY === "hidden" || style.overflowY === "clip";
          const label = text.replace(/\s+/g, " ").slice(0, 28);
          if (clipsX && el.scrollWidth > el.clientWidth + 1)
            out.push(`${el.tagName.toLowerCase()} "${label}" cut off at the side`);
          else if (clipsY && el.scrollHeight > el.clientHeight + 1)
            out.push(`${el.tagName.toLowerCase()} "${label}" cut off at the bottom`);
        }
        return out.slice(0, 5);
      });
      expect(clipped, `text clipped on ${where}`).toEqual([]);

      // Two blocks of text on top of each other. Compared on the box the reader actually sees:
      // an element's rect intersected with every clipping ancestor, so a collapsed FAQ answer
      // (zero-height panel, overflow hidden) drops out instead of colliding with every other
      // collapsed answer. Positioned and transformed leaves are overlapping on purpose — the
      // accent rule on the prev/next cards, the marquee track, the fixed consent bar.
      const overlapping = await page.evaluate(() => {
        const sel = "h1,h2,h3,h4,p,li,dd,dt,figcaption,label,td,th,span";
        type Box = { left: number; top: number; right: number; bottom: number };
        type Leaf = { el: Element; box: Box; text: string };

        /** The element's rect after every clipping ancestor has had its say. */
        const visibleBox = (el: Element): Box => {
          const r = el.getBoundingClientRect();
          const box = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
          for (let n = el.parentElement; n; n = n.parentElement) {
            const cs = getComputedStyle(n);
            if (cs.overflowX === "visible" && cs.overflowY === "visible") continue;
            const nr = n.getBoundingClientRect();
            box.left = Math.max(box.left, nr.left);
            box.top = Math.max(box.top, nr.top);
            box.right = Math.min(box.right, nr.right);
            box.bottom = Math.min(box.bottom, nr.bottom);
          }
          return box;
        };
        const underFixed = (el: Element) => {
          for (let n: Element | null = el; n; n = n.parentElement)
            if (getComputedStyle(n).position === "fixed") return true;
          return false;
        };

        const leaves: Leaf[] = [];
        for (const el of document.querySelectorAll<HTMLElement>(sel)) {
          if (el.querySelector(sel)) continue; // leaves only: a parent always "overlaps" its child
          if (el.closest('[hidden], dialog:not([open]), [aria-hidden="true"], [role="marquee"]'))
            continue;
          // A collapsed <details> keeps laying its answer out somewhere; only the summary shows.
          if (el.closest("details:not([open])") && !el.closest("summary")) continue;
          const text = (el.textContent ?? "").trim();
          if (!text) continue;
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") continue;
          if (Number.parseFloat(style.opacity) === 0) continue;
          if (style.position === "absolute" || style.position === "fixed") continue;
          if (style.transform !== "none") continue;
          if (style.clipPath === "inset(50%)") continue; // .sr-only
          if (underFixed(el)) continue;
          const box = visibleBox(el);
          if (box.right - box.left < 4 || box.bottom - box.top < 4) continue;
          leaves.push({ el, box, text: text.replace(/\s+/g, " ") });
        }
        const out: string[] = [];
        for (let i = 0; i < leaves.length; i++) {
          for (let j = i + 1; j < leaves.length; j++) {
            const a = leaves[i]!;
            const b = leaves[j]!;
            if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
            const x = Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left);
            const y = Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top);
            // 2px of tolerance: rounded line boxes touch without a reader ever seeing it.
            if (x > 2 && y > 2) out.push(`"${a.text.slice(0, 24)}" over "${b.text.slice(0, 24)}"`);
          }
        }
        return out.slice(0, 5);
      });
      expect(overlapping, `text overlapping on ${where}`).toEqual([]);

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
      expect(small, `tap targets < 44px on ${where}`).toEqual([]);

      // WIDE_BLEED: figures and galleries share the article's left edge. A wide image is allowed
      // to run past the text on the RIGHT, into the gutter, but never to start further left,
      // which would give the column two ragged edges. Media is grouped into rows first, because
      // the app showcase lays its phones out in a grid and only the first of each row is expected
      // to sit on that edge.
      const ragged = await page.evaluate(() => {
        const article = document.querySelector("article.case-body");
        if (!article) return [];
        const left = Math.round(article.getBoundingClientRect().left);
        const media = [
          ...article.querySelectorAll("figure"),
          ...[...article.querySelectorAll("ul")].filter((el) => el.querySelector("img")),
        ];
        const rows = new Map<number, number>();
        for (const el of media) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          if (Math.round(r.left) < left - 1)
            return [`${el.tagName.toLowerCase()} starts left of the text: ${Math.round(r.left)}`];
          const row = Math.round(r.top);
          rows.set(row, Math.min(rows.get(row) ?? Infinity, Math.round(r.left)));
        }
        return [...rows.entries()]
          .filter(([, rowLeft]) => Math.abs(rowLeft - left) > 1)
          .map(([top, rowLeft]) => `row at y=${top} starts at ${rowLeft} vs text ${left}`)
          .slice(0, 5);
      });
      expect(ragged, `media not left-aligned with text on ${where}`).toEqual([]);

      const shot = (theme: string) =>
        page.screenshot({
          path: `test-results/responsive/${path.replace(/\W+/g, "_") || "home"}-${width}-${theme}.png`,
          fullPage: true,
        });
      await shot("light");
      if (DARK_AT.has(width)) {
        await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
        await page.goto(path, { waitUntil: "load" });
        await page.waitForTimeout(400);
        await shot("dark");
      }
    });
  }
});
