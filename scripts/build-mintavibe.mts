/**
 * Builds the Mintavibe case-study visuals in three fidelities.
 *
 *   wireframe-*  structure only, grey boxes, generic labels
 *   lofi-*       the same four screens with real copy and hierarchy, still greyscale
 *   final-*      the shipped screens, supplied as transparent phone renders
 *
 * The wireframes and low-fidelity sheets are RECONSTRUCTIONS of the structure visible in the
 * shipped screens, not recovered originals, and the case-study captions say so. The final screens
 * are the real product.
 *
 * Also draws the card-sort and information-architecture diagrams and composes the cover, because a
 * cover made of portrait phones needs different geometry from the landscape one in build-assets.
 *
 * Run with `npm run assets`.
 */
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import sharp, { type OverlayOptions } from "sharp";

const SRC = join(process.cwd(), "Images", "mintavibe-screens");
const OUT = join(process.cwd(), "public", "work", "mintavibe");
const W = 1400;
const H = 875; // 16:10, the figure and gallery slot

const PAPER = "#F2F2ED";
const INK = "#3B4A45";
const LINE = "#8C9A94";
const SOFT = "#D9DEDA";
const MID = "#BFC7C2";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type Block = {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  /** Low-fidelity sheets use a darker fill for anything that carries meaning. */
  strong?: boolean;
  radius?: number;
  size?: number;
};

type Sheet = {
  name: string;
  title: string;
  note: string;
  mode: "wire" | "lofi";
  blocks: Block[];
  notes: string[];
};

const PHONE = { x: 90, y: 96, w: 348, h: 700, r: 44 };
const SCREEN = { x: PHONE.x + 12, y: PHONE.y + 12, w: PHONE.w - 24, h: PHONE.h - 24 };
const COL = 560;
const RIGHT = W - 70;

