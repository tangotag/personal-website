# raheelqureshi.com

Personal portfolio of **Raheel Ahmad Qureshi** — Senior Product Designer (fintech, SaaS, games).
Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · MDX case studies · EN/ES · deployed on Vercel.

The full planning trail (positioning, reference audit, IA, content, project strategy, case-study framework,
design system, UX/motion spec, technical architecture, implementation plan, content request) lives in
[`docs/`](docs/). Start with [`docs/10-implementation-plan.md`](docs/10-implementation-plan.md) for status
and [`docs/11-content-request.md`](docs/11-content-request.md) for what the site still needs from Raheel.

## Scripts

| Command             | What it does                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run dev`       | Dev server (Turbopack) at http://localhost:3000                                                 |
| `npm run build`     | Production build (`prebuild` validates content first)                                           |
| `npm run start`     | Serve the production build                                                                      |
| `npm run lint`      | ESLint                                                                                          |
| `npm run format`    | Prettier (writes)                                                                               |
| `npm run typecheck` | `next typegen` + `tsc --noEmit`                                                                 |
| `npm run validate`  | Message-catalog parity, MDX frontmatter (zod), cover/alt presence, filter coverage, JSON schemas |
| `npm run test`      | Vitest unit tests (`tests/unit`)                                                                |
| `npm run test:e2e`  | Build, then Playwright e2e against the production server                                        |
| `npm run e2e`       | Playwright only (assumes a build exists); test servers use port 3100 so `npm run dev` keeps 3000 |
| `npm run lhci`      | Build with a same-origin site URL, then Lighthouse (mobile) with budgets on the main routes     |

First time only: `npx playwright install chromium`.

Lighthouse runs through `scripts/lighthouse.mts` (Playwright's Chromium, no chrome-launcher — it fails on
Windows). Budgets: accessibility/best-practices/SEO ≥ 95, performance ≥ 90 (temporary — target 95, see docs/10 Phase 12), CLS ≤ 0.02, LCP ≤ 1.8 s (warn).
Run it with `node`, not `tsx` — esbuild's `__name` helper breaks Lighthouse's in-page functions.

## Environment

Copy `.env.example` to `.env.local`. Nothing is required for local development:

- **Contact form** works without keys — messages are logged to the server console and the UI shows success.
  Set `RESEND_API_KEY` (+ `CONTACT_FROM` on a verified domain) to send email, and the Turnstile keys to
  enable the anti-spam check. The Turnstile widget must list every hostname it runs on (Cloudflare
  dashboard → Turnstile → widget → Domains): add `localhost` for development, `raheelqureshi.com`, and
  the Vercel preview domain — otherwise the widget fails with error 110200. Locally, keep Cloudflare's
  test key pair in `.env.local` (always passes, no domain check) and the real pair in `.env`/Vercel.
- **Database**: with `SUPABASE_PROJECT_URL` + `SUPABASE_SERVICE_ROLE_KEY` (or the anon key) every submission
  is also stored in `public.contact_submissions` (email first, database second; the visitor only sees an
  error if both fail). Create the table once with `npm run db:migrate` — it needs `DATABASE_URL`, the
  Session-pooler URI from Supabase → Connect; the migration in `supabase/migrations/` is idempotent.
  Without the keys the form is email-only.
- **Automated tests never touch real services**: `test:e2e`/`lhci` build with Cloudflare's test site key
  and run the server with the always-pass test secret, an empty Resend key and no database keys.
- **Analytics**: Cloudflare's cookieless beacon loads when `NEXT_PUBLIC_CF_BEACON_TOKEN` is set; GA4 loads
  only after the visitor accepts the consent bar and `NEXT_PUBLIC_GA_ID` holds the *measurement ID*
  (`G-XXXXXXXXXX`, from GA Admin → Data streams → Web) — the numeric property/stream id will not work.
- **Calendar**: `NEXT_PUBLIC_CAL_LINK` turns every "Book a call" into a Cal.com link (mailto until then).

## Project structure

```
src/
  app/[locale]/        routes: /, /work, /work/[slug] (+ OG image), /services, /about, /contact, dev/components
  app/                 robots.ts · sitemap.ts · proxy.ts (next-intl routing; Next 16 name for middleware)
  components/          ui · layout · sections · portfolio · case-study · forms · motion · providers
  content/work/        case studies as MDX (<slug>.<locale>.mdx)
  content/*.json       services · experience · testimonials · faq (zod-validated, localized fields)
  data/                site constants (name, email, socials, availability) · nav
  lib/                 content loader · mdx (compile/run) · data · email (Resend) · turnstile · json-ld · cn
  types/               zod schemas + inferred types (work, content)
  styles/tokens.css    design tokens, light/dark, exposed to Tailwind via @theme
messages/              en.json · es.json (UI strings; parity enforced at build)
public/                resume PDF · work/<slug>/ assets · images/portrait.jpg
docs/                  planning documents (01–11)
tests/e2e              Playwright: smoke, navigation, home, work, case-study, pages, responsive matrix
```

## Adding a case study

1. Create `src/content/work/<slug>.en.mdx` (optionally `<slug>.es.mdx`) following the frontmatter schema in
   `src/types/work.ts` and the section order in [`docs/06-case-study-framework.md`](docs/06-case-study-framework.md).
   Available MDX components: `Section`, `TLDR`, `Figure`, `Gallery`, `Compare`, `Callout`, `Metric`,
   `Results`, `Quote`.
2. Drop assets in `public/work/<slug>/` — `cover.jpg` (1600×1000) plus screens; `loop.mp4`/`loop.webm` optional.
3. Every `<Figure>` needs `alt`. Any result with `status: "confirm"` and any `draft: true` entry stays out of
   production builds until removed.
4. `npm run validate` fails the build on invalid frontmatter, missing covers or alt text, or a filter with
   no projects.

## Conventions

- Server Components by default; client islands only for menus, toggles, forms, the reveal observer, count-up
  and the filter grid. No animation library: motion is CSS (transitions, keyframes, scroll-driven
  `animation-timeline`, View Transitions API) and honours `prefers-reduced-motion`.
- Design tokens are CSS variables in `src/styles/tokens.css`; custom type utilities (`text-h1`, `text-lead`…)
  are registered with tailwind-merge in `src/lib/cn.ts`.
- Structured data goes through `src/lib/json-ld.ts`.
- Only the message namespaces client islands need are sent to the browser (`clientMessages()` in the locale
  layout) — add a namespace there when a new client component reads one.
- Line endings are LF (`.gitattributes`).
