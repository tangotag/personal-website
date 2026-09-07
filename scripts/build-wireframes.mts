/**
 * Draws low-fidelity wireframes for projects whose source files contain finished screens but no
 * process artefacts.
 *
 * These are RECONSTRUCTIONS of the structure visible in the shipped screens, not recovered
 * originals, and every case study that uses them says so in the caption. They exist to show the
 * layout decisions behind a screen, which a finished visual hides.
 *
 * Run with `npm run assets`, which calls this after the photographic pipeline.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = join(process.cwd(), "public", "work");
const W = 1400;
const H = 800;

type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  /** Filled blocks read as content, outlined blocks as containers. */
  fill?: boolean;
  /** Rounded pill, for controls. */
  pill?: boolean;
};

type Frame = { slug: string; name: string; title: string; note: string; boxes: Box[] };

const ink = "#3B4A45";
const line = "#8C9A94";
const soft = "#D9DEDA";
const paper = "#F2F2ED";

function svg(frame: Frame) {
  const parts: string[] = [];
  parts.push(`<rect width="${W}" height="${H}" fill="${paper}"/>`);
  parts.push(
    `<text x="40" y="52" font-family="monospace" font-size="19" letter-spacing="2" fill="${ink}">${esc(
      frame.title.toUpperCase(),
    )}</text>`,
  );
  parts.push(
    `<text x="40" y="80" font-family="monospace" font-size="15" fill="${line}">${esc(frame.note)}</text>`,
  );
  parts.push(`<line x1="40" y1="100" x2="${W - 40}" y2="100" stroke="${soft}" stroke-width="2"/>`);

  for (const b of frame.boxes) {
    const r = b.pill ? Math.min(b.h / 2, 22) : 8;
    parts.push(
      `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${r}" ry="${r}" fill="${
        b.fill ? soft : "none"
      }" stroke="${line}" stroke-width="2"/>`,
    );
    if (b.label) {
      const size = b.h < 40 ? 14 : 16;
      parts.push(
        `<text x="${b.x + b.w / 2}" y="${b.y + b.h / 2 + size / 3}" text-anchor="middle" font-family="monospace" font-size="${size}" fill="${ink}">${esc(
          b.label,
        )}</text>`,
      );
    }
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join("")}</svg>`,
  );
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Five seats across the felt, the shape both casino titles share. */
function seats(y: number, h: number, label: (i: number) => string, count = 5): Box[] {
  const gap = 24;
  const w = (W - 80 - gap * (count - 1)) / count;
  return Array.from({ length: count }, (_, i) => ({
    x: 40 + i * (w + gap),
    y,
    w,
    h,
    label: label(i),
  }));
}

const FRAMES: Frame[] = [
  {
    slug: "open-omaha",
    name: "wireframe-1-buy-in",
    title: "Open Omaha · 01 buy-in",
    note: "Empty seats invite a tap. Nothing else is reachable until a stake exists.",
    boxes: [
      { x: 480, y: 130, w: 440, h: 120, label: "dealer area (empty)" },
      ...seats(300, 150, (i) => `seat ${i + 1} · tap to buy in`),
      { x: 40, y: 500, w: 300, h: 56, label: "denomination rail", fill: true, pill: true },
      { x: 1050, y: 500, w: 310, h: 56, label: "auto buy-in / auto play", pill: true },
      { x: 40, y: 700, w: 1320, h: 48, label: "balance · table id · clock", fill: true },
    ],
  },
  {
    slug: "open-omaha",
    name: "wireframe-2-side-bets",
    title: "Open Omaha · 02 side bets",
    note: "Bonus grids sit left, out of the deal path, so an optional bet never blocks the hand.",
    boxes: [
      { x: 40, y: 130, w: 400, h: 220, label: "3 and 4 card bonus grid" },
      { x: 480, y: 130, w: 440, h: 120, label: "dealer area" },
      ...seats(400, 130, (i) => `seat ${i + 1} · ante + blind`),
      { x: 480, y: 580, w: 440, h: 56, label: "deal cards", fill: true, pill: true },
      { x: 40, y: 700, w: 1320, h: 48, label: "balance · table id · clock", fill: true },
    ],
  },
  {
    slug: "open-omaha",
    name: "wireframe-3-decision",
    title: "Open Omaha · 03 decision",
    note: "One decision at a time. The multiplier buttons appear only for the seat being asked.",
    boxes: [
      { x: 40, y: 130, w: 400, h: 200, label: "bonus results" },
      { x: 480, y: 130, w: 440, h: 120, label: "community cards" },
      ...seats(370, 160, (i) => (i === 1 ? "seat 2 · active" : `seat ${i + 1}`)),
      { x: 40, y: 580, w: 160, h: 56, label: "check", pill: true },
      { x: 1120, y: 580, w: 110, h: 56, label: "3x", fill: true, pill: true },
      { x: 1250, y: 580, w: 110, h: 56, label: "4x", fill: true, pill: true },
      { x: 40, y: 700, w: 1320, h: 48, label: "balance · table id · clock", fill: true },
    ],
  },
  {
    slug: "open-omaha",
    name: "wireframe-4-showdown",
    title: "Open Omaha · 04 showdown",
    note: "Every hand is named in words above its cards, so the result is readable without counting.",
    boxes: [
      { x: 40, y: 130, w: 340, h: 110, label: "dealer hand · named", fill: true },
      { x: 480, y: 130, w: 440, h: 120, label: "community cards" },
      { x: 1020, y: 130, w: 340, h: 110, label: "payout callout", fill: true },
      ...seats(
        330,
        90,
        (i) => ["pair", "full house", "two pair", "two pair", "full house"][i] ?? "",
      ),
      ...seats(440, 130, (i) => `seat ${i + 1} · cards`),
      { x: 1140, y: 610, w: 220, h: 56, label: "turbo", fill: true, pill: true },
      { x: 40, y: 700, w: 1320, h: 48, label: "balance · table id · clock", fill: true },
    ],
  },

  {
    slug: "texas-flip",
    name: "wireframe-1-ante",
    title: "Texas Flip · 01 ante",
    note: "Two hands per seat. The pair is drawn as one unit so nobody stakes half a seat by accident.",
    boxes: [
      { x: 560, y: 130, w: 280, h: 110, label: "dealer area" },
      ...seats(300, 190, (i) => `seat ${i + 1}`),
      ...seats(330, 60, () => "hand 1        hand 2"),
      { x: 40, y: 560, w: 300, h: 56, label: "denomination rail", fill: true, pill: true },
      { x: 1040, y: 560, w: 320, h: 56, label: "auto all / auto ante", pill: true },
      { x: 40, y: 700, w: 1320, h: 48, label: "balance · table id · clock", fill: true },
    ],
  },
  {
    slug: "texas-flip",
    name: "wireframe-2-bonus",
    title: "Texas Flip · 02 bonus bets",
    note: "Optional bets get their own pass, with auto buttons for players who always take them.",
    boxes: [
      { x: 560, y: 130, w: 280, h: 110, label: "dealer area" },
      ...seats(300, 190, (i) => `seat ${i + 1} · 3 and 4 card bonus`),
      { x: 620, y: 560, w: 180, h: 56, label: "auto 3 card", pill: true },
      { x: 820, y: 560, w: 180, h: 56, label: "auto 4 card", pill: true },
      { x: 1180, y: 560, w: 180, h: 56, label: "ok", fill: true, pill: true },
      { x: 40, y: 700, w: 1320, h: 48, label: "balance · table id · clock", fill: true },
    ],
  },
  {
    slug: "texas-flip",
    name: "wireframe-3-flip",
    title: "Texas Flip · 03 flip bet",
    note: "The title mechanic. A hint line states the price in the stake the player already made.",
    boxes: [
      { x: 560, y: 130, w: 280, h: 110, label: "dealer area" },
      ...seats(300, 190, (i) =>
        i % 2 === 1 ? `seat ${i + 1} · top cards outlined` : `seat ${i + 1}`,
      ),
      { x: 40, y: 560, w: 460, h: 44, label: "flip bet is equal to ante", fill: true },
      { x: 1180, y: 560, w: 180, h: 56, label: "ok", fill: true, pill: true },
      { x: 40, y: 700, w: 1320, h: 48, label: "balance · table id · clock", fill: true },
    ],
  },
  {
    slug: "texas-flip",
    name: "wireframe-4-hand-bets",
    title: "Texas Flip · 04 per-hand bets",
    note: "Each hand is priced on its own, so a strong hand is not dragged down by its partner.",
    boxes: [
      { x: 560, y: 130, w: 280, h: 110, label: "community cards" },
      ...seats(300, 190, (i) => `seat ${i + 1}`),
      ...seats(330, 60, () => "hand 1        hand 2"),
      { x: 1000, y: 560, w: 160, h: 56, label: "check", pill: true },
      { x: 1180, y: 560, w: 180, h: 56, label: "3x bet ante", fill: true, pill: true },
      { x: 40, y: 700, w: 1320, h: 48, label: "balance · table id · clock", fill: true },
    ],
  },
];

export async function buildWireframes() {
  let made = 0;
  for (const frame of FRAMES) {
    const dir = join(OUT, frame.slug);
    mkdirSync(dir, { recursive: true });
    const dest = join(dir, `${frame.name}.webp`);
    const info = await sharp(svg(frame)).webp({ quality: 88, effort: 5 }).toFile(dest);
    console.log(
      `▢ ${frame.slug}/${frame.name}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
    );
    made++;
  }
  return made;
}

if (process.argv[1]?.endsWith("build-wireframes.mts")) await buildWireframes();
