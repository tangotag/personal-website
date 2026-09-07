/**
 * Draws the Mintavibe case-study visuals.
 *
 * The source material for this project is a Behance presentation board. Slicing it gave images
 * that carried their own section headings, so every figure repeated the heading above it and the
 * page read like a screenshot of a slide deck. These are drawn instead: phone wireframes, phone
 * mockups in the product's own palette, and two diagrams.
 *
 * The wireframes and diagrams are RECONSTRUCTIONS of structure described by the source board, not
 * recovered originals, and the captions in the case study say so.
 *
 * Run with `npm run assets`.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = join(process.cwd(), "public", "work", "mintavibe");
const W = 1400;
const H = 875; // 16:10, the gallery and figure slot

// Site chrome for the wireframes, product palette for the mockups.
const PAPER = "#F2F2ED";
const INK = "#3B4A45";
const LINE = "#8C9A94";
const SOFT = "#D9DEDA";

const NIGHT = "#141414";
const CARD = "#1F1F1F";
const GOLD = "#E8B33C";
const VIOLET = "#7C4DEF";
const MUTED = "#8A8A85";

type Block = {
  /** Position inside the phone screen, in screen coordinates. */
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  fill?: string;
  stroke?: string;
  radius?: number;
  text?: string;
  size?: number;
  color?: string;
  align?: "start" | "middle";
};

