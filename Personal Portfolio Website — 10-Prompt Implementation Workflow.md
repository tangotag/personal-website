# Personal Portfolio Website — 10-Prompt Implementation Workflow

## Phase 1 — Discovery & Strategy

### 1A — Resume Analysis & Professional Positioning
**Purpose:** Understand who I am before designing anything.

Claude will analyze my uploaded resume and extract:

- Current professional level
- Career history
- Product design experience
- UI/UX experience
- Software engineering background
- Industries and domains
- Leadership experience
- Technical knowledge
- Tools and technologies
- Education and certifications
- Strongest achievements
- Weak/repetitive resume content
- Missing information
- Portfolio-worthy experience

Claude will then define:

- Recommended professional title
- Secondary positioning
- Core value proposition
- Target employers
- Target roles
- Target clients
- Key differentiators
- Personal brand positioning

**Output:**
`Professional Positioning Document`

---

### 1B — Reference Website Audit & Inspiration Matrix
**Purpose:** Understand the design direction from the websites I provide without copying them.

I will provide reference URLs/screenshots.

Claude will analyze each reference for:

- Navigation
- Hero
- Layout
- Grid
- Typography
- Colors
- Whitespace
- Project presentation
- Case studies
- Animations
- Interactions
- Scroll behavior
- Personal branding
- Contact experience
- Mobile behavior

Claude will create:

| Reference | Feature | Why It Works | Use? | Adaptation |
|---|---|---|---|---|

It must distinguish between:

- Patterns worth adopting
- Patterns worth adapting
- Patterns to avoid

**Output:**
`Reference Design Audit`

---

## Phase 2 — Product Architecture

### 2A — Portfolio Information Architecture & User Journey
**Purpose:** Define the website structure before designing screens.

Claude will determine whether the portfolio should be:

- Single-page
- Multi-page
- Hybrid

It will define:

- Sitemap
- Navigation hierarchy
- Homepage structure
- Portfolio structure
- Case-study routes
- About/experience placement
- Resume access
- Contact flow

Claude will also define primary user journeys for:

- Recruiter
- Hiring manager
- Design leader
- Potential client

Example:

`Landing → Positioning → Featured Work → Case Study → Experience → Contact`

**Output:**
`Website IA + User Journey Map`

---

### 2B — Content Architecture & Portfolio Storytelling
**Purpose:** Decide what content belongs on the website and how it should be presented.

Claude will map resume information into website content.

Define content for:

- Hero
- About
- Featured projects
- Experience
- Capabilities
- Industries
- Skills
- Design process
- Technical background
- Certifications
- Contact
- Footer

It will also identify:

- Content to remove
- Content to shorten
- Missing content
- Metrics required
- Screenshots/assets required
- Potential NDA issues

No visual design yet.

**Output:**
`Website Content Blueprint`

---

## Phase 3 — Portfolio & Case Studies

### 3A — Project Selection & Portfolio Architecture
**Purpose:** Decide which work should actually be showcased.

Claude will evaluate my projects and classify them by:

- Business impact
- UX complexity
- Visual quality
- Technical complexity
- Leadership
- Research
- Product thinking
- Industry relevance

Then recommend:

- Hero project
- Featured projects
- Secondary projects
- Projects to exclude

For every selected project define:

- Title
- Short description
- Role
- Timeline
- Platform
- Industry
- Responsibilities
- Key problem
- Major contribution
- Expected portfolio value

**Output:**
`Portfolio Project Strategy`

---

### 3B — Case Study System & Reusable Template
**Purpose:** Build one strong storytelling system for every project.

Claude will create a reusable case-study architecture.

Possible structure:

1. Project Hero
2. Overview
3. Context
4. Problem
5. Business Goal
6. Users
7. My Role
8. Constraints
9. Research
10. Existing UX Problems
11. User Flows
12. Information Architecture
13. Exploration
14. Wireframes
15. Design System
16. Final Solution
17. Key Screens
18. Interaction Design
19. Development Collaboration
20. Results
21. Learnings

Claude must determine which sections are mandatory versus optional.

It should prevent excessively long case studies.

**Output:**
`Case Study Framework`

---

## Phase 4 — Experience Design

### 4A — Visual Direction & Design System
**Purpose:** Establish the visual language before designing pages.

Using outputs from 1A and 1B, Claude will define:

### Visual Direction
- Brand personality
- Light/dark direction
- Typography
- Color philosophy
- Accent system
- Grid
- Spacing
- Borders
- Radius
- Shadows
- Image treatment
- Project mockups
- Iconography

### Design Tokens
- Colors
- Typography
- Spacing
- Radius
- Border
- Elevation
- Breakpoints

### Core Components
- Navbar
- Buttons
- Links
- Project cards
- Tags
- Badges
- Section headers
- Experience entries
- Media frames
- Metric cards
- Contact CTA
- Footer

Claude must avoid generic AI portfolio aesthetics.

**Output:**
`Portfolio Design System Specification`

---

### 4B — Page-Level UX, Responsive & Motion Specification
**Purpose:** Turn the architecture into actual screen behavior.

Claude will specify the UX for:

- Homepage
- Portfolio listing
- Case studies
- About/experience
- Contact
- Navigation

For every section define:

- Layout
- Hierarchy
- Content
- CTA
- Interaction
- Desktop behavior
- Tablet behavior
- Mobile behavior

Also define the motion system:

- Entrance animations
- Project hover
- Image transitions
- Navigation transitions
- Scroll behavior
- Sticky elements
- Page transitions
- Reduced motion

Animations must support UX, not decoration.

**Output:**
`Detailed UX + Responsive + Motion Specification`

---

## Phase 5 — Engineering

### 5A — Technical Architecture & Component System
**Purpose:** Decide how the approved design should be engineered.

Claude will design the production architecture.

Preferred starting stack:

- Next.js
- React
- TypeScript
- Tailwind CSS

Claude must evaluate additional dependencies instead of blindly adding them.

Potential technologies:

- Motion / Framer Motion
- GSAP
- Lenis
- Lucide
- MDX
- CMS
- Analytics

Define:

### Application Structure
```text
src/
  app/
  components/
    ui/
    layout/
    sections/
    portfolio/
    case-study/
  content/
  data/
  hooks/
  lib/
  types/
  styles/
```

Define:

- Component boundaries
- Server vs client components
- Data architecture
- Project schema
- Case-study schema
- Image handling
- Animation architecture
- Theme architecture
- SEO architecture
- Performance strategy
- Accessibility strategy

**Output:**
`Frontend Technical Architecture`

---

### 5B — Production Implementation Roadmap & Acceptance Criteria
**Purpose:** Create the final execution plan before coding starts.

Claude will combine all previous approved outputs into implementation phases.

Example:

**Phase 1**
Project foundation

**Phase 2**
Global design system

**Phase 3**
Navigation + layout

**Phase 4**
Homepage

**Phase 5**
Portfolio listing

**Phase 6**
Case-study engine

**Phase 7**
Case-study content

**Phase 8**
Responsive implementation

**Phase 9**
Motion and interactions

**Phase 10**
SEO + accessibility + performance

**Phase 11**
QA

**Phase 12**
Deployment

For each implementation phase define:

- Objective
- Dependencies
- Tasks
- Components
- Files/modules
- Deliverables
- Acceptance criteria
- Test cases
- Edge cases

Also produce a final checklist covering:

- Responsive QA
- Cross-browser testing
- Accessibility
- SEO
- Core Web Vitals
- Broken links
- Image optimization
- Metadata
- Analytics
- Contact functionality
- Deployment

Claude must NOT start coding in this phase.

**Output:**
`Production Implementation Plan`