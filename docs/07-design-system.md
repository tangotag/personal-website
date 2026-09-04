# 4A — Portfolio Design System Specification

**Inputs:** 01 (positioning), 02 (reference audit), decisions: dark/light toggle · coral-orange accent · expressive motion · no endless scroll · limited cursor.
**Status:** Draft for approval

---

## 1. Visual direction

| Aspect | Decision |
|---|---|
| **Brand personality** | *Engineer's rigor, gamer's delight.* Precise grid and hairlines; one loud accent used like a highlighter, not paint; motion that feels like good game UI — snappy, physical, never slow. |
| **Light/dark** | Dark-first (designed first, default for `prefers-color-scheme: dark`), light theme designed as a warm paper counterpart — not an inversion. Toggle in header; persisted; no flash. |
| **Typography** | Display: **Bricolage Grotesque** (variable, `opsz` 96 at large sizes → tight, characterful, not Montserrat). Body: **Inter** (variable). Metadata/eyebrows: **JetBrains Mono**. All self-hosted via `next/font/google`. |
| **Colour philosophy** | Near-black ink + warm off-white paper; coral-orange accent; a single green reserved for "available". No gradients, no glass. Accent appears in ≤ 5% of any viewport. |
| **Accent system** | `coral-500 #FF5A3C` on dark (6.3:1 vs ink) · `coral-600 #C93415` on light (4.8:1 vs paper — D63A1F measured 4.26:1 and failed AA for 12px numerals). Hover lightens on dark, darkens on light. Soft tint at 14% alpha for backgrounds. |
| **Grid** | 12 columns · content max 1280px · bleed max 1440px · gutters 24px (16px < md) · page margins 20 / 40 / 80px. |
| **Spacing** | 4px base. Section padding fluid `clamp(4rem, 10vw, 9rem)`. |
| **Borders** | 1px hairlines at low alpha (never solid grey). Accent border only on hover/focus. |
| **Radius** | 4 chips · 8 inputs/buttons · 12 cards · 20 media frames · 999 pills. |
| **Shadows** | Dark theme: none; hover uses an accent *glow*. Light theme: soft layered shadow. |
| **Image treatment** | Media frames: 1px hairline + radius 20 + surface-2 background; covers 16:10; hover scale 1.03. No drop-shadowed floating screens. |
| **Project mockups** | Compass: photographic POS terminal + kiosk frames (`DeviceFrame kind="pos|kiosk"`); apps: neutral phone frame, no bezels-with-notch clichés; games: raw in-game captures, full-bleed; web: browser chrome minimal. |
| **Iconography** | Lucide, 20px, 1.5px stroke, currentColor. Arrow-up-right `↗` is the site's signature glyph for links. |
| **Signature details** | Numbered mono eyebrows `01 / Selected work` · availability dot pulse · `↗` on every external link · underline "draw" on text links · coral highlight sweep on the H1's key phrase ("actually enjoy"). |

**Avoid list (generic AI-portfolio):** gradient blobs, glassmorphism, neon glows on everything, 3D floating cards, emoji in headings, "✨", typewriter effects, particle backgrounds, cursor trails.

---

## 2. Design tokens (source of truth → `styles/tokens.css` via Tailwind v4 `@theme`)

### Colour
| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#0B0B0D` | `#F7F4EE` | page |
| `--surface` | `#141417` | `#FFFFFF` | cards, header (blurred at 80%) |
| `--surface-2` | `#1C1C21` | `#EFEBE3` | media frame bg, inputs |
| `--border` | `rgba(244,241,234,.09)` | `rgba(20,20,23,.10)` | hairlines |
| `--border-strong` | `rgba(244,241,234,.20)` | `rgba(20,20,23,.22)` | inputs focus base |
| `--fg` | `#F4F1EA` | `#141417` | text |
| `--fg-muted` | `rgba(244,241,234,.64)` | `rgba(20,20,23,.64)` | secondary text (≥ 4.5:1) |
| `--fg-faint` | `rgba(244,241,234,.40)` | `rgba(20,20,23,.42)` | metadata, only ≥ 18px or with icons |
| `--accent` | `#FF5A3C` | `#C93415` (was D63A1F; 4.8:1 on paper) | links, chips, highlights |
| `--accent-hover` | `#FF7A5C` | `#A82A10` | hover |
| `--accent-fg` | `#0B0B0D` | `#FFFFFF` | text on accent buttons |
| `--accent-soft` | `rgba(255,90,60,.14)` | `rgba(214,58,31,.10)` | tints, selected chips |
| `--success` | `#3DDC97` | `#1B9E6B` | availability dot |
| `--danger` | `#FF6B6B` | `#C62828` | form errors |
| `--focus` | `#FF5A3C` | `#C93415` | 2px ring + 2px offset |

### Typography
| Token | Value | Notes |
|---|---|---|
| `--font-display` | Bricolage Grotesque, 700–800, `opsz` auto | H1/H2, stats |
| `--font-sans` | Inter 400/500/600 | body, UI |
| `--font-mono` | JetBrains Mono 400/500 | eyebrows, meta, code |
| `--text-display` | `clamp(3rem, 7.5vw, 6.5rem)` / 0.95 / -0.03em | home H1 (was 7.25rem; Spanish headline needed the room) |
| `--text-h1` | `clamp(2.5rem, 5.5vw, 4.5rem)` / 1.0 / -0.025em | page H1 |
| `--text-h2` | `clamp(2rem, 3.6vw, 3rem)` / 1.05 / -0.02em | section |
| `--text-h3` | `1.5rem` / 1.2 / -0.01em | card titles |
| `--text-lead` | `clamp(1.125rem, 1.4vw, 1.375rem)` / 1.5 | hero sub, intros |
| `--text-body` | `1rem` / 1.65 | paragraphs (max 68ch) |
| `--text-small` | `0.875rem` / 1.5 | captions |
| `--text-eyebrow` | `0.75rem` mono, uppercase, tracking `.12em` | numbered labels |
| `--text-stat` | `clamp(2.5rem, 5vw, 4rem)` display, tabular nums | numbers block |

