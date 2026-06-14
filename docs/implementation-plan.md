# LitaBluma Implementation Plan

This plan converts the product spec ([product-spec.md](product-spec.md)) into buildable phases.

## Phase 0: Project Scaffold

Goal: create a working frontend shell.

Tasks:
- Initialize Vite React TypeScript app.
- Add Tailwind.
- Add routing.
- Add basic app shell with parent mode and child mode.
- Add placeholder data and local domain services.

Done when:
- App runs locally.
- Parent and child routes render.
- No backend is required for the first UI pass.

## Phase 1: Domain Core With Mock Data

Goal: validate the product loop before persistence.

Tasks:
- Implement child profile model.
- Implement age-band calculation.
- Implement checklist template selection.
- Implement behavior logging.
- Implement point ledger balance calculation.
- Implement reward creation and redemption.
- Implement garden progress calculation.
- Implement recognition selection (rotating non-AI phrase library; positive outcomes only).
- Implement parent self-regulation micro-pause on `not_yet` (rotating static line; parent-side; no scoring).

Done when:
- A parent can create/select a child profile in mock state.
- A parent can tick behaviors.
- Points update through ledger entries.
- A child can see garden growth.
- A reward can be redeemed only when enough points exist.
- A positive log surfaces a recognition line that varies (no immediate repeat) and never fires on `not_yet`.
- Logging `not_yet` shows a calm parent micro-pause line (dismissible, no score, never shown to the child).

## Phase 2: Supabase Persistence

Goal: persist MVP Core data safely.

Tasks:
- Create Supabase schema.
- Add RLS policies scoped by family/caregiver.
- Add consent records.
- Persist child profiles, checklist items, behavior logs, point ledger, rewards, redemptions, and garden progress.
- Add deletion request path.

Done when:
- Data persists across reloads.
- A caregiver can only access records in their family.
- Sensitive child data has a deletion path.

## Phase 3: MVP UI Quality

Goal: make the product usable by real parents and children.

Tasks:
- Build parent dashboard.
- Build checklist management.
- Build child garden view.
- Build reward shelf.
- Build parental gate.
- Add empty, loading, error, and success states.
- Add mobile-first responsive behavior and tablet landscape support for child mode.

Done when:
- A real parent can complete the daily loop without explanation.
- Child mode contains no raw negative feedback.
- Parent mode exposes enough control without feeling like surveillance.

## Phase 4: MVP+ AI

Goal: add AI only after the core loop works.

Tasks:
- Add backend proxy or Supabase Edge Function.
- Add AI suggestion prompt with guardrails.
- Add AI suggestion review flow: generated, edited, used, dismissed.
- Layer AI encouragement on top of the recognition library; fall back to it when AI is uncertain or rate-limited.
- Add weekly summary generation.
- Add usage limits for free plan.

Done when:
- AI never receives unnecessary child data.
- Parent approves or edits AI copy before use.
- AI failures fall back to safe templates.

## Phase 5: Beta Readiness

Goal: prepare for 3-5 real parent testers.

Tasks:
- Add analytics events for KPI measurement.
- Add onboarding copy.
- Add privacy/consent copy.
- Add basic test coverage.
- Add seed checklist templates for age bands.
- Add seed recognition phrases per age band/category.
- Add seed parent micro-pause prompts (`not_yet` context).
- Review compliance and app-store-child policy requirements before public launch.

Done when:
- Testers can use the app for one week.
- The team can measure return frequency, daily behavior logs, reward usage, and AI usage.
