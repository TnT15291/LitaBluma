# LitaBluma Product Spec

Canonical product spec for LitaBluma. This file absorbs the former `PRD-LitaBluma-v2.1.md` and is the primary product source of truth. Architecture/data-model lives in [architecture.md](architecture.md); mandatory rules in [rules.md](rules.md).

## 1. Vision

LitaBluma helps children build positive habits and behavior through parental recognition, encouragement, and companionship. The end goal is **not** collecting points or prizes:

> Help the child gradually choose to do the right thing even when there is no reward.

## 2. Problem

- Parents remind their children too many times a day.
- It is hard to teach children consistently.
- There is no good tool to record a child's positive progress.

## 3. Target Audience

- Parents of children aged 4–10.
- Mother, father, grandparents (later stage).
- Children aged 4–10.

### Roles — who operates, who benefits, who pays (decided 2026-06-14)

These three roles are deliberately **not the same person**, and every design decision should respect the split:

- **Operator (daily user): the parent.** In MVP the parent does almost all interaction — logs behavior, defines rewards, confirms redemptions. The child mostly *watches* the garden (child self-assessment is post-MVP).
- **Beneficiary: the child.** The behavior change happens in the child; the Vision (§1) is about the child.
- **Payer / keep-or-cancel decision: the parent.** The retention KPI (§14) and the paid layer (§11) are both measured on, and sold to, the parent.

Design implications (these drive scope and UI):

- The child supplies the *daily emotional pull* (wants to see the garden grow); the parent supplies the *reason to stay and to pay*. The app must convert the child's daily delight into something the parent perceives as worth it.
- **MVP Core must make progress visible to the parent without AI.** AI (Coach, weekly letter) is the reason to *pay*, not the reason to *stay*; the core loop (garden + progress + point ledger) has to stand on its own before the AI layer exists. **Parent-perceived value + engagement is the retention north star** — if the parent does not see value and enjoy using it, the app is cancelled no matter how the child feels.
- **Parent value is not only seeing the child progress — it is the parent's own growth.** Helping the parent stay calm and regulate strong emotions in the moment of interacting with the child (and feel "I'm growing too") is a core part of what the parent values and pays for, not a side feature. This is the parent pillar (§4); keep it woven into the flow, never a guilt-inducing scorecard.
- Engagement is dual-track and runs on different cadences: child = emotional + daily; parent = rational + in-the-moment/weekly. Don't optimize one at the cost of the other. (Consistent with the two-pillar 70/30 model in §4.)

## 4. Core Values

- No punishment.
- No comparison.
- Recognize effort.
- Walk alongside the parent.

### Two pillars (decided 2026-06-14)

LitaBluma has **two co-equal pillars in philosophy/messaging (50/50)**: "the child grows, the parent grows too." But they are **interwoven, not split 50/50 in UI (~70/30)** and run on different cadences:

- **Child (daily):** center of the daily loop and the main UI — recognition loop, garden growth.
- **Parent (in-the-moment + weekly):** woven into the child flow — an in-the-moment self-regulation micro-pause, a shared weekly reflection letter. Never a separate equal-sized section; never "homework" every day.

Do NOT split the screen 50/50. See idea #8 in [feature-ideas-eq.md](feature-ideas-eq.md) for the parent pillar's feature shape. Build timing (updated 2026-06-14): a **minimal** micro-pause (one static, non-AI, no-scoring line on `not_yet`) is in **MVP Core** so the pillar ships from day one; the fuller self-regulation is MVP+ and the reflection letter is post-MVP.

## 5. Age-by-birth-date mechanism

- Store **day / month / year of birth** — do NOT store age.
- Age is computed at runtime each time the app opens (by months for young children).
- Content and AI tone shift by **dynamic age band**: 4–5 / 6–7 / 8–10.
- **Auto-notify when the child is about to cross a band** ("Bé sắp 7 tuổi, cập nhật checklist nhé?").
- **Birthday moment**: a special "one year, look how you've grown" screen + suggestion to raise the band.

## 6. Product Scope

Three layers to keep the MVP from bloating and ship a fast prototype.

