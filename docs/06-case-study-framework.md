# 3B — Case Study Framework

One storytelling system, three lengths. Every case study is an MDX file with typed frontmatter and a fixed section order; the *template* decides which sections are mandatory.
**Status:** Draft for approval

---

## 1. Principles
1. **Lead with the outcome.** The result appears in the hero, not at the bottom.
2. **Every section earns its place.** Optional sections are omitted, never left thin.
3. **Length budget.** Full ≤ 1,800 words / ≤ 25 images · Standard ≤ 1,100 / ≤ 15 · Compact ≤ 500 / ≤ 8. Reading time shown in the hero.
4. **Hiring managers skim, clients scan.** A sticky mini-TOC and "TL;DR" box serve both.
5. **No fabricated numbers.** Where a metric is unknown, the Results section states qualitative outcomes; placeholders never ship.

## 2. Section catalogue (from the workflow doc, consolidated to 14)
| # | Section | Full (hero) | Standard (featured) | Compact (secondary) | Notes |
|---|---|---|---|---|---|
| 1 | Project hero — title, hook, cover, meta (role · timeline · platform · industry · team), 1–3 headline results | ● | ● | ● | Results chips in hero |
| 2 | TL;DR — 3 bullets: problem / what I did / result | ● | ● | ● | Sticky on desktop |
| 3 | Context & business goal | ● | ● | ○ | Merge "Overview/Context/Business goal" |
| 4 | Users | ● | ○ | — | Personas only if research-backed |
| 5 | My role & team | ● | ● | ● | Explicit about what you did *not* do |
| 6 | Constraints | ● | ○ | — | Hardware, offline, regulation, timeline |
| 7 | Research & existing UX problems | ● | ○ | — | Merge "Research + Existing UX problems" |
| 8 | Flows & information architecture | ● | ○ | — | One diagram beats paragraphs |
| 9 | Exploration & wireframes | ○ | ○ | — | Max 4 images; show the rejected option |
| 10 | Design system | ● | ○ | — | Tokens/components; hero shows multi-surface system |
| 11 | Final solution & key screens | ● | ● | ● | The bulk of images live here |
| 12 | Interaction & motion | ○ | ○ | — | Short loops only |
| 13 | Development collaboration | ● | ○ | — | Where the −25% story is told |
| 14 | Results & learnings | ● | ● | ● | Metrics + 3 learnings + "what I'd do next" |
| — | Next project + contact CTA | ● | ● | ● | Auto-rendered |

● mandatory · ○ optional · — omitted

## 3. Frontmatter schema (preview of `types/work.ts`)
```yaml
slug: compass-pos
title: "Compass POS — an AI-powered restaurant POS and kiosk ecosystem"
hook: "Designing the system restaurants run their whole day on."
template: full            # full | standard | compact | collection
tier: hero                # hero | featured | secondary | collection
client: "Cygnus Payments"
role: "Senior Product Designer"
team: "1 designer · 2 PMs · 8 engineers"     # [CONFIRM]
timeline: "Jul 2025 – present"
platforms: ["POS terminal", "Kiosk", "KDS", "Customer display", "Web admin"]
industry: ["Fintech", "Hospitality"]
tags: ["POS", "Kiosk", "Design system", "AI", "Offline-first"]
results:
  - { value: "5", label: "surfaces, one design system" }
  - { value: "< 30 min", label: "cashier onboarding", status: "confirm" }   # hidden until confirmed
cover: /work/compass-pos/cover.jpg
loop: /work/compass-pos/loop.mp4      # optional
featuredOrder: 1
locales: ["en"]                       # es added when translated
credits: []                           # collaborators for multi-owner work
externalUrl: https://cygnuspay.com/cpos
readingTime: auto
```
`status: confirm` on any result hides it at build time — placeholders cannot leak to production.

