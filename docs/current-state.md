# LitaBluma Current State

Last updated: 2026-06-14

## Repository State

- The app is scaffolded and runnable (Phase 0 done; Phase 1 domain core done).
- Stack in place: Vite + React 19 + TypeScript + Tailwind v4 + React Router 7. Vitest for tests, ESLint + Prettier configured.
- The directory is not currently initialized as a git repository.
- Primary product spec: `docs/product-spec.md` (absorbed the former `PRD-LitaBluma-v2.1.md`, which has been removed along with the earlier draft `PRD-app-day-cu-xu.md` and the book-summary source file — book content now lives in `docs/eq-source-material.md`).

## What Exists In Code

- **Build/tooling:** `package.json`, `tsconfig.*`, `vite.config.ts` (Tailwind plugin + Vitest config + `@/*` alias), `eslint.config.js`, `.prettierrc`, `.gitignore`, `index.html`.
- **Design context:** `PRODUCT.md` (register=product, users, principles) and `DESIGN.md` (visual system) at repo root, authored via the `impeccable` skill. The `impeccable` design skill is installed at `.claude/skills/impeccable/`.
- **Design system (redesigned via impeccable):** `src/styles/index.css` — Tailwind v4 `@theme` tokens in **OKLCH** for two deliberately distinct worlds: child = *drenched* immersive garden (`leaf`/`sun`/`soil`/`bloom`/`sky`), parent = *restrained* cool workspace (`ink`/`calm`, not warm cream). Self-hosted variable fonts (Inter / Fredoka / Nunito). Motion keyframes (sway, sun-rays, drift, rise-in, pop-in) all reduced-motion-safe. Semantic z-scale, elevation + easing tokens. `--color-danger`/`warning`/`info` reserved for real system state only, never behavior.
- **Child centerpiece:** `src/features/garden/GardenIllustration.tsx` — a self-contained SVG scene whose plant grows seed→sprout→plant→flower→tree→butterflies, verified at fresh + grown stages via headless-Chrome screenshots.
- **Domain core (pure, tested — 31 tests passing):** `src/lib/domain/`
  - `types.ts` — all MVP Core entities.
  - `ageBand.ts` — age/band from birth date at runtime, band-transition + birthday detection.
  - `points.ts` — ledger balance, outcome→points (not_yet = 0, no entry), redemption affordability.
  - `garden.ts` — deterministic growth from positive logs → stage + progress-to-next.
  - `recognition.ts` — rotating non-AI phrase selection (positive-only, no immediate repeat).
- **Mock layer:** `src/lib/mock/` — `content.ts` (static app content: age-band behavior templates, recognition phrases, parent micro-pause prompts, system avatars, starter reward suggestions) + `store.tsx` React context persisting to localStorage. First run is empty (no consent, no child); `completeOnboarding` builds the whole state atomically. Enforces ledger rules centrally (logBehavior, redeemReward); `not_yet` returns a parent micro-pause line, positive outcomes return child recognition.
- **Onboarding (first-run flow):** `src/routes/Onboarding.tsx` — 3 steps in calm parent-scope: privacy consent (before any child profile) → child profile (name, birth date, system avatar, live age-band) → starter checklist (band templates + custom add + suggested rewards). Verified via headless-Chrome screenshots.
- **UI:** `src/components/shared/` (Button with size/variant + full states, Panel + GardenCard, ProgressBar), `src/features/garden/` (immersive `GardenIllustration`, GardenScene, stage display), `src/features/parental-gate/` (PIN keypad gate), `src/routes/` (Onboarding, ChildHome, ParentDashboard), `src/app/App.tsx` (router with onboarding guard: not-onboarded → `/onboarding`; else child `/`, gated parent `/parent`).
- **Parent self-regulation pillar (started):** logging `not_yet` shows a rotating, dismissible parent micro-pause line — never scored, never shown to the child (Phase 1 item).
- **Tests:** 35 passing — ledger, age-band, garden, recognition, templates + parent-pause selection.

## How To Run

- `npm install` then `npm run dev` (app), `npm test` (Vitest), `npm run build` (typecheck + build), `npm run lint`.
- Demo parental-gate PIN: `1234`. "Đặt lại dữ liệu demo" in parent mode clears localStorage state.

## Product State

The product concept is defined:
- LitaBluma helps children build positive habits and behavior through parent recognition and encouragement.
- The product avoids punishment, comparison, and shame.
- The child-facing metaphor is a growing garden.
- Parent-facing mode manages checklist, seed points, rewards, and privacy-sensitive actions.

## MVP Scope

