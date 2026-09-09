/**
 * Converts supplied artwork to webp: the hand-drawn wireframes for the five case studies that
 * have them, and the mobile-app screens behind the Mobile App Design section.
 *
 * These are the designer's own files, so nothing is drawn or reconstructed here — the script only
 * renames them into the order the page tells its story in and re-encodes to webp. That is why it
 * replaced build-compass.mts and build-wireframes.mts, which drew stand-ins because no originals
 * had been supplied yet.
 *
 * Run with `npm run assets`.
 */
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp, { type OverlayOptions } from "sharp";

const IMAGES = join(process.cwd(), "Images");
const APPS = join(process.cwd(), "Mobile apps");
const WORK = join(process.cwd(), "public", "work");
/** Mobile App Designs is a work entry like any other, so its assets live with the rest. */
const APPS_OUT = join(WORK, "mobile-app-designs");

/** Source file → output name, in the order each case study walks through them. */
const WIREFRAMES: Record<string, [string, string][]> = {
  "compass-pos": [
    ["Compass POS wireframes (1).png", "wireframe-1-sign-in.webp"],
    ["Compass POS wireframes (5).png", "wireframe-2-home.webp"],
    ["Compass POS wireframes (3).png", "wireframe-3-payment.webp"],
    ["Compass POS wireframes (2).png", "wireframe-4-kitchen.webp"],
  ],
  "compass-kiosk": [
    ["KIOSK wireframes (1).png", "wireframe-1-menu.webp"],
    ["KIOSK wireframes (4).png", "wireframe-2-configurator.webp"],
    ["KIOSK wireframes (3).png", "wireframe-3-order.webp"],
    ["KIOSK wireframes (2).png", "wireframe-4-payment.webp"],
  ],
  "open-omaha": [
    ["Open omaha wireframe (1).png", "wireframe-1-buy-in.webp"],
    ["Open omaha wireframe (2).png", "wireframe-2-ante-blind.webp"],
    ["Open omaha wireframe (4).png", "wireframe-3-decision.webp"],
    ["Open omaha wireframe (3).png", "wireframe-4-showdown.webp"],
  ],
  "texas-flip": [
    ["Texas Flip wire frames (1).png", "wireframe-1-table.webp"],
    ["Texas Flip wire frames (2).png", "wireframe-2-ante-blind.webp"],
    ["Texas Flip wire frames (5).png", "wireframe-3-dealt.webp"],
    ["Texas Flip wire frames (3).png", "wireframe-4-turn.webp"],
    ["Texas Flip wire frames (4).png", "wireframe-5-bets.webp"],
  ],
  mintavibe: [
    ["Mintavibe wireframes (4).png", "wireframe-1-celebrity.webp"],
    ["Mintavibe wireframes (2).png", "wireframe-2-watch.webp"],
    ["Mintavibe wireframes (5).png", "wireframe-3-play.webp"],
    ["Mintavibe wireframes (1).png", "wireframe-4-collectables.webp"],
    ["Mintavibe wireframes (3).png", "wireframe-5-profile.webp"],
  ],
};

/** Mobile App Design: source file → output name, in the order each app's flow reads. */
const APP_SCREENS: Record<string, [string, string][]> = {
  cinema: [
    ["Cinema Mobile APP (2).png", "cinema-1-now-showing.webp"],
    ["Cinema Mobile APP (3).png", "cinema-2-seats.webp"],
    ["Cinema Mobile APP (1).png", "cinema-3-ticket.webp"],
  ],
  coffee: [
    ["Coffee shop App (2).png", "coffee-1-welcome.webp"],
    ["Coffee shop App (3).png", "coffee-2-order.webp"],
    ["Coffee shop App (4).png", "coffee-3-product.webp"],
    ["Coffee shop App (1).png", "coffee-4-checkout.webp"],
  ],
  furniture: [
    ["Furniture Selling App (1).png", "furniture-1-welcome.webp"],
    ["Furniture Selling App (2).png", "furniture-2-catalogue.webp"],
    ["Furniture Selling App (3).png", "furniture-3-product.webp"],
  ],
  "rent-a-car": [
    ["Rent A Car App (1).png", "rent-a-car-1-welcome.webp"],
    ["Rent A Car App (2).png", "rent-a-car-2-browse.webp"],
    ["Rent A Car App (3).png", "rent-a-car-3-details.webp"],
    ["Rent A Car App (4).png", "rent-a-car-4-payment.webp"],
  ],
};

