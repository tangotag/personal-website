# 5A — Frontend Technical Architecture

**Environment:** Node 24.20 · npm 11.19 · git 2.55 · Windows 11 · deploy target Vercel · domain raheelqureshi.com
**Status:** Draft for approval (assumes 07/08 as drafted)

---

## 1. Stack & dependency evaluation

| Need | Choice | Evaluated alternatives | Why |
|---|---|---|---|
| Framework | **Next.js (latest stable, App Router) + React 19 + TypeScript** | Astro (Ruben's choice) | Vercel-native, RSC for a mostly-static site, `next/image`, `next/og`, server actions for the form |
| Styling | **Tailwind CSS v4** | v3, vanilla CSS modules | v4's CSS-first `@theme` maps 1:1 to the token table in 07; zero config |
| Content | **MDX files + custom typed loader** (`gray-matter` + `zod` + `@mdx-js/mdx` compile/run — next-mdx-remote dropped: its dev JSX-runtime shim lost attribute props under React 19.2) | Contentlayer (unmaintained), Velite, content-collections, Sanity | You chose MDX; a 120-line loader with a zod schema gives build-time validation without a framework dependency |
| i18n | **next-intl** | next-i18next, Lingui, manual | Best App Router support; `[locale]` segment, `hreflang`, typed messages |
| Motion | **CSS-first** (transitions/keyframes, scroll-driven `animation-timeline: view()`, View Transitions API) + two tiny islands (IntersectionObserver reveal, rAF count-up) | `motion` (Framer), GSAP | Measured 2026-09-04: `motion` added ~114 KB gz to /work and cost ~15 Lighthouse points under 4× CPU throttling; CSS delivers the spec in docs/08 with zero library. Reintroduce a library only for an effect CSS cannot do |
| Smooth scroll | **none** (native) | Lenis, Locomotive | Decided 2026-09-04: native scroll for maximum speed |
| Icons | **lucide-react** | Phosphor, Heroicons | Consistent 1.5px stroke, tree-shaken |
| Theme | **next-themes** | manual | No-flash script, `data-theme` attribute, system default |
| Forms | **Server Action + zod + Resend + Cloudflare Turnstile** | Formspree, API route | Free tiers, no client secrets, spam-proof; auto-reply from your domain (needs DNS records) |
| Calendar | **Cal.com** embed (`@calcom/embed-react`) | link only | Modal on desktop, link on mobile |
| Analytics | **GA4** via `@next/third-parties` · **Cloudflare Web Analytics** beacon · **Bing** verification meta | Vercel Analytics, Plausible | Your choice. Cookieless Cloudflare loads always; GA4 loads after consent (EU/GDPR) — a 2-line consent bar is included |
| OG images | **`next/og`** `ImageResponse` | static PNGs | One template, per-page titles, per-case-study cover |
| Blur placeholders | **`plaiceholder`** at build via script | none | Cheap LCP polish; optional |
| Video | static MP4 + WebM in `public/`, `<video>` islands | Mux | Loops are ≤ 2 MB each; no player needed |
| Testing | **Vitest** (lib/schema) · **Playwright** (+ `@axe-core/playwright`) · **Lighthouse CI** | Jest, Cypress | Fast, Vercel-friendly |
| Lint/format | ESLint (next/core-web-vitals) + Prettier + `prettier-plugin-tailwindcss` | Biome | Standard |
| Package manager | **npm** | pnpm (not installed) | Already present; lockfile committed |

Not added on purpose: CMS, GSAP, Three.js, Lottie, Swiper, Redux/Zustand, Storybook (components are few; a `/dev/components` route behind `NODE_ENV` check replaces it).

---

## 2. Application structure
```
src/
  app/
    [locale]/
      layout.tsx            # html lang, fonts, theme, header/footer, JSON-LD Person
      page.tsx              # Home
      work/page.tsx         # listing (+ ?f= filter)
      work/[slug]/page.tsx  # case study (generateStaticParams)
      work/[slug]/opengraph-image.tsx
      services/page.tsx
      about/page.tsx
      contact/page.tsx
      not-found.tsx
    api/contact/route.ts    # (only if a webhook is needed; otherwise server action)
    sitemap.ts  robots.ts  manifest.ts  opengraph-image.tsx
  components/
    ui/          Button Link Tag Badge StatusPill Marquee ThemeToggle LocaleSwitch Field Callout
    layout/      Header MobileMenu Footer Container Section SectionHeader SkipLink ConsentBar
    sections/    Hero TwoPaths SelectedWork Numbers SoundFamiliar ServicesTeaser WorkedWith Testimonials Process ContactCTA
    portfolio/   ProjectCard ProjectGrid FilterChips CollectionCard
    case-study/  CaseHero Meta TLDR TOC Progress Figure Compare Gallery Lightbox DeviceFrame Metric NextProject mdx-components.tsx
    motion/      Reveal SplitReveal CountUp Parallax Cursor (flagged)
  content/
    work/        compass-pos.en.mdx  open-omaha.en.mdx  …  kompete.en.mdx
    testimonials.json  services.json  experience.json  faq.json
  data/          site.ts (name, email, socials, availability, calendar URL)  nav.ts
  hooks/         useReducedMotion useScrollDirection useCopy useLocalTime
  lib/           content.ts (loader) mdx.ts (rehype/remark) seo.ts (metadata + JSON-LD builders) analytics.ts i18n.ts email.ts (Resend) turnstile.ts
  types/         work.ts (zod schema + inferred types) content.ts
  styles/        globals.css tokens.css (Tailwind @theme) typography.css
messages/        en.json  es.json
public/          resume.pdf  work/<slug>/{cover.jpg,loop.mp4,loop.webm,01.jpg…}  images/portrait.jpg  logos/
scripts/         validate-content.ts  blur.ts  check-links.ts
tests/           unit/  e2e/
```

## 3. Component boundaries · server vs client
- **Server by default:** all pages, layouts, MDX rendering, cards, lists, footer, JSON-LD.
- **Client islands only:** Header (scroll state), MobileMenu, ThemeToggle, LocaleSwitch, Marquee, Reveal/SplitReveal/CountUp/Parallax, FilterChips, Compare, Lightbox, Cal modal, contact form, ConsentBar, Cursor.
- Rule: a client component never imports content; it receives props. Motion wrappers accept `children` so page content stays server-rendered (SEO + no hydration cost for text).

## 4. Data architecture
- `types/work.ts` — zod schema mirroring the frontmatter in 06 (`slug, title, hook, template, tier, client, role, team?, timeline, platforms[], industry[], tags[], results[{value,label,status?}], cover, loop?, featuredOrder?, locales[], credits[], externalUrl?`). Build fails on invalid frontmatter or missing cover/alt.
- `lib/content.ts` — `getAllWork(locale)`, `getWork(slug, locale)` with EN fallback + `fallbackNotice` flag, `getFeatured()`, `getAdjacent(slug)`; results with `status: "confirm"` stripped in production.
- JSON data (`testimonials`, `services`, `experience`, `faq`) also zod-validated; localized fields as `{ en, es }`.
- Filters derived from `industry`/`tags` → fixed filter set validated against content (no empty filters).

## 5. Image & video handling
- `next/image` with `sizes` per breakpoint; covers 1600×1000 source; AVIF/WebP automatic; `priority` only on the hero portrait and case-study cover.
- Blur data URLs generated by `scripts/blur.ts` into `content/.blur.json`.
- Loops: `<video muted loop playsInline preload="none">` + IntersectionObserver play/pause; poster = cover; skipped when `navigator.connection.saveData` or reduced motion.
- All work images under `public/work/<slug>/`; alt text lives in MDX `<Figure alt>` (required prop).

## 6. Animation architecture
- `components/motion/*` wrap `motion` primitives; each reads `useReducedMotion()` and degrades per 08.
- Variants centralised in `lib/motion.ts` (`reveal`, `stagger`, `lineReveal`).
- View Transitions: `next.config` `experimental.viewTransition` + `view-transition-name` on card/hero covers; progressive enhancement.
- Cursor behind `NEXT_PUBLIC_FLAG_CURSOR` (off by default).

## 7. Theme architecture
- `next-themes` with `attribute="data-theme"`, `defaultTheme="system"`, `enableSystem`.
- Tokens in `styles/tokens.css`: `:root` (light) + `[data-theme=dark]` + `@media (prefers-color-scheme: dark) :root:not([data-theme=light])`; Tailwind `@theme` references the CSS variables so utilities stay theme-agnostic.
- `color-scheme` set on `html`; theme-color meta per theme.

## 8. SEO architecture
- `generateMetadata` per page (title template `%s — Raheel Ahmad Qureshi`, description, canonical, `alternates.languages` en/es, OG/Twitter).
- JSON-LD builders in `lib/seo.ts`: `Person` (site-wide; `jobTitle`, `sameAs` LinkedIn/Behance/Upwork, `knowsAbout`), `ProfessionalService` + `Service[]` on `/services` (your requirement), `CreativeWork` per case study, `BreadcrumbList`, `FAQPage` on services/contact.
- `sitemap.ts` with both locales; `robots.ts`; Bing verification meta; `resume.pdf` allowed.
- Semantic headings (one H1 per page), descriptive link text, `lang` per locale.

## 9. Performance strategy
- Static generation for every route (`generateStaticParams` for slugs + locales); contact form via server action (no client fetch libs).
- Fonts self-hosted via `next/font` with `adjustFontFallback`; ≤ 3 families, subset latin + latin-ext (Spanish).
- JS budget: home ≤ 140 KB gzipped first-load; case study ≤ 120 KB. Enforced by Lighthouse CI budgets.
- Targets: LCP < 1.8s, CLS < 0.02, INP < 200ms on Moto G-class; Lighthouse ≥ 95 all categories.
- `next/image` + blur placeholders; `preload` hero portrait; loops `preload=none`.

## 10. Accessibility strategy
- Landmarks, skip link, one H1, focus order = visual order, visible focus (accent ring), `aria-pressed` filters, `aria-expanded` menu/FAQ, dialog semantics for menu/lightbox/Cal modal with focus trap + `Esc`.
- Contrast per token table (all text ≥ 4.5:1; `--fg-faint` only ≥ 18px).
- `prefers-reduced-motion` honoured globally; marquee pausable; no autoplay with sound.
- Forms: labels, `aria-describedby` errors, `aria-live` status, honeypot not focusable.
- Automated: `@axe-core/playwright` on every route in both themes; manual: keyboard-only pass, VoiceOver/NVDA spot check.

## 11. Environment & secrets
`RESEND_API_KEY` · `CONTACT_TO` · `TURNSTILE_SECRET_KEY` · `NEXT_PUBLIC_TURNSTILE_SITE_KEY` · `NEXT_PUBLIC_GA_ID` · `NEXT_PUBLIC_CF_BEACON_TOKEN` · `NEXT_PUBLIC_CAL_LINK` · `NEXT_PUBLIC_SITE_URL` · `SUPABASE_PROJECT_URL` · `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`) · `DATABASE_URL` (migrations only, never at runtime) · flags. Stored in Vercel; `.env.example` committed.

## 12. Decisions requested
1. Approve the custom MDX loader over a content framework.
2. ~~GA4 consent~~ — approved 2026-09-04: consent bar; Cloudflare always, GA4 after accept.
3. ~~DNS records for Resend~~ — done 2026-09-04: `raheelqureshi.com` is verified; mail sends from and replies go to `connect@raheelqureshi.com`.
