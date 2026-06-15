# LitaBluma Current State

Last updated: 2026-06-15

## Repository State

- The app is scaffolded and runnable (Phase 0 done; Phase 1 domain core done; parent-confirmed proposals added on top).
- Stack in place: Vite + React 19 + TypeScript + Tailwind v4 + React Router 7. Vitest for tests, ESLint + Prettier configured.
- The directory is a git repository (`main` branch).
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
  - `proposals.ts` — derives parent-confirmed proposals ("app suggests, parent decides"): habit tapering (`new`→`building`→`stable`, −1 seed per step), recognition-only (well-established habit → 0 points, still celebrated), recurring-`not_yet` (Flow 6: a stuck behavior → suggest easing/pausing, parent-only, never child-facing), and `band_review` (child-scoped, via `deriveBandReview`): when a band transition is near and the upcoming band has fresh suggested items, invite the parent to review — a `navigate` effect to `/parent/manage`, never a bulk add. Pure derivation only — it never mutates state; ids encode the trigger so a stronger signal can re-surface after a dismissal.
  - `virtues.ts` — the 5-virtue character axis (tự lập / trách nhiệm / kiểm soát cảm xúc / đồng cảm / kiên trì): metadata (label+emoji) + `groupByVirtue`. A recognition *lens* over behaviors, never a graded level; no per-virtue scoring of the child.
  - `weeklyReport.ts` — pure aggregator that turns the last 7 days of positive logs into a strength-based "Lá thư tuần này": good-moments + active-days counts, highlights grouped by virtue, top behaviors, and a rotating parent reflection + tip. Excludes `not_yet`; no score/ranking. The non-AI base path (AI dual analysis layers on later).
