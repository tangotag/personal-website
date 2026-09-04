# 4B — Detailed UX + Responsive + Motion Specification

Screen behaviour for every page and the motion system. Breakpoints: **Mobile** < 768 · **Tablet** 768–1023 · **Desktop** ≥ 1024.
**Status:** Draft for approval

---

## 1. Global

### Navigation
| | Desktop | Tablet | Mobile |
|---|---|---|---|
| Layout | logo left · links centre · EN/ES + theme + "Let's talk ↗" right | logo · links (no labels for toggles) · CTA | logo · theme · hamburger |
| Behaviour | transparent → blurred surface after 80px; hides on fast scroll-down, returns on scroll-up | same | same; menu = full-screen overlay, links stagger in (60ms), email + socials + status pill at bottom; body scroll locked; `Esc` closes; focus trapped |
| Active state | accent dot under current section/page | same | list item accent |

Skip link → `#main`. Header height reserved (no CLS).

### Page shell
Section rhythm `--section-y`; every page ends with `ContactCTA`; no infinite scroll anywhere; pagination not needed (≤ 12 case studies).

---

## 2. Homepage

| # | Section | Layout (desktop) | Hierarchy & content | CTA | Interaction | Tablet | Mobile |
|---|---|---|---|---|---|---|---|
| 00 | Marquee | full-bleed strip, 36px, hairline bottom | mono uppercase items | — | 40s linear loop, pause on hover | same | same, 32px |
| 01 | Hero | 12-col: text 7 cols, portrait 5 cols right, min-height 88vh | eyebrow → H1 display → lead → 2 buttons → micro-line; status pill above eyebrow | Start a project (primary) · Download resume (secondary) | H1 lines mask-reveal (see §7); portrait 4% parallax; "actually enjoy" gets accent sweep 300ms after reveal; scroll cue fades at 10% scroll | text 8/12, portrait 4/12 | stacked: portrait 1:1 crop 200px top-right → text; buttons full-width; min-height auto |
| 02 | Two paths | 2 equal cards, gap 24 | eyebrow · sentence · arrow | See experience · See services | hover: arrow slides 6px, border accent | 2 cards | stacked |
| 03 | Selected work | hero card spans 12 cols (media 8 / text 4 side-by-side); 3 featured in 3-col grid | eyebrow `02 / Selected work` · h2 · lead · right action "All work ↗" | card → case study | hover glow/scale; loop plays in-view | hero stacked (media over text); featured 2-col | all stacked; loops autoplay muted in-view (data-saver → stills) |
| 04 | Numbers | 5 stats in a row, hairline dividers | stat display · label small | — | count-up on reveal once | 3 + 2 | 2-col grid, hairlines |
| 05 | Sound familiar? | 2 cols: pains left (4 items, mono numbers), answers right | h2 · pairs | "Start a project" ghost | hover pair highlights both sides | stacked pairs | stacked |
| 06 | Services teaser | 7 cards, 3-col (last row 1 wide) | title · 1 line · ↗ | All services ↗ | hover glow | 2-col | 1-col, or horizontal scroll-snap row |
| 07 | Where I've worked | logo strip + 3-line text (8 cols) | eyebrow · text · "Full story ↗" | About | logos monochrome, colour on hover | same | logos wrap 3/row |
| 08 | Testimonials | 3-col grid (2 rows max) | quote · person · project link | — | none; static | 2-col | scroll-snap carousel, dots |
| 09 | How I work | 4 steps, numbered, horizontal with connector line | step · title · what you get | Request a quote (ghost) | step reveals stagger | 2×2 | vertical with left rail |
| 10 | Contact CTA | display h2 (8 cols) · actions | h2 · email/copy · calendar · message · pill | primary: Book a call | copy feedback | same | stacked, buttons full-width |

Home JS budget: hero reveal, marquee, count-up, card hover — nothing else.

---

## 3. Work listing `/work`
- Header: H1 · lead · filter chips (client component; URL `?f=games` so filters are shareable; `aria-pressed`).
- Grid: desktop 3-col (hero card spans 2), tablet 2-col, mobile 1-col. Filtering animates with layout transitions (Motion `layout`), 300ms; reduced motion → instant.
- Empty filter state impossible (every filter has ≥ 1 item) — assert at build.
- Collection card (Game UI) uses a 3-image mosaic cover.
- Bottom: CTA strip.

## 4. Case study `/work/[slug]`
| Region | Desktop | Tablet | Mobile |
|---|---|---|---|
| Hero | full-bleed cover (or loop) 16:9 with 8% parallax; below: title (h1) 8 cols, hook lead, meta grid (role/timeline/platforms/industry/team) 4 cols mono; results chips row | cover 16:9; meta below title 2-col | cover 4:3 crop; meta stacked |
| Progress | 2px accent bar under header | same | same |
| Body | 8-col text column (max 68ch) + 3-col sticky TOC right; figures may break to 12 cols (`wide`) or bleed | TOC collapses to top dropdown | dropdown TOC; figures full-width |
| Sections | `SectionHeader` numbered per template; `Callout`, `Compare` (drag), `Gallery` (2/3 cols, lightbox on click, `Esc`/arrows) | galleries 2-col | galleries 1-col; lightbox swipe |
| End | Results block (metrics 3-up) · Learnings list · Next project card (full width, cover + title) · ContactCTA | same | stacked |
Reading time in meta; `[CONFIRM]`-status results hidden; images `loading=lazy` except cover; alt text required (build fails without).

