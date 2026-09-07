# Project Reality OS — Design System & Content Spec

> Single source of truth for Cursor / AI coding agents.  
> Use this file to implement the Landing Page (Phase I) and all subsequent screens.  
> Do not invent new colors, type scales, or component styles outside this document.

---

## 1. Product Identity

| Field | Value |
|-------|-------|
| Product name | **Project Reality OS** |
| Tagline | Turn daily site reports into real-time project truth |
| Domain (placeholder) | projectrealityos.ai |
| Support email | hello@projectrealityos.ai |
| Tone | Calm, operational, editorial, craft-like. Never flashy SaaS hype. |
| Audience | Site Engineers + Planners / Managers in infrastructure & construction |

---

## 2. Design System

### 2.1 Color Palette

```css
--orange:        #FF8A00;   /* Primary CTA / active state */
--purple:        #4B00FF;   /* Secondary accent (charts, rare) */
--cream:         #FCF9F0;   /* Page background */
--pale-yellow:   #FFF0B8;   /* Card highlight / "Review Needed" / offline callout */
--black:         #171717;   /* Primary text */
--muted:         #4F4B45;   /* Secondary text, captions */
--border:        #1C1C1C;   /* All borders */
--green:         #55B85A;   /* Confirmed / success (status only) */
--charcoal:      #262626;   /* Secondary surfaces / nav */
--white:         #FFFFFF;   /* Card interiors when needed */
/* Red is reserved for "Possible Risk" status only — never brand color */
```

### 2.2 Typography

| Role | Font | Size | Weight | Line-height | Usage |
|------|------|------|--------|-------------|-------|
| H1 | Georgia (serif) | 28–30px | 500 | 1.05–1.08 | Screen titles, hero headline |
| H2 | Georgia (serif) | 22–24px | 500 | 1.15 | Section headers |
| H3 | Inter (sans) | 15–16px | 500 | 1.3 | Card titles, node titles |
| Body | Inter (sans) | 12.5–14px | 400 | 1.45–1.5 | Descriptions, report text |
| Caption / Nav | Inter (sans) | 10–11px | 400–500 | 1.4 | Timestamps, labels, nav links, section labels |

- Section labels: uppercase, 10px, letter-spacing 0.07–0.08em, color `--muted`
- Never use pure black body text on cream for long copy — prefer `--muted` for body, `--black` for headings

### 2.3 Spacing & Layout

- **Content column**: max-width `520–560px`, centered
- **Page padding**: 16px mobile, 20px desktop
- **Vertical rhythm**: 28–36px between major sections
- **Card internal padding**: 18–20px
- **Gaps**: 8–12px between cards / grid items
- **Breakpoints**: 560px (mobile stack), 768px+

### 2.4 Borders, Radius, Shadows

| Element | Border | Radius | Shadow |
|---------|--------|--------|--------|
| Cards, containers | 1.5px solid `#1C1C1C` | 6–7px | None |
| Buttons | 1.5px solid `#1C1C1C` | 4–5px | Primary only: `2px 2px 0 #111` |
| Badges / pills | 1px solid | 3–4px | None |
| Inputs | 1.5px solid `#1C1C1C` | 5px | None |

- **No** soft floating shadows, glassmorphism, or large blurs
- Hover on primary buttons: shift `1px` toward shadow + slight darken

### 2.5 Buttons

**Primary** (Start tracking, Approve, Submit)
```
background: #FF8A00
color: #171717
border: 1.5px solid #1C1C1C
box-shadow: 2px 2px 0 #111
padding: 9px 16px
font-size: 12px
font-weight: 500
border-radius: 5px
```

**Secondary** (See architecture, Cancel, Reject)
```
background: #FCF9F0
color: #171717
border: 1.5px solid #1C1C1C
padding: 9px 16px
font-size: 12px
```

### 2.6 Cards

```
background: #FCF9F0 (or #FFFFFF for nested)
border: 1.5px solid #1C1C1C
border-radius: 7px
padding: 18–20px
```

### 2.7 Images

- Always wrapped in `.img-frame` with `1.5px solid #1C1C1C` + `7px` radius
- Optional caption bar: 10px muted text, top border, cream background
- Prefer construction / infrastructure / field-tech photography
- Aspect ratios: hero ~16:9 or 3:2; grid tiles ~4:3

### 2.8 Icons

- Simple Lucide-style line icons (stroke 1.6–1.8)
- No illustrated mascots or playful characters
- Architecture nodes use small bordered icon boxes

### 2.9 Logo