### Spacing · radius · border · elevation · breakpoints
- Spacing scale: `1=4 2=8 3=12 4=16 5=20 6=24 8=32 10=40 12=48 16=64 20=80 24=96 32=128 48=192` · `--section-y: clamp(4rem,10vw,9rem)` · `--container: 80rem` · `--bleed: 90rem`.
- Radius: `--r-xs 4 --r-sm 8 --r-md 12 --r-lg 20 --r-full 999`.
- Border: `--bw 1px`; focus ring `2px solid var(--focus)` offset 2px.
- Elevation: `--glow: 0 0 0 1px var(--accent), 0 24px 64px -24px rgba(255,90,60,.45)` (dark hover) · `--shadow-1: 0 1px 2px rgba(20,20,23,.06), 0 8px 24px -12px rgba(20,20,23,.12)` (light) · `--shadow-2: 0 2px 4px rgba(20,20,23,.08), 0 24px 48px -16px rgba(20,20,23,.18)` (light hover).
- Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Design at 390 / 768 / 1280 / 1536.
- Motion tokens: `--ease-out: cubic-bezier(.22,1,.36,1)` · `--ease-in-out: cubic-bezier(.65,0,.35,1)` · `--dur-fast 150ms · --dur 300ms · --dur-slow 600ms · --dur-reveal 800ms`.

---

## 3. Core components

| Component | Anatomy | States / rules |
|---|---|---|
| **Navbar** | 64px (56 mobile) · logo mark "RAQ" mono · links · EN/ES · theme toggle · primary button "Let's talk ↗" | Transparent at top → `surface` @ 80% + blur + hairline after 80px scroll; active link = accent dot under label; mobile: hamburger → full-screen overlay (see 08) |
| **Button** | primary (accent bg, accent-fg text) · secondary (hairline, fg) · ghost (text + ↗) · sizes md 44px / lg 52px · radius 8 | hover: primary lightens/darkens + 2px lift; focus ring; loading spinner; disabled 40% |
| **Link** | inline text + underline 1px at 60% alpha | hover: underline draws to accent; external gets ↗ |
| **ProjectCard** | media frame (16:10, cover or loop) · eyebrow "role · year" · title (h3) · hook · outcome chip · tags · ↗ | hover: image 1.03 scale, border → accent, glow; whole card is the link; loop plays on hover/in-view; sizes: hero (2-col span), standard, compact |
| **Tag / chip** | mono small, hairline, radius 4 | selected = accent-soft bg + accent text; filter chips are toggle buttons with `aria-pressed` |
| **Badge / status pill** | dot + text, radius full | green pulsing dot for available; used in hero, contact, footer |
| **SectionHeader** | eyebrow `01 / Label` · h2 · optional lead · optional right-aligned action link | eyebrow number auto-increments per page |
| **ExperienceEntry** | company · role · dates (mono) · 2-line summary · 3 tags · hairline separator | grid: 3/9 desktop, stacked mobile; current role gets "Now" badge |
| **MediaFrame / DeviceFrame** | hairline + radius 20 + surface-2; `kind: plain|pos|kiosk|phone|desktop` | caption below in small mono; lazy; blur placeholder; `<Compare>` variant with drag handle |
| **MetricCard / Stat** | display number (tabular) · label · optional source note | count-up on reveal (once); `status: confirm` hides |
| **Testimonial** | quote (lead size) · avatar 40px · name · role, company · "view project ↗" | carousel on mobile (scroll-snap), 2–3 grid on desktop; no auto-play |
| **ServiceCard** | title · scope paragraph · 3 tags · "view scope ↗" · timeline | hover glow; links to `/services#slug` |
| **PathCard** (two paths) | eyebrow "Hiring?" / "Need a designer?" · sentence · arrow | large hit area, hover arrow slides |
| **Marquee** | mono uppercase items separated by `·`, 40s linear, pause on hover, duplicated for seamless loop | reduced-motion: static, wraps |
| **ContactCTA** | h2 display size · email w/ copy button · calendar button · "send a message" · status pill | copy shows "Copied ✓" for 1.5s |
| **Form fields** | label above · input 48px · hairline → strong on focus + ring · error in danger + icon · helper text | honeypot hidden; Turnstile below submit |
| **Footer** | 4 columns · tagline · © · EN/ES · back-to-top | hairline top; all links keyboard reachable |
| **ThemeToggle** | icon button sun/moon, 44px hit | announces state; persists via `next-themes` |
| **LocaleSwitch** | `EN · ES` segmented | preserves route; `hreflang` |
| **TOC (case study)** | sticky right rail, mono, active section highlighted | desktop only; mobile → dropdown |
| **Callout** | left accent bar · kind icon · text | constraint / insight / decision |

Accessibility baked in: all interactive ≥ 44px; contrast verified per token above; focus visible everywhere; motion honours `prefers-reduced-motion`.

---

## 4. Decisions requested
1. ~~Font pairing~~ — approved 2026-09-04: Bricolage Grotesque + Inter + JetBrains Mono.
2. Approve the two coral values and the "≤ 5% accent" rule.
3. Approve device-frame approach for Compass (photographic terminal/kiosk) — needs `[ASSET]` photos of the actual hardware.