### 6.1 MVP Core (build first — enough to test the value loop)
- Child profile: name, day/month/year of birth, system avatar.
- Behavior checklist: age-band library + allow custom items.
- Seed points.
- Growing garden.
- Rewards: parent-defined (including non-material).
- Recognition variety: a built-in **rotating recognition-phrase library** (non-AI) so daily praise does not become repetitive before AI encouragement exists.
- Parent self-regulation **micro-pause (minimal, non-AI)**: one calm, static line shown in the moment the parent is about to log `not_yet` (e.g. "Hít thở — mô tả việc, không trách con"). This puts the parent pillar in the product from day one. The fuller version (more prompts, weekly reflection letter) stays MVP+/post-MVP. *(Scope updated 2026-06-14: the minimal version moved from MVP+ into MVP Core.)*

### 6.2 MVP+ (right after the core loop is stable)
- AI encouragement (generate specific behavior-based recognition).
- Weekly summary (the "Sunday letter" written by AI).

### 6.3 Post-MVP
- Child self-assessment (child ticks + says what they did well → parent approves).
- AI Parenting Coach.
- Growth journal.
- Multiple children, multi-device sync (mom + dad).
- End-of-year "the child's book" PDF.

## 7. Core Feature Details

### Child profile
- Name, day/month/year of birth, system avatar (no real photo upload → protects privacy).

### Behavior checklist
- Age-band sample library for the 3 bands (ready to use immediately, then customizable).
- Good behaviors add points; not-yet behaviors are only logged for tracking.

### Seed points
- Unlock choices/privileges rather than material gifts.
- **Points taper as a behavior becomes a habit** — the app suggests moving it to "regular recognition" so the child does not act only for points. (Anti reward-addiction mechanism.)

### Growing garden
- Consistent plant-world visuals: 🌱 sprout → 🌿 seedling → 🌷 flowering → 🌳 big tree → 🦋 garden with butterflies.
- The child sees *growth* (progress), not a number.

### Recognition variety (rotating phrase library) *(MVP Core)*
Addresses the boredom risk: repeating the same praise ("Giỏi lắm!") loses meaning for the child and feels stale to the parent — and AI encouragement, which would vary it, is MVP+ and free-limited to 3/day. So the non-AI core needs its own variety.

- A built-in, human-written library of recognition lines, varied by **age band** and **behavior category**.
- The app **rotates** phrasing so the same behavior does not always get identical words — avoid repeating the most recent line for that child/behavior.
- Phrases describe the specific behavior/effort (Faber & Mazlish style); no generic "good job"-only, no comparison.
- Non-AI and offline-safe: it is *content*, not generation. When AI encouragement (MVP+) is enabled it builds on top of this library and **falls back to it** when uncertain or rate-limited (consistent with the "safe template" AI rule).
- The variety is also why tapering (§13) matters: as a behavior becomes a habit the recognition shifts tone, so the loop keeps evolving rather than repeating.

### Parent self-regulation micro-pause (minimal) *(MVP Core)*
The parent pillar (§4) in its smallest shippable form — so the parent's own emotional growth is present from the first build, not deferred entirely to MVP+.

