/**
 * Prepares the portrait for the two frames that hold it (home hero, /about) and for the
 * default social card.
 *
 * The current source is a rendered character portrait that carries its own room behind the
 * subject, so unlike the first supplied file it is used whole — there is no plain ground to key
 * out, and the bokeh and shelves are part of the picture. The only decision left is the crop:
 * both frames reserve 4:5 and the source is 3:4, so 80 rows come off, weighted to the bottom of
 * the sweater to leave the eyes on the upper third.
 *
 *   public/images/portrait.webp   1200×1500, the two frames
 *   public/images/og-default.jpg  1200×630 social card for every page without one of its own
 *
 * Run with `npm run assets`.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const SRC = join(process.cwd(), "Images", "RAQ portrait1.jpg");
const OUT = join(process.cwd(), "public", "images");

/** 4:5, the aspect both frames reserve. */
const W = 1200;
const H = 1500;

const OG_W = 1200;
const OG_H = 630;
/** The photo panel on the right of the social card; the copy gets the rest. */
const OG_PANEL = 470;

const INK = "#0E2A23";
const PAPER = "#F2F2ED";
const LIME = "#DDF23A";
const MUTED = "#9FB3AB";

/**
 * Crops the source to `aspect`. When height is the excess, two thirds of it comes off the bottom:
 * the subject sits high with the sweater running off the bottom edge, so an even crop would eat
 * headroom the composition needs and drop the eyes below the upper third. When width is the
 * excess it comes off evenly, the face being centred.
 */
function crop(width: number, height: number, aspect: number) {
  const wantH = Math.round(width / aspect);
  if (wantH <= height) {
    const top = Math.round((height - wantH) / 3);
    return { left: 0, top, width, height: wantH };
  }
  const wantW = Math.round(height * aspect);
  return { left: Math.round((width - wantW) / 2), top: 0, width: wantW, height };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const src = sharp(SRC);
  const { width = 0, height = 0 } = await src.metadata();
  console.log(`  source ${width}×${height}`);

  const frame = crop(width, height, W / H);
  console.log(
    `  frame  ${frame.width}×${frame.height} at y=${frame.top} (${height - frame.height - frame.top}px off the bottom)`,
  );
  const portrait = await sharp(SRC)
    .extract({ left: frame.left, top: frame.top, width: frame.width, height: frame.height })
    .resize(W, H)
    .webp({ quality: 86 })
    .toFile(join(OUT, "portrait.webp"));
  console.log(`  portrait.webp ${W}×${H} · ${(portrait.size / 1024).toFixed(0)}KB`);

  // Social card: a photo panel down the right edge, the name and role on the evergreen ground.
  const panel = crop(width, height, OG_PANEL / OG_H);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
  <rect width="${OG_W}" height="${OG_H}" fill="${INK}"/>
  <rect x="72" y="150" width="64" height="6" fill="${LIME}"/>
  <text x="72" y="250" font-family="Verdana, DejaVu Sans, sans-serif" font-size="58" font-weight="700" fill="${PAPER}">Raheel Ahmad</text>
  <text x="72" y="318" font-family="Verdana, DejaVu Sans, sans-serif" font-size="58" font-weight="700" fill="${PAPER}">Qureshi</text>
  <text x="72" y="386" font-family="Verdana, DejaVu Sans, sans-serif" font-size="25" fill="${LIME}">Senior Product Designer</text>
  <text x="72" y="434" font-family="Verdana, DejaVu Sans, sans-serif" font-size="22" fill="${MUTED}">POS &amp; kiosk · fintech · SaaS · games</text>
  <text x="72" y="528" font-family="Verdana, DejaVu Sans, sans-serif" font-size="21" fill="${MUTED}">raheelqureshi.com</text>
  <rect x="${OG_W - OG_PANEL - 6}" y="0" width="6" height="${OG_H}" fill="${LIME}"/>
</svg>`;

  const og = await sharp(Buffer.from(svg))
    .composite([
      {
        input: await sharp(SRC)
          .extract({ left: panel.left, top: panel.top, width: panel.width, height: panel.height })
          .resize(OG_PANEL, OG_H)
          .png()
          .toBuffer(),
        left: OG_W - OG_PANEL,
        top: 0,
      },
    ])
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
    .toFile(join(OUT, "og-default.jpg"));
  console.log(`  og-default.jpg ${OG_W}×${OG_H} · ${(og.size / 1024).toFixed(0)}KB`);
}

await main();