type Sheet = {
  name: string;
  title: string;
  note: string;
  mode: "wire" | "mock";
  blocks: Block[];
  /** Annotation lines printed to the right of the phone. */
  notes: string[];
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Phone geometry on the 1400x875 canvas: body, then the screen it contains. */
const PHONE = { x: 90, y: 96, w: 348, h: 700, r: 44 };
const SCREEN = { x: PHONE.x + 12, y: PHONE.y + 12, w: PHONE.w - 24, h: PHONE.h - 24 };

function render(sheet: Sheet) {
  const wire = sheet.mode === "wire";
  const bg = wire ? PAPER : "#0E2A23";
  const bodyFill = wire ? "#FFFFFF" : "#0A0A0A";
  const bodyStroke = wire ? LINE : "#2A2A2A";
  const screenFill = wire ? PAPER : NIGHT;
  const titleColor = wire ? INK : "#F1F5EE";
  const noteColor = wire ? LINE : "#9DB3AA";

  // The text column starts here and runs to the right margin, so the sheet reads as two columns
  // rather than a phone with a caption floating beside it.
  const COL = 560;
  const RIGHT = W - 70;

  const p: string[] = [];
  p.push(`<rect width="${W}" height="${H}" fill="${bg}"/>`);
  p.push(
    `<text x="${COL}" y="150" font-family="monospace" font-size="21" letter-spacing="2" fill="${titleColor}">${esc(sheet.title.toUpperCase())}</text>`,
  );
  p.push(
    `<text x="${COL}" y="182" font-family="monospace" font-size="15" fill="${noteColor}">${esc(sheet.note)}</text>`,
  );
  p.push(
    `<line x1="${COL}" y1="212" x2="${RIGHT}" y2="212" stroke="${wire ? SOFT : "#1D4438"}" stroke-width="2"/>`,
  );

  // Phone body, then a clipped screen.
  p.push(
    `<rect x="${PHONE.x}" y="${PHONE.y}" width="${PHONE.w}" height="${PHONE.h}" rx="${PHONE.r}" ry="${PHONE.r}" fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="3"/>`,
  );
  p.push(
    `<clipPath id="scr"><rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.w}" height="${SCREEN.h}" rx="${PHONE.r - 12}" ry="${PHONE.r - 12}"/></clipPath>`,
  );
  p.push(`<g clip-path="url(#scr)">`);
  p.push(
    `<rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.w}" height="${SCREEN.h}" fill="${screenFill}"/>`,
  );
  for (const b of sheet.blocks) {
    const x = SCREEN.x + b.x;
    const y = SCREEN.y + b.y;
    const r = b.radius ?? 8;
    p.push(
      `<rect x="${x}" y="${y}" width="${b.w}" height="${b.h}" rx="${r}" ry="${r}" fill="${b.fill ?? (wire ? SOFT : CARD)}" stroke="${b.stroke ?? (wire ? LINE : "none")}" stroke-width="${b.stroke || wire ? 1.5 : 0}"/>`,
    );
    const label = b.text ?? b.label;
    if (label) {
      const size = b.size ?? 13;
      const middle = (b.align ?? "middle") === "middle";
      p.push(
        `<text x="${middle ? x + b.w / 2 : x + 12}" y="${y + b.h / 2 + size / 3}" ${middle ? 'text-anchor="middle"' : ""} font-family="monospace" font-size="${size}" fill="${b.color ?? (wire ? INK : "#EDEDE8")}">${esc(label)}</text>`,
      );
    }
  }
  p.push(`</g>`);

  // Notch, so the phone reads as a phone rather than a rounded rectangle.
  p.push(
    `<rect x="${PHONE.x + PHONE.w / 2 - 52}" y="${PHONE.y + 12}" width="104" height="22" rx="11" ry="11" fill="${bodyStroke}"/>`,
  );

  // Annotations, numbered down the text column.
  let ny = 268;
  for (const [i, line] of sheet.notes.entries()) {
    p.push(
      `<circle cx="${COL + 14}" cy="${ny - 5}" r="14" fill="${wire ? SOFT : "#173A31"}" stroke="${wire ? LINE : "#2B5A4B"}" stroke-width="1.5"/>`,
    );
    p.push(
      `<text x="${COL + 14}" y="${ny}" text-anchor="middle" font-family="monospace" font-size="13" fill="${titleColor}">${i + 1}</text>`,
    );
    p.push(
      `<text x="${COL + 44}" y="${ny}" font-family="monospace" font-size="16" fill="${noteColor}">${esc(line)}</text>`,
    );
    ny += 44;
  }

  // Foot of the text column: the palette on a mockup, the layout rules on a wireframe. Without it
  // the lower right of the sheet is empty and the composition tips to one side.
  const footY = 640;
  p.push(
    `<text x="${COL}" y="${footY}" font-family="monospace" font-size="13" letter-spacing="2" fill="${wire ? LINE : "#6F8A80"}">${wire ? "LAYOUT RULES" : "PALETTE"}</text>`,
  );
  if (wire) {
    const rules = ["Balance: fixed, top left", "Targets: 48dp minimum", "One promise per screen"];
    let ry = footY + 34;
    for (const rule of rules) {
      p.push(`<rect x="${COL}" y="${ry - 12}" width="10" height="10" fill="${LINE}"/>`);
      p.push(
        `<text x="${COL + 24}" y="${ry}" font-family="monospace" font-size="15" fill="${INK}">${esc(rule)}</text>`,
      );
      ry += 32;
    }
  } else {
    const swatches: [string, string][] = [
      [NIGHT, "#141414"],
      [CARD, "#1F1F1F"],
      [GOLD, "#E8B33C"],
      [VIOLET, "#7C4DEF"],
    ];
    for (const [i, [fill, hex]] of swatches.entries()) {
      const sx = COL + i * 190;
      p.push(
        `<rect x="${sx}" y="${footY + 20}" width="72" height="72" rx="12" ry="12" fill="${fill}" stroke="#2B5A4B" stroke-width="1.5"/>`,
      );
      p.push(
        `<text x="${sx}" y="${footY + 118}" font-family="monospace" font-size="13" fill="#9DB3AA">${esc(hex)}</text>`,
      );
    }
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${p.join("")}</svg>`,
  );
}

const bar = (y: number, extra: Partial<Block> = {}): Block => ({
  x: 20,
  y,
  w: SCREEN.w - 40,
  h: 16,
  radius: 8,
  ...extra,
});

const SHEETS: Sheet[] = [
  {
    name: "wireframe-1-onboarding",
    title: "Mintavibe · 01 onboarding",
    note: "Three screens state the deal before asking for an account.",
    mode: "wire",
    blocks: [
      { x: 90, y: 60, w: 144, h: 144, radius: 72, label: "art" },
      bar(240, { w: 220, x: 52, h: 22 }),
      bar(276, { w: 260, x: 32 }),
      bar(300, { w: 200, x: 62 }),
      { x: 100, y: 350, w: 124, h: 12, radius: 6, label: "" },
      { x: 32, y: 560, w: SCREEN.w - 64, h: 52, radius: 26, label: "Continue" },
      { x: 110, y: 630, w: 104, h: 14, radius: 7, label: "Skip" },
    ],
    notes: [
      "Watch, play, redeem. One promise per screen.",
      "No account is requested until the third screen.",
      "Skip stays available, because a forced tour",
      "is the fastest way to lose a rewards user.",
    ],
  },
  {
    name: "wireframe-2-home",
    title: "Mintavibe · 02 home and balance",
    note: "The coin balance takes a fixed position it never leaves.",
    mode: "wire",
    blocks: [
      { x: 20, y: 24, w: 130, h: 34, radius: 17, label: "balance" },
      { x: SCREEN.w - 74, y: 24, w: 54, h: 34, radius: 17, label: "" },
      { x: 20, y: 80, w: SCREEN.w - 40, h: 130, label: "featured game" },
      bar(230, { w: 130, x: 20, h: 14 }),
      { x: 20, y: 256, w: 140, h: 100, label: "play" },
      { x: 180, y: 256, w: 140, h: 100, label: "watch" },
      { x: 20, y: 372, w: 140, h: 100, label: "shop" },
      { x: 180, y: 372, w: 140, h: 100, label: "refer" },
      { x: 20, y: 500, w: SCREEN.w - 40, h: 92, label: "earn history" },
      { x: 20, y: SCREEN.h - 76, w: SCREEN.w - 40, h: 56, radius: 16, label: "tab bar" },
    ],
    notes: [
      "Four ways to earn, given equal weight.",
      "None of them is a tab, so none outranks another.",
      "Balance sits top left on every screen,",
      "which is what lets it be checked without navigating.",
    ],
  },
  {
    name: "wireframe-3-earn",
    title: "Mintavibe · 03 earning",
    note: "The reward is stated before the activity starts, not after.",
    mode: "wire",
    blocks: [
      { x: 20, y: 24, w: 130, h: 34, radius: 17, label: "balance" },
      { x: 20, y: 80, w: SCREEN.w - 40, h: 170, label: "content" },
      bar(270, { w: 210, x: 20, h: 18 }),
      { x: 20, y: 306, w: 150, h: 44, radius: 22, label: "+50 coins" },
      bar(374, { w: SCREEN.w - 40, h: 12 }),
      bar(396, { w: 240, h: 12 }),
      { x: 20, y: 440, w: SCREEN.w - 40, h: 96, label: "you may also like" },
      { x: 32, y: 580, w: SCREEN.w - 64, h: 52, radius: 26, label: "Claim" },
    ],
    notes: [
      "The amount is shown before the video plays.",
      "Claim is a deliberate tap, not an automatic credit,",
      "so the coin feels earned rather than granted.",
      "Related content follows the claim, not the play.",
    ],
  },
  {
    name: "wireframe-4-redeem",
    title: "Mintavibe · 04 redeeming",
    note: "Every voucher shows its cost against the balance held.",
    mode: "wire",
    blocks: [
      { x: 20, y: 24, w: 130, h: 34, radius: 17, label: "balance" },
      { x: 20, y: 80, w: SCREEN.w - 40, h: 40, radius: 20, label: "search" },
      { x: 20, y: 140, w: 96, h: 30, radius: 15, label: "all" },
      { x: 126, y: 140, w: 96, h: 30, radius: 15, label: "food" },
      { x: 232, y: 140, w: 88, h: 30, radius: 15, label: "tech" },
      { x: 20, y: 192, w: 145, h: 150, label: "voucher" },
      { x: 175, y: 192, w: 145, h: 150, label: "voucher" },
      { x: 20, y: 356, w: 145, h: 150, label: "voucher" },
      { x: 175, y: 356, w: 145, h: 150, label: "voucher" },
      { x: 20, y: SCREEN.h - 76, w: SCREEN.w - 40, h: 56, radius: 16, label: "tab bar" },
    ],
    notes: [
      "Cost sits on the card, next to the brand.",
      "An unaffordable voucher is shown, not hidden,",
      "with the shortfall named, because a visible goal",
      "is the reason to come back tomorrow.",
    ],
  },

  {
    name: "mockup-1-home",
    title: "Mintavibe · home",
    note: "Gold is the only colour that means value.",
    mode: "mock",
    blocks: [
      {
        x: 20,
        y: 26,
        w: 150,
        h: 38,
        radius: 19,
        fill: "#241E10",
        text: "1,240 coins",
        color: GOLD,
        size: 14,
      },
      { x: SCREEN.w - 66, y: 26, w: 46, h: 38, radius: 19, fill: CARD },
      {
        x: 20,
        y: 84,
        w: SCREEN.w - 40,
        h: 140,
        radius: 16,
        fill: "#20180B",
        text: "Play & Win Cricket",
        color: GOLD,
        size: 16,
      },
      {
        x: 20,
        y: 244,
        w: 120,
        h: 14,
        radius: 7,
        fill: "#2A2A2A",
        text: "Earn today",
        color: MUTED,
        size: 12,
      },
      { x: 20, y: 272, w: 140, h: 104, radius: 14, fill: CARD, text: "Play", color: "#EDEDE8" },
      { x: 180, y: 272, w: 140, h: 104, radius: 14, fill: CARD, text: "Watch", color: "#EDEDE8" },
      { x: 20, y: 388, w: 140, h: 104, radius: 14, fill: CARD, text: "Shop", color: "#EDEDE8" },
      {
        x: 180,
        y: 388,
        w: 140,
        h: 104,
        radius: 14,
        fill: "#241B3D",
        text: "Refer",
        color: "#C9B6FF",
      },
      {
        x: 20,
        y: 512,
        w: SCREEN.w - 40,
        h: 76,
        radius: 14,
        fill: CARD,
        text: "Recent: +50, +20, +120",
        color: MUTED,
        size: 12,
      },
      {
        x: 20,
        y: SCREEN.h - 78,
        w: SCREEN.w - 40,
        h: 58,
        radius: 18,
        fill: CARD,
        text: "home   earn   shop   me",
        color: MUTED,
        size: 12,
      },
    ],
    notes: [
      "Near-black ground, one gold, one violet.",
      "Gold marks the balance and anything earned.",
      "Violet is reserved for social features,",
      "so a colour never means two things.",
    ],
  },
  {
    name: "mockup-2-wallet",
    title: "Mintavibe · wallet",
    note: "Earning and spending share one ledger.",
    mode: "mock",
    blocks: [
      {
        x: 20,
        y: 26,
        w: SCREEN.w - 40,
        h: 120,
        radius: 18,
        fill: "#241E10",
        text: "1,240",
        color: GOLD,
        size: 34,
      },
      {
        x: 20,
        y: 164,
        w: 145,
        h: 46,
        radius: 23,
        fill: GOLD,
        text: "Earn more",
        color: "#141414",
        size: 13,
      },
      {
        x: 175,
        y: 164,
        w: 145,
        h: 46,
        radius: 23,
        fill: CARD,
        text: "Redeem",
        color: "#EDEDE8",
        size: 13,
      },
      {
        x: 20,
        y: 234,
        w: 130,
        h: 14,
        radius: 7,
        fill: "#2A2A2A",
        text: "History",
        color: MUTED,
        size: 12,
      },
      {
        x: 20,
        y: 264,
        w: SCREEN.w - 40,
        h: 56,
        radius: 12,
        fill: CARD,
        text: "Watched a video      +50",
        color: "#EDEDE8",
        size: 12,
      },
      {
        x: 20,
        y: 330,
        w: SCREEN.w - 40,
        h: 56,
        radius: 12,
        fill: CARD,
        text: "Cricket challenge   +120",
        color: "#EDEDE8",
        size: 12,
      },
      {
        x: 20,
        y: 396,
        w: SCREEN.w - 40,
        h: 56,
        radius: 12,
        fill: CARD,
        text: "Coffee voucher      -400",
        color: MUTED,
        size: 12,
      },
      {
        x: 20,
        y: 462,
        w: SCREEN.w - 40,
        h: 56,
        radius: 12,
        fill: CARD,
        text: "Referral bonus      +150",
        color: "#EDEDE8",
        size: 12,
      },
      {
        x: 20,
        y: SCREEN.h - 78,
        w: SCREEN.w - 40,
        h: 58,
        radius: 18,
        fill: CARD,
        text: "home   earn   shop   me",
        color: MUTED,
        size: 12,
      },
    ],
    notes: [
      "One list holds credits and debits together.",
      "A separate spend history would let the balance",
      "read as a score rather than as money.",
      "Signs and colour agree, and both are shown.",
    ],
  },
  {
    name: "mockup-3-redeem",
    title: "Mintavibe · redeem",
    note: "Cost is stated against the balance held.",
    mode: "mock",
    blocks: [
      {
        x: 20,
        y: 26,
        w: 150,
        h: 38,
        radius: 19,
        fill: "#241E10",
        text: "1,240 coins",
        color: GOLD,
        size: 14,
      },
      {
        x: 20,
        y: 82,
        w: SCREEN.w - 40,
        h: 42,
        radius: 21,
        fill: CARD,
        text: "Search vouchers",
        color: MUTED,
        size: 12,
      },
      {
        x: 20,
        y: 142,
        w: 90,
        h: 32,
        radius: 16,
        fill: GOLD,
        text: "All",
        color: "#141414",
        size: 12,
      },
      {
        x: 120,
        y: 142,
        w: 90,
        h: 32,
        radius: 16,
        fill: CARD,
        text: "Food",
        color: MUTED,
        size: 12,
      },
      {
        x: 220,
        y: 142,
        w: 100,
        h: 32,
        radius: 16,
        fill: CARD,
        text: "Tech",
        color: MUTED,
        size: 12,
      },
      { x: 20, y: 194, w: 145, h: 154, radius: 14, fill: CARD, text: "400", color: GOLD, size: 18 },
      {
        x: 175,
        y: 194,
        w: 145,
        h: 154,
        radius: 14,
        fill: CARD,
        text: "800",
        color: GOLD,
        size: 18,
      },
      {
        x: 20,
        y: 362,
        w: 145,
        h: 154,
        radius: 14,
        fill: CARD,
        text: "1,200",
        color: GOLD,
        size: 18,
      },
      {
        x: 175,
        y: 362,
        w: 145,
        h: 154,
        radius: 14,
        fill: CARD,
        text: "2,000",
        color: MUTED,
        size: 18,
      },
      {
        x: 175,
        y: 470,
        w: 145,
        h: 46,
        radius: 0,
        fill: "none",
        text: "760 more",
        color: MUTED,
        size: 11,
      },
      {
        x: 20,
        y: SCREEN.h - 78,
        w: SCREEN.w - 40,
        h: 58,
        radius: 18,
        fill: CARD,
        text: "home   earn   shop   me",
        color: MUTED,
        size: 12,
      },
    ],
    notes: [
      "The 2,000 voucher is out of reach and still shown,",
      "with the shortfall named underneath it.",
      "Hiding it would remove the only reason",
      "to open the app again tomorrow.",
    ],
  },
  {
    name: "mockup-4-refer",
    title: "Mintavibe · refer",
    note: "The social surface, in the one colour reserved for it.",
    mode: "mock",
    blocks: [
      {
        x: 20,
        y: 26,
        w: 150,
        h: 38,
        radius: 19,
        fill: "#241E10",
        text: "1,240 coins",
        color: GOLD,
        size: 14,
      },
      {
        x: 20,
        y: 84,
        w: SCREEN.w - 40,
        h: 150,
        radius: 18,
        fill: "#241B3D",
        text: "Refer and earn 150",
        color: "#C9B6FF",
        size: 16,
      },
      {
        x: 20,
        y: 254,
        w: SCREEN.w - 40,
        h: 60,
        radius: 14,
        fill: CARD,
        text: "CGHJG",
        color: "#EDEDE8",
        size: 20,
      },
      {
        x: 20,
        y: 330,
        w: SCREEN.w - 40,
        h: 50,
        radius: 25,
        fill: VIOLET,
        text: "Share invite",
        color: "#FFFFFF",
        size: 14,
      },
      {
        x: 20,
        y: 400,
        w: 130,
        h: 14,
        radius: 7,
        fill: "#2A2A2A",
        text: "Invited",
        color: MUTED,
        size: 12,
      },
      {
        x: 20,
        y: 430,
        w: SCREEN.w - 40,
        h: 52,
        radius: 12,
        fill: CARD,
        text: "Joined            +150",
        color: "#EDEDE8",
        size: 12,
      },
      {
        x: 20,
        y: 492,
        w: SCREEN.w - 40,
        h: 52,
        radius: 12,
        fill: CARD,
        text: "Pending",
        color: MUTED,
        size: 12,
      },
      {
        x: 20,
        y: SCREEN.h - 78,
        w: SCREEN.w - 40,
        h: 58,
        radius: 18,
        fill: CARD,
        text: "home   earn   shop   me",
        color: MUTED,
        size: 12,
      },
    ],
    notes: [
      "Violet appears here and nowhere else.",
      "The code is large enough to read aloud.",
      "Pending invites are listed, so a referral",
      "is a tracked thing rather than a hope.",
    ],
  },
];

/** Information architecture, drawn as a tree rather than screenshotted from the board. */
function diagramIa() {
  const p: string[] = [`<rect width="${W}" height="${H}" fill="${PAPER}"/>`];
  const node = (x: number, y: number, w: number, h: number, label: string, accent = false) => {
    p.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" ry="8" fill="${accent ? "#E9EFD2" : "#FFFFFF"}" stroke="${accent ? "#0B6E51" : LINE}" stroke-width="1.5"/>`,
    );
    p.push(
      `<text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-family="monospace" font-size="14" fill="${INK}">${esc(label)}</text>`,
    );
  };
  const link = (x1: number, y1: number, x2: number, y2: number) =>
    p.push(
      `<path d="M ${x1} ${y1} V ${(y1 + y2) / 2} H ${x2} V ${y2}" fill="none" stroke="${LINE}" stroke-width="1.5"/>`,
    );

  p.push(
    `<text x="60" y="60" font-family="monospace" font-size="19" letter-spacing="2" fill="${INK}">INFORMATION ARCHITECTURE</text>`,
  );
  p.push(
    `<text x="60" y="88" font-family="monospace" font-size="14" fill="${LINE}">Every way to earn sits one level below home, so no activity outranks another.</text>`,
  );

  node(610, 130, 180, 46, "Splash");
  link(700, 176, 700, 214);
  node(610, 214, 180, 46, "Onboarding");
  link(700, 260, 700, 298);
  node(560, 298, 280, 46, "Sign up  /  Log in");
  link(700, 344, 700, 392);
  node(590, 392, 220, 52, "Home", true);

  const kids = [
    ["Play & earn", ["Game list", "Play", "Score"]],
    ["Watch & earn", ["Feed", "Watch", "Claim"]],
    ["Refer & earn", ["Code", "Share", "Invites"]],
    ["Shop", ["Browse", "Voucher", "Redeem"]],
    ["Profile", ["Points", "Alerts", "Settings"]],
  ] as const;
  const colW = 236;
  const startX = 60;
  for (const [i, [label, subs]] of kids.entries()) {
    const x = startX + i * colW;
    link(700, 444, x + colW / 2 - 18, 500);
    node(x, 500, colW - 36, 46, label, true);
    let y = 566;
    for (const s of subs) {
      link(x + colW / 2 - 18, y - 20, x + colW / 2 - 18, y);
      node(x, y, colW - 36, 40, s);
      y += 74;
    }
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${p.join("")}</svg>`,
  );
}

/** Card sort result: seven groups as labelled columns. */
function diagramCardSort() {
  const p: string[] = [`<rect width="${W}" height="${H}" fill="${PAPER}"/>`];
  p.push(
    `<text x="60" y="60" font-family="monospace" font-size="19" letter-spacing="2" fill="${INK}">CARD SORTING</text>`,
  );
  p.push(
    `<text x="60" y="88" font-family="monospace" font-size="14" fill="${LINE}">Seven groups. Points and perks earned its own column instead of hiding inside account settings.</text>`,
  );
  const groups: [string, string[]][] = [
    ["Onboarding", ["App setup", "Sign up", "Login options"]],
    ["Entertainment", ["Gaming", "Video", "Earning rewards"]],
    ["Shopping", ["Shopping", "Vouchers", "Earning rewards"]],
    ["Social", ["Sharing", "Interacting", "Celebrity"]],
    ["Account", ["Profile", "Preferences", "Security"]],
    ["Settings", ["Settings", "Notifications", "Help & support"]],
    ["Points & perks", ["Rewards system", "Mintavibe points", "Perks overview"]],
  ];
  const colW = 176;
  const gap = 12;
  const startX = 60;
  for (const [i, [title, items]] of groups.entries()) {
    const x = startX + i * (colW + gap);
    const accent = i === groups.length - 1;
    p.push(
      `<rect x="${x}" y="140" width="${colW}" height="52" rx="8" ry="8" fill="${accent ? "#0B6E51" : INK}"/>`,
    );
    p.push(
      `<text x="${x + colW / 2}" y="171" text-anchor="middle" font-family="monospace" font-size="13" fill="#FFFFFF">${esc(title)}</text>`,
    );
    let y = 210;
    for (const item of items) {
      p.push(
        `<rect x="${x}" y="${y}" width="${colW}" height="64" rx="8" ry="8" fill="${accent ? "#E9EFD2" : "#FFFFFF"}" stroke="${accent ? "#0B6E51" : LINE}" stroke-width="1.5"/>`,
      );
      p.push(
        `<text x="${x + colW / 2}" y="${y + 38}" text-anchor="middle" font-family="monospace" font-size="12" fill="${INK}">${esc(item)}</text>`,
      );
      y += 76;
    }
  }
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${p.join("")}</svg>`,
  );
}

mkdirSync(OUT, { recursive: true });
let made = 0;
for (const sheet of SHEETS) {
  const info = await sharp(render(sheet))
    .webp({ quality: 88, effort: 5 })
    .toFile(join(OUT, `${sheet.name}.webp`));
  console.log(
    `▢ mintavibe/${sheet.name}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
  );
  made++;
}
for (const [name, buf] of [
  ["information-architecture", diagramIa()],
  ["card-sorting", diagramCardSort()],
] as const) {
  const info = await sharp(buf)
    .webp({ quality: 88, effort: 5 })
    .toFile(join(OUT, `${name}.webp`));
  console.log(
    `▢ mintavibe/${name}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
  );
  made++;
}
console.log(`\n✔ ${made} Mintavibe visual(s) drawn.`);
