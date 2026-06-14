# LitaBluma Build Rules

These rules are mandatory when building LitaBluma. The product serves children and parents, so implementation choices must protect children, avoid manipulative reward loops, and keep the MVP small enough to ship.

## Product Rules

- The app helps children build positive habits and behavior through parental recognition, not punishment.
- Do not design flows that shame, compare, rank, threaten, or label a child.
- Child-facing UI must emphasize growth and progress, not score maximization.
- Parents may see operational details such as points and trends; children should mainly see the garden metaphor.
- Negative behavior is logged only for parent awareness and pattern support. It must not create point penalties.
- Rewards should favor choices, activities, privileges, and shared time over physical gifts.
- Any mechanism that creates urgency, loss aversion, or scarcity must be parent-only and written in neutral language.
- **The app suggests; the parent decides.** The app may *propose* changes — checklist items, point values, habit tapering, task difficulty/timing/rotation (e.g. on a band transition, a habit becoming stable, or a recurring `not_yet`). It must never auto-change a child's checklist, points, or rewards without explicit parent confirmation. The parent always owns the context the app cannot see.
- **Recognition wording must vary.** Do not show identical praise for the same behavior repeatedly. Use the rotating recognition library (and AI when available) to keep recognition specific and fresh; avoid generic "good job"-only.
- MVP must validate the core loop: parent records behavior, child sees growth, parent defines rewards, child gradually builds habits.
- The non-AI core loop must deliver perceivable value on its own (visible progress for the parent). AI is the reason to *pay*, not the reason to *stay* — do not make the basic loop depend on AI.
- **No-punishment, no-shame, no-comparison applies to the parent too.** Parent self-regulation support (the micro-pause, later reflection) must never score, rank, or guilt the parent ("good/bad parent"). It is optional, dismissible, and never a daily gate. Do not build a parent-judgement counter or ledger.

## MVP Scope Rules

- MVP Core includes child profile, age-band checklist, seed points, garden progress, parent-defined rewards, privacy baseline, and parental gate.
- MVP+ includes AI encouragement and weekly AI summary.
- Post-MVP includes child self-assessment, AI Parenting Coach, growth journal, multiple children, multi-device sync, and yearly PDF.
- Do not pull MVP+ or post-MVP features into MVP Core unless explicitly requested.
- Prefer a simple, shippable implementation over a broad feature surface.

## Monetization Rules

- Core features must stay usable for free: one child, checklist, seed points, garden, and journal.
- The reason to pay is the deeper AI layer (Parenting Coach, weekly summary, unlimited encouragement), multiple children, and multi-device sync — not gating the basic loop.
- Free-tier AI encouragement is limited (3 generations/day; see product-spec §11). Limits must be enforced server-side, never bypassable from the browser.
- Do not use scarcity, loss aversion, or urgency to push upgrades inside child mode. Upgrade prompts are parent-only and neutral in tone.

## Child Privacy Rules

- Do not upload or store real child photos in MVP.
- Do not store location, address, school, phone number, or social identifiers for a child.
- Require parent consent before creating a child profile.
- Provide a clear delete path for a child profile and related data.
- Child-facing mode must not include open chat, social sharing, external links, or account settings without parental gate.
- AI requests must use the minimum child data needed for the task.
- Keep privacy and consent requirements in the data model from the start.
- Review children's-app regulations (COPPA and equivalents) before any public/app-store release. Do not ship to a store without that review.
- No personalized advertising to children.

## AI Rules

- AI may suggest wording for parents; it must not directly message the child without parent approval.
- AI must not diagnose psychological, medical, neurodevelopmental, ADHD, autism, or behavioral disorders.
- AI must not give medical, legal, or specialist intervention advice.
- AI must not compare the child with siblings, peers, or other children.
- AI output must focus on specific behavior, effort, choices, next steps, and warm parental language.
- If data is missing or ambiguous, use a safe template instead of inventing details.
- Store AI suggestion status: generated, edited, used, or dismissed.

## Technical Rules

- Use React, TypeScript, Tailwind, Supabase, and a backend proxy for AI as defined in product-spec/architecture unless changed deliberately.
- Treat point changes as ledger entries. Do not mutate total points directly.
- Derive child age from birth date at runtime. Do not store static age.
- Use row-level ownership boundaries around family, caregiver, child, and related records.
- Keep app copy and UI state separated from persistence logic.
- Avoid premature abstraction until at least two concrete use cases need it.
- Add tests around point ledger, age-band calculation, checklist logging, reward redemption, and parental-gate-sensitive actions.

## UI Rules

- Parent mode should be calm, clear, and operational.
- Child mode should be visual, tactile, and low-text.
- Use the garden metaphor consistently: seed, sprout, plant, flower, tree, butterflies.
- Child mode should not show raw behavioral failure, warning colors, ranking, or deficit language.
- Avoid red/error styling for behavior outcomes. Reserve error styling for actual system errors.
- Mobile-first is required; tablet landscape should be considered for child mode.
