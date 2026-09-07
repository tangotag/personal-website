/**
 * Rasterises a PDF into per-page PNGs.
 *
 * Headless Chromium downloads PDFs instead of rendering them, and there is no poppler or
 * ImageMagick on this machine, so pdf.js does the rendering inside a real browser page where a
 * canvas exists. A tiny static server hands the browser both pdf.js and the PDF itself, because a
 * page loaded from data: or file: cannot fetch either.
 *
 * Usage: node scripts/pdf-pages.mts "Images/Some Design.pdf" <outDir> [maxWidth]
 */
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const [src, outDir, widthArg] = process.argv.slice(2);
if (!src || !outDir) {
  console.error('Usage: node scripts/pdf-pages.mts "<file.pdf>" <outDir> [maxWidth]');
  process.exit(2);
}
const MAX_WIDTH = Number(widthArg ?? 1600);
const ROOT = process.cwd();
if (!existsSync(src)) {
  console.error(`No such file: ${src}`);
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const TYPES: Record<string, string> = {
  ".mjs": "text/javascript",
  ".js": "text/javascript",
  ".pdf": "application/pdf",
  ".html": "text/html",
  ".map": "application/json",
};

const VIEWER = `<!doctype html><meta charset="utf-8"><body><script type="module">
import * as pdfjs from "/node_modules/pdfjs-dist/build/pdf.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = "/node_modules/pdfjs-dist/build/pdf.worker.mjs";
window.renderPdf = async (url, maxWidth) => {
  const doc = await pdfjs.getDocument({ url, disableAutoFetch: false }).promise;
  window.__pageCount = doc.numPages;
  window.__page = async (n) => {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(maxWidth / base.width, 3);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport, background: "#ffffff" }).promise;
    const data = canvas.toDataURL("image/png");
    canvas.width = canvas.height = 0;
    return data;
  };
  return doc.numPages;
};
window.__ready = true;
</script></body>`;

const server = createServer((req, res) => {
  const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
  if (path === "/" || path === "/viewer.html") {
    res.writeHead(200, { "content-type": "text/html" });
    res.end(VIEWER);
    return;
  }
  const file = resolve(join(ROOT, path));
  if (!file.startsWith(ROOT) || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, {
    "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    "content-length": statSync(file).size,
    "accept-ranges": "bytes",
  });
  createReadStream(file).pipe(res);
});

await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
const address = server.address();
const port = typeof address === "object" && address ? address.port : 0;
const base = `http://127.0.0.1:${port}`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("page error:", e.message.slice(0, 120)));
  await page.goto(`${base}/viewer.html`, { waitUntil: "load" });
  await page.waitForFunction(
    () => (window as unknown as { __ready?: boolean }).__ready === true,
    null,
    {
      timeout: 30_000,
    },
  );

  const pdfUrl = `${base}/${src.split(/[\\/]/).map(encodeURIComponent).join("/")}`;
  const count: number = await page.evaluate(
    ([url, w]) =>
      (window as unknown as { renderPdf: (u: string, w: number) => Promise<number> }).renderPdf(
        url as string,
        w as number,
      ),
    [pdfUrl, MAX_WIDTH] as const,
  );
  console.log(`${src}: ${count} page(s)`);

  for (let n = 1; n <= count; n++) {
    const dataUrl: string = await page.evaluate(
      (i) => (window as unknown as { __page: (n: number) => Promise<string> }).__page(i as number),
      n,
    );
    const buf = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
    const out = join(outDir, `page-${String(n).padStart(2, "0")}.png`);
    writeFileSync(out, buf);
    console.log(`  ${out}  ${(buf.length / 1024).toFixed(0)} KB`);
  }
} finally {
  await browser.close();
  server.close();
}
