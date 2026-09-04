— needs Vercel account + DNS ||||||| # | Phase | Depends on | Est. | Blocking inputs from you | Status (2026-09-04) |
|---|---|---|---|---|---|
| 1 | Project foundation | — | 0.5 | none | ✅ done |
| 2 | Global design system | 1 | 1 | approve 07 | ✅ done |
| 3 | Navigation + layout | 2 | 0.5 | none | ✅ done |
| 4 | Homepage | 3 | 1.5 | portrait, 4 covers (placeholders OK) | ✅ done (assets pending) |
| 5 | Work listing | 3 | 0.5 | — | ✅ done |
| 6 | Case-study engine | 2 | 1 | — | ✅ done |
| 7 | Case-study content | 6 | 2–3 | Compass/Open Omaha/KOMPETE/AML facts + screens | ⏳ blocked on docs/11 (Compass outline drafted) |
| 8 | Services · About · Contact | 3 | 1.5 | testimonials, tools list, Cal.com link, Resend/Turnstile keys | ✅ done (Resend, Turnstile and Supabase keys in; `DATABASE_URL` needed once so `npm run db:migrate` can create the table) |
| 9 | Responsive pass | 4–8 | 0.5 | — | ✅ gate green (7 widths × 2 themes × 6 pages) |
| 10 | Motion & interactions | 4–8 | 1 | — | ✅ CSS motion system applied (reveals, hero fade-ups, cover morph, parallax) |
| 11 | i18n (Spanish) | 4–8 | 1 | review of ES copy | 🔄 UI/pages translated; case studies EN-first |
| 12 | SEO · a11y · performance | 4–11 | 1 | GA4 ID, CF token, Bing code | 🔄 a11y/BP/SEO 100, CLS 0; perf 90–93 (see Phase 12 status) |
| 13 | QA | 12 | 0.5 | — | 🔄 unit 17 · e2e 98 pass; launch checklist pending assets |
| 14 | Deployment | 13 | 0.5 | Vercel account, domain DNS | — needs Vercel account + DNS |

Critical path: **7 (content)**. Everything else can ship with placeholder screens; the site goes live with Compass + 1–2 featured and grows.

---

## Phase details

### 1 · Project foundation
- **Objective:** empty repo → running Next.js 15 + TS + Tailwind v4 app with tooling.
- **Tasks:** `create-next-app` (App Router, src dir, TS, Tailwind, ESLint) · Prettier + tailwind plugin · Vitest · Playwright + axe · Lighthouse CI config · `.env.example` · `.gitignore` · first commit · `README.md` (how to add a case study).
- **Files:** `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config`, `prettier.config`, `vitest.config`, `playwright.config`, `lighthouserc`.
- **Deliverables:** `npm run dev/build/lint/test/e2e` all green on an empty page.
- **Acceptance:** build passes; Lighthouse ≥ 95 on the placeholder; git history starts.
- **Tests:** smoke e2e (`/` returns 200).
- **Edge cases:** Windows path/EOL (`.gitattributes` `* text=auto eol=lf`); Node 24 compatibility of all deps.

### 2 · Global design system
- **Objective:** tokens + primitives from 07 in code.
- **Tasks:** `tokens.css` (`@theme`, light/dark) · fonts via `next/font/google` (Bricolage Grotesque, Inter, JetBrains Mono) · typography utilities · `Button Link Tag Badge StatusPill SectionHeader Container Section Field Callout MediaFrame DeviceFrame Metric` · `next-themes` provider · `/dev/components` gallery route (dev only).
- **Acceptance:** every token from 07 exists; both themes render the gallery with no unstyled flash; contrast checks pass (axe on `/dev/components` both themes).
- **Tests:** unit snapshot of token names; axe.
- **Edge cases:** system theme change while open; font fallback metrics (no CLS).

### 3 · Navigation + layout
- **Objective:** Header, MobileMenu, Footer, SkipLink, ConsentBar, locale layout shell.
- **Tasks:** `[locale]/layout.tsx` with next-intl provider · header scroll behaviour · mobile overlay (focus trap, `Esc`, scroll lock) · footer columns · consent bar (stores choice; loads GA4 on accept).
- **Acceptance:** keyboard-only navigation through header/menu/footer; menu traps focus; header doesn't cause CLS; `lang` attribute correct.
- **Tests:** e2e: open/close menu with keyboard; theme toggle persists after reload; locale switch keeps route.
- **Edge cases:** very long nav labels in ES; iOS 100vh; back-forward cache.

