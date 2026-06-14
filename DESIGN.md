# Design

The visual system for LitaBluma. Source of truth lives in code at
[src/styles/index.css](src/styles/index.css) (Tailwind v4 `@theme` tokens); this
document explains the intent so variants stay on-brand.

## Theme

**Two worlds, one home.** The app runs two deliberately distinct surfaces:

- **Child mode** (`.child-scope`) — a *drenched*, immersive garden. Color is the
  surface. Warm, deep, alive. Display type, big touch targets, almost no chrome.
  The scene (sky → sun → hills → soil → growing plant) carries the meaning; UI
  cards are frosted and used sparingly so the world reads through them.
- **Parent mode** (`.parent-scope`) — a *restrained*, calm workspace. A cool,
  faintly green-tinted near-white with one grounded green accent and white
  panels. Familiar, operational, the tool disappears into the task.

Crossing from child to parent is a felt boundary (the parental-gate keypad), not
a tab switch.

## Color

All tokens are OKLCH. Defined in `@theme`; consumed as Tailwind utilities
(`bg-leaf-500`, `text-ink-700`, …) and directly in the SVG garden via `var()`.

**Garden (child):**
- `leaf` 50–900 — primary greens (hue ~150–158), the growth color.
- `sun` 100–500 — warm golden light (hue ~72–88); the *recognition* accent. Never a warning.
- `sky` 100–300 — cool backdrop wash (hue ~230–235).
- `soil` 100–500 — grounding warm browns (hue ~52–72).
- `bloom` 200–500 — soft rose flower accent (hue ~356–2). A flower color, **not** an error red.

**Parent (operational):**
- `ink` 50–900 — cool, faintly green-tinted neutrals (hue ~160–210). `ink-50` is the body; deliberately **not** warm cream. Text uses `ink-700/800/900` for AA contrast.
- `calm` 100–700 — a grounded forest-green accent (hue ~160). Shares brand DNA with `leaf` but quieter and more serious. Used for primary actions, selection, and nudges only.

**System-only signals** — `--color-danger` (red), `--color-warning` (amber),
`--color-info` (blue). Reserved for real system state (failed save, offline).
**Never used for behavior outcomes.** `not_yet` is neutral `ink`, not red.

Color strategy: child = **Drenched**; parent = **Restrained**.

## Typography

Three self-hosted variable families (no external requests):

- **Inter Variable** (`--font-ui`) — all parent-mode UI. One family carries
  headings, labels, buttons, data. Fixed rem scale.
- **Fredoka Variable** (`--font-display`) — child-mode headings. Rounded,
  friendly, distinctly display; paired with Nunito on a geometric-vs-humanist
  contrast axis.
- **Nunito Variable** (`--font-rounded`) — child-mode body. Humanist, rounded,
  highly legible for new readers; generous size and line-height.

Headings get `text-wrap: balance`; prose gets `text-wrap: pretty`. No fluid
clamp display sizes in the product surface.

## Spacing & Layout

- Mobile-first. Child mode centers on `max-w-md`; parent mode on `max-w-2xl`.
- Radii: `--radius-card` (1.5rem, child garden cards), `--radius-panel` (1rem,
  parent panels), `--radius-pill` (buttons, chips).
- Elevation tokens: `--shadow-panel` (parent, subtle), `--shadow-float` (child
  cards, soft depth), `--shadow-pop` (toasts).
- Semantic z-scale: `--z-sticky` < `--z-overlay` < `--z-modal` < `--z-toast`.
  No magic numbers.

## Components

- **Button** (`components/shared/Button.tsx`) — variants `primary` / `soft` /
  `ghost` / `child`; sizes `md` (≥44px) / `lg` (≥56px child touch floor). Full
  hover / active / focus-visible / disabled states.
- **Panel** / **GardenCard** (`components/shared/Card.tsx`) — the two surface
  cards, one per world.
- **ProgressBar** — leaf→sun gradient growth bar; never red.
- **GardenIllustration** (`features/garden/`) — the centerpiece: a self-contained
  SVG scene whose plant grows seed → sprout → plant → flower → tree →
  butterflies, with gentle sway, sun rays, and drifting butterflies.
- **ParentalGate** — numeric keypad with PIN dots; calm, large targets.
- Outcome control (in ParentDashboard) — a 3-way segmented group
  (completed = leaf, tried = sun, not_yet = neutral ink), `aria-pressed` state.

## Motion

- **Parent:** 150–250ms, state-only (hover, selection, toast pop-in). No
  page-load choreography.
- **Child:** ambient life — `sway` (plant), `sun-rays` (slow rotate), `drift`
  (butterflies), staggered `rise-in` for the moments list, `pop-in` for toasts.
- Easing: `--ease-out-quart`, `--ease-out-expo`. No bounce/elastic.
- **Reduced motion:** every animation is disabled/instant under
  `prefers-reduced-motion: reduce` (global base rule). The garden stays fully
  legible static.

## Accessibility

- WCAG 2.1 AA contrast; behavior never relies on color alone (icon + label +
  color on every outcome).
- Focus-visible outline (calm green) on all interactive elements.
- Child touch targets ≥56px; parent ≥44px.
- `aria-live` on the garden and toasts; `role="group"` + `aria-pressed` on the
  outcome control.
