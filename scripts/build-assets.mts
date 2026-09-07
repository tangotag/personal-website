/**
 * Converts the raw exports in Images/ into web-ready .webp under public/work/<slug>/.
 *
 * Images/ holds the raw design exports (large PNG/PDF, kept for archive); only the generated .webp
 * under public/ are served to visitors. Idempotent: re-running overwrites. Run with `npm run assets`.
 */
import { mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import sharp, { type OverlayOptions } from "sharp";

const ROOT = process.cwd();
const SRC = join(ROOT, "Images");
const OUT = join(ROOT, "public", "work");

/** Wide screenshots are capped at 2000px: the largest slot on the page is ~1100 CSS px. */
const MAX_WIDTH = 2000;
const QUALITY = 80;

type Job = {
  from: string;
  to: string;
  /** Exact output width. Omit to keep the source width, capped at MAX_WIDTH. */
  width?: number;
  /** Crop to this ratio (width / height) before resizing, e.g. 1.6 for 16:10 covers. */
  ratio?: number;
  /**
   * Slice a band out of a tall presentation board before anything else. Boards from Behance stack
   * their screens vertically with no reliable separator, so the bands are measured by eye against
   * a ruler preview rather than detected.
   */
  band?: { top: number; height: number };
  /** Trim a uniform border, i.e. the board background around a screen. */
  trim?: boolean;
};

const JOBS: Job[] = [
  // Compass POS — terminal, customer display and kitchen
  { from: "Compass POS (3).png", to: "compass-pos/pos-home-modules.webp" },
  { from: "Compass POS (6).png", to: "compass-pos/pos-menu-grid.webp" },
  { from: "Compass POS (4).png", to: "compass-pos/pos-required-modifiers.webp" },
  { from: "Compass POS (5).png", to: "compass-pos/pos-pizza-builder.webp" },
  { from: "Compass POS (7).png", to: "compass-pos/pos-payment-split.webp" },
  { from: "Compass POS (8).png", to: "compass-pos/pos-drive-through.webp" },
  { from: "Compass POS (9).png", to: "compass-pos/kds-board.webp" },
  { from: "Compass POS (1).png", to: "compass-pos/customer-display-tip.webp" },
  { from: "Compass POS (2).png", to: "compass-pos/pos-staff-pin.webp" },

  // Compass Kiosk, its own product: the self-order journey, in order
  { from: "kiosk (1).png", to: "compass-kiosk/01-welcome.webp" },
  { from: "kiosk (5).png", to: "compass-kiosk/02-dine-in-or-take-away.webp" },
  { from: "kiosk (11).png", to: "compass-kiosk/03-menu.webp" },
  { from: "kiosk (8).png", to: "compass-kiosk/04-category.webp" },
  { from: "kiosk (4).png", to: "compass-kiosk/05-pizza-configurator.webp" },
  { from: "kiosk (7).png", to: "compass-kiosk/06-burger-configurator.webp" },
  { from: "kiosk 2.png", to: "compass-kiosk/07-order-review.webp" },
  { from: "PAYMNET OPTIONS.png", to: "compass-kiosk/08-payment-methods.webp" },
  { from: "kiosk (3).png", to: "compass-kiosk/09-card-terminal.webp" },
  { from: "kiosk (9).png", to: "compass-kiosk/10-name.webp" },
  { from: "kiosk (10).png", to: "compass-kiosk/11-phone.webp" },
  { from: "kiosk (6).png", to: "compass-kiosk/12-receipt.webp" },

  // AML Watcher: section bands measured against a ruler preview of the 1920x7224 board.
  {
    from: "AML WATCHER.png",
    to: "aml-watcher/main-page.webp",
    trim: true,
    band: { top: 1500, height: 940 },
  },
  {
    from: "AML WATCHER.png",
    to: "aml-watcher/summary.webp",
    trim: true,
    band: { top: 2450, height: 810 },
  },
  {
    from: "AML WATCHER.png",
    to: "aml-watcher/linked-entities.webp",
    trim: true,
    band: { top: 3360, height: 840 },
  },
  {
    from: "AML WATCHER.png",
    to: "aml-watcher/sanction-details.webp",
    trim: true,
    band: { top: 4380, height: 835 },
  },
  {
    from: "AML WATCHER.png",
    to: "aml-watcher/verifications.webp",
    trim: true,
    band: { top: 5225, height: 475 },
  },
  {
    from: "AML WATCHER.png",
    to: "aml-watcher/sources.webp",
    trim: true,
    band: { top: 5705, height: 415 },
  },
  {
    from: "AML WATCHER.png",
    to: "aml-watcher/style-guide.webp",
    trim: true,
    band: { top: 6240, height: 984 },
  },

  // KOMPETE: nine screens on a 1446x7305 board, evenly spaced. The boundaries come from
  // autocorrelating row brightness, which found a 795.6px period at phase 51.
  {
    from: "Legacy Kompete .png",
    to: "kompete/lobby.webp",
    trim: true,
    band: { top: 78, height: 768 },
  },
  {
    from: "Legacy Kompete .png",
    to: "kompete/customizer.webp",
    trim: true,
    band: { top: 846, height: 796 },
  },
  {
    from: "Legacy Kompete .png",
    to: "kompete/face-morph.webp",
    trim: true,
    band: { top: 1642, height: 795 },
  },
  {
    from: "Legacy Kompete .png",
    to: "kompete/attributes.webp",
    trim: true,
    band: { top: 2437, height: 796 },
  },
  {
    from: "Legacy Kompete .png",
    to: "kompete/season-pass.webp",
    trim: true,
    band: { top: 3233, height: 796 },
  },
  {
    from: "Legacy Kompete .png",
    to: "kompete/currency.webp",
    trim: true,
    band: { top: 4029, height: 795 },
  },
  {
    from: "Legacy Kompete .png",
    to: "kompete/item-shop.webp",
    trim: true,
    band: { top: 4824, height: 796 },
  },
  {
    from: "Legacy Kompete .png",
    to: "kompete/career-stats.webp",
    trim: true,
    band: { top: 5620, height: 795 },
  },
  {
    from: "Legacy Kompete .png",
    to: "kompete/settings.webp",
    trim: true,
    band: { top: 6415, height: 796 },
  },
  // Open Omaha: pages rendered from the source PDF with scripts/pdf-pages.mts. Each page is a
  // letterboxed screen, so trim removes the white page margin around it.
  { from: "open-omaha/page-01.png", to: "open-omaha/buy-in.webp", trim: true },
  { from: "open-omaha/page-02.png", to: "open-omaha/side-bets.webp", trim: true },
  { from: "open-omaha/page-05.png", to: "open-omaha/chips-placed.webp", trim: true },
  { from: "open-omaha/page-06.png", to: "open-omaha/cards-dealt.webp", trim: true },
  { from: "open-omaha/page-07.png", to: "open-omaha/bonus-win.webp", trim: true },
  { from: "open-omaha/page-09.png", to: "open-omaha/bet-decision.webp", trim: true },
  { from: "open-omaha/page-14.png", to: "open-omaha/showdown.webp", trim: true },
  { from: "open-omaha/page-15.png", to: "open-omaha/payout.webp", trim: true },
  { from: "open-omaha/page-16.png", to: "open-omaha/settings.webp", trim: true },
  { from: "open-omaha/page-17.png", to: "open-omaha/coin-size.webp", trim: true },

  // Texas Flip, the sister title. Same rendering path.
  { from: "texas-flip/page-01.png", to: "texas-flip/ante.webp", trim: true },
  { from: "texas-flip/page-02.png", to: "texas-flip/bonus-bets.webp", trim: true },
  { from: "texas-flip/page-03.png", to: "texas-flip/flip-bet.webp", trim: true },
  { from: "texas-flip/page-04.png", to: "texas-flip/hand-bets.webp", trim: true },
  { from: "texas-flip/page-05.png", to: "texas-flip/community-cards.webp", trim: true },
];

/**
 * Listing and hero covers, composed rather than cropped.
 *
 * A raw screenshot makes a poor cover: crop it to the slot and the interface loses its edges, letterbox
 * it and it floats. Each cover is instead built here, two real screens laid on the site's evergreen
 * ground with a lime glow behind them, so the covers read as one family and the interface stays sharp.
 * `front` is the hero screen, `back` peeks out behind it.
 */
const COVER = { w: 1600, h: 1000 } as const; // 16:10, the same ratio as the card and hero slots

type Cover = { slug: string; front: string; back?: string };

const COVERS: Cover[] = [
  { slug: "compass-pos", front: "pos-home-modules.webp", back: "kds-board.webp" },
  { slug: "compass-kiosk", front: "01-welcome.webp", back: "05-pizza-configurator.webp" },
  { slug: "aml-watcher", front: "main-page.webp", back: "linked-entities.webp" },
  { slug: "kompete", front: "lobby.webp", back: "career-stats.webp" },
  { slug: "open-omaha", front: "showdown.webp", back: "cards-dealt.webp" },
  { slug: "texas-flip", front: "flip-bet.webp", back: "hand-bets.webp" },
];

/**
 * Scales an image to fit inside a box and rounds its corners. Fitting inside rather than forcing a
 * width is what lets a portrait app screen and a landscape POS screen share one cover layout.
 */
async function panel(file: string, maxW: number, maxH: number, radius: number) {
  const scaled = await sharp(file)
    .resize({ width: maxW, height: maxH, fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();
  const { width = maxW, height = maxH } = await sharp(scaled).metadata();
  const mask = Buffer.from(
    `<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
  );
  const rounded = await sharp(scaled)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
  return { buf: rounded, width, height };
}

async function buildCovers() {
  let made = 0;
  for (const cover of COVERS) {
    const dir = join(OUT, cover.slug);
    const frontPath = join(dir, cover.front);
    if (!existsSync(frontPath)) {
      console.warn(`⚠ cover source missing: ${cover.slug}/${cover.front}`);
      continue;
    }

    // Evergreen ground with a lime glow, matching src/styles/tokens.css.
    const bg = Buffer.from(
      `<svg width="${COVER.w}" height="${COVER.h}" xmlns="http://www.w3.org/2000/svg">
         <defs>
           <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
             <stop offset="0%" stop-color="#0E2A23"/>
             <stop offset="100%" stop-color="#061713"/>
           </linearGradient>
           <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
             <stop offset="0%" stop-color="#DDF23A" stop-opacity="0.42"/>
             <stop offset="100%" stop-color="#DDF23A" stop-opacity="0"/>
           </radialGradient>
         </defs>
         <rect width="${COVER.w}" height="${COVER.h}" fill="url(#g)"/>
         <ellipse cx="${COVER.w * 0.62}" cy="${COVER.h * 0.2}" rx="${COVER.w * 0.5}" ry="${COVER.h * 0.45}" fill="url(#glow)"/>
       </svg>`,
    );

    const layers: OverlayOptions[] = [];

    if (cover.back && existsSync(join(dir, cover.back))) {
      const back = await panel(join(dir, cover.back), 720, 470, 14);
      const left = COVER.w - back.width - 40;
      const top = 46;
      // Dimmed so it reads as depth rather than competing with the front screen.
      const dimmed = await sharp(back.buf)
        .composite([
          {
            input: Buffer.from(
              `<svg width="${back.width}" height="${back.height}"><rect width="100%" height="100%" fill="#061713" opacity="0.42"/></svg>`,
            ),
            blend: "atop",
          },
        ])
        .png()
        .toBuffer();
      layers.push({ input: dimmed, left, top });
    }

    const front = await panel(frontPath, 1120, 760, 18);
    const left = 86;
    const top = Math.round((COVER.h - front.height) / 2) + 40;

    // Soft drop shadow: the panel silhouette, blurred and darkened, sitting under the panel.
    const shadow = await sharp({
      create: { width: front.width, height: front.height, channels: 4, background: "#000000d9" },
    })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${front.width}" height="${front.height}"><rect width="${front.width}" height="${front.height}" rx="18" ry="18" fill="#fff"/></svg>`,
          ),
          blend: "dest-in",
        },
      ])
      .extend({ top: 40, bottom: 40, left: 40, right: 40, background: "#00000000" })
      .blur(26)
      .png()
      .toBuffer();

    layers.push({ input: shadow, left: left - 40, top: top - 40 + 18 });
    layers.push({ input: front.buf, left, top });

    const dest = join(dir, "cover.webp");
    const info = await sharp(bg).composite(layers).webp({ quality: 84, effort: 5 }).toFile(dest);
    console.log(
      `★ ${cover.slug}/cover.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
    );
    made++;
  }
  return made;
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`No Images/ directory at ${SRC}. Nothing to build.`);
    process.exit(2);
  }
  let built = 0;
  let missing = 0;

  for (const job of JOBS) {
    if (!existsSync(join(SRC, job.from))) {
      console.warn(`⚠ missing source: ${job.from}`);
      missing++;
      continue;
    }
    const dest = join(OUT, job.to);
    mkdirSync(dirname(dest), { recursive: true });
    let img = sharp(join(SRC, job.from));
    let meta = await img.metadata();

    if (job.band && meta.width && meta.height) {
      const top = Math.max(0, Math.min(job.band.top, meta.height - 1));
      const height = Math.min(job.band.height, meta.height - top);
      img = sharp(await img.extract({ left: 0, top, width: meta.width, height }).toBuffer());
      meta = await img.metadata();
    }

    if (job.trim) {
      // A threshold of 14 tolerates the faint texture on these boards without eating
      // into the screen itself.
      img = sharp(await img.trim({ threshold: 14 }).toBuffer());
      meta = await img.metadata();
    }

    if (job.ratio && meta.width && meta.height) {
      // Centre-crop to the target ratio so covers never letterbox.
      const wanted = Math.round(Math.min(meta.width, meta.height * job.ratio));
      const height = Math.round(wanted / job.ratio);
      img = img.extract({
        left: Math.round((meta.width - wanted) / 2),
        top: Math.round((meta.height - height) / 2),
        width: wanted,
        height,
      });
    }

    const target = job.width ?? (meta.width && meta.width > MAX_WIDTH ? MAX_WIDTH : undefined);
    if (target) img = img.resize({ width: target, withoutEnlargement: true });

    const info = await img.webp({ quality: QUALITY, effort: 5 }).toFile(dest);
    console.log(`→ ${job.to}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
    built++;
  }

  const covers = await buildCovers();

  console.log(
    `\n✔ ${built} asset(s) and ${covers} cover(s) built${missing ? `, ${missing} source(s) missing` : ""}.`,
  );
  if (missing) process.exit(1);
}

await main();