MVP Core:
- Child profile.
- Age-band checklist.
- Seed points.
- Garden progress.
- Parent-defined rewards.
- Rotating recognition-phrase library (non-AI variety).
- Parent self-regulation micro-pause (minimal, non-AI, no scoring).
- Privacy baseline.
- Parental gate.

MVP+:
- AI encouragement.
- Weekly AI summary.

Post-MVP:
- Child self-assessment.
- AI Parenting Coach.
- Growth journal.
- Multiple children.
- Multi-device sync.
- Yearly PDF.

## Key Decisions Already Made

- Stack target: React, TypeScript, Tailwind, Supabase.
- AI must go through a backend proxy.
- Point changes must use a ledger.
- Children should not see raw negative behavior feedback.
- Child photos are not supported in MVP; only system avatars.
- Rewards should prefer choices, activities, and privileges over objects.
- AI is parent-mediated and cannot directly advise or message the child without parent approval.
- **Roles are split (decided 2026-06-14):** the parent is the daily operator AND the payer / keep-or-cancel decider; the child is the beneficiary. The child gives daily emotional pull; the parent gives the reason to stay and pay. See product-spec §3 "Roles".
- **MVP Core must show value without AI.** AI is the reason to *pay*, not the reason to *stay* — the core loop (garden + visible parent progress) must stand alone first.
- **Parent-perceived value is the retention north star (reinforced 2026-06-14).** The parent must both *see* the child's progress AND *experience their own emotional growth* — staying calm and regulating strong emotions when talking with the child. The parent self-regulation pillar (feature-ideas #8) is part of the value proposition, not just philosophy. Keep it woven in, never a guilt-inducing "good/bad parent" scorecard.
- **App suggests, parent decides (now a rule).** The app never auto-changes a child's checklist, points, or rewards; band-transition / habit-tapering / recurring-`not_yet` changes are parent-confirmed proposals. See rules.md.
- **Anti-boredom: added rotating recognition-phrase library to MVP Core** (non-AI). New entity `recognition_phrases`; recognition wording must vary and never repeat identically. See architecture.md + product-spec §7.

## Idea Backlog

- EQ & communication feature ideas derived from the two parenting books are captured in `docs/feature-ideas-eq.md` (scoped by MVP Core / MVP+ / post-MVP; not yet committed to the plan).
- **Product direction decided 2026-06-14: parent emotional self-regulation is the product's second pillar** ("the child grows, the parent grows too") — see idea #8 in `docs/feature-ideas-eq.md`. The two pillars are **co-equal in philosophy/messaging (50/50) but interwoven, not split 50/50 in UI (~70/30)**: the child is the center of the daily loop and main UI; parent features are woven into the child flow (in-the-moment micro-pause, shared weekly reflection letter) and run on a different cadence (child = daily; parent = in-the-moment + weekly). Do NOT split the screen 50/50. Positioning is core. **Scope update 2026-06-14: the *minimal* parent micro-pause (one static, non-AI, no-scoring line on `not_yet`) is now in MVP Core** — so the parent pillar ships from day one (new `parent_pause_prompts` entity). The fuller parent self-regulation (more prompts) stays MVP+ and the weekly reflection letter stays post-MVP. PRD/onboarding/messaging still need updating to reflect the two pillars.

## Open Decisions

- Whether to store full `birth_date` or only month/year plus optional birthday day.
- Exact retention period for detailed behavior logs.
- Whether MVP requires Supabase Auth immediately or can start with local/mock auth for prototype.
- Exact garden growth formula.
- Exact parental gate implementation for MVP.
- Initial checklist template content for each age band.
- Initial recognition-phrase content per age band/category, and the exact rotation strategy (e.g. least-recently-used vs random-no-immediate-repeat).
- Whether the first build should be web-only PWA or also packaged for app stores later.

## Immediate Next Steps

Done: scaffold, TS/Tailwind/routing, domain types, mock-data flows, and tests for ledger/age-band/garden/recognition.

Next:
1. Flesh out Phase 3 UI quality: onboarding + consent flow, child-profile create/edit, empty/loading/error/success states, mobile + tablet-landscape polish for child mode.
2. Add parent-confirmed proposals UI for habit tapering / band transition (app suggests, parent decides).
3. Add Supabase schema and RLS scoped by family/caregiver; swap the mock store for a real repository behind the same interface.
4. Seed the full age-band checklist templates and recognition-phrase library.
5. Decide the open items below before persistence (birth_date granularity, garden formula, parental-gate production approach).

## Do Not Start Yet Unless Requested

- AI Parenting Coach.
- PDF export.
- Multi-caregiver collaboration.
- App store compliance packaging.
- Voice input.
- Community checklist marketplace.