### 4 · Homepage
- **Objective:** all 11 home sections from 04/08 with real copy.
- **Tasks:** Marquee · Hero (portrait, CTAs, status pill) · TwoPaths · SelectedWork (reads content) · Numbers · SoundFamiliar · ServicesTeaser (reads `services.json`) · WorkedWith · Testimonials (reads json) · Process · ContactCTA.
- **Acceptance:** matches 08 layouts at 390/768/1280; LCP element = portrait, < 1.8s on throttled 4G; no client JS in sections other than Marquee/CountUp/Reveal.
- **Tests:** e2e: both CTAs route correctly; count-up renders final values with reduced motion; visual snapshots 3 widths × 2 themes.
- **Edge cases:** missing portrait → layout still valid; fewer than 4 featured projects; testimonials without photo (initials avatar).

### 5 · Work listing
- **Objective:** `/work` with filters.
- **Tasks:** FilterChips (URL-synced, `aria-pressed`) · ProjectGrid with `layout` animation · CollectionCard.
- **Acceptance:** filters deep-linkable; every filter yields ≥ 1 result (build assert); grid order = tier then `featuredOrder`.
- **Tests:** unit: filter derivation; e2e: `?f=games` shows only games.
- **Edge cases:** unknown `?f` → "All"; keyboard operation of chips.

### 6 · Case-study engine
- **Objective:** MDX pipeline + templates + case components.
- **Tasks:** `types/work.ts` zod schema · `lib/content.ts` loader (locale fallback, confirm-stripping, adjacent) · `lib/mdx.ts` (remark-gfm, rehype-slug, autolink) · `mdx-components.tsx` · CaseHero, Meta, TLDR, TOC, Progress, Figure, Compare, Gallery + Lightbox, DeviceFrame, NextProject · `full|standard|compact|collection` template renderers · `generateStaticParams` · OG image route · `scripts/validate-content.ts` (run in `prebuild`).
- **Acceptance:** an MDX file with bad frontmatter fails the build with a readable message; results with `status: confirm` never render in production; TOC tracks scroll; lightbox is accessible.
- **Tests:** unit: schema, loader fallback, confirm-stripping; e2e: navigate card → case → next project; axe on a sample case.
- **Edge cases:** ES file missing → EN + notice; case with no loop; image without alt → build error; very long titles in OG image.

### 7 · Case-study content
- **Objective:** write and assemble Compass (full), Open Omaha, KOMPETE, AML Watcher (standard), Mintavibe, TurnkeyTix, RPA, EXAT (compact), Game UI collection.
- **Tasks:** per project: draft MDX from 05/06 → you review facts → drop screens into `public/work/<slug>/` → alt text → blur script → reading time check against budget.
- **Deliverables:** 9 MDX files, assets, `content/.blur.json`.
- **Acceptance:** every `[CONFIRM]` resolved or removed; word/image budgets met; each ends with results + learnings.
- **Edge cases:** projects with no metrics stay qualitative (no invented numbers); collaborator credits on multi-owner work.

### 8 · Services · About · Contact
- **Objective:** three remaining pages + working form.
- **Tasks:** Services (cards, models, process, quote form, FAQ, `ProfessionalService`/`Service` JSON-LD) · About (story, timeline from `experience.json`, skills, awards, resume button) · Contact (form server action: zod → Turnstile verify → Resend send + auto-reply → Supabase insert into `contact_submissions` → success state; details column) · `public/resume.pdf`.
- **Acceptance:** form rejects invalid input inline, blocks bots, delivers email to connect@raheelqureshi.com within 30s, stores a row in `public.contact_submissions`, shows success with Cal.com prompt; JSON-LD validates in Google Rich Results test; resume opens inline.
- **Tests:** unit: form schema; e2e: happy path with Turnstile test keys; failure path (Resend down → error banner, input preserved).
- **Edge cases:** double submit; 10k-char message; email with `+`; Cal.com blocked by ad-blocker → plain link fallback.

### 9 · Responsive implementation
- **Objective:** every page correct at 390 / 412 / 768 / 1024 / 1280 / 1536 / 1920, both orientations on tablet.
- **Acceptance:** no horizontal scroll anywhere; all tap targets ≥ 44px; tables/galleries scroll inside frames; visual snapshots approved.
- **Tests:** Playwright snapshot matrix (7 widths × 2 themes × 6 pages).

### 10 · Motion and interactions
- **Objective:** implement 08 §8 fully behind reduced-motion checks.
- **Tasks:** Reveal/SplitReveal/CountUp/Parallax · card hover · View Transitions for covers · route transitions · header hide/show · Cursor (flag, off) · marquee pause.
- **Acceptance:** with `prefers-reduced-motion: reduce` every animation degrades per spec; no long tasks > 50ms during hero reveal (Chrome perf trace); INP < 200ms.
- **Tests:** e2e with `reducedMotion: 'reduce'` emulation; trace assertions on `/`.
- **Edge cases:** Safari View Transitions unsupported → crossfade; tab hidden → marquee/loops pause.

