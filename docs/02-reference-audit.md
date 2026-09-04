# 1B — Reference Design Audit & Inspiration Matrix

**References:** rafaelkurosawa.com · bramvanvugt.com · rubenmarcus.dev
**Method:** each site loaded in-browser 2026-09-04; DOM, computed styles, fonts, script stack and accessibility tree inspected.
**Status:** Draft for approval

---

## 0. What the three have in common (= your taste, decoded)
| Trait | Kurosawa | Bram | Ruben |
|---|---|---|---|
| Ground | pure black `#000` | near-black `#121212` + off-white `#FDFBF8` sections | pure black `#000`, cream text `#F5F1EA` |
| One saturated accent | yellow `#F5C518` | blue `#2D62FF` (+ orange `#EE4B2B`) | terminal green `#4ADE80` / `#00FF41` |
| Display type | Montserrat, ultra-bold, huge name | Neue Montreal, medium, restrained | Gabarito 63px/500 + JetBrains Mono labels |
| Portrait in hero | duotone, right-aligned | candid photo on couch | halftone/ASCII-treated |
| Availability signal | green dot "Available for work" | "Koffie?" CTA | scrolling marquee: full-time + freelance |
| Section labels | `/work`, `/numbers` | eyebrow words | `01 / Hire me`, `02 / Proof in numbers` |
| Numbers block | "By the numbers" | — | "Shipped, measured." stats grid |
| Testimonials | — | carousel w/ photo, name, role, "view project" | — |
| Footer | giant "Let's craft the next chapter." + email | photo strip + "Klaar om op te vallen?" + email | big contact heading + form |
| Motion stack | GSAP + ScrollTrigger, custom cursor | GSAP full suite + Lenis + Barba, preloader | Lenis only, CSS reveals |
| Tech | static HTML | Webflow | Astro |
| i18n | — | Dutch only | EN / PT toggle |

**Read-out:** you like *dark, editorial-tech, one bold accent, big confident type, a real face, an explicit "I'm available" signal, numbered sections and a footer that closes the sale.* None of the three has a theme toggle — yours will, so the light theme must be designed, not derived.

---

## 1. Inspiration matrix

Legend — **Use?**: ✅ adopt · 🔁 adapt · ❌ avoid

### rafaelkurosawa.com
| Feature | Why it works | Use? | Adaptation for Raheel |
|---|---|---|---|
| Hero: eyebrow name + giant surname + role line + 1-sentence value prop + Download CV + View work | Instant identity and outcome; two CTAs cover recruiter (CV) and client (work) | ✅ | Same skeleton; H1 = positioning line, not surname (surname is long and less memorable) |
| Green-dot "Available for work" + city/year | Removes the #1 recruiter question | 🔁 | Make it a status pill: "Available · full-time & freelance" |
| Slash-prefixed nav labels (`/work`) | Techy, distinctive, cheap | 🔁 | Keep as a subtle mono eyebrow style for section labels; keep nav labels plain for clarity |
| Skills marquee (8 skills, duplicated) | Motion + keyword density without a list | 🔁 | Use for *industries/platforms* instead of skills — "POS · Kiosk · SaaS · Games · Mobile · Web" |
| "By the numbers" (15+ yrs, 20+ designers, awards) | Credibility in 3 seconds | ✅ | 9+ yrs · −25% dev time · +40% conversion · +30% retention · 3 awards |
| Selected cases with counter "02 / 03", role line, 1-line hook, tags, year | Every card sells role + outcome | ✅ | Card schema: role · title · hook · outcome metric · tags · year |
| Work-history articles with 3 tags + date range | Compact resume on-page | ✅ | About page timeline |
| Giant footer CTA "Let's craft the next chapter." | Emotional close, then email | ✅ | "Let's build something people come back to." + email + calendar |
| Custom cursor (`has-cursor`) | Feels crafted | ❌ (limited) | Only a subtle cursor-follow on project cards, and only on pointer devices; respect reduced-motion |
| Montserrat ultra-bold display | Bold | ❌ | Overused; pick a display face with more character (G4) |
| Yellow accent | High contrast on black | ❌ | Taken by this reference; choose your own (G4) |