## 5. Services `/services`
Hero (h1 + lead + "Request a quote" anchor button) → 7 `ServiceCard`s in 3-col grid (anchors `#end-to-end`, …) → each card expands in place? **No** — clicking scrolls to a detail block below the grid (accordion-free, scannable) → engagement models 3 cards → process 4 steps (expanded "what I need from you") → quote form (2 cols: fields left, "what happens next" right) → FAQ (`<details>` native, styled; one open at a time optional) → client testimonials → ContactCTA. Tablet 2-col; mobile stacked.

## 6. About `/about`
Hero: photo 5 cols (portrait 4:5, media frame) + H1/story 7 cols → "What I bring" 3 cards → timeline (`ExperienceEntry` list; hover reveals role tags) → skills grouped chips (5 groups) → awards & certs 2-col → education → Download resume (primary) → ContactCTA. Mobile: photo first (4:5 → 1:1 crop), all stacked.

## 7. Contact `/contact`
2 cols (7/5): form left, details right (email copy, calendar button that opens Cal.com in a modal on desktop / new tab on mobile, socials, location + live local time). Form validation inline on blur; submit → pending state → success card replaces form with calendar prompt; error → inline banner + preserved input. FAQ below. Mobile: details first (email/calendar are the fastest paths), then form.

---

## 8. Motion system

| Category | Spec | Reduced motion |
|---|---|---|
| **Entrance (sections)** | `opacity 0→1, y 24→0`, 600ms `--ease-out`, trigger at 15% in view, once; children stagger 60ms (max 8) | opacity only, 200ms |
| **Hero text reveal** | each H1 line clipped, `y 110%→0`, 800ms, stagger 90ms; lead + buttons follow at 300ms; portrait `scale 1.06→1` + `opacity`, 1000ms | fade 200ms |
| **Accent sweep** | pseudo-element `scaleX 0→1` behind key phrase, 400ms, 300ms after reveal | static highlight |
| **Marquee** | translateX loop 40s linear, duplicated content, `pause` on hover/focus | static wrapped row |
| **Count-up** | numbers 0→value, 1200ms ease-out, once, tabular nums | show final |
| **Project card hover** | media `scale 1.03` 400ms · border → accent · glow · ↗ translates (4,-4) · loop plays | no scale; border + ↗ only |
| **Image transitions** | card cover → case-study cover via View Transitions API (`view-transition-name` per slug) where supported; fallback crossfade 250ms | instant |
| **Navigation transitions** | ~~250ms page fade~~ — dropped 2026-09-04: React `<ViewTransition>` around the page made the Suspense-wrapped /work grid re-reveal on hydration (CLS 0.44). Native View Transitions remain for the /work filter grid and cover morphs. | — |
| **Header** | shrink/blur 200ms; hide on scroll-down > 8px/frame, show on scroll-up | same (opacity) |
| **Mobile menu** | overlay `clip-path` from top 400ms; items stagger 50ms; close reverse 250ms | fade |
| **Scroll behaviour** | Native scroll everywhere (decided 2026-09-04 — no Lenis); **no scroll-jacking, no pinned sections, no infinite scroll** | — |
| **Parallax** | hero portrait 4%, case-study cover 8%; transform-only, rAF-throttled | off |
| **Sticky** | header; case-study TOC + progress bar; mobile "Start a project" pill appears after hero, hides near footer | same, no animation |
| **Filter transitions** | Motion `layout` 300ms | instant |
| **Buttons/links** | hover 150ms colour; underline draw 200ms; primary lift 2px | colour only |
| **Cursor** | pointer devices only: 12px dot follows cursor at 0.15 lerp; on project cards grows to 64px with "View ↗" label; hidden over text/inputs. **Feature-flagged** — can be removed in one line | off |
| **Page load** | no preloader; fonts `display: swap` with size-adjust fallbacks; hero reveal covers font swap | — |

Performance rules: transforms/opacity only; CSS transitions/keyframes and scroll-driven animations rather than a JS animation library (decided 2026-09-04 after measuring `motion`); IntersectionObserver for triggers; no scroll listeners besides the header and the reading-progress bar; the only motion islands are the reveal observer and the count-up. Budget: INP < 200ms, no long tasks > 50ms during hero reveal, 60fps on mid-range Android.

---

## 9. Responsive rules of thumb
- Type is fluid via `clamp`; never below 16px body on mobile.
- Touch targets ≥ 44px; hover-only affordances always have a visible non-hover equivalent (↗, underline).
- Images sized with `sizes` per breakpoint; covers 16:10 desktop, 4:3 mobile via `<picture>` crop.
- Tables in case studies scroll horizontally inside their frame.
- Test devices: iPhone 13/15 (390), Pixel 7 (412), iPad (768/1024), 1280, 1536, 1920.

## 10. Decisions requested
1. Approve the cursor feature-flag approach (ships off by default; you decide after seeing it).
2. ~~Lenis~~ — dropped 2026-09-04; native scroll everywhere.
3. Approve "Chai?" as the hero micro-CTA text or keep "Let's talk".
