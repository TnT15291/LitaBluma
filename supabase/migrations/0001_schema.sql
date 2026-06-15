-- LitaBluma — MVP Core schema
-- Mirrors docs/architecture.md "Data Model" and src/lib/domain/types.ts.
-- Decisions baked in (docs/current-state.md, 2026-06-15):
--   * birth_date stored as a full DATE; age is NEVER stored, always derived.
--   * point_ledger is append-only; the balance is always SUM(points_delta).
--   * Ledger sign is enforced at the DB level: only redemptions go negative.
--   * Behavior logs are kept while the child profile lives and purged with it
--     (ON DELETE CASCADE), so a profile delete removes all detailed history.

create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enumerated domain types (match the string unions in domain/types.ts)
-- ---------------------------------------------------------------------------
create type age_band         as enum ('4-5', '6-7', '8-10');
create type behavior_outcome as enum ('completed', 'tried', 'not_yet');
create type habit_stage      as enum ('new', 'building', 'stable', 'recognition_only');
create type reward_type      as enum ('choice', 'activity', 'privilege', 'object');
create type virtue           as enum ('independence', 'responsibility', 'emotional_regulation', 'empathy', 'perseverance');
create type ledger_source    as enum ('behavior', 'bonus', 'redemption');
create type redemption_status as enum ('pending', 'fulfilled', 'cancelled');
create type checklist_status as enum ('active', 'archived');
create type plan_tier        as enum ('free', 'premium');

-- ---------------------------------------------------------------------------
-- Tenancy: family is the billing/ownership unit; caregivers are its operators.
-- ---------------------------------------------------------------------------
create table families (
  id         uuid primary key default gen_random_uuid(),
  plan       plan_tier not null default 'free',
  created_at timestamptz not null default now()
);

create table caregivers (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references families (id) on delete cascade,
  auth_user_id uuid not null references auth.users (id) on delete cascade,
  role         text not null default 'parent',
  created_at   timestamptz not null default now(),
  unique (family_id, auth_user_id)
);
create index caregivers_auth_user_idx on caregivers (auth_user_id);
create index caregivers_family_idx on caregivers (family_id);

-- ---------------------------------------------------------------------------
-- Child profile. birth_date is the one mildly-sensitive child field; age is
-- derived at runtime. deleted_at supports soft-delete before a controlled hard
-- delete (privacy rule: clear delete path).
-- ---------------------------------------------------------------------------
create table child_profiles (
  id                   uuid primary key default gen_random_uuid(),
  family_id            uuid not null references families (id) on delete cascade,
  display_name         text not null check (length(btrim(display_name)) between 1 and 60),
  birth_date           date not null,
  avatar_key           text not null,
  -- Rotation state for the parent micro-pause (last prompt shown), so it does
  -- not repeat back-to-back across devices. Not child data, not scored.
  last_parent_pause_id text,
  created_at           timestamptz not null default now(),
  deleted_at           timestamptz
);
create index child_profiles_family_idx on child_profiles (family_id);

-- ---------------------------------------------------------------------------
-- Static, app-owned content (seeded in 0003). NEVER child data. Text ids match
-- src/lib/mock/content.ts so the existing app content maps 1:1.
-- ---------------------------------------------------------------------------
create table behavior_templates (
  id             text primary key,
  age_band       age_band not null,
  title          text not null,
  description    text,
  default_points int not null check (default_points > 0),
  category       text not null,
  virtue         virtue not null,
  is_active      boolean not null default true
);

create table recognition_phrases (
  id        text primary key,
  age_band  age_band,                              -- null = any band
  category  text,                                  -- null = any category
  outcome   behavior_outcome not null check (outcome in ('completed', 'tried')),
  text      text not null,
  is_active boolean not null default true
);

create table parent_pause_prompts (
  id        text primary key,
  context   text not null default 'not_yet',
  text      text not null,
  is_active boolean not null default true
);