**Concept** — Plan layer + site layer snap together; orange block = live truth lock.

| Asset | Path | Use |
|-------|------|-----|
| Mark (light) | `assets/logo-mark.svg` | Favicon, nav, app icon on cream |
| Mark (dark) | `assets/logo-mark-dark.svg` | Charcoal / dark surfaces |
| Wordmark | `assets/logo-wordmark.svg` | Docs, decks, lockups |
| Raster preview | `assets/project-reality-os-logo.png` | Social / mockups |

**Construction**
- Outer frame: 32×32, cream fill `#FCF9F0`, 1.5px `#1C1C1C` stroke, ~3px radius
- Back square (plan) + offset front square (site/reality), same stroke language
- Orange lock tile `#FF8A00` at lower-right intersection (only brand accent)
- Wordmark: Georgia / Times — `Project Reality` in `#171717` + `OS` in `#FF8A00`
- Nav lockup: mark 22×22 + 8px gap + wordmark text
- No gradients, glow, soft shadow, or illustrated mascots

**HTML lockup**
```html
<a class="logo" aria-label="Project Reality OS">
  <!-- inline logo-mark.svg -->
  <span class="logo-text">Project Reality<span class="logo-os"> OS</span></span>
</a>
```

---

## 3. Landing Page — Section Inventory & Content

Implement these sections **in order**. Content below is final copy — do not rewrite unless asked.

### 3.1 Header

- Logo: mark + `Project Reality` + `OS` (OS in orange) — see §2.9
- Nav links: Architecture · How it works · Trust
- Compact primary button: `Start free`

### 3.2 Hero

**Eyebrow**  
`INFRASTRUCTURE PROJECT OPERATING SYSTEM`

**H1**  
`Turn daily site reports into real-time project truth`

**Supporting**  
`Report from site, get matched to the plan, and see progress the moment it happens — even when the network doesn’t.`

**CTAs**  
- Primary: `Start tracking your project`
- Secondary: `See the architecture`

**Hero image**  
Construction / site reality photo with caption: `Site reality meets the digital plan`

### 3.3 The Gap (Problem)

**Label**  
`THE GAP`

**H3**  
`Planning and execution still live in different worlds`

**Body**  
`Site engineers write reports in the field. Planners update schedules days later. By the time a delay is visible on the Gantt, the cost has already compounded. Manual matching, stale notes, and patchy connectivity keep the truth locked on paper or in someone’s phone.`

`What should be a continuous loop is still a broken chain of handoffs, emails, and late discoveries.`

**Images** (2-up grid)  
- Field reality (site workers / machinery)  
- Planning desk (laptop + schedules)

### 3.4 Visual Architecture

**Label**  
`VISUAL ARCHITECTURE`

**H3**  
`How Project Reality OS connects field to plan`

**Body**  
`A calm, human-in-the-loop pipeline. AI proposes. Planners decide. The schedule stays truthful.`

**Flow (horizontal, 4 nodes)**  

| Node | Style | Title | Description |
|------|-------|-------|-------------|
| 1 | Default cream | Site Report | Plain text + photos · Offline-first |
| 2 | Orange tint | AI Match Layer | Confidence score · Task linking |
| 3 | Pale yellow | Planner Review | Approve / Reject · Flag risks |
| 4 | Default cream | Live Dashboard | Real-time truth · Audit trail |

**Legend**  
- Orange tint = AI-assisted  
- Pale yellow = Human decision  
- Cream = System of record

**Path cards (2-up)**  
- Site Engineer path: Write report → Local save → Sync → Match confirmation  
- Planner path: Review queue → Confidence tiers → Approve → Dashboard update

### 3.5 How It Works

**Label**  
`HOW PROJECT REALITY OS WORKS`

**H3**  
`Four calm steps. No drama.`

**Body**  
`AI matches unstructured site notes to the live plan. A planner always makes the final call. Nothing is written into the schedule until a human says so.`

**Steps (4-column grid)**  

| # | Label | Icon idea |
|---|-------|-----------|
| 01 | Report | Document |
| 02 | AI Match | Search / radar |
| 03 | Approve | Check circle |
| 04 | Sync | Refresh arrows |

### 3.6 Built for the Field

**Label**  
`BUILT FOR THE FIELD`

**H3**  
`Offline-first by design`

**Body**  
`Write reports with zero connectivity. They save locally and sync the moment the device finds a signal. No data loss. No “try again later.”`

`Remote sites, tunnels, and low-signal zones are not edge cases — they are the normal working environment. Project Reality OS is built for that reality.`