/**
 * The card cover: one screen from each of the four apps, overlapping across the evergreen ground
 * with a lime glow — the same treatment build-assets.mts gives the case-study covers, so the entry
 * sits in the work grid without looking like a different kind of thing.
 */
const COVER_SCREENS = [
  "cinema-1-now-showing.webp",
  "coffee-1-welcome.webp",
  "furniture-3-product.webp",
  "rent-a-car-3-details.webp",
];

const COVER_W = 1600;
const COVER_H = 1000; // 16:10, the ratio every card slot reserves

/** A screen scaled to a height and given rounded corners, so it reads as a device not a rectangle. */
async function phone(file: string, height: number, radius: number) {
  const buf = await sharp(file).resize({ height }).png().toBuffer();
  const { width = 0, height: h = 0 } = await sharp(buf).metadata();
  const rounded = await sharp(buf)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${width}" height="${h}"><rect width="${width}" height="${h}" rx="${radius}" ry="${radius}" fill="#fff"/></svg>`,
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
  return { buf: rounded, width, height: h };
}

async function buildCover() {
  const bg = Buffer.from(
    `<svg width="${COVER_W}" height="${COVER_H}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="#0E2A23"/><stop offset="100%" stop-color="#061713"/>
         </linearGradient>
         <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
           <stop offset="0%" stop-color="#DDF23A" stop-opacity="0.38"/>
           <stop offset="100%" stop-color="#DDF23A" stop-opacity="0"/>
         </radialGradient>
       </defs>
       <rect width="${COVER_W}" height="${COVER_H}" fill="url(#g)"/>
       <ellipse cx="${COVER_W * 0.5}" cy="${COVER_H * 0.22}" rx="${COVER_W * 0.46}" ry="${COVER_H * 0.5}" fill="url(#glow)"/>
     </svg>`,
  );

  // Four phones stepped across the frame, the outer pair shorter so the eye lands in the middle.
  const plan = COVER_SCREENS.map((file, i) => ({
    file,
    h: i === 0 || i === 3 ? 600 : 690,
    cx: 340 + i * 307,
    cy: 520,
  }));

  const layers: OverlayOptions[] = [];
  for (const item of plan) {
    const p = await phone(join(APPS_OUT, item.file), item.h, 24);
    layers.push({
      input: p.buf,
      left: Math.round(item.cx - p.width / 2),
      top: Math.round(item.cy - p.height / 2),
    });
  }

  const info = await sharp(bg)
    .composite(layers)
    .webp({ quality: 84, effort: 5 })
    .toFile(join(APPS_OUT, "cover.webp"));
  console.log(
    `★ mobile-app-designs/cover.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
  );
}

let made = 0;
let missing = 0;

async function convert(from: string, to: string, label: string, maxWidth?: number) {
  if (!existsSync(from)) {
    console.warn(`⚠ missing source: ${from}`);
    missing++;
    return;
  }
  const pipeline = sharp(from);
  if (maxWidth) pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  const info = await pipeline.webp({ quality: 88, effort: 5 }).toFile(to);
  console.log(`▣ ${label}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
  made++;
}

for (const [slug, files] of Object.entries(WIREFRAMES)) {
  const out = join(WORK, slug);
  mkdirSync(out, { recursive: true });
  for (const [from, to] of files) {
    await convert(join(IMAGES, from), join(out, to), `${slug}/${to}`, 1600);
  }
}

mkdirSync(APPS_OUT, { recursive: true });
for (const files of Object.values(APP_SCREENS)) {
  for (const [from, to] of files) {
    await convert(join(APPS, from), join(APPS_OUT, to), `mobile-app-designs/${to}`);
  }
}

await buildCover();

console.log(`\n✔ ${made} supplied asset(s) converted${missing ? `, ${missing} missing` : ""}.`);
if (missing) process.exitCode = 1;