-- ---------------------------------------------------------------------------
-- Per-child operational data.
-- ---------------------------------------------------------------------------
create table child_checklist_items (
  id                       uuid primary key default gen_random_uuid(),
  child_id                 uuid not null references child_profiles (id) on delete cascade,
  template_id              text references behavior_templates (id),
  title                    text not null check (length(btrim(title)) > 0),
  points_value             int not null check (points_value > 0),
  status                   checklist_status not null default 'active',
  habit_stage              habit_stage not null default 'new',
  category                 text,
  virtue                   virtue,
  -- Rotation state for recognition phrases (last line shown for this item).
  last_recognition_phrase_id text references recognition_phrases (id),
  created_by               uuid references caregivers (id),
  created_at               timestamptz not null default now()
);
create index checklist_child_idx on child_checklist_items (child_id, status);

create table behavior_logs (
  id               uuid primary key default gen_random_uuid(),
  child_id         uuid not null references child_profiles (id) on delete cascade,
  checklist_item_id uuid not null references child_checklist_items (id) on delete cascade,
  log_date         date not null,
  outcome          behavior_outcome not null,
  note             text,
  created_by       uuid references caregivers (id),
  created_at       timestamptz not null default now()
);
create index behavior_logs_child_date_idx on behavior_logs (child_id, log_date);
create index behavior_logs_item_idx on behavior_logs (checklist_item_id);

-- Append-only ledger. The balance is ALWAYS sum(points_delta). No UPDATE/DELETE
-- policy exists, so rows are immutable from the client. The CHECK enforces the
-- non-negotiable rule: behavior/bonus are never negative; only redemptions are.
create table point_ledger (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references child_profiles (id) on delete cascade,
  source_type  ledger_source not null,
  source_id    uuid,
  points_delta int not null,
  reason       text not null,
  created_at   timestamptz not null default now(),
  constraint ledger_sign check (
    (source_type = 'redemption' and points_delta < 0) or
    (source_type in ('behavior', 'bonus') and points_delta >= 0)
  )
);
create index point_ledger_child_idx on point_ledger (child_id);

create table rewards (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references child_profiles (id) on delete cascade,
  title       text not null check (length(btrim(title)) > 0),
  reward_type reward_type not null,
  points_cost int not null check (points_cost > 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
create index rewards_child_idx on rewards (child_id);

create table reward_redemptions (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references child_profiles (id) on delete cascade,
  -- Keep redemption history even if the reward definition is later deleted.
  reward_id    uuid references rewards (id) on delete set null,
  points_spent int not null check (points_spent > 0),
  status       redemption_status not null default 'fulfilled',
  redeemed_at  timestamptz not null default now()
);
create index reward_redemptions_child_idx on reward_redemptions (child_id);

-- Proposals are DERIVED, never stored. We only persist which ones the parent has
-- handled (declined or applied), so a handled card never re-appears.
create table proposal_dismissals (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references child_profiles (id) on delete cascade,
  proposal_id  text not null,
  dismissed_at timestamptz not null default now(),
  unique (child_id, proposal_id)
);

-- ---------------------------------------------------------------------------
-- Privacy / consent.
-- ---------------------------------------------------------------------------
create table consent_records (
  id              uuid primary key default gen_random_uuid(),
  family_id       uuid not null references families (id) on delete cascade,
  caregiver_id    uuid references caregivers (id),
  consent_version text not null,
  accepted_at     timestamptz not null default now()
);
create index consent_records_family_idx on consent_records (family_id);

create table data_deletion_requests (
  id           uuid primary key default gen_random_uuid(),
  family_id    uuid not null references families (id) on delete cascade,
  child_id     uuid references child_profiles (id) on delete set null,
  requested_by uuid references caregivers (id),
  status       text not null default 'pending',
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- DB-level guard: a redemption can never overdraw the child's balance. The
-- affordability check also lives in the app (domain/points.ts), but enforcing
-- it here makes the ledger trustworthy regardless of client.
-- ---------------------------------------------------------------------------
create function enforce_ledger_balance() returns trigger
language plpgsql as $$
declare
  current_balance int;
begin
  if new.points_delta < 0 then
    select coalesce(sum(points_delta), 0) into current_balance
    from point_ledger where child_id = new.child_id;
    if current_balance + new.points_delta < 0 then
      raise exception 'insufficient points: balance % cannot cover %', current_balance, new.points_delta
        using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger point_ledger_no_overdraft
  before insert on point_ledger
  for each row execute function enforce_ledger_balance();
