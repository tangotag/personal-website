/**
 * DOM-level design audit. Loads every route in both themes in a real browser and inspects the
 * live DOM rather than the source, so it catches what actually renders.
 *
 * Checks per route × theme:
 *   - contrast: real ratio for every visible text node against its composited background
 *     (alpha-blended up the ancestor chain), against WCAG AA thresholds
 *   - accent contract: the lime `--accent` must never end up as a foreground colour on the light
 *     theme, where it measures ~1.1:1 (see src/styles/tokens.css)
 *   - em-dashes in rendered copy (taste-skill hard ban)
 *   - target size: WCAG 2.2 SC 2.5.8, including the inline-text and spacing exceptions
 *   - accessible names on every control
 *   - a visible focus ring
 *
 * Usage: npm run audit:dom            (expects a server on http://localhost:3000)
 *        npm run audit:dom -- http://localhost:3100
 */
import { chromium } from "@playwright/test";

const BASE = process.argv[2] ?? process.env.AUDIT_URL ?? "http://localhost:3000";
const ROUTES = ["/", "/work", "/work/compass-pos", "/services", "/about", "/contact"];
const THEMES = ["light", "dark"] as const;

type Finding = Record<string, unknown>;
type Report = {
  tokens: Record<string, string>;
  contrast: Finding[];
  limeForeground: Finding[];
  emDash: Finding[];
  smallTargets: Finding[];
  namelessControls: Finding[];
};

/** Runs inside the page. Kept as one self-contained function so it can be serialized. */
function audit(): Report {
  const out: Report = {
    tokens: {},
    contrast: [],
    limeForeground: [],
    emDash: [],
    smallTargets: [],
    namelessControls: [],
  };
  const rootStyle = getComputedStyle(document.documentElement);
  for (const name of [
    "--bg",
    "--fg",
    "--fg-muted",
    "--fg-faint",
    "--accent",
    "--accent-strong",
    "--accent-fg",
    "--focus",
  ])
    out.tokens[name] = rootStyle.getPropertyValue(name).trim();
  out.tokens.theme = document.documentElement.getAttribute("data-theme") ?? "";

  type Rgba = { r: number; g: number; b: number; a: number };
  const parse = (c: string): Rgba | null => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1]
      .split(/[ ,/]+/)
      .filter(Boolean)
      .map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg: Rgba, bg: Rgba): Rgba => ({
    r: fg.a * fg.r + (1 - fg.a) * bg.r,
    g: fg.a * fg.g + (1 - fg.a) * bg.g,
    b: fg.a * fg.b + (1 - fg.a) * bg.b,
    a: 1,
  });
  const lum = ({ r, g, b }: Rgba) => {
    const f = (v: number) => {
      const x = v / 255;
      return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a: Rgba, b: Rgba) => {
    const [hi, lo] = [lum(a), lum(b)].sort((m, n) => n - m);
    return (hi + 0.05) / (lo + 0.05);
  };
  /** Composites every translucent background up the ancestor chain onto the body colour. */
  const bgOf = (el: Element): Rgba => {
    let acc: Rgba | null = null;
    let node: Element | null = el;
    while (node) {
      const c = parse(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0) {
        acc = acc ? over(acc, c) : c;
        if (acc.a >= 0.999) return acc;
      }
      node = node.parentElement;
    }
    const body = parse(getComputedStyle(document.body).backgroundColor) ?? {
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    };
    return acc ? over(acc, body) : body;
  };
  const visible = (el: Element) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const label = (el: Element) => {
    const cls =
      typeof el.className === "string"
        ? el.className.trim().split(/\s+/).slice(0, 2).join(".")
        : "";
    return el.tagName.toLowerCase() + (cls ? "." + cls : "");
  };

  const probe = document.createElement("div");
  probe.style.color = out.tokens["--accent"];
  document.body.appendChild(probe);
  const accent = parse(getComputedStyle(probe).color);
  probe.remove();

  const CONTROLS = "a[href], button, input, select, textarea, [role=button], summary";

  for (const el of document.querySelectorAll("body *")) {
    if (!visible(el)) continue;
    const style = getComputedStyle(el);
    const text = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent?.trim() ?? "")
      .join(" ")
      .trim();

    if (text) {
      if (text.includes("—")) out.emDash.push({ el: label(el), text: text.slice(0, 90) });
      const fg = parse(style.color);
      const bg = bgOf(el);
      if (fg) {
        const eff = fg.a < 1 ? over(fg, bg) : fg;
        const size = parseFloat(style.fontSize);
        const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
        const need = large ? 3 : 4.5;
        const r = ratio(eff, bg);
        if (r < need)
          out.contrast.push({
            el: label(el),
            text: text.slice(0, 60),
            ratio: +r.toFixed(2),
            need,
            size,
          });
        if (
          out.tokens.theme !== "dark" &&
          accent &&
          Math.abs(eff.r - accent.r) < 6 &&
          Math.abs(eff.g - accent.g) < 6 &&
          Math.abs(eff.b - accent.b) < 6
        )
          out.limeForeground.push({ el: label(el), text: text.slice(0, 50), ratio: +r.toFixed(2) });
      }
    }

    if (el.matches(CONTROLS)) {
      const r = el.getBoundingClientRect();
      const offscreen = el.matches(".sr-only") || !!el.closest(".sr-only");
      // Inline links sitting inside a run of text are exempt from SC 2.5.8.
      const inlineInText =
        style.display.includes("inline") &&
        el.matches("a[href]") &&
        !!el.parentElement &&
        [...el.parentElement.childNodes].some(
          (n) => n.nodeType === 3 && (n.textContent?.trim().length ?? 0) > 0,
        );
      if (!offscreen && !inlineInText && (r.width < 24 || r.height < 24)) {
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Spacing exception: a 24px circle centred on the target may not touch another target.
        const crowded = [...document.querySelectorAll(CONTROLS)].some((other) => {
          if (other === el) return false;
          const q = other.getBoundingClientRect();
          if (q.width === 0 || q.height === 0) return false;
          const dx = Math.max(q.left - cx, 0, cx - q.right);
          const dy = Math.max(q.top - cy, 0, cy - q.bottom);
          return Math.hypot(dx, dy) < 12;
        });
        if (crowded)
          out.smallTargets.push({
            el: label(el),
            w: Math.round(r.width),
            h: Math.round(r.height),
            text: (el.textContent ?? "").trim().slice(0, 30),
          });
      }
      const name = (
        el.getAttribute("aria-label") ||
        el.textContent ||
        el.getAttribute("title") ||
        ""
      ).trim();
      if (!name && !el.matches("input, select, textarea"))
        out.namelessControls.push({ el: label(el), html: el.outerHTML.slice(0, 90) });
    }
  }
  return out;
}