- A single calm, human-written line shown **in the moment the parent is about to log `not_yet`** — the emotionally hard moment — e.g. "Hít thở một nhịp. Mô tả việc chưa làm, không trách con."
- Static content, non-AI, offline-safe; lines rotate so it doesn't feel canned.
- **Never a score.** No points, no streak, no "good/bad parent" rating — the no-punishment / no-shame / no-comparison principle applies to the parent too. It is optional and dismissible, never a daily "homework" gate.
- Stays parent-side and in-the-moment; it does not appear in child mode and is not tied to the child's points or garden.
- The fuller parent pillar — more situational prompts, the weekly reflection letter — remains MVP+ / post-MVP (see [feature-ideas-eq.md](feature-ideas-eq.md) #8).

### AI encouragement
- Generate specific behavior-based recognition (replacing generic "good job").
- Takes the runtime-computed age as a parameter for the right tone per age.

### Child self-assessment *(post-MVP)*
- At day's end the child ticks and says what they did well.
- The child only **proposes**; the parent approves → empowers the child while keeping data accurate.

### Growth journal *(post-MVP)*
- Record proud moments each day.

### Weekly summary
- AI creates a warm summary letter for the parent: progress + points to watch.

## 8. AI Parenting Coach *(post-MVP)*

Analyzes a situation, explains the cause, and suggests an appropriate response (Positive Discipline direction). See the EQ framework and templates in [eq-source-material.md](eq-source-material.md).

## 9. Handling recurring not-yet behavior

- No punishment.
- Nothing negative shown to the child.
- Only a gentle log plus a suggestion for the parent (AI aggregates into a weekly trend).

## 10. Retention touchpoints

- Daily golden moment.
- Companion mascot.
- Parent self-regulation micro-pause in the moment (parent value + their own emotional growth; minimal version in MVP Core).
- The Sunday letter.
- Age-band transition + birthday notifications (natural re-entry points).

## 11. Monetization

### Free
- 1 child.
- Checklist, seed points, garden, journal.
- **AI encouragement: limited to 3/day** (a taste of the value).

### Premium
- Unlimited AI encouragement.
- AI Parenting Coach.
- AI weekly summary.
- Multiple children.
- Multi-device sync (mom + dad).
- End-of-year PDF.

> Boundary: basic features stay usable for free; the deep AI layer (Coach, summary, unlimited) is the reason to pay.

## 12. MVP User Flows

### Flow 1: Parent onboarding
1. Parent creates an account.
2. App shows the child-privacy commitment.
3. Parent accepts consent to create a child profile.
4. App takes the parent to the first child-profile creation screen.

### Flow 2: Create a child profile
1. Enter the child's name.
2. Choose day/month/year of birth.
3. Choose a system avatar.
4. App computes the age band at runtime.
5. App suggests a sample checklist matching the age band.

### Flow 3: Choose the first checklist
1. App shows 5–8 sample behaviors for the age band.
2. Parent toggles each behavior on/off.
3. Parent can add custom behaviors.
4. App creates the active checklist for the child.
5. App briefly explains: good behavior adds points, not-yet is only logged.

### Flow 4: A normal day of use
1. Parent opens the child's dashboard.
2. Tick `completed`, `tried`, or `not_yet` for each behavior.
3. For `completed`/`tried`, app creates `behavior_logs` and adds points via `point_ledger`.
4. For `not_yet`, app only creates a tracking log, no point deduction.
5. The garden updates progress by day/week.

### Flow 5: Redeem points for a reward/choice
1. Parent creates a reward or picks an existing one.
2. When there are enough points, the child sees the reward as a child-friendly image.
3. Parent confirms the redemption.
4. App creates `reward_redemptions` and deducts points via `point_ledger`.
5. Copy favors "you've grown enough seeds to unlock a choice", not point-based purchasing.

### Flow 6: Recurring not-yet behavior
1. If the same behavior is `not_yet` several times in a week, the app only shows a suggestion to the parent.
2. The suggestion focuses on reducing difficulty, offering choices, or changing the timing.
3. No negative warning is shown in child mode.

## 13. Point Rules

### Principles
- Points are a recognition signal, not a control tool.
- No negative points.
- No deductions for not-yet behavior.
- Parents can always adjust each behavior's points.
- The app suggests lowering points once a behavior is a habit, but never forces it.

### Default points by behavior type
- Small/easy behavior: 1 point.
- Medium-effort behavior: 2 points.
- Hard or newly forming behavior: 3 points.
- Meaningful effort even if incomplete: 1 point.

### Tapering mechanism (habit stages)
- `new`: new behavior, full points.
- `building`: after 7 completions in 14 days, the app suggests −1 point.
- `stable`: after 21 days trending stable, the app suggests lower points or recognition-only.
- `recognition_only`: still recognized in the garden, but no longer a main point source.

### Example
- "Brush teeth at night" starts at 2 points.
- After 7 completions in 14 days, the app suggests 1 point.
- After 21 stable days, the app suggests moving to "regular recognition".
- The parent can keep it as-is if the child still needs support.

### Redemption rules
- Choice-type rewards should make up most of the list.
- Material rewards should be suggested sparingly by the app.
- No pressure copy like "about to lose points" in child mode.
- If point expiry is ever added, show it to parents only and in neutral language.

## 14. KPI

- **"Good enough to continue" bar:** 30–40% of parents return ≥ 3×/week after 30 days.
- **Ambitious bar:** 70% return ≥ 3×/week after 30 days.
- ≥ 1 behavior recorded/day (for active users).
- 50% read the weekly summary.

## 15. MVP Core done criteria

- Child profile (birth date + runtime age).
- Age-band checklist.
- Seed points (+ tapering mechanism).
- Growing garden.
- Rotating recognition-phrase library (non-AI variety).
- Parent self-regulation micro-pause (minimal, non-AI, no scoring).
- Child privacy protection.

*(AI encouragement + weekly summary are MVP+ criteria; they do not block MVP Core.)*
