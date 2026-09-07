/**
 * Draws the wireframes and low-fidelity sheets for the two Compass case studies.
 *
 * Compass POS and Compass Kiosk are separate products on separate hardware, so they get separate
 * studies. Both surfaces are landscape, so both use the same device frame with different chrome:
 * the terminal carries a staff bar, the kiosk carries a language and help bar.
 *
 * These sheets are RECONSTRUCTIONS of the structure visible in the shipped screens, not recovered
 * originals, and the captions in each case study say so. The shipped screens appear only under the
 * final-design section.
 *
 * Run with `npm run assets`.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = join(process.cwd(), "public", "work");
const W = 1400;
const H = 875;

const PAPER = "#F2F2ED";
const INK = "#3B4A45";
const LINE = "#8C9A94";
const SOFT = "#D9DEDA";
const MID = "#BFC7C2";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Landscape device: a 16:10 screen inside a bezel, the shape both surfaces share. */
const DEVICE = { x: 60, y: 210, w: 776, h: 500, r: 18 };
const SCREEN = { x: DEVICE.x + 16, y: DEVICE.y + 16, w: DEVICE.w - 32, h: DEVICE.h - 32 };
const COL = 890;
const RIGHT = W - 60;

type Block = {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  /** Low-fidelity sheets darken anything that carries meaning. */
  strong?: boolean;
  radius?: number;
  size?: number;
};

type Sheet = {
  slug: "compass-pos" | "compass-kiosk";
  name: string;
  title: string;
  note: string;
  mode: "wire" | "lofi";
  blocks: Block[];
  notes: string[];
};

