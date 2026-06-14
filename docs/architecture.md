# LitaBluma Architecture

This document defines the initial technical architecture for building the MVP Core and preparing for MVP+.

## Target Stack

- Frontend: React, TypeScript, Vite
- Styling: Tailwind CSS
- Backend/Data: Supabase Auth, Postgres, Row Level Security, Storage only if needed later
- AI: backend proxy or Supabase Edge Function; never call an AI provider directly from the browser
- Deployment: PWA-first web app

## Product Surfaces

### Parent Mode
- Dashboard for one child in MVP Core.
- Create and edit checklist items.
- Log behavior outcomes: completed, tried, not_yet.
- In-the-moment self-regulation micro-pause when logging `not_yet` (minimal parent pillar; non-AI, no scoring).
- Manage rewards.
- Redeem rewards.
- View point ledger and garden progress.
- Access settings, privacy, and delete flows.

### Child Mode
- View garden progress.
- View available rewards in child-friendly form.
- See positive recognition moments.
- No raw points as the primary visual.
- No negative behavior feed.
- No settings or parent data without parental gate.

### Retention Touchpoints
These keep parents (and children) coming back; they are product surfaces, not just notifications.
- Daily "golden moment" highlight.
- Companion mascot in child mode.
- Sunday letter (weekly summary — MVP+).
- Age-band transition and birthday prompts (see Domain Logic). These are natural re-entry points and must use warm, neutral copy.

### Parental Gate
- Required for switching from child mode to parent mode.
- Required for deleting data, exporting data, changing child profile, enabling AI, or changing sensitive settings.
- MVP can use a simple PIN stored securely enough for prototype use. Production should revisit auth-backed verification.

## Data Model

### `families`
- `id`
- `created_at`

### `caregivers`
- `id`
- `family_id`
- `auth_user_id`
- `role`
- `created_at`

### `child_profiles`
- `id`
- `family_id`
- `display_name`
- `birth_date`
- `avatar_key`
- `created_at`
- `deleted_at`

### `behavior_templates`
- `id`
- `age_band`
- `title`
- `description`
- `default_points`
- `category`
- `is_active`

### `recognition_phrases`
Built-in, human-written recognition lines used to keep daily praise varied **without AI** (MVP Core). This is static content, not child data.
- `id`
- `age_band` (nullable = applies to any band)
- `category` (nullable = any; matches behavior categories, e.g. `eq`, `routine`)
- `outcome` (`completed` | `tried` — recognition is positive-only; never generated for `not_yet`)
- `text`
- `is_active`

Rules:
- Seeded with the app; contains no child-specific data.
- Selection **rotates** (e.g. least-recently-used per child/behavior) so the same line is not repeated back-to-back.
- AI encouragement (MVP+) layers on top and falls back to this library when uncertain or rate-limited.
- Wording follows the AI/UI rules: specific behavior + effort, no generic "good job"-only, no comparison.

### `parent_pause_prompts`
Built-in, human-written calm lines for the parent self-regulation **micro-pause** (MVP Core, minimal). Static content, not child data, no scoring.
- `id`
- `context` (e.g. `not_yet` — the moment the prompt is shown)
- `text`
- `is_active`

Rules:
- Seeded with the app; contains no child-specific or parent-specific data.
- Shown parent-side, in the moment (e.g. just before confirming a `not_yet` log); rotates so it doesn't feel canned.
- **Never produces a score, streak, or "good/bad parent" signal.** No ledger, no counters tied to the parent's emotions. Optional and dismissible — never a gate.
- Does not appear in child mode and is unrelated to the child's points or garden.

### `child_checklist_items`
- `id`
- `child_id`
- `template_id`
- `title`
- `points_value`
- `status`
- `habit_stage`
- `created_by`
- `created_at`

### `behavior_logs`
- `id`
- `child_id`
- `checklist_item_id`
- `log_date`
- `outcome`
- `note`
- `created_by`
- `created_at`

Allowed `outcome` values:
- `completed`
- `tried`
- `not_yet`

### `point_ledger`
- `id`
- `child_id`
- `source_type`
- `source_id`
- `points_delta`
- `reason`
- `created_at`

Rules:
- Positive entries come from completed/tried behaviors or parent bonus recognition.
- Negative entries come only from reward redemption.
- Never create negative entries for behavior problems.
- Current point balance is derived from this table.

### `rewards`
- `id`
- `child_id`
- `title`
- `reward_type`
- `points_cost`
- `is_active`
- `created_at`

Allowed `reward_type` values:
- `choice`
- `activity`
- `privilege`
- `object`

### `reward_redemptions`
- `id`
- `child_id`
- `reward_id`
- `points_spent`
- `status`
- `redeemed_at`

### `garden_progress`
- `id`
- `child_id`
- `level`
- `growth_score`
- `last_growth_at`

### MVP+ Tables

#### `ai_suggestions`
- `id`
- `child_id`
- `behavior_log_id`
- `suggestion_type`
- `content`
- `status`
- `created_at`

#### `weekly_summaries`
- `id`
- `child_id`
- `week_start`
- `week_end`
- `content`
- `status`
- `created_at`