## 4. Component vocabulary (MDX)
`<Meta/>` `<TLDR/>` `<Section n="03" title=…/>` `<Figure/>` `<Compare before after/>` `<DeviceFrame kind="pos|kiosk|phone|desktop"/>` `<Gallery cols={2|3}/>` `<Metric/>` `<Callout kind="constraint|insight|decision"/>` `<Flow/>` (SVG) `<Quote/>` `<NextProject/>`

## 5. Collection template (Game UI collection)
Hero (title, 1 paragraph, 3 covers) → per game: title · role · platform · 150 words · 4–6 images → shared "What game UI taught me about product design" (200 words) → next project.

---

## 6. Compass POS + Kiosk — drafted outline (Full template)
> Draft narrative; every fact marked `[CONFIRM]` needs your check. Word budget 1,800.

**Hero.** *Compass POS — an AI-powered restaurant POS and kiosk ecosystem.* Hook: "Designing the system restaurants run their whole day on." Meta: Senior Product Designer · Cygnus Payments · Jul 2025–present · POS · Kiosk · KDS · Customer display · Web admin · Fintech/Hospitality. Results chips: "5 surfaces, 1 design system" · "Offline-first ordering & payments" · `[CONFIRM metric]`.

**TL;DR.** Independent restaurants were stitching together POS, online ordering, timekeeping and reporting from different vendors. I designed Compass as one system — front-of-house to back-office — sold with hardware as a ~$3,000 bundle, with AI reporting and support built into daily workflows rather than bolted on.

**03 Context & goal.** Cygnus Payments is a US payments ISO moving from reselling third-party POS to owning the product. Goal: a POS ecosystem competitive with Toast/Square/Clover-tier products at a price independent restaurants accept, differentiated by AI insights, dual pricing and offline resilience. `[CONFIRM business framing]`

**04 Users.** Owner-operator (reports, menu, pricing, staff) · cashier/server (speed, errors, tips) · kitchen (KDS clarity, timing) · customer at kiosk (first-time, in a queue) · Cygnus support/sales (onboarding, "The Bridge" admin). `[CONFIRM research done: interviews? site visits? pilot merchants?]`

**05 Role & team.** Sole product designer owning strategy, IA, flows, UI, design system and handoff across all surfaces; partnered with `[CONFIRM]` PMs and engineers; did not do: hardware selection, payment-processor integration.

**06 Constraints.** Fixed hardware (screen sizes, touch, printers) · must work offline and reconcile later · PCI/dual-pricing disclosure rules · staff turnover → learn in one shift · kiosk accessibility (reach, contrast, time-outs) · aggressive timeline `[CONFIRM]`.

**07 Research & existing problems.** Audit of incumbent POS UX (modifier hell, hidden discounts, tip flows), kitchen observation, support-ticket themes `[CONFIRM what actually happened]`.

**08 Flows & IA.** Diagram: order → modify → pay (dual pricing) → kitchen → close; kiosk path; admin path. Nine modules mapped to five surfaces.

**10 Design system.** Shared tokens across POS/kiosk/KDS/admin; large-touch component set; states for offline/queued sync; role-based navigation.

**11 Final solution.** Order screen · modifiers · payment & tipping · offline banner & sync · KDS board · kiosk attract → order → pay · Bridge admin: live sales, AI reports, employee time. `[ASSET: 8–12 screens, POS/kiosk device photos]`

**12 Interaction.** Order-line gestures, KDS bump animation, kiosk idle timeout — short loops.

**13 Development collaboration.** Component specs, redlines, offline-state matrix, design QA per release; how AI report layouts were prototyped with real data.

**14 Results & learnings.** Metrics `[NEEDED]` (merchants live, kiosk order share, onboarding time, support tickets) · Learnings: design for the worst shift, not the demo; one system beats five apps; AI belongs in workflows, not dashboards · Next: `[CONFIRM roadmap items you can share]`.

---

## 7. Decisions requested
1. Approve the 3-template system and the mandatory/optional split.
2. Approve the Compass outline direction; send the `[CONFIRM]`/`[NEEDED]` facts and 8–12 screens when ready.
3. Confirm Game UI as a *collection* (one page) rather than three separate case studies.