const browser = await chromium.launch();
let problems = 0;
try {
  for (const theme of THEMES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 960 } });
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem("theme", t as string);
      } catch {
        /* private mode */
      }
    }, theme);
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1200);
      // Reveal scroll-animated blocks so their content is measurable.
      await page.evaluate(() =>
        document
          .querySelectorAll("[data-reveal]")
          .forEach((el) => el.setAttribute("data-inview", "")),
      );
      await page.waitForTimeout(300);
      const r = await page.evaluate(audit);
      const focus = await page.evaluate(() => {
        const el = document.querySelector<HTMLElement>("main a[href], main button");
        if (!el) return null;
        el.focus();
        const s = getComputedStyle(el);
        return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`;
      });

      const groups = {
        contrast: r.contrast,
        limeForeground: r.limeForeground,
        emDash: r.emDash,
        smallTargets: r.smallTargets,
        namelessControls: r.namelessControls,
      };
      const bad = Object.values(groups).reduce((n, list) => n + list.length, 0);
      problems += bad;
      console.log(
        `\n== ${theme} ${route} ==  bg=${r.tokens["--bg"]}  accent-strong=${r.tokens["--accent-strong"]}`,
      );
      console.log(`   focus ring: ${focus ?? "n/a"}`);
      if (!bad) console.log("   ✔ contrast · accent contract · em-dashes · target size · names");
      for (const [name, list] of Object.entries(groups))
        for (const item of list.slice(0, 8)) console.log(`   ✖ ${name}: ${JSON.stringify(item)}`);
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log(`\n${problems === 0 ? "✔ DOM audit clean" : `✖ ${problems} DOM issue(s)`}`);
process.exit(problems === 0 ? 0 : 1);