function render(sheet: Sheet) {
  const lofi = sheet.mode === "lofi";
  const p: string[] = [`<rect width="${W}" height="${H}" fill="${PAPER}"/>`];

  p.push(
    `<text x="${COL}" y="150" font-family="monospace" font-size="21" letter-spacing="2" fill="${INK}">${esc(sheet.title.toUpperCase())}</text>`,
  );
  p.push(
    `<text x="${COL}" y="182" font-family="monospace" font-size="15" fill="${LINE}">${esc(sheet.note)}</text>`,
  );
  p.push(`<line x1="${COL}" y1="212" x2="${RIGHT}" y2="212" stroke="${SOFT}" stroke-width="2"/>`);

  p.push(
    `<rect x="${PHONE.x}" y="${PHONE.y}" width="${PHONE.w}" height="${PHONE.h}" rx="${PHONE.r}" ry="${PHONE.r}" fill="#FFFFFF" stroke="${LINE}" stroke-width="3"/>`,
  );
  p.push(
    `<clipPath id="scr"><rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.w}" height="${SCREEN.h}" rx="${PHONE.r - 12}" ry="${PHONE.r - 12}"/></clipPath>`,
  );
  p.push(`<g clip-path="url(#scr)">`);
  p.push(
    `<rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.w}" height="${SCREEN.h}" fill="${PAPER}"/>`,
  );
  for (const b of sheet.blocks) {
    const x = SCREEN.x + b.x;
    const y = SCREEN.y + b.y;
    const r = b.radius ?? 8;
    p.push(
      `<rect x="${x}" y="${y}" width="${b.w}" height="${b.h}" rx="${r}" ry="${r}" fill="${b.strong && lofi ? MID : SOFT}" stroke="${LINE}" stroke-width="1.5"/>`,
    );
    if (b.label) {
      const size = b.size ?? (b.h < 34 ? 11 : 13);
      p.push(
        `<text x="${x + b.w / 2}" y="${y + b.h / 2 + size / 3}" text-anchor="middle" font-family="monospace" font-size="${size}" fill="${INK}">${esc(b.label)}</text>`,
      );
    }
  }
  p.push(`</g>`);
  p.push(
    `<rect x="${PHONE.x + PHONE.w / 2 - 52}" y="${PHONE.y + 12}" width="104" height="22" rx="11" ry="11" fill="${LINE}"/>`,
  );

  let ny = 268;
  for (const [i, line] of sheet.notes.entries()) {
    p.push(
      `<circle cx="${COL + 14}" cy="${ny - 5}" r="14" fill="${SOFT}" stroke="${LINE}" stroke-width="1.5"/>`,
    );
    p.push(
      `<text x="${COL + 14}" y="${ny}" text-anchor="middle" font-family="monospace" font-size="13" fill="${INK}">${i + 1}</text>`,
    );
    p.push(
      `<text x="${COL + 44}" y="${ny}" font-family="monospace" font-size="16" fill="${LINE}">${esc(line)}</text>`,
    );
    ny += 44;
  }

  const footY = 640;
  p.push(
    `<text x="${COL}" y="${footY}" font-family="monospace" font-size="13" letter-spacing="2" fill="${LINE}">${lofi ? "FIDELITY: LOW" : "FIDELITY: WIREFRAME"}</text>`,
  );
  const rules = lofi
    ? ["Real copy, no brand", "Hierarchy fixed here", "Point values are content"]
    : ["Structure only", "Balance: fixed, top right", "Targets: 48dp minimum"];
  let ry = footY + 34;
  for (const rule of rules) {
    p.push(`<rect x="${COL}" y="${ry - 12}" width="10" height="10" fill="${LINE}"/>`);
    p.push(
      `<text x="${COL + 24}" y="${ry}" font-family="monospace" font-size="15" fill="${INK}">${esc(rule)}</text>`,
    );
    ry += 32;
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${p.join("")}</svg>`,
  );
}

/** The app chrome that appears on every earning screen. */
const chrome = (lofi: boolean): Block[] => [
  { x: 16, y: 18, w: 40, h: 40, radius: 20, label: "" },
  { x: 66, y: 26, w: 110, h: 24, radius: 6, label: lofi ? "MINTAVIBE" : "logo", size: 11 },
  {
    x: 196,
    y: 22,
    w: 74,
    h: 32,
    radius: 16,
    strong: true,
    label: lofi ? "MV 100" : "balance",
    size: 11,
  },
  { x: 278, y: 22, w: 46, h: 32, radius: 16, label: lofi ? "out" : "", size: 11 },
  {
    x: 16,
    y: SCREEN.h - 72,
    w: SCREEN.w - 32,
    h: 56,
    radius: 16,
    strong: true,
    label: lofi ? "home  watch  play  redeem" : "tab bar",
    size: 11,
  },
];

const SHEETS: Sheet[] = [];

const FLOWS: {
  key: string;
  title: string;
  note: string;
  notes: string[];
  body: (lofi: boolean) => Block[];
}[] = [
  {
    key: "1-watch",
    title: "Watch and earn",
    note: "Every row states what it pays before it is opened.",
    notes: [
      "The reward sits on the row, not behind a tap.",
      "Amounts differ per video, so they are content,",
      "not a constant, and the eye compares them.",
      "Duration and likes sit with the title, out of the way.",
    ],
    body: (lofi) => [
      ...chrome(lofi),
      {
        x: 16,
        y: 70,
        w: SCREEN.w - 32,
        h: 78,
        radius: 12,
        strong: true,
        label: lofi ? "Watch content, get rewarded" : "promo banner",
        size: 11,
      },
      {
        x: 16,
        y: 162,
        w: 150,
        h: 20,
        radius: 6,
        label: lofi ? "Watch and Earn" : "section",
        size: 11,
      },
      ...[0, 1, 2, 3].flatMap((i) => {
        const y = 196 + i * 94;
        return [
          { x: 16, y, w: 112, h: 78, radius: 10, label: lofi ? "thumb" : "", size: 11 },
          {
            x: 138,
            y,
            w: SCREEN.w - 154,
            h: 30,
            radius: 6,
            label: lofi ? "Video title" : "title",
            size: 11,
          },
          { x: 138, y: y + 36, w: 96, h: 16, radius: 8, label: lofi ? "100K likes" : "", size: 10 },
          {
            x: 138,
            y: y + 58,
            w: 150,
            h: 20,
            radius: 10,
            strong: true,
            label: lofi ? `Earn ${[1000, 500, 50, 1500][i]} MV` : "reward",
            size: 10,
          },
        ];
      }),
    ],
  },
  {
    key: "2-play",
    title: "Play and earn",
    note: "One game promoted, the rest ranked by what you last played.",
    notes: [
      "Game of the day takes the banner slot.",
      "Every other game carries points earned and",
      "when it was last played, because a returning",
      "player picks up where they left off.",
    ],
    body: (lofi) => [
      ...chrome(lofi),
      {
        x: 16,
        y: 70,
        w: SCREEN.w - 32,
        h: 132,
        radius: 12,
        strong: true,
        label: lofi ? "Game of the Day: Cricket" : "featured",
        size: 11,
      },
      {
        x: 16,
        y: 216,
        w: 170,
        h: 20,
        radius: 6,
        label: lofi ? "Explore More Games" : "section",
        size: 11,
      },
      ...[0, 1, 2].flatMap((i) => {
        const y = 250 + i * 104;
        return [
          { x: 16, y, w: 84, h: 84, radius: 14, label: lofi ? "icon" : "", size: 11 },
          {
            x: 110,
            y,
            w: SCREEN.w - 126,
            h: 24,
            radius: 6,
            label: lofi ? ["Super Sixes", "Top Goals", "Cricket 3D"][i] : "title",
            size: 11,
          },
          {
            x: 110,
            y: y + 30,
            w: 120,
            h: 16,
            radius: 8,
            label: lofi ? "4.7 (1500)" : "",
            size: 10,
          },
          {
            x: 110,
            y: y + 54,
            w: 130,
            h: 22,
            radius: 11,
            strong: true,
            label: lofi ? `Points ${[200, 100, 150][i]}` : "points",
            size: 10,
          },
        ];
      }),
    ],
  },
  {
    key: "3-celebrity",
    title: "Celebrity profile",
    note: "The reason to earn, one level from the reward that buys it.",
    notes: [
      "Bio first, because a fan wants the person.",
      "Top fans are a leaderboard, so the ranking",
      "is itself an incentive to keep earning.",
      "Tiers are named, not numbered.",
    ],
    body: (lofi) => [
      ...chrome(lofi),
      {
        x: 16,
        y: 70,
        w: SCREEN.w - 32,
        h: 108,
        radius: 12,
        strong: true,
        label: lofi ? "Bio" : "bio card",
        size: 11,
      },
      {
        x: 16,
        y: 192,
        w: 140,
        h: 20,
        radius: 6,
        label: lofi ? "Top Five Fans" : "section",
        size: 11,
      },
      ...[0, 1, 2, 3, 4].map((i) => ({
        x: 16 + i * 60,
        y: 222,
        w: 52,
        h: 52,
        radius: 26,
        label: "",
      })),
      {
        x: 16,
        y: 290,
        w: 190,
        h: 20,
        radius: 6,
        label: lofi ? "Club Benefits" : "section",
        size: 11,
      },
      ...[0, 1, 2].map((i) => ({
        x: 16 + i * 100,
        y: 320,
        w: 90,
        h: 76,
        radius: 10,
        label: lofi ? ["Playlist", "Excursion", "Guitar"][i] : "",
        size: 10,
      })),
      ...[0, 1, 2, 3].map((i) => ({
        x: 16 + i * 76,
        y: 412,
        w: 68,
        h: 30,
        radius: 15,
        strong: i === 0,
        label: lofi ? ["Collect", "Images", "Videos", "Events"][i] : "",
        size: 10,
      })),
      {
        x: 16,
        y: 458,
        w: SCREEN.w - 32,
        h: 118,
        radius: 12,
        strong: true,
        label: lofi ? "BRIGADIER tier" : "tier card",
        size: 11,
      },
    ],
  },
  {
    key: "4-redeem",
    title: "Collectable and invoice",
    note: "The receipt states what points paid for and what money did.",
    notes: [
      "Benefits are shown as a grid of what you unlock.",
      "The invoice splits total, points used and cash paid,",
      "so the coin is proved to be worth something.",
      "Nothing about the split is hidden behind a tap.",
    ],
    body: (lofi) => [
      ...chrome(lofi),
      {
        x: 16,
        y: 70,
        w: SCREEN.w - 32,
        h: 108,
        radius: 12,
        strong: true,
        label: lofi ? "BRIGADIER" : "tier card",
        size: 11,
      },
      {
        x: 16,
        y: 192,
        w: SCREEN.w - 32,
        h: 22,
        radius: 4,
        strong: true,
        label: lofi ? "FAN COLLECTABLES BENEFITS" : "section",
        size: 10,
      },
      ...[0, 1, 2, 3, 4, 5].map((i) => ({
        x: 16 + (i % 3) * 100,
        y: 226 + Math.floor(i / 3) * 86,
        w: 90,
        h: 76,
        radius: 10,
        label: "",
      })),
      {
        x: 16,
        y: 402,
        w: SCREEN.w - 32,
        h: 22,
        radius: 4,
        strong: true,
        label: lofi ? "INVOICE" : "section",
        size: 10,
      },
      { x: 16, y: 436, w: 150, h: 18, radius: 6, label: lofi ? "Order no." : "", size: 10 },
      {
        x: 16,
        y: 462,
        w: 190,
        h: 26,
        radius: 6,
        strong: true,
        label: lofi ? "2146461414" : "",
        size: 11,
      },
      { x: 16, y: 500, w: 130, h: 18, radius: 6, label: lofi ? "Total 7000" : "", size: 10 },
      { x: 16, y: 526, w: 160, h: 18, radius: 6, label: lofi ? "Points used 3000" : "", size: 10 },
      {
        x: 16,
        y: 552,
        w: 150,
        h: 22,
        radius: 6,
        strong: true,
        label: lofi ? "Paid 4000" : "",
        size: 10,
      },
    ],
  },
];

for (const flow of FLOWS) {
  SHEETS.push({
    name: `wireframe-${flow.key}`,
    title: `Mintavibe · ${flow.title}`,
    note: flow.note,
    mode: "wire",
    blocks: flow.body(false),
    notes: flow.notes,
  });
  SHEETS.push({
    name: `lofi-${flow.key}`,
    title: `Mintavibe · ${flow.title}`,
    note: flow.note,
    mode: "lofi",
    blocks: flow.body(true),
    notes: flow.notes,
  });
}

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
    `<text x="60" y="88" font-family="monospace" font-size="14" fill="${LINE}">Four tabs. Every way to earn sits on one, and the celebrity is what the earning is for.</text>`,
  );

  node(610, 128, 180, 44, "Splash");
  link(700, 172, 700, 208);
  node(610, 208, 180, 44, "Onboarding");
  link(700, 252, 700, 288);
  node(560, 288, 280, 44, "Sign up  /  Log in");
  link(700, 332, 700, 378);
  node(600, 378, 200, 50, "Home", true);

  const kids = [
    ["Watch & earn", ["Video list", "Player", "Claim"]],
    ["Play & earn", ["Game of day", "Game list", "Score"]],
    ["Redeem", ["Collectables", "Checkout", "Invoice"]],
    ["Celebrity", ["Bio", "Top fans", "Tiers"]],
    ["Profile", ["MV points", "Purchases", "Refer & earn"]],
  ] as const;
  const colW = 236;
  const startX = 60;
  for (const [i, [label, subs]] of kids.entries()) {
    const x = startX + i * colW;
    link(700, 428, x + colW / 2 - 18, 484);
    node(x, 484, colW - 36, 46, label, true);
    let y = 550;
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
    ["Entertainment", ["Watch & earn", "Video content", "Celebrity"]],
    ["Play", ["Game of day", "Game list", "Points earned"]],
    ["Redeem", ["Collectables", "Vouchers", "Invoice"]],
    ["Account", ["Profile", "Purchases", "Disable account"]],
    ["Support", ["Notifications", "FAQ", "About us"]],
    ["Points & perks", ["MV points", "Refer & earn", "Tiers"]],
  ];
  const colW = 176;
  const gap = 12;
  for (const [i, [title, items]] of groups.entries()) {
    const x = 60 + i * (colW + gap);
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

/** Three shipped phones fanned across the evergreen ground. */
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

// The shipped screens, converted as-is. They arrive as transparent phone renders, so the frame
// background shows around them and nothing is cropped.
const FINAL: Record<string, string> = {
  "screen-6.png": "final-1-splash.webp",
  "screen-5.png": "final-2-watch.webp",
  "screen-1.png": "final-3-play.webp",
  "screen-2.png": "final-4-celebrity.webp",
  "screen-3.png": "final-5-collectable.webp",
  "screen-4.png": "final-6-profile.webp",
};

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
} else {
  console.warn(`⚠ no shipped screens at ${SRC}`);
}

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

if (existsSync(SRC)) await buildCover(["screen-5.png", "screen-2.png", "screen-1.png"]);

console.log(`\n✔ ${made} Mintavibe visual(s) built.`);
