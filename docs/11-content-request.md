# 11 — Content & Asset Request (blocks Phase 7)

Everything below is what only you can supply. Items are ordered by how much they unblock.
Placeholders in the code are tagged `[CONFIRM]` (a number I drafted) or `[NEEDED]` (missing entirely); both are hidden from production builds until resolved.

## A. Assets (drop into the paths shown; the build validates them)

| # | Asset | Path | Spec |
|---|---|---|---|
| 1 | Portrait | `public/images/portrait.jpg` | ≥ 1600 px on the long side, 4:5 crop works best, neutral background |
| 2 | Compass POS cover | `public/work/compass-pos/cover.jpg` | 1600 × 1000, the terminal or kiosk in context |
| 3 | Compass screens | `public/work/compass-pos/01.jpg … 12.jpg` | Order screen, modifiers, payment/tipping, offline banner, KDS, kiosk attract/order/pay, Bridge admin (live sales, AI reports, employee time) |
| 4 | Compass hardware photos | `public/work/compass-pos/hardware-*.jpg` | Terminal + kiosk photos for the device frames (`kind="pos"` / `"kiosk"`) |
| 5 | Open Omaha cover + screens | `public/work/open-omaha/` | Lobby, table, cashier — before/after pairs if you have them (the `<Compare>` component) |
| 6 | AML Watcher cover + screens | `public/work/aml-watcher/` | Alert queue, case timeline, reporting |
| 7 | KOMPETE cover + screens | `public/work/kompete/` | HUD, lobby, store — draft stays hidden until facts arrive |
| 8 | Mintavibe, TurnkeyTix, RPA, EXAT Homes covers | `public/work/<slug>/cover.jpg` | Can be exported from your Behance boards |
| 9 | Game UI collection | `public/work/game-ui-collection/` | 3 covers + 4–6 captures each (Legacy Battle Royal, Taxa's Hold'em, Roulette) |
| 10 | Client logos (optional) | `public/logos/*.svg` | Only with permission; otherwise text logos stay |

Every image needs one line of alt text — I'll draft them from your captions.

## B. Facts to confirm (numbers currently hidden in production)

| Where | Placeholder | What I need |
|---|---|---|
| Home numbers, Open Omaha | **+40% conversion** | Confirm the figure, what converted (lobby → first hand? visitor → deposit?), and the measurement window |
| Compass POS hero | **< 30 min cashier onboarding** | Real figure, or a different metric: merchants live, locations, kiosk share of orders, support-ticket drop |
| Compass POS | Team: PMs / engineers count · launch date · platforms (Android? Windows? iPad?) · was there research (interviews, site visits, pilots)? | One paragraph is enough |
| AML Watcher | Timeline (months) · did the −25% dev-time / $5k figure come from this project or RPA? | |
| KOMPETE | Studio/client name (can be "confidential"), platforms, timeline, your exact scope, any launch numbers | Without these the case study stays a draft |
| Services | Typical timelines (6–12 weeks etc.) | Approve or edit the ranges in `src/content/services.json` |
| About | Tools beyond Figma (Protopie? After Effects? Jira? Unity?) · "Beyond work" 2 sentences (optional) | |

## C. Links & accounts

| Item | Used for | Status |
|---|---|---|
| **Cal.com booking link** | Every "Book a call" button (falls back to email until set) | ✅ received 2026-09-04 |
| **Upwork profile URL** | Footer, contact, JSON-LD `sameAs` | `src/data/site.ts` |
| **Resend** account + API key | Contact form delivery (works in "log only" mode until then) | ✅ key received; domain verified 2026-09-04 — sends from `connect@raheelqureshi.com` |
| **Supabase** project URL + keys · **`DATABASE_URL`** | Storing every submission in Postgres (`public.contact_submissions`) | ✅ URL + anon/service keys received; ⚠ still needed once: `DATABASE_URL` (Supabase → Connect → Session pooler URI with the database password) so `npm run db:migrate` can create the table |
| **Cloudflare Turnstile** site + secret keys | Spam protection (skipped until set) | ✅ keys received; still needed: add `localhost`, `raheelqureshi.com` and `*.vercel.app` to the widget's Domains (error 110200 otherwise) |
| **GA4** measurement ID · **Cloudflare Web Analytics** token · **Bing Webmaster** verification code | Analytics (GA4 only after consent) | ⚠ GA value supplied is a numeric id — need the `G-XXXXXXXXXX` measurement ID (Admin → Data streams → Web); CF token and Bing code still missing |
| **Vercel** account · **raheelqureshi.com** DNS | Deployment | Phase 14 |

## D. Testimonials (section hidden until at least one is published)

For each: quote · name · role · company · source (Upwork / LinkedIn / direct) · **written permission to publish** · optional photo · which project it relates to. Paste them in any format; I'll place them in `src/content/testimonials.json`.

## E. Profile hygiene (5 minutes, high impact)

- Behance bio says "6 years" — resume says 9+. Align to 9+.
- Behance/LinkedIn (and the downloadable resume PDF) still show the personal Gmail — switch them to connect@raheelqureshi.com; the site itself never uses the Gmail address.
- 360SynergyTech title: "Senior Product Designer" (resume) vs "Product Design Consultant" (Behance). Pick one; mirror it on LinkedIn.
- "Modernize Games — Game UI/UX Designer" appears on Behance but not on the resume. Add it or remove it.
- Behance services listed "from US$200" undercut the senior positioning — remove or reprice.
- Fifty Cats (Jul 2022–Jun 2023) overlaps 360SynergyTech; the site labels it "remote contract". Confirm.

## F. Spanish

The UI, home, services, about and contact pages are translated. Case studies fall back to English with a notice. Tell me when you want case studies translated (I'll draft; you review).
