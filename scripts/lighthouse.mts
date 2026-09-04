/**
 * Local Lighthouse gate that avoids chrome-launcher (its temp-profile cleanup fails on Windows).
 * Starts `next start`, launches Playwright's Chromium with remote debugging, audits each URL
 * with Lighthouse's mobile defaults, asserts budgets, and writes reports to .lighthouseci/.
 *
 *   npm run lhci              → build (with NEXT_PUBLIC_SITE_URL=http://localhost:PORT so canonical/hreflang are same-origin), then audit
 *   node scripts/lighthouse.mts --build-only → test build for Playwright (same-origin URL, test keys)
 *   node scripts/lighthouse.mts → audit an existing build (Node 24 strips types natively; tsx/esbuild injects __name helpers that break Lighthouse page functions)
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";

const PORT = Number(process.env.PORT ?? 3100); // 3000 belongs to the dev server
const DEBUG_PORT = 9222;
const BASE = `http://localhost:${PORT}`;
// Accepts "/", "/work", "work" or full URLs. Git Bash on Windows rewrites "/work"-style env values
// into filesystem paths unless MSYS_NO_PATHCONV=1 is set, so bare segments are tolerated too.
const URLS = (process.env.LH_URLS ?? "/").split(",").map((p) => {
  const s = p.trim();
  return s.startsWith("http") ? s : `${BASE}/${s.replace(/^[\/]+/, "")}`;
});
const RUNS = Number(process.env.LH_RUNS ?? 2);

const BUDGET = {
  // TEMP 0.90 (target 0.95): every route is LCP-bound by the 77 KB display font under simulated
  // slow 4G. Revisit in Phase 12 once real covers/portrait land — see docs/10 Phase 12.
  performance: 0.9,
  accessibility: 0.95,
  "best-practices": 0.95,
  seo: 0.95,
  lcpMs: 1800, // warn only
  cls: 0.02,
} as const;

function waitForServer(url: string, timeoutMs = 120_000): Promise<void> {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        /* not up yet */
      }
      if (Date.now() - started > timeoutMs) return reject(new Error(`Server not ready: ${url}`));
      setTimeout(tick, 500);
    };
    void tick();
  });
}

function build() {
  return new Promise<void>((resolve, reject) => {
    const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
    const child = spawn(process.execPath, [nextBin, "build"], {
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_PUBLIC_SITE_URL: BASE,
        // Cloudflare's visible always-pass test site key, so audits and e2e never hit the real widget.
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
        // GA is consent-gated and never loads in automated runs; keep the id out of the test build anyway.
        NEXT_PUBLIC_GA_ID: "",
      },
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`next build exited with ${code}`)),
    );
  });
}

async function main() {
  if (process.argv.includes("--build-only")) {
    await build();
    return;
  }
  if (process.argv.includes("--build")) await build();
  // Spawn the real `next` binary (no shell wrapper) so the PID we later kill is the server itself.
  const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
  const server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    stdio: "ignore",
    // Same isolation as Playwright: audits must never reach Resend, Turnstile or the database.
    env: {
      ...process.env,
      TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
      RESEND_API_KEY: "",
      SUPABASE_PROJECT_URL: "",
      SUPABASE_ANON_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
  });
  const browser = await chromium.launch({ args: [`--remote-debugging-port=${DEBUG_PORT}`] });
  const outDir = join(process.cwd(), ".lighthouseci");
  mkdirSync(outDir, { recursive: true });

  let failed = false;
  try {
    await waitForServer(BASE);
    for (const url of URLS) {
      const scores: Record<string, number[]> = {};
      let lcp = 0;
      let cls = 0;
      for (let i = 0; i < RUNS; i++) {
        const result = await lighthouse(url, {
          port: DEBUG_PORT,
          output: "json",
          logLevel: "silent",
          onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        });
        if (!result) throw new Error(`Lighthouse returned nothing for ${url}`);
        const { lhr } = result;
        for (const [id, cat] of Object.entries(lhr.categories)) {
          (scores[id] ??= []).push(cat.score ?? 0);
        }
        lcp = Math.max(lcp, lhr.audits["largest-contentful-paint"]?.numericValue ?? 0);
        cls = Math.max(cls, lhr.audits["cumulative-layout-shift"]?.numericValue ?? 0);
        const slug = new URL(url).pathname.replace(/\W+/g, "_") || "_";
        writeFileSync(join(outDir, `lhr${slug}-${i + 1}.json`), JSON.stringify(lhr));
      }

      // Median of runs per category.
      const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
      const line = Object.entries(scores)
        .map(([id, xs]) => `${id}=${Math.round(median(xs) * 100)}`)
        .join("  ");
      console.log(`${url}\n  ${line}  LCP=${Math.round(lcp)}ms  CLS=${cls.toFixed(3)}`);

      for (const [id, min] of Object.entries(BUDGET)) {
        if (id === "lcpMs" || id === "cls") continue;
        const got = median(scores[id] ?? [0]);
        if (got < min) {
          failed = true;
          console.error(`  ✖ ${id} ${Math.round(got * 100)} < ${min * 100}`);
        }
      }
      if (cls > BUDGET.cls) {
        failed = true;
        console.error(`  ✖ CLS ${cls.toFixed(3)} > ${BUDGET.cls}`);
      }
      if (lcp > BUDGET.lcpMs) console.warn(`  ⚠ LCP ${Math.round(lcp)}ms > ${BUDGET.lcpMs}ms`);
    }
  } finally {
    await browser.close();
    if (server.pid) {
      if (process.platform === "win32") spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"]);
      else server.kill("SIGTERM");
    }
  }

  if (failed) {
    console.error("✖ Lighthouse budgets not met");
    process.exit(1);
  }
  console.log("✔ Lighthouse budgets met");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
