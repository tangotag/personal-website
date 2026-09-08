/**
 * Prepares the portrait for the two frames that hold it (home hero, /about) and for the
 * default social card.
 *
 * The supplied file is a stylised illustration on a plain white studio ground. Dropped in as-is
 * it would put a bright white block inside a frame whose background is evergreen on the dark
 * theme, so the ground is removed and the subject is delivered on transparency — the frame's own
 * surface then shows through and the portrait reads correctly in both themes.
 *
 * Removal is a flood fill inward from the border rather than a global brightness threshold: the
 * face carries near-white highlights that a threshold would punch holes in, and those highlights
 * are not connected to the border.
 *
 *   public/images/portrait.webp   4:5 cutout on transparency, the two frames
 *   public/images/og-default.jpg  1200×630 social card for every page without one of its own
 *
 * Run with `npm run assets`.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const SRC = join(process.cwd(), "Images", "RAQ portrait.jpg");
const OUT = join(process.cwd(), "public", "images");

/** 4:5, the aspect both frames reserve. */
const W = 1200;
const H = 1500;

const OG_W = 1200;
const OG_H = 630;

const INK = "#0E2A23";
const PAPER = "#F2F2ED";
const LIME = "#DDF23A";

/** Near-white and near-neutral: the studio ground, not a highlight on the subject. */
const isGround = (r: number, g: number, b: number) =>
  r > 232 && g > 232 && b > 232 && Math.max(r, g, b) - Math.min(r, g, b) < 14;

/**
 * Marks every ground pixel reachable from the image border. Returns the subject mask
 * (255 = keep) as one byte per pixel.
 */
function subjectMask(px: Buffer, w: number, h: number, channels: number) {
  const mask = Buffer.alloc(w * h, 255);
  const seen = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;

  const push = (i: number) => {
    if (seen[i]) return;
    const o = i * channels;
    if (!isGround(px[o], px[o + 1], px[o + 2])) return;
    seen[i] = 1;
    mask[i] = 0;
    queue[tail++] = i;
  };

  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }

  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }
  return mask;
}

/** Shrinks the mask by one pixel so the white ground does not survive as a light fringe. */
function erode(mask: Buffer, w: number, h: number) {
  const out = Buffer.from(mask);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!mask[i]) continue;
      const edge =
        (x > 0 && !mask[i - 1]) ||
        (x < w - 1 && !mask[i + 1]) ||
        (y > 0 && !mask[i - w]) ||
        (y < h - 1 && !mask[i + w]);
      if (edge) out[i] = 0;
    }
  }
  return out;
}

async function cutout() {
  const src = sharp(SRC);
  const { width: w = 0, height: h = 0 } = await src.metadata();
  const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });

  // Two passes: one pixel of erosion still let the white ground survive as a light rim along
  // the hair, where the illustration's own anti-aliasing is already near-white.
  const mask = erode(erode(subjectMask(data, w, h, info.channels), w, h), w, h);
  // A one-pixel blur turns the hard mask edge into anti-aliasing instead of a staircase.
  // toColourspace + raw is load-bearing: without it sharp hands back three interleaved channels
  // for a one-channel input, and reading it as alpha garbles the mask.
  const alpha = await sharp(mask, { raw: { width: w, height: h, channels: 1 } })
    .blur(1)
    .toColourspace("b-w")
    .raw()
    .toBuffer();
  if (alpha.length !== w * h) throw new Error(`alpha is ${alpha.length} bytes, expected ${w * h}`);

  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const o = i * info.channels;
    rgba[i * 4] = data[o];
    rgba[i * 4 + 1] = data[o + 1];
    rgba[i * 4 + 2] = data[o + 2];
    rgba[i * 4 + 3] = alpha[i];
  }

  // Bounding box from the mask rather than sharp's trim(), which reads its reference from the
  // top-left pixel and cut 287 rows into the hair on this image.
  let top = h;
  let bottom = -1;
  let left = w;
  let right = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }
  const box = { left, top, width: right - left + 1, height: bottom - top + 1 };

  const buffer = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract(box)
    .png()
    .toBuffer();

  return { buffer, width: box.width, height: box.height };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const subject = await cutout();
  console.log(`  cutout ${subject.width}×${subject.height} from the 896×1200 source`);

  // Scale to the frame height less a little headroom, and sit the shoulders on the bottom edge:
  // the shirt is already cropped in the source, so a flush bottom reads as intentional framing.
  const scale = (H * 0.96) / subject.height;
  const sw = Math.round(subject.width * scale);
  const sh = Math.round(subject.height * scale);
  const portrait = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      {
        input: await sharp(subject.buffer).resize(sw, sh).png().toBuffer(),
        left: Math.round((W - sw) / 2),
        top: H - sh,
      },
    ])
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(join(OUT, "portrait.webp"));
  console.log(`  portrait.webp ${W}×${H} · ${(portrait.size / 1024).toFixed(0)}KB`);

  // Social card: the portrait filling the right edge, the name and role on the left.
  const cardH = OG_H;
  const cardW = Math.round((subject.width / subject.height) * cardH);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
  <rect width="${OG_W}" height="${OG_H}" fill="${INK}"/>
  <rect x="72" y="150" width="64" height="6" fill="${LIME}"/>
  <text x="72" y="250" font-family="Verdana, DejaVu Sans, sans-serif" font-size="62" font-weight="700" fill="${PAPER}">Raheel Ahmad</text>
  <text x="72" y="322" font-family="Verdana, DejaVu Sans, sans-serif" font-size="62" font-weight="700" fill="${PAPER}">Qureshi</text>
  <text x="72" y="392" font-family="Verdana, DejaVu Sans, sans-serif" font-size="25" fill="${LIME}">Senior Product Designer</text>
  <text x="72" y="440" font-family="Verdana, DejaVu Sans, sans-serif" font-size="22" fill="#9FB3AB">POS &amp; kiosk · fintech · SaaS · games</text>
  <text x="72" y="534" font-family="Verdana, DejaVu Sans, sans-serif" font-size="21" fill="#9FB3AB">raheelqureshi.com</text>
</svg>`;

  const og = await sharp(Buffer.from(svg))
    .composite([
      {
        input: await sharp(subject.buffer).resize(cardW, cardH).png().toBuffer(),
        left: OG_W - cardW - 56,
        top: OG_H - cardH,
      },
    ])
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
    .toFile(join(OUT, "og-default.jpg"));
  console.log(`  og-default.jpg ${OG_W}×${OG_H} · ${(og.size / 1024).toFixed(0)}KB`);
}

await main();