#### `ai_usage_counters`
Tracks AI generation usage to enforce free-tier limits (product-spec §11: 3 encouragement generations/day on free).
- `id`
- `family_id` (or `caregiver_id` — scope at the billing unit)
- `usage_date`
- `feature` (e.g. `encouragement`, `weekly_summary`, `coach`)
- `count`
- `created_at`

Notes:
- Increment server-side only (backend proxy / Edge Function); the browser must never be the source of truth for limits.
- Plan tier lives on the billing unit — add a `plan` field (`free` | `premium`) on `caregivers` or `families`. The proxy reads plan + today's counter before allowing a generation.

### Privacy Tables

#### `consent_records`
- `id`
- `family_id`
- `caregiver_id`
- `consent_version`
- `accepted_at`

#### `data_deletion_requests`
- `id`
- `family_id`
- `child_id`
- `requested_by`
- `status`
- `requested_at`
- `completed_at`

## Domain Logic

### Age Bands
- `4-5`
- `6-7`
- `8-10`

Age band is derived from `birth_date` at runtime. Checklist suggestions and AI tone use the derived band.

### Age-Band Transitions & Birthday Moments
- When a child is about to cross into the next band, prompt the parent to review/update the checklist ("Bé sắp 7 tuổi, cập nhật checklist nhé?").
- On the birthday, show a special "one year, look how you've grown" moment plus a suggestion to raise the band.
- Both are derived from `birth_date` at runtime — no stored age, no scheduled job required for correctness (compute on app open). A notification layer can surface them proactively later.
- Copy stays warm and celebratory; never framed as the child falling behind a level.

### Plans & AI Limits
- `plan` (`free` | `premium`) gates the deep AI layer. Free includes the full core loop; premium unlocks unlimited encouragement, Parenting Coach, weekly summary, multiple children, multi-device sync.
- Free AI encouragement is capped (product-spec §11: 3/day), enforced via `ai_usage_counters` checked in the backend proxy before each generation.

### Point Rules
- Small/easy behavior: 1 point.
- Medium effort behavior: 2 points.
- New or difficult behavior: 3 points.
- Meaningful effort even if incomplete: 1 point.
- `not_yet` creates a behavior log but no point ledger entry.
- Reward redemption creates a negative point ledger entry.

### Habit Stage Rules
- `new`: full points.
- `building`: after 7 completions in 14 days, suggest reducing by 1 point.
- `stable`: after 21 days of stability, suggest lower points or recognition only.
- `recognition_only`: contributes to garden growth but is not a main point source.

### Recognition Selection
- On a positive log (`completed`/`tried`), pick a line from `recognition_phrases` filtered by the runtime-derived age band + behavior category + outcome.
- Rotate selection (avoid repeating the most recent line for that child/behavior) so the daily loop stays fresh — this is the MVP Core, non-AI recognition path.
- AI encouragement (MVP+) replaces or augments this, but this library is always the safe fallback when AI is uncertain or rate-limited.
- Never select recognition for a `not_yet` outcome; `not_yet` stays neutral and silent to the child.

### Parent Self-Regulation Micro-Pause (minimal — MVP Core)
- When the parent is about to log `not_yet`, surface one rotating line from `parent_pause_prompts` (`context = 'not_yet'`) before/at confirmation.
- Parent-side only; non-AI; optional and dismissible. It must not block the log or add friction beyond a single calm line.
- No scoring, no streaks, no persisted judgement of the parent — the no-shame/no-comparison rule applies to the parent too.
- This is the smallest form of the parent pillar; the fuller version (more contexts, weekly reflection letter `caregiver_reflections`) stays MVP+/post-MVP.

### App-Suggests / Parent-Decides
- Suggestions the app derives (band-transition checklist update, habit-stage point tapering, recurring-`not_yet` adjustments, recognition-only moves) are surfaced to the parent as proposals only.
- No suggestion mutates `child_checklist_items`, `point_ledger`, or `rewards` until the parent confirms. Model these as parent-confirmable prompts, not automatic writes.

### Garden Progress
- Garden progress should be derived from positive behavior logs and point ledger activity.
- Child mode displays garden level and visual growth, not raw ledger details.
- Garden state should be deterministic enough to recover from logs if needed.

## Suggested Frontend Structure

```text
src/
  app/
  components/
    parent/
    child/
    shared/
  features/
    auth/
    children/
    checklist/
    points/
    rewards/
    garden/
    parental-gate/
    privacy/
    ai/
  lib/
    supabase/
    date/
    domain/
  routes/
  styles/
```

## Security Notes

- Supabase RLS must scope all family data by caregiver membership.
- Child profile deletion should be soft-delete first, then hard-delete through a controlled deletion job when production-ready.
- AI provider keys must exist only in backend environment variables.
- Avoid logging raw AI prompts that include unnecessary child details.

## Test Focus

- Age-band calculation around birthdays.
- Behavior logging outcomes.
- Point ledger balance.
- Reward redemption with insufficient points.
- Habit-stage transition suggestions.
- Recognition selection: age-band/category/outcome filtering, rotation (no immediate repeat), and never firing on `not_yet`.
- App-suggests/parent-decides: suggestions never mutate checklist/points/rewards without parent confirmation.
- Parent micro-pause: shows on `not_yet`, parent-side only, never scores/blocks, absent from child mode.
- Parental gate protection for sensitive actions.
- RLS policies before production data.
