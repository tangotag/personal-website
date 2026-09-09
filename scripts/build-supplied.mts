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
import sharp from "sharp";

const IMAGES = join(process.cwd(), "Images");
const APPS = join(process.cwd(), "Mobile apps");
const WORK = join(process.cwd(), "public", "work");
const APPS_OUT = join(process.cwd(), "public", "mobile-apps");

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
    await convert(join(APPS, from), join(APPS_OUT, to), `mobile-apps/${to}`);
  }
}

console.log(`\n✔ ${made} supplied asset(s) converted${missing ? `, ${missing} missing` : ""}.`);
if (missing) process.exitCode = 1;
