# 2A — Website IA + User Journey Map

**Decision inputs:** full multi-page (your choice) · both audiences equally · EN + ES · form + email + calendar
**Status:** Draft for approval

---

## 1. Structure decision
**Multi-page, with a long-form home.** Home does the selling for both audiences; every other page goes one level deeper. Case studies get their own routes for depth, sharing and SEO. Spanish mirrors the whole tree under `/es`.

## 2. Sitemap
```
/                         Home
/work                     Work listing (filterable)
/work/[slug]              Case study (MDX)
/services                 Services + process + FAQ + quote CTA   ← client path
/about                    Story, timeline, skills, awards, resume ← hiring path
/contact                  Form, email, calendar, availability
/resume.pdf               Static PDF (full, un-redacted — your choice)
/es/…                     Spanish mirror of every route above
/sitemap.xml, /robots.txt, /og/[slug] (generated OG images)
Reserved, not v1:  /writing  /playground  /work/games (collection)
```

## 3. Navigation hierarchy
**Header (sticky, shrinks on scroll):** Logo/RAQ mark · Work · Services · About · Contact · [EN/ES] · [theme] · **Let's talk →** (primary button)
**Mobile:** hamburger → full-screen menu with the same items + email + socials + availability pill.
**Footer:** 4 columns — Navigate (Work/Services/About/Contact) · Work (5 case-study links) · Connect (email, LinkedIn, Behance, Upwork, calendar) · Availability + location + time zone. Bottom row: © year · "Built with Next.js" · language switch · back-to-top.

## 4. Page structures

### Home `/`
| # | Section | Job | Primary audience |
|---|---|---|---|
| 00 | Availability marquee | Answer "is he available, for what, from where" | both |
| 01 | Hero — eyebrow, H1, value prop, portrait, CTA "Start a project" + CTA "Download resume", scroll cue | Positioning in 5 s | both |
| 02 | Two paths — "Hiring?" card → About · "Need a designer?" card → Services | Route each audience explicitly | both |
| 03 | Selected work — hero project (large) + 3 featured | Prove it | both |
| 04 | Proof in numbers — 5 stats | Credibility | both |
| 05 | Sound familiar? — 4 client pains → how I solve each | Convert clients | client |
| 06 | Services teaser — 6 cards, "view all" | Convert clients | client |
| 07 | Where I've worked — logo/text strip + 3-line experience summary, "full story →" | Credibility | hiring |
| 08 | Testimonials — 5–6, linked to projects | Trust | both |
| 09 | How I work — 4-step process | Reduce risk | client |
| 10 | Contact CTA — giant heading, email, calendar, form link | Close | both |

### Work `/work`
Intro line · filter chips (All · Fintech & POS · SaaS · Mobile · Games · Web & Brand) · grid of all case studies (hero first) · "Game UI collection" entry · CTA strip.

### Case study `/work/[slug]`
See `06-case-study-framework.md`. Ends with next/previous project + contact CTA.

### Services `/services`
Hero ("Senior product design, on demand") · 6 service cards (anchor each) · engagement models (project · retainer · embedded/full-time) · process (Discover → Define → Design → Deliver, with what you get at each step) · "Request a quote" form (short: name, email, company, service, budget band, message) · FAQ (6) · testimonials (client-only subset).

### About `/about`
Hero with photo + 3-paragraph story (games → SaaS → fintech) · "What I bring" (3 differentiators) · experience timeline (6 roles, tags, dates) · skills grouped (Product · Research · Craft · Leadership · Tools) · awards & certifications · education · "Beyond work" (1 paragraph, optional) · Download resume · contact CTA.

### Contact `/contact`
Availability pill · two columns: left = form (name, email, I'm-a: hiring/client, message) · right = email (copy button), calendar embed/link, LinkedIn/Behance/Upwork, location + time zone with current local time · FAQ (3) · response-time promise.

## 5. Resume access
- Header: none (keep it clean). Hero: secondary CTA "Download resume". About: primary button. Footer: link. `/resume.pdf` served from `public/` with `Content-Disposition: inline` so it opens in-browser; filename `Raheel-Ahmad-Qureshi-Senior-Product-Designer.pdf`.
- ES pages link the same English PDF (unless you supply a Spanish CV).

## 6. Contact flow
1. Any "Let's talk / Start a project" → `/contact` (or `/services#quote` from services cards).
2. Form → server action → Resend email to connect@raheelqureshi.com + auto-reply to sender + success state with calendar link ("Skip the wait — book 20 min").
3. Calendar: Cal.com (free, embeddable) or Calendly — **your pick**; link shown on contact, footer, and form-success.
4. Fallbacks: `mailto:` with prefilled subject; LinkedIn message.
5. Spam: honeypot + Turnstile (Cloudflare, free — you already plan Cloudflare analytics).

## 7. Primary user journeys
| Persona | Goal | Journey | Exit / conversion |
|---|---|---|---|
| **Recruiter** (60 s) | Is he a fit, is he available, get the CV | Marquee → Hero → Numbers → Download resume | PDF + LinkedIn |
| **Hiring manager** (5 min) | Depth of thinking, seniority, collaboration | Hero → Selected work → Compass POS case study (Problem → Role → Solution → Results) → About timeline → Contact | Contact form ("I'm hiring") |
| **Design leader** (10 min) | Craft, process, leadership, judgment | Work → 2 case studies (Compass + a game) → About "What I bring" + awards → Testimonials | Contact / LinkedIn |
| **Potential client** (3 min) | Can he solve *my* problem, what does it cost, how do we start | Hero "Start a project" → Services (Sound familiar → cards → process → FAQ) → one relevant case study → Request a quote | Quote form / calendar |
| **Upwork visitor** (2 min) | Verify the profile is real and senior | Home → Testimonials → Work → Contact | Back to Upwork to hire, or direct email |

Journey rule: **every page ends in a CTA and every case study ends in the next case study.** No dead ends; no infinite scroll.

## 8. i18n architecture (decision)
- `next-intl` with `[locale]` segment; default `en` unprefixed, `es` prefixed. `hreflang` on every page.
- UI strings in `messages/en.json` / `messages/es.json`.
- Case studies: `content/work/<slug>.en.mdx` and optional `<slug>.es.mdx`; if ES missing, render EN with a small "Only available in English" note.
- Language switch preserves the current route.