- **Mock layer:** `src/lib/mock/` — `content.ts` (static app content: age-band behavior templates **tagged by virtue**, recognition phrases, parent micro-pause prompts, weekly reflection prompts + parent tips, system avatars, starter reward suggestions) + `store.tsx` React context persisting to localStorage. First run is empty (no consent, no child); `completeOnboarding` builds the whole state atomically. Enforces ledger rules centrally (logBehavior, redeemReward); `not_yet` returns a parent micro-pause line, positive outcomes return child recognition.
- **Onboarding (first-run flow):** `src/routes/Onboarding.tsx` — 3 steps in calm parent-scope: privacy consent (before any child profile) → child profile (name, birth date, system avatar, live age-band) → starter checklist (band templates + custom add + suggested rewards). Verified via headless-Chrome screenshots.
- **UI:** `src/components/shared/` (Button with size/variant + full states, Panel + GardenCard, ProgressBar), `src/features/garden/` (immersive `GardenIllustration`, GardenScene, stage display), `src/features/parental-gate/` (PIN keypad gate), `src/routes/` (Onboarding, ChildHome, ParentDashboard), `src/app/App.tsx` (router with onboarding guard: not-onboarded → `/onboarding`; else child `/`, gated parent `/parent`).
- **Parent self-regulation pillar:** logging `not_yet` now opens a calm in-place panel ("Một nhịp cho bố mẹ") at that checklist item — a rotating, dismissible micro-pause line that persists until closed (no longer a 3.5s toast), clears when the same item is later logged positive. Never scored, never shown to the child. Positive outcomes still relay the child-facing recognition line to the parent as a brief toast. This is the smallest form of the second pillar; fuller version (more prompts/situational tips) is MVP+, weekly reflection letter post-MVP.
- **Reward management:** parent mode can add custom rewards (title, type, points; objects de-emphasized) and delete any reward including the onboarding defaults. Store actions `addReward` / `removeReward`; deletion preserves ledger/redemption history (ledger stores its own reason text).
- **Character virtue axis (seed — MVP Core):** behaviors carry a `virtue` (5 virtues). Onboarding's template picker is grouped by virtue; the parent dashboard shows a virtue chip on each checklist item; the weekly report groups highlights by virtue. Seed only — a recognition lens, not a graded curriculum. Full system (age-laddered difficulty via proposals, garden-per-virtue, parent arc view) is post-MVP. See feature-ideas #9.
- **Weekly report (non-AI — "Lá thư tuần này"):** gated route `/parent/report`, reachable from a dashboard link. Strength-based summary of the last 7 days (good moments, active days, highlights by virtue, top behaviors) + one rotating parent reflection + tip. No score/ranking; `not_yet` excluded; parent-only. The AI dual-analysis layer (child + parent) and monthly/yearly cadences are deferred (feature-ideas #10, needs the backend proxy).
- **Checklist & profile management (Phase 3):** gated route `/parent/manage` (tap the child header on the dashboard). Edit the child profile (name, birth date with live band, avatar); add checklist items (custom or one-tap from age-band suggestions), edit title/points/virtue, archive/restore, and hard-delete only items with no logs (history is never erased). Store actions `addChecklistItem` / `updateChecklistItem` / `archiveChecklistItem` / `restoreChecklistItem` / `removeChecklistItem` / `updateChild` — a points edit changes only future logs, never the ledger.
- **Parent-confirmed proposals (app suggests, parent decides):** the parent dashboard has an "Đề xuất từ ứng dụng" section ("Ứng dụng gợi ý — bạn là người quyết định") listing app-derived proposals. Each is accept (`applyProposal`) or decline (`dismissProposal`); nothing auto-applies. Store keeps `dismissedProposalIds` so handled cards never reappear. Applying a taper changes only the item's `pointsValue` + `habitStage` (future logs), never rewriting past ledger entries — points stay a ledger. `habitStage` now actually advances (first place it changes after creation). Recurring-`not_yet` proposals (and their archive action) live strictly in parent scope; child mode is untouched. **Band transition** is now an actionable `band_review` proposal whose "Xem gợi ý" link goes to `/parent/manage` (which shows the *upcoming* band's suggestions when a transition is near) — the parent adds each item by hand; nothing is auto-added. The dashboard birthday banner is now purely celebratory.
- **Tests:** 86 passing — ledger, age-band, garden, recognition, templates, parent-pause, proposal derivation incl. band_review (16), virtue grouping + template validity (5), weekly-report aggregation (6), store management actions (6), ParentDashboard integration (8: proposal apply/decline, micro-pause, band_review surface/dismiss), ParentWeeklyReport render (2), ParentManage render (3), ParentDashboard empty-checklist (1), ChildHome empty/loaded rewards (2), ParentPrivacy delete flow (2).
- **Privacy & data surface (MVP Core privacy baseline):** gated route `/parent/privacy` (linked from the dashboard footer). Shows what is stored (profile + counts of checklist/logs/rewards/redemptions), reaffirms what is deliberately NOT stored (no real photos, no location/school/phone, age never stored), the consent record (version + date), and a **clear delete path**: a two-step, explicit "delete child profile + all data" that calls the new store action `deleteChildAndData` (returns to a clean first-run state; on the real backend this maps to soft-delete + `data_deletion_requests`) and routes back to onboarding. The demo "reset" affordance now lives here too, kept visually distinct from the real delete. Tested (`ParentPrivacy.test.tsx`: confirm gating + actual erase).
- **PWA (PWA-first, architecture.md):** `vite-plugin-pwa` (Workbox `generateSW`, `registerType: autoUpdate`) generates `manifest.webmanifest` + service worker precaching the hashed build assets with an SPA `navigateFallback` for offline. Web app manifest (vi, standalone, portrait, theme `#3f7d52`), `public/icon.svg` + `public/favicon.svg` (on-brand seedling), SW registered in `main.tsx` (`virtual:pwa-register`, immediate; disabled in dev). `dev-dist/` gitignored. Note: icons are SVG — add 192/512 PNGs for full store-grade installability before any store release.
- **UI quality + a11y polish (2026-06-15/16):** empty states for the child rewards garden and the parent checklist (CTA to manage); child mode 2-column landscape on `lg`; global `color-scheme: light` (keeps native date/number/checkbox controls from inverting under a dark OS theme); child-scope focus ring recolored on-palette (leaf, not the parent cool blue). The base already had global `:focus-visible` + reduced-motion handling.
- **Supabase schema + RLS (Phase persistence — schema done, store swap pending):** `supabase/migrations/` — `0001_schema.sql` (enums, tables, constraints, indexes, the append-only `point_ledger` with a `ledger_sign` CHECK + a `BEFORE INSERT` overdraft-guard trigger), `0002_rls.sql` (`is_family_member`/`owns_child` security-definer helpers, a `bootstrap_family()` RPC for first sign-in, RLS policies on every table — child/operational rows scoped via `owns_child`, ledger + logs + redemptions are append/read-only, static content world-readable to authenticated), `0003_seed_content.sql` (behavior templates, recognition phrases, parent-pause prompts — 1:1 with `src/lib/mock/content.ts`, idempotent). `supabase/config.toml` + `supabase/README.md` document apply/design. Frontend scaffold: `@supabase/supabase-js` installed, `src/lib/supabase/client.ts` (env-guarded lazy client — app still builds/runs on the mock store without env) + `database.types.ts` (hand-written, matches the migrations) + `.env.example`. **Not yet done:** swapping the mock `StoreProvider` for a real async repository behind the same interface (needs a live Supabase project to wire + test, and a loading/error-state pass on the UI).

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

### Decisions resolved 2026-06-15 (pre-persistence)

These closed the open items below so the Supabase schema can be built:

- **Birth date granularity:** store the **full `birth_date`** (`YYYY-MM-DD`). It is the one mildly-sensitive child field but is needed for accurate birthday moments and band transitions, and matches the ISO date the code already uses everywhere. Age is still never stored — always derived at runtime.
- **Behavior-log retention:** **keep detailed logs while the child profile is active; purge them with the profile.** Garden growth is derived cumulatively from all positive logs, so rolling logs off would break deterministic rebuild. Deletion follows the profile delete path (soft-delete → controlled hard-delete).
- **Parental gate (production):** target **device biometric / WebAuthn** as the primary verify, with a **PIN fallback** (WebAuthn support/UX varies across devices and PWA installs). MVP keeps the existing PIN; the WebAuthn layer lands at the parental-gate production step.
- **Auth:** adopt **Supabase Auth immediately** when wiring persistence (not a mock/local caregiver). RLS is scoped by caregiver/family from day one so row-ownership is verified for real.
- **Garden growth formula — ratified as implemented** (`src/lib/domain/garden.ts`): `completed` = +2, `tried` = +1, `not_yet` = 0; stage thresholds `[0, 3, 8, 16, 28, 45]` for seed→sprout→plant→flower→tree→butterflies. Deterministic and rebuildable from logs.
- **Recognition rotation — ratified as implemented** (`src/lib/domain/recognition.ts`): random among eligible phrases, never repeating the immediately previous line for that child/behavior. (Chosen over full LRU; sufficient for MVP variety.)
- **Delivery target — ratified:** **web-only PWA for MVP**; revisit app-store packaging only after a COPPA/equivalent review (per rules.md), never before.

## Idea Backlog

- EQ & communication feature ideas derived from the two parenting books are captured in `docs/feature-ideas-eq.md` (scoped by MVP Core / MVP+ / post-MVP; not yet committed to the plan).
- **Product direction decided 2026-06-14: parent emotional self-regulation is the product's second pillar** ("the child grows, the parent grows too") — see idea #8 in `docs/feature-ideas-eq.md`. The two pillars are **co-equal in philosophy/messaging (50/50) but interwoven, not split 50/50 in UI (~70/30)**: the child is the center of the daily loop and main UI; parent features are woven into the child flow (in-the-moment micro-pause, shared weekly reflection letter) and run on a different cadence (child = daily; parent = in-the-moment + weekly). Do NOT split the screen 50/50. Positioning is core. **Scope update 2026-06-14: the *minimal* parent micro-pause (one static, non-AI, no-scoring line on `not_yet`) is now in MVP Core** — so the parent pillar ships from day one (new `parent_pause_prompts` entity). The fuller parent self-regulation (more prompts) stays MVP+ and the weekly reflection letter stays post-MVP. PRD/onboarding/messaging still need updating to reflect the two pillars.

## Open Decisions

Resolved 2026-06-15 (see "Decisions resolved" above): birth_date granularity, log retention, Supabase Auth timing, garden formula, parental-gate production approach, recognition rotation strategy, web-only-PWA-vs-store. Remaining:

- Initial checklist template content for each age band (seed exists; needs full coverage).
- Initial recognition-phrase content per age band/category (rotation strategy now decided; content still needs expansion).
- WebAuthn parental-gate implementation details (PIN fallback storage, per-device enrollment) — deferred to the parental-gate production step.

## Immediate Next Steps

Done: scaffold, TS/Tailwind/routing, domain types, mock-data flows, tests for ledger/age-band/garden/recognition, the parent-confirmed proposals system (incl. `band_review`), the in-place parent micro-pause, the character-virtue axis seed, the non-AI weekly report ("Lá thư tuần này"), and checklist/profile management (`/parent/manage`).

Next:
1. Phase 3 UI quality (partly done 2026-06-15): added empty states for the child "Vườn quà" garden (no rewards yet) and the parent dashboard checklist (no active items → CTA to `/parent/manage`); child mode now uses a 2-column landscape layout on `lg` (garden left, cards right — the garden illustration stays `max-w-sm`, so it isn't enlarged). **Remaining:** loading/error/success states proper (these land with the async repository swap — the mock store is synchronous so there is nothing to load yet), and further mobile polish.
2. **Supabase schema + RLS: DONE** (`supabase/migrations/`, scoped by family/caregiver — see "What Exists In Code"). **Remaining:** create/link a Supabase project, apply the migrations, then swap the mock `StoreProvider` for a real async repository behind the same `StoreApi` interface (add auth sign-in + `bootstrap_family()` call, and a loading/error-state pass since reads become async).
3. Seed the full age-band checklist templates and recognition-phrase library (expanded 2026-06-15: behavior templates 23 → 32, ~3 more per band keeping all 5 virtues; recognition phrases 8 → 22 with broad/category/band-specific lines so rotation repeats less. Both mirrored 1:1 into `supabase/migrations/0003_seed_content.sql`. Still room to grow further.)
4. Decide the open items below before persistence (birth_date granularity, garden formula, parental-gate production approach).
5. Phase 4 / MVP+: layer AI dual-analysis (child + parent) onto the weekly report via the backend proxy, and add monthly/yearly cadences + the full virtue ladder (feature-ideas #9, #10).

## Do Not Start Yet Unless Requested

- AI Parenting Coach.
- PDF export.
- Multi-caregiver collaboration.
- App store compliance packaging.
- Voice input.
- Community checklist marketplace.
