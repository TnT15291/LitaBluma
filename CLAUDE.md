# LitaBluma

LitaBluma is a parent-child app that helps children build positive habits through parental recognition — not punishment, comparison, or shame. The child-facing metaphor is a growing garden; the parent-facing mode manages a checklist, seed points, rewards, and privacy-sensitive actions.

The repo currently contains product documentation only — no application code yet. When you start building, follow the phased plan in [docs/implementation-plan.md](docs/implementation-plan.md).

## Source of truth (read before deciding)

1. [docs/product-spec.md](docs/product-spec.md) — primary product spec (vision, scope, flows, monetization, KPI)
2. [docs/rules.md](docs/rules.md) — mandatory product, privacy, AI, technical, and UI rules
3. [docs/architecture.md](docs/architecture.md) — stack, data model, domain logic, frontend structure
4. [docs/current-state.md](docs/current-state.md) — what exists, open decisions, next steps
5. [docs/implementation-plan.md](docs/implementation-plan.md) — phased build plan

Supporting docs: [docs/feature-ideas-eq.md](docs/feature-ideas-eq.md) (EQ/parent-pillar idea backlog) and [docs/eq-source-material.md](docs/eq-source-material.md) (book-derived AI prompts and situation templates).

## Non-negotiables

These come from [docs/rules.md](docs/rules.md) — re-read it for the full list, but never let work in this repo violate any of:

- **No punishment of children.** No point penalties for behavior, no shame, no comparison, no ranking. `not_yet` is neutral tracking, not failure.
- **Points are a ledger.** Never mutate a total directly — append a `point_ledger` entry. Negative entries only come from reward redemptions, never from behavior.
- **Child privacy is architecture.** No real child photos, no location/school/phone, parent consent before profile creation, clear delete path. Parental gate guards sensitive actions.
- **Child mode stays positive.** Garden metaphor, low-text, no raw points as the primary visual, no negative behavior feed, no error-red styling for behavior.
- **AI is parent-mediated.** Never message the child directly. No diagnoses (medical, psychological, ADHD, autism, etc.). Fall back to safe templates when uncertain.
- **MVP scope discipline.** Don't pull MVP+ (AI encouragement, weekly summary) or post-MVP (coach, multi-child, PDF) into MVP Core unless explicitly asked.

## Build workflow

Before implementing a feature, answer:

- Is this MVP Core, MVP+, or post-MVP?
- Does it expose sensitive child data or need a parental gate?
- Does it mutate points directly instead of through the ledger?
- Does it create shame, comparison, pressure, or punishment?
- Can it work without AI first?

Then: read the relevant product-spec section, identify domain entities touched, implement the smallest working behavior, add tests if points/age-bands/rewards/privacy/parental-gate are involved, and verify child mode does not leak operational details.

When a milestone changes the state of the codebase (scaffold done, persistence wired, etc.), update [docs/current-state.md](docs/current-state.md).

## Stack

React + TypeScript + Vite + Tailwind on the frontend; Supabase (Auth, Postgres, RLS) for persistence; AI strictly through a backend proxy / Supabase Edge Function — never from the browser. PWA-first.
