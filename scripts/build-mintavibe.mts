/**
 * Builds the Mintavibe shipped screens and the case-study cover.
 *
 * It used to draw wireframes, low-fidelity sheets and two diagrams as well. Those sections are
 * gone from the case study — the wireframes are now Raheel's own files, converted by
 * scripts/build-supplied.mts — so all that is left here is converting the shipped screens and
 * composing the cover, which needs different geometry from the landscape one in build-assets
 * because it is made of portrait phones.
 *
 * Run with `npm run assets`.
 */
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp, { type OverlayOptions } from "sharp";

const SRC = join(process.cwd(), "Images", "mintavibe-screens");
const OUT = join(process.cwd(), "public", "work", "mintavibe");

/** The shipped screens, converted as-is: transparent phone renders, so nothing is cropped. */
const FINAL: Record<string, string> = {
  "screen-6.png": "final-1-splash.webp",
  "screen-5.png": "final-2-watch.webp",
  "screen-1.png": "final-3-play.webp",
  "screen-2.png": "final-4-celebrity.webp",
  "screen-3.png": "final-5-collectable.webp",
  "screen-4.png": "final-6-profile.webp",
};

async function buildCover(order: string[]) {
  const CW = 1600;
  const CH = 1000;
  const bg = Buffer.from(
    `<svg width="${CW}" height="${CH}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
           <stop offset="0%" stop-color="#0E2A23"/><stop offset="100%" stop-color="#061713"/>
         </linearGradient>
         <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
           <stop offset="0%" stop-color="#DDF23A" stop-opacity="0.4"/>
           <stop offset="100%" stop-color="#DDF23A" stop-opacity="0"/>
         </radialGradient>
       </defs>
       <rect width="${CW}" height="${CH}" fill="url(#g)"/>
       <ellipse cx="${CW * 0.5}" cy="${CH * 0.24}" rx="${CW * 0.46}" ry="${CH * 0.5}" fill="url(#glow)"/>
     </svg>`,
  );

  const layers: OverlayOptions[] = [];
  // Centre phone tallest, flanked by two smaller ones, all clear of the 16:10 card crop.
  const plan: { file: string; h: number; cx: number; cy: number }[] = [
    { file: order[1]!, h: 760, cx: 800, cy: 520 },
    { file: order[0]!, h: 640, cx: 470, cy: 540 },
    { file: order[2]!, h: 640, cx: 1130, cy: 540 },
  ];
  // Outer phones first so the centre one sits on top.
  for (const item of [plan[1]!, plan[2]!, plan[0]!]) {
    const buf = await sharp(join(SRC, item.file)).resize({ height: item.h }).png().toBuffer();
    const meta = await sharp(buf).metadata();
    layers.push({
      input: buf,
      left: Math.round(item.cx - (meta.width ?? 0) / 2),
      top: Math.round(item.cy - item.h / 2),
    });
  }
  const info = await sharp(bg)
    .composite(layers)
    .webp({ quality: 84, effort: 5 })
    .toFile(join(OUT, "cover.webp"));
  console.log(
    `★ mintavibe/cover.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
  );
}

mkdirSync(OUT, { recursive: true });

let made = 0;
if (existsSync(SRC)) {
  const available = new Set(readdirSync(SRC));
  for (const [from, to] of Object.entries(FINAL)) {
    if (!available.has(from)) {
      console.warn(`⚠ missing shipped screen: ${from}`);
      continue;
    }
    const info = await sharp(join(SRC, from))
      .webp({ quality: 88, effort: 5 })
      .toFile(join(OUT, to));
    console.log(
      `▣ mintavibe/${to}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
    );
    made++;
  }
  await buildCover(["screen-5.png", "screen-2.png", "screen-1.png"]);
} else {
  console.warn(`⚠ no shipped screens at ${SRC}`);
}

console.log(`\n✔ ${made} Mintavibe screen(s) built.`);