### bramvanvugt.com
| Feature | Why it works | Use? | Adaptation |
|---|---|---|---|
| Preloader: stacked project images + % counter | Theatrical | ❌ | Costs 3–5 s and LCP; you asked for fast. Replace with a 400 ms hero reveal |
| Candid photo + "Koffie?" (Coffee?) CTA | Human, disarming — clients hire people they like | ✅ | "Chai?" is on-brand for Lahore and memorable; A/B with "Let's talk" |
| "Herkenbaar?" (Sound familiar?) problem-statement block | Speaks to client pain before showing work | ✅ | Home + Services: "Your product works, but users don't stay / devs keep asking questions / …" |
| Project cards with looping *video* thumbnails, year, one-line tagline | Motion sells UI work better than stills | 🔁 | Use short muted MP4/WebM loops for hero + featured; stills for secondary; lazy-load |
| Testimonials carousel: quote, photo, name, role, "view project" link | Social proof tied to evidence | ✅ | You have many reviews; pick 5–6, link each to its case study |
| Light off-white sections alternating with dark | Rhythm, avoids the "black slab" | 🔁 | Dark-first with a warm light theme; use surface-elevation, not alternating bands |
| Footer photo strip + "Klaar om op te vallen?" (Ready to stand out?) | Personality | 🔁 | One photo, not ten |
| GSAP SplitText/Flip/MotionPath + Lenis + Barba | Very expressive | 🔁 | Expressive is what you asked for — but on a Next.js budget: Motion (Framer) + Lenis, GSAP only if a specific effect needs it |
| Blue + orange dual accent | Energetic | ❌ | Two accents muddy a small site; one accent + neutrals |
| Dutch-only, agency-style copy | Fits his market | 🔁 | Your EN/ES toggle instead; copy addresses the reader ("you"), not "we" |

### rubenmarcus.dev
| Feature | Why it works | Use? | Adaptation |
|---|---|---|---|
| Top marquee: "AVAILABLE FOR FULL-TIME ROLES · OPEN TO FREELANCE CONTRACTS · BASED IN …" | Solves your exact "both audiences" problem in one strip | ✅ | Same content, yours: "Available for full-time roles · Open to freelance · Lahore, PKT · Remote worldwide" |
| Hero: "Hello, I'm ___" + big H1 + rotating "I build ___" + two CTAs (Book a project / secondary) | Two-audience hero done right | ✅ | CTA 1 "Start a project" (client) · CTA 2 "Download resume" or "See my work" (hiring) |
| Numbered section eyebrows "01 / Hire me", "02 / Proof in numbers" | Wayfinding + editorial feel | ✅ | Adopt across all pages |
| "Hire me for" service cards: title, 1-paragraph scope, 3 tags, "view scope" | Turns a portfolio into a services page | ✅ | `/services`: 6 cards from your list; each → anchor with scope, deliverables, "request a quote" |
| Stats grid "Shipped, measured." | Proof | ✅ | Merge with Kurosawa's numbers block |
| Client logo strip | Trust | 🔁 | Cygnus, Fifty Cats, 360SynergyTech, Argon, Turtle Studios, Metaverk, Exat Homes — text-logos if no permission for marks |
| EN / PT language toggle | Direct precedent for your EN/ES | ✅ | `/es` routes, toggle in header |
| FAQ section ("What kind of work…", "Is he available…") | Pre-answers client objections; also good for SEO | ✅ | 5 questions on Services + Contact |
| Tech-stack wall (40+ tags) | Completeness | ❌ | Noise. Cap at ~12 tools, grouped |
| ASCII/halftone portrait, "agent-ready", MCP endpoint | Brand gimmick for an AI engineer | ❌ | Not your story. Portrait gets a *clean* duotone or none |
| JetBrains Mono for labels | Techy texture | 🔁 | A mono for eyebrows/metadata only; body stays humanist |
| Blog | Long-term SEO | 🔁 | Out of v1 scope; leave a `/writing` slot in IA |

---

## 2. Consolidated verdicts

**Adopt (build these):** availability marquee/pill · two-CTA hero · numbered eyebrows · numbers block · project card schema (role/hook/metric/tags/year) · services cards with scope · testimonials tied to case studies · problem-statement block · work-history timeline · FAQ · giant footer CTA + email + calendar · EN/ES toggle · Download resume.

**Adapt (take the idea, change the execution):** industries marquee instead of skills · video loop thumbnails (featured only) · light theme designed on its own terms · Motion + Lenis instead of the GSAP kitchen sink · single photo in footer · mono type for metadata only · limited cursor effect on cards only.

**Avoid:** preloader with counter · endless/infinite scroll · custom cursor site-wide · dual accents · 40-tag tech wall · Montserrat-bold display · borrowing any of the three accent colours · ASCII/AI gimmicks · glassmorphism/gradient-blob "AI portfolio" look.

---

## 3. Hypothesis to test in G4 (Visual Direction)
- **Ground:** dark-first (`#0A0A0B`-ish, not pure black — better for the light theme's mirror) with a warm light theme (`#F7F5F0` paper, not white).
- **Accent:** one, and *not* yellow/blue/green. Candidates: warm coral-orange (energy of games, warmth for clients) or electric lime. Decide with mockups.
- **Type:** a display face with character (e.g. a tight grotesk or a soft-serif for contrast) + a humanist sans for body + a mono for metadata.
- **Motion:** expressive *entrances* and *hover* (what you asked for), restrained *scroll* (no scroll-jacking, no endless), 60 fps budget, `prefers-reduced-motion` respected.
- **Imagery:** device mockups for POS/kiosk (hardware is the differentiator — show the terminal, not a floating screen), phone mockups for apps, in-game captures for games.