**Callout bar** (pale yellow)  
`Works in remote sites, tunnels, and low-signal zones.`

**Image**  
Engineer using tablet / device on active construction site

### 3.7 Real-time Visibility

**Label**  
`REAL-TIME VISIBILITY`

**H3**  
`One source of truth`

**Body**  
`Every approved report updates the live schedule. Delay alerts surface automatically. Confidence tiers (Confirmed, Review Needed, Possible Risk) give planners an immediate view of project health without manual cross-checking.`

`No more spreadsheet archaeology. No more waiting for the weekly status call to discover what already happened three days ago.`

**Image**  
Dashboard / analytics screen with caption:  
`Live project dashboard — Confirmed / Review Needed / Possible Risk tiers`

### 3.8 Trust & Control

**Label**  
`TRUST & CONTROL`

**Four cards (2×2 grid)**  

1. **Planner in the loop**  
   AI suggests matches and flags risks. A responsible human always approves or rejects. Nothing is auto-written into the schedule.

2. **Confidence tiers**  
   Every match carries a clear score: Confirmed, Review Needed, or Possible Risk. Low-confidence items never slip through.

3. **Audit trail**  
   Who reported, who approved, when it synced. Full history stays attached to the task — no lost context.

4. **Data stays yours**  
   Project data is isolated by organisation and project code. No training on your site notes without explicit consent.

### 3.9 From Site to System (image grid)

**Label**  
`FROM SITE TO SYSTEM`

**4-up image grid** with captions:  
- Plan layer  
- Human + AI loop  
- Planner review  
- System backbone

### 3.10 Closing CTA

**H2**  
`Close the planning-to-execution gap`

**Body**  
`Start with one project. Site engineers keep writing the way they already do. Planners finally see reality as it happens.`

**Primary CTA**  
`Start tracking your project`

**Reassurance (caption)**  
`No credit card · Takes under 3 minutes · Role-based access`

### 3.11 Footer

- Logo: Project Reality OS  
- Line: `Intelligent data capture & schedule-linking for infrastructure teams.`  
- Links: Privacy · Support · hello@projectrealityos.ai

---

## 4. Component Specs (for future screens)

Reusable components that must share the same visual language:

| Component | Notes |
|-----------|-------|
| `Button` | Primary / Secondary variants as defined above |
| `Card` | Cream + 1.5px black border + 7px radius |
| `Badge` | 3–4px radius; green / pale-yellow / red-as-status |
| `Navbar` | Logo left, links + compact CTA right |
| `ReportCard` | Bordered, expandable report text + match info |
| `ConfidenceTierCard` | Three tiers: Confirmed (green), Review Needed (pale-yellow), Possible Risk (red status) |
| `DashboardSummaryCard` | Count tiles matching tier colors |
| `DelayAlertBanner` | Top-of-dashboard urgency banner |
| `ImgFrame` | Border + radius + optional caption bar |

---

## 5. Implementation Rules for Cursor

1. **Single HTML file** for the landing page is acceptable (embedded CSS).  
2. Use Google Fonts: `Georgia` (or system serif) + `Inter`.  
3. All interactive primary buttons must have the offset shadow + hover press.  
4. Never introduce gradients, glass, or large soft shadows.  
5. Keep the content column narrow (≤ 560px).  
6. Images must be framed with the design-system border treatment.  
7. Architecture diagram must be pure HTML/CSS (no external diagram library).  
8. Copy above is final — do not paraphrase unless the user requests changes.  
9. Mobile: stack all grids to single column below 560px.  
10. File name convention: `project-reality-os-landing.html`

---

## 6. Full Screen Inventory (Phase I reference)

1. Landing Page ← **current focus**  
2. Signup / Login (role + project code)  
3. Onboarding (3 screens)  
4. Site Report (daily input)  
5. AI Processing  
6. Match Confirmation (Site Engineer)  
7. Planner Review Queue  
8. Delay & Conflict Detail  
9. Sync & Dashboard Update  
10. Real-Time Project Dashboard  
11. Weekly / Milestone Summary  
12. Report & Task History  
13. Account / Settings

---

## 7. Quick Reference — Key Phrases

- Product: **Project Reality OS**
- Hero promise: **real-time project truth**
- Core loop: **Report → AI Match → Approve → Sync**
- Trust principle: **AI proposes. Planners decide.**
- Offline promise: **No data loss. No “try again later.”**
- Status tiers: **Confirmed · Review Needed · Possible Risk**

---

*End of design.md — use this document as the authoritative source for visual and content decisions.*
