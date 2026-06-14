---
name: litabluma-builder
description: Use whenever building, changing, or reviewing the LitaBluma app — a parent-child habit-building product with strict child-safety, privacy, and MVP-scope guardrails. Trigger on any task that touches the React/Supabase codebase, the data model, points/rewards/garden logic, parent or child UI, AI suggestions, or product scope decisions in this repo.
---

# LitaBluma Builder Skill

Use this skill whenever building, changing, or reviewing the LitaBluma app.

## Source Of Truth

Read these files before making product or architecture decisions:

1. `docs/product-spec.md`
2. `docs/rules.md`
3. `docs/architecture.md`
4. `docs/current-state.md`
5. `docs/implementation-plan.md`

## Build Principles

- Keep MVP Core separate from MVP+ and post-MVP.
- Implement the domain loop before AI.
- Use mock data first when validating UI/domain behavior, then wire Supabase.
- Treat points as a ledger.
- Treat child privacy as architecture, not a later policy page.
- Keep child-facing UI positive, visual, and low-text.
- Keep parent-facing UI practical and clear.

## Required Checks Before Coding

Before implementing a feature, answer:

- Is this MVP Core, MVP+, or post-MVP?
- Does this expose sensitive child data?
- Does this require parental gate?
- Does this mutate points directly instead of using a ledger?
- Does this create shame, comparison, pressure, or punishment?
- Can it work without AI first?

## Implementation Workflow

1. Read current state and the product-spec section relevant to the task.
2. Identify the domain entities touched by the feature.
3. Implement the smallest working behavior.
4. Add tests for domain logic if points, age bands, rewards, privacy, or parental gate are involved.
5. Verify child mode does not expose negative feedback or raw operational details.
6. Update `docs/current-state.md` when a major implementation milestone changes.

## Review Workflow

When reviewing changes:

- Start with child safety and privacy risks.
- Then check product philosophy alignment.
- Then check data integrity, especially point ledger and reward redemption.
- Then check UI clarity and age-appropriate behavior.
- Then check technical maintainability and tests.

## Common Pitfalls

- Adding AI before the daily parent-child loop works.
- Showing points too prominently to children.
- Treating `not_yet` as failure instead of neutral tracking.
- Storing too much child data for convenience.
- Making rewards feel like a store economy.
- Letting parent mode become a surveillance dashboard.