### 11 · i18n (Spanish)
- **Objective:** `/es` for UI + Home + Services + About + Contact; case studies EN fallback.
- **Tasks:** `messages/es.json` · localized JSON fields · `hreflang` · locale-aware sitemap · ES OG titles · number/date formatting.
- **Acceptance:** you review ES copy; no untranslated keys (script checks); switching locale keeps route.
- **Tests:** unit: message key parity; e2e: `/es` renders, fallback notice on `/es/work/compass-pos`.
- **Edge cases:** longer ES strings in buttons/nav; `lang="es"` hyphenation.

### 12 · SEO · accessibility · performance
- **Status 2026-09-04:** a11y 100 · best-practices 100 · SEO 100 · CLS 0.000 on all six routes. Performance 90–93 (budget temporarily 90): FCP 1.1 s, LCP 3.2–3.7 s under simulated slow 4G, entirely the H1 waiting for Bricolage Grotesque (77 KB with the `opsz` axis). Levers, in order of design cost: (1) real covers/portrait make an image the LCP element (measure first); (2) drop the `opsz` axis (~30 KB); (3) `display: optional` for the display face (fallback on first slow-mobile visit); (4) self-host a subset (needs fonttools). Decide with Raheel.
- **Tasks:** metadata per page · JSON-LD (Person, CreativeWork, Breadcrumb, FAQ) · sitemap/robots · GA4 (consent-gated) · Cloudflare beacon · Bing meta · `plaiceholder` · font subsetting · bundle analysis · Lighthouse CI budgets.
- **Acceptance:** Lighthouse ≥ 95 ×4 on `/`, `/work/compass-pos`, `/services` mobile; axe: 0 violations all routes both themes; Rich Results test passes; `hreflang` validated.
- **Edge cases:** consent declined → GA4 never loads; ad-blockers → no console errors.

### 13 · QA
- Full checklist below executed; bug list triaged; content proofread EN + ES; links checked (`scripts/check-links.ts`).

### 14 · Deployment
- **Tasks:** Vercel project · env vars · preview deployments per branch · `raheelqureshi.com` + `www` redirect · DNS (Vercel or Cloudflare proxy for CF analytics) · Resend domain records (SPF/DKIM) · GA4 property · Bing Webmaster + sitemap submit · Google Search Console + sitemap · uptime check.
- **Acceptance:** HTTPS, both locales indexed, form works in production, analytics receiving data, PDF downloadable.
- **Edge cases:** Cloudflare proxy + Vercel (use DNS-only or Vercel's recommended CNAME setup); cache of old `resume.pdf` (version the filename).

---

## Final launch checklist
- [ ] **Responsive:** 7 widths × 2 themes, tablet portrait/landscape, no horizontal scroll
- [ ] **Cross-browser:** Chrome, Safari (macOS/iOS), Firefox, Edge, Samsung Internet
- [ ] **Accessibility:** axe clean; keyboard-only pass; screen reader pass on Home + one case study; reduced-motion pass; contrast per tokens
- [ ] **SEO:** titles/descriptions unique; canonical + hreflang; JSON-LD valid; sitemap submitted (Google + Bing); robots OK; 404 page
- [ ] **Core Web Vitals:** LCP < 1.8s, CLS < 0.02, INP < 200ms (mobile, throttled)
- [ ] **Broken links:** internal + external + Behance/LinkedIn/Upwork + resume
- [ ] **Images:** AVIF/WebP served, `sizes` correct, alt text everywhere, loops ≤ 2 MB
- [ ] **Metadata:** OG images render for every route (test in Slack/LinkedIn preview)
- [ ] **Analytics:** GA4 events (CTA clicks, form submit, resume download, calendar open), CF beacon, Bing verified, consent works
- [ ] **Contact:** form delivers, auto-reply sends, spam blocked, Cal.com opens, email copy works
- [ ] **Content:** no `[CONFIRM]`/`[NEEDED]` left; Behance/LinkedIn inconsistencies fixed; ES proofread
- [ ] **Deployment:** custom domain, HTTPS, www redirect, env vars, error monitoring (Vercel), backups = git

## Decisions requested
1. ~~Phase order~~ — approved 2026-09-04: full sequence, launch at the end.
2. Confirm who supplies assets and by when (Phase 7 is the only real schedule risk).
