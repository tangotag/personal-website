/**
 * Converts the raw exports in Images/ into web-ready .webp under public/work/<slug>/.
 *
 * Images/ holds the raw design exports (large PNG/PDF, kept for archive); only the generated .webp
 * under public/ are served to visitors. Idempotent: re-running overwrites. Run with `npm run assets`.
 */
import { mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import sharp from "sharp";

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
};

const JOBS: Job[] = [
  // Listing and OG cover. 1600x1000 is the 16:10 slot on the /work cards.
  { from: "kiosk (1).png", to: "compass-pos/cover.webp", width: 1600, ratio: 1.6 },

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

  // Compass kiosk — the self-order journey, in order
  { from: "kiosk (1).png", to: "compass-pos/kiosk-01-welcome.webp" },
  { from: "kiosk (5).png", to: "compass-pos/kiosk-02-dine-in-or-take-away.webp" },
  { from: "kiosk (11).png", to: "compass-pos/kiosk-03-menu.webp" },
  { from: "kiosk (8).png", to: "compass-pos/kiosk-04-category.webp" },
  { from: "kiosk (4).png", to: "compass-pos/kiosk-05-pizza-configurator.webp" },
  { from: "kiosk (7).png", to: "compass-pos/kiosk-06-burger-configurator.webp" },
  { from: "kiosk 2.png", to: "compass-pos/kiosk-07-order-review.webp" },
  { from: "PAYMNET OPTIONS.png", to: "compass-pos/kiosk-08-payment-methods.webp" },
  { from: "kiosk (3).png", to: "compass-pos/kiosk-09-card-terminal.webp" },
  { from: "kiosk (9).png", to: "compass-pos/kiosk-10-name.webp" },
  { from: "kiosk (10).png", to: "compass-pos/kiosk-11-phone.webp" },
  { from: "kiosk (6).png", to: "compass-pos/kiosk-12-receipt.webp" },
];

async function main() {
  if (!existsSync(SRC)) {
    console.error(`No Images/ directory at ${SRC}. Nothing to build.`);
    process.exit(2);
  }
  const available = new Set(readdirSync(SRC));
  let built = 0;
  let missing = 0;

  for (const job of JOBS) {
    if (!available.has(job.from)) {
      console.warn(`⚠ missing source: ${job.from}`);
      missing++;
      continue;
    }
    const dest = join(OUT, job.to);
    mkdirSync(dirname(dest), { recursive: true });
    let img = sharp(join(SRC, job.from));
    const meta = await img.metadata();

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

  console.log(`\n✔ ${built} asset(s) built${missing ? `, ${missing} source(s) missing` : ""}.`);
  if (missing) process.exit(1);
}

await main();