function render(sheet: Sheet) {
  const lofi = sheet.mode === "lofi";
  const kiosk = sheet.slug === "compass-kiosk";
  const p: string[] = [`<rect width="${W}" height="${H}" fill="${PAPER}"/>`];

  p.push(
    `<text x="${COL}" y="250" font-family="monospace" font-size="20" letter-spacing="2" fill="${INK}">${esc(sheet.title.toUpperCase())}</text>`,
  );
  p.push(`<line x1="${COL}" y1="278" x2="${RIGHT}" y2="278" stroke="${SOFT}" stroke-width="2"/>`);
  p.push(
    `<text x="${COL}" y="308" font-family="monospace" font-size="14" fill="${LINE}">${esc(sheet.note)}</text>`,
  );

  // Bezel, then a clipped screen.
  p.push(
    `<rect x="${DEVICE.x}" y="${DEVICE.y}" width="${DEVICE.w}" height="${DEVICE.h}" rx="${DEVICE.r}" ry="${DEVICE.r}" fill="#FFFFFF" stroke="${LINE}" stroke-width="3"/>`,
  );
  p.push(
    `<clipPath id="scr"><rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.w}" height="${SCREEN.h}" rx="6" ry="6"/></clipPath>`,
  );
  p.push(`<g clip-path="url(#scr)">`);
  p.push(
    `<rect x="${SCREEN.x}" y="${SCREEN.y}" width="${SCREEN.w}" height="${SCREEN.h}" fill="${PAPER}"/>`,
  );
  for (const b of sheet.blocks) {
    const x = SCREEN.x + b.x;
    const y = SCREEN.y + b.y;
    p.push(
      `<rect x="${x}" y="${y}" width="${b.w}" height="${b.h}" rx="${b.radius ?? 6}" ry="${b.radius ?? 6}" fill="${b.strong && lofi ? MID : SOFT}" stroke="${LINE}" stroke-width="1.5"/>`,
    );
    if (b.label) {
      const size = b.size ?? (b.h < 30 ? 10 : 12);
      p.push(
        `<text x="${x + b.w / 2}" y="${y + b.h / 2 + size / 3}" text-anchor="middle" font-family="monospace" font-size="${size}" fill="${INK}">${esc(b.label)}</text>`,
      );
    }
  }
  p.push(`</g>`);

  // A stand under the terminal, a pillar under the kiosk.
  if (kiosk) {
    p.push(
      `<rect x="${DEVICE.x + DEVICE.w / 2 - 42}" y="${DEVICE.y + DEVICE.h}" width="84" height="70" fill="${SOFT}" stroke="${LINE}" stroke-width="2"/>`,
    );
    p.push(
      `<rect x="${DEVICE.x + DEVICE.w / 2 - 130}" y="${DEVICE.y + DEVICE.h + 70}" width="260" height="16" rx="8" ry="8" fill="${MID}" stroke="${LINE}" stroke-width="2"/>`,
    );
  } else {
    p.push(
      `<path d="M ${DEVICE.x + DEVICE.w / 2 - 70} ${DEVICE.y + DEVICE.h} L ${DEVICE.x + DEVICE.w / 2 - 120} ${DEVICE.y + DEVICE.h + 62} L ${DEVICE.x + DEVICE.w / 2 + 120} ${DEVICE.y + DEVICE.h + 62} L ${DEVICE.x + DEVICE.w / 2 + 70} ${DEVICE.y + DEVICE.h} Z" fill="${SOFT}" stroke="${LINE}" stroke-width="2"/>`,
    );
  }

  let ny = 360;
  for (const [i, line] of sheet.notes.entries()) {
    p.push(
      `<circle cx="${COL + 14}" cy="${ny - 5}" r="14" fill="${SOFT}" stroke="${LINE}" stroke-width="1.5"/>`,
    );
    p.push(
      `<text x="${COL + 14}" y="${ny}" text-anchor="middle" font-family="monospace" font-size="13" fill="${INK}">${i + 1}</text>`,
    );
    p.push(
      `<text x="${COL + 44}" y="${ny}" font-family="monospace" font-size="15" fill="${LINE}">${esc(line)}</text>`,
    );
    ny += 42;
  }

  const footY = 620;
  p.push(
    `<text x="${COL}" y="${footY}" font-family="monospace" font-size="12" letter-spacing="2" fill="${LINE}">${lofi ? "FIDELITY: LOW" : "FIDELITY: WIREFRAME"}</text>`,
  );
  const rules = kiosk
    ? ["One decision per screen", "Reach: controls in the lower half", "Targets: 48dp minimum"]
    : ["Ticket never leaves the rail", "One decision at a time", "Targets sized for gloves"];
  let ry = footY + 32;
  for (const rule of rules) {
    p.push(`<rect x="${COL}" y="${ry - 11}" width="9" height="9" fill="${LINE}"/>`);
    p.push(
      `<text x="${COL + 22}" y="${ry}" font-family="monospace" font-size="14" fill="${INK}">${esc(rule)}</text>`,
    );
    ry += 30;
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${p.join("")}</svg>`,
  );
}

/** Persistent chrome: staff bar on the terminal, language and help bar on the kiosk. */
const posChrome = (lofi: boolean): Block[] => [
  {
    x: 0,
    y: SCREEN.h - 30,
    w: SCREEN.w,
    h: 30,
    radius: 0,
    strong: true,
    label: lofi ? "Balance · Table · 11:59" : "status bar",
    size: 10,
  },
];
const kioskChrome = (lofi: boolean): Block[] => [
  {
    x: 0,
    y: SCREEN.h - 30,
    w: SCREEN.w,
    h: 30,
    radius: 0,
    strong: true,
    label: lofi
      ? "Choose language · English · Spanish            Need help? 844-200-3277"
      : "language + help bar",
    size: 10,
  },
];

/** Order ticket down the left of every POS ordering screen. */
const ticket = (lofi: boolean): Block[] => [
  { x: 10, y: 10, w: 200, h: 26, label: lofi ? "T # 01   + Add Guest" : "ticket header", size: 10 },
  ...[0, 1, 2, 3, 4].map((i) => ({
    x: 10,
    y: 44 + i * 30,
    w: 200,
    h: 24,
    label: lofi
      ? [
          "Double Bacon Burger",
          "  2x Mustard",
          "  Large Fries",
          "Hawaiian Pizza (L)",
          "  3x Fresh Mozzarella",
        ][i]
      : "",
    size: 9,
  })),
  {
    x: 10,
    y: 204,
    w: 200,
    h: 22,
    strong: true,
    label: lofi ? "Total  $20.82 / $20.21" : "total",
    size: 10,
  },
  { x: 10, y: 232, w: 96, h: 26, label: lofi ? "Save" : "", size: 10 },
  { x: 114, y: 232, w: 96, h: 26, strong: true, label: lofi ? "Pay" : "", size: 10 },
];

const SHEETS: Sheet[] = [];

type Flow = {
  slug: "compass-pos" | "compass-kiosk";
  key: string;
  title: string;
  note: string;
  notes: string[];
  body: (lofi: boolean) => Block[];
};

const FLOWS: Flow[] = [
  {
    slug: "compass-pos",
    key: "1-home",
    title: "POS · shift home",
    note: "Every job a shift needs, one tap from the top level.",
    notes: [
      "Twelve modules, no submenus.",
      "Role decides which tiles render, so a cashier",
      "never sees day closing or staff reports.",
      "Tiles are square and thumb-sized, not icons.",
    ],
    body: (lofi) => [
      ...posChrome(lofi),
      { x: 10, y: 10, w: 120, h: 24, label: lofi ? "CYGNUS" : "brand", size: 10 },
      {
        x: SCREEN.w - 150,
        y: 10,
        w: 140,
        h: 24,
        label: lofi ? "Hi, Jhon · Admin" : "user",
        size: 10,
      },
      ...[
        "Dine In",
        "To Go",
        "Delivery",
        "Pick Up",
        "Menu",
        "Orders",
        "Reservation",
        "Tables",
        "Messages",
        "Settings",
        "Recall",
        "Day Closing",
      ].map((label, i) => ({
        x: 40 + (i % 6) * 112,
        y: 60 + Math.floor(i / 6) * 104,
        w: 96,
        h: 88,
        radius: 10,
        label: lofi ? label : "",
        size: 10,
      })),
      {
        x: SCREEN.w / 2 - 56,
        y: 276,
        w: 112,
        h: 84,
        radius: 10,
        strong: true,
        label: lofi ? "Staff Report" : "",
        size: 10,
      },
    ],
  },
  {
    slug: "compass-pos",
    key: "2-order",
    title: "POS · order and menu",
    note: "The ticket holds the left rail; everything else opens beside it.",
    notes: [
      "The ticket never moves, so the eye stays put.",
      "Category chips filter the grid without a page change.",
      "Items are photographs, because staff scan images",
      "faster than they read a list under pressure.",
    ],
    body: (lofi) => [
      ...posChrome(lofi),
      ...ticket(lofi),
      { x: 224, y: 10, w: 200, h: 26, label: lofi ? "Search" : "search", size: 10 },
      ...["All", "Gifts", "EBT", "Dinner"].map((label, i) => ({
        x: 434 + i * 74,
        y: 10,
        w: 66,
        h: 26,
        radius: 13,
        strong: i === 0,
        label: lofi ? label : "",
        size: 10,
      })),
      ...["Cakes", "Cookies", "Burgers", "Croissants", "Pizza"].map((label, i) => ({
        x: 224 + i * 96,
        y: 48,
        w: 84,
        h: 48,
        radius: 8,
        label: lofi ? label : "",
        size: 9,
      })),
      ...Array.from({ length: 8 }, (_, i) => ({
        x: 224 + (i % 4) * 122,
        y: 110 + Math.floor(i / 4) * 100,
        w: 110,
        h: 88,
        radius: 8,
        label: lofi
          ? ["Classic", "Bacon", "Spicy", "Cheese", "Beyond", "BBQ", "Falafel", "Tempeh"][i]
          : "",
        size: 9,
      })),
    ],
  },
  {
    slug: "compass-pos",
    key: "3-modifiers",
    title: "POS · required modifiers",
    note: "A required choice blocks the ticket until it is answered.",
    notes: [
      "Required is a label on the sheet, not a colour.",
      "Steppers replace typing, so a gloved hand can",
      "build a combo without a keyboard.",
      "Optional groups sit in a rail, out of the path.",
    ],
    body: (lofi) => [
      ...posChrome(lofi),
      ...ticket(lofi),
      {
        x: 224,
        y: 10,
        w: 330,
        h: 34,
        strong: true,
        label: lofi ? "Condiments (Required)" : "required sheet",
        size: 11,
      },
      ...Array.from({ length: 6 }, (_, i) => ({
        x: 224 + (i % 2) * 170,
        y: 56 + Math.floor(i / 2) * 46,
        w: 158,
        h: 38,
        radius: 6,
        label: lofi ? ["2x Mustard", "2x Mayo", "Ketchup", "Onion", "Pickles", "Hot Sauce"][i] : "",
        size: 9,
      })),
      ...["Optional add-ons", "Choose a Side", "Choose a Drink"].map((label, i) => ({
        x: 570,
        y: 10 + i * 56,
        w: 174,
        h: 46,
        radius: 6,
        label: lofi ? label : "",
        size: 9,
      })),
      { x: 224, y: 236, w: 160, h: 30, label: lofi ? "Cancel" : "", size: 10 },
      { x: 394, y: 236, w: 160, h: 30, strong: true, label: lofi ? "Done" : "", size: 10 },
    ],
  },
  {
    slug: "compass-pos",
    key: "4-payment",
    title: "POS · payment and split",
    note: "Dual pricing, tipping and splitting resolved in one view.",
    notes: [
      "Card and cash totals are shown together,",
      "because dual pricing has to be disclosed.",
      "The split grid does the arithmetic, so nobody",
      "divides a bill by seven at the counter.",
    ],
    body: (lofi) => [
      ...posChrome(lofi),
      ...ticket(lofi),
      {
        x: 224,
        y: 10,
        w: 160,
        h: 52,
        strong: true,
        label: lofi ? "Card $40.00" : "card",
        size: 11,
      },
      {
        x: 394,
        y: 10,
        w: 160,
        h: 52,
        strong: true,
        label: lofi ? "Cash $30.00" : "cash",
        size: 11,
      },
      { x: 564, y: 10, w: 180, h: 52, label: lofi ? "Add Tip" : "tip", size: 11 },
      ...["Exact", "Round Up", "Cash"].map((label, i) => ({
        x: 224 + i * 176,
        y: 74,
        w: 164,
        h: 30,
        label: lofi ? label : "",
        size: 10,
      })),
      ...Array.from({ length: 9 }, (_, i) => ({
        x: 224 + (i % 3) * 176,
        y: 116 + Math.floor(i / 3) * 46,
        w: 164,
        h: 38,
        radius: 6,
        label: lofi ? `Split by ${i + 2}` : "",
        size: 9,
      })),
      ...["Payment Card", "Cash", "Gift Card"]
        .map((label, i) => ({
          x: 570,
          y: 254,
          w: 0,
          h: 0,
          label: undefined,
          size: 9,
          radius: 0,
          strong: i === 99,
        }))
        .slice(0, 0),
      {
        x: 224,
        y: 254,
        w: 520,
        h: 30,
        strong: true,
        label: lofi ? "Split by Guest · Items · Evenly · Amount" : "split modes",
        size: 10,
      },
    ],
  },

  {
    slug: "compass-kiosk",
    key: "1-attract",
    title: "Kiosk · attract",
    note: "One target on the screen, sized to be hit without aiming.",
    notes: [
      "A single call to action, low enough to reach",
      "from a wheelchair as well as standing.",
      "Category icons preview the menu without",
      "asking for a decision yet.",
      "Language and help sit on a bar that never moves.",
    ],
    body: (lofi) => [
      ...kioskChrome(lofi),
      { x: 20, y: 16, w: 150, h: 34, label: lofi ? "CYGNUS" : "brand", size: 11 },
      {
        x: 20,
        y: 62,
        w: 300,
        h: 56,
        strong: true,
        label: lofi ? "WELCOME!" : "headline",
        size: 15,
      },
      ...Array.from({ length: 7 }, (_, i) => ({
        x: 20 + i * 56,
        y: 138,
        w: 48,
        h: 48,
        radius: 10,
        label: "",
      })),
      {
        x: 20,
        y: 214,
        w: 300,
        h: 66,
        radius: 33,
        strong: true,
        label: lofi ? "TAP TO START" : "primary action",
        size: 13,
      },
      {
        x: 430,
        y: 40,
        w: 300,
        h: 240,
        radius: 10,
        label: lofi ? "food photography" : "hero image",
        size: 10,
      },
    ],
  },
  {
    slug: "compass-kiosk",
    key: "2-menu",
    title: "Kiosk · menu",
    note: "Categories as pictures, with the order total always visible.",
    notes: [
      "Every category is a photograph and a word.",
      "The running order sits top right and updates",
      "on every add, so the total is never a surprise.",
      "Dine in or take away stays switchable here.",
    ],
    body: (lofi) => [
      ...kioskChrome(lofi),
      {
        x: 20,
        y: 14,
        w: 150,
        h: 30,
        radius: 15,
        strong: true,
        label: lofi ? "Take Away | Dine In" : "mode",
        size: 10,
      },
      { x: SCREEN.w / 2 - 70, y: 14, w: 140, h: 30, label: lofi ? "OUR MENU" : "title", size: 11 },
      {
        x: SCREEN.w - 190,
        y: 14,
        w: 170,
        h: 30,
        radius: 15,
        strong: true,
        label: lofi ? "View Order  3   $0.00" : "order total",
        size: 10,
      },
      ...Array.from({ length: 11 }, (_, i) => ({
        x: 30 + (i % 6) * 118,
        y: 66 + Math.floor(i / 6) * 118,
        w: 104,
        h: 104,
        radius: 10,
        label: lofi
          ? [
              "Pizza",
              "Burger",
              "Wings",
              "Salad",
              "Sandwich",
              "Deserts",
              "Taco",
              "Wraps",
              "Fries",
              "Drinks",
              "Sauces",
            ][i]
          : "",
        size: 10,
      })),
    ],
  },
  {
    slug: "compass-kiosk",
    key: "3-configure",
    title: "Kiosk · configure an item",
    note: "Required choices first, optional ones after, total always live.",
    notes: [
      "Size is required, so it is asked first and",
      "labelled required rather than coloured.",
      "Fillings use steppers with a price each,",
      "so the total never changes without a reason.",
      "Add to bag sits beside cancel, never alone.",
    ],
    body: (lofi) => [
      ...kioskChrome(lofi),
      { x: 20, y: 20, w: 210, h: 170, radius: 10, label: lofi ? "item photo" : "image", size: 10 },
      {
        x: 20,
        y: 202,
        w: 210,
        h: 24,
        strong: true,
        label: lofi ? "PIZZA  $9.50" : "name + price",
        size: 10,
      },
      {
        x: 20,
        y: 234,
        w: 210,
        h: 46,
        label: lofi ? "Condiments: onion, olives" : "description",
        size: 9,
      },
      {
        x: 260,
        y: 20,
        w: 220,
        h: 26,
        strong: true,
        label: lofi ? "SELECT SIZE (Required)" : "required group",
        size: 10,
      },
      ...["Small $2.5", "Medium $2.5", "Large $2.5"].map((label, i) => ({
        x: 260 + i * 156,
        y: 56,
        w: 144,
        h: 40,
        label: lofi ? label : "",
        size: 9,
      })),
      {
        x: 260,
        y: 110,
        w: 240,
        h: 24,
        label: lofi ? "SELECT FILLINGS (Optional)" : "optional group",
        size: 10,
      },
      ...Array.from({ length: 4 }, (_, i) => ({
        x: 260,
        y: 142 + i * 38,
        w: 460,
        h: 30,
        label: lofi
          ? [
              "Onion  $0.75   -  0  +",
              "Olive  $3.00   -  1  +",
              "Tomato $1.65   -  0  +",
              "Mushroom       -  0  +",
            ][i]
          : "",
        size: 9,
      })),
      { x: 20, y: 296, w: 200, h: 34, label: lofi ? "Cancel" : "", size: 10 },
      { x: 240, y: 296, w: 240, h: 34, strong: true, label: lofi ? "Add to Bag" : "", size: 10 },
      {
        x: 520,
        y: 296,
        w: 200,
        h: 34,
        strong: true,
        label: lofi ? "TOTAL  $9.50" : "total",
        size: 10,
      },
    ],
  },
  {
    slug: "compass-kiosk",
    key: "4-review",
    title: "Kiosk · review and pay",
    note: "Editable to the last moment, with the summary pinned beside it.",
    notes: [
      "Every line stays editable, including quantity,",
      "because a queue makes people rush and misorder.",
      "The summary panel holds subtotal, tax and",
      "discount separately, never one merged figure.",
      "Upsell sits below the order, never inside it.",
    ],
    body: (lofi) => [
      ...kioskChrome(lofi),
      { x: 20, y: 16, w: 160, h: 26, label: lofi ? "Your Order" : "title", size: 11 },
      ...Array.from({ length: 2 }, (_, i) => ({
        x: 20,
        y: 54 + i * 76,
        w: 430,
        h: 66,
        radius: 8,
        label: lofi ? ["pepperoni pizza  $5.00   -  1  +", "Sandwich  $5.00   -  1  +"][i] : "",
        size: 9,
      })),
      { x: 20, y: 214, w: 160, h: 22, label: lofi ? "You may also like" : "upsell", size: 10 },
      ...Array.from({ length: 4 }, (_, i) => ({
        x: 20 + i * 112,
        y: 244,
        w: 100,
        h: 78,
        radius: 8,
        label: "",
      })),
      {
        x: 480,
        y: 54,
        w: 240,
        h: 150,
        radius: 8,
        strong: true,
        label: lofi ? "Subtotal 19.25 · Tax 0.96 · Discount -2.00 · Total 20.21" : "summary",
        size: 9,
      },
      { x: 480, y: 288, w: 110, h: 34, label: lofi ? "Back to Menu" : "", size: 9 },
      { x: 600, y: 288, w: 120, h: 34, strong: true, label: lofi ? "Continue" : "", size: 9 },
    ],
  },
];

for (const flow of FLOWS) {
  const label = flow.slug === "compass-kiosk" ? "Compass Kiosk" : "Compass POS";
  SHEETS.push({
    slug: flow.slug,
    name: `wireframe-${flow.key}`,
    title: `${label} · ${flow.title.split("· ")[1]}`,
    note: flow.note,
    mode: "wire",
    blocks: flow.body(false),
    notes: flow.notes,
  });
  SHEETS.push({
    slug: flow.slug,
    name: `lofi-${flow.key}`,
    title: `${label} · ${flow.title.split("· ")[1]}`,
    note: flow.note,
    mode: "lofi",
    blocks: flow.body(true),
    notes: flow.notes,
  });
}

let made = 0;
for (const sheet of SHEETS) {
  const dir = join(OUT, sheet.slug);
  mkdirSync(dir, { recursive: true });
  const info = await sharp(render(sheet))
    .webp({ quality: 88, effort: 5 })
    .toFile(join(dir, `${sheet.name}.webp`));
  console.log(
    `▢ ${sheet.slug}/${sheet.name}.webp  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`,
  );
  made++;
}
console.log(`\n✔ ${made} Compass sheet(s) drawn.`);
