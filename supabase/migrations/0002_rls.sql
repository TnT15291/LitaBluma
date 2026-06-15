-- LitaBluma — Row Level Security
-- Every family/child row is scoped to the authenticated caregiver's family.
-- Helper functions are SECURITY DEFINER so they bypass RLS internally and do not
-- recurse when used inside the caregivers/child policies.

-- ---------------------------------------------------------------------------
-- Membership helpers
-- ---------------------------------------------------------------------------
create function public.is_family_member(fid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from caregivers
    where caregivers.family_id = fid
      and caregivers.auth_user_id = auth.uid()
  );
$$;

create function public.owns_child(cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from child_profiles c
    join caregivers cg on cg.family_id = c.family_id
    where c.id = cid
      and cg.auth_user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Bootstrap: create a family + the caller's caregiver row atomically. Called
-- once at first sign-in. Avoids needing INSERT policies on families/caregivers.
-- ---------------------------------------------------------------------------
create function public.bootstrap_family()
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  existing uuid;
  new_family uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  -- Idempotent: if the caller already has a family, return it.
  select family_id into existing from caregivers where auth_user_id = auth.uid() limit 1;
  if existing is not null then
    return existing;
  end if;

  insert into families default values returning id into new_family;
  insert into caregivers (family_id, auth_user_id, role) values (new_family, auth.uid(), 'owner');
  return new_family;
end;
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS on every table.
-- ---------------------------------------------------------------------------
alter table families               enable row level security;
alter table caregivers             enable row level security;
alter table child_profiles         enable row level security;
alter table behavior_templates     enable row level security;
alter table recognition_phrases    enable row level security;
alter table parent_pause_prompts   enable row level security;
alter table child_checklist_items  enable row level security;
alter table behavior_logs          enable row level security;
alter table point_ledger           enable row level security;
alter table rewards                enable row level security;
alter table reward_redemptions     enable row level security;
alter table proposal_dismissals    enable row level security;
alter table consent_records        enable row level security;
alter table data_deletion_requests enable row level security;

-- ---------------------------------------------------------------------------
-- Tenancy tables. No INSERT policies — rows are created via bootstrap_family().
-- ---------------------------------------------------------------------------
create policy families_select on families
  for select using (is_family_member(id));
create policy families_update on families
  for update using (is_family_member(id)) with check (is_family_member(id));

create policy caregivers_select on caregivers
  for select using (is_family_member(family_id));

-- ---------------------------------------------------------------------------
-- Child profiles — family-scoped, full lifecycle (incl. soft + hard delete).
-- ---------------------------------------------------------------------------
create policy child_profiles_select on child_profiles
  for select using (is_family_member(family_id));
create policy child_profiles_insert on child_profiles
  for insert with check (is_family_member(family_id));
create policy child_profiles_update on child_profiles
  for update using (is_family_member(family_id)) with check (is_family_member(family_id));
create policy child_profiles_delete on child_profiles
  for delete using (is_family_member(family_id));

-- ---------------------------------------------------------------------------
-- Static content — readable by any authenticated user; never written from the
-- client (seeded by migration as the table owner).
-- ---------------------------------------------------------------------------
create policy behavior_templates_read on behavior_templates
  for select to authenticated using (true);
create policy recognition_phrases_read on recognition_phrases
  for select to authenticated using (true);
create policy parent_pause_prompts_read on parent_pause_prompts
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Checklist items — full CRUD within the owning child.
-- ---------------------------------------------------------------------------
create policy checklist_select on child_checklist_items
  for select using (owns_child(child_id));
create policy checklist_insert on child_checklist_items
  for insert with check (owns_child(child_id));
create policy checklist_update on child_checklist_items
  for update using (owns_child(child_id)) with check (owns_child(child_id));
create policy checklist_delete on child_checklist_items
  for delete using (owns_child(child_id));

-- ---------------------------------------------------------------------------
-- Behavior logs — append + read only. History is not edited from the client;
-- removal happens via child/checklist cascade.
-- ---------------------------------------------------------------------------
create policy logs_select on behavior_logs
  for select using (owns_child(child_id));
create policy logs_insert on behavior_logs
  for insert with check (owns_child(child_id));

-- ---------------------------------------------------------------------------
-- Point ledger — append + read only. The absence of UPDATE/DELETE policies is
-- deliberate: the ledger is immutable. Balance = sum(points_delta).
-- ---------------------------------------------------------------------------
create policy ledger_select on point_ledger
  for select using (owns_child(child_id));
create policy ledger_insert on point_ledger
  for insert with check (owns_child(child_id));

-- ---------------------------------------------------------------------------
-- Rewards — full CRUD; redemptions append + read only.
-- ---------------------------------------------------------------------------
create policy rewards_select on rewards
  for select using (owns_child(child_id));
create policy rewards_insert on rewards
  for insert with check (owns_child(child_id));
create policy rewards_update on rewards
  for update using (owns_child(child_id)) with check (owns_child(child_id));
create policy rewards_delete on rewards
  for delete using (owns_child(child_id));

create policy redemptions_select on reward_redemptions
  for select using (owns_child(child_id));
create policy redemptions_insert on reward_redemptions
  for insert with check (owns_child(child_id));

-- ---------------------------------------------------------------------------
-- Proposal dismissals — owning child can add/read/clear.
-- ---------------------------------------------------------------------------
create policy dismissals_select on proposal_dismissals
  for select using (owns_child(child_id));
create policy dismissals_insert on proposal_dismissals
  for insert with check (owns_child(child_id));
create policy dismissals_delete on proposal_dismissals
  for delete using (owns_child(child_id));

-- ---------------------------------------------------------------------------
-- Privacy tables — family-scoped.
-- ---------------------------------------------------------------------------
create policy consent_select on consent_records
  for select using (is_family_member(family_id));
create policy consent_insert on consent_records
  for insert with check (is_family_member(family_id));

create policy deletion_select on data_deletion_requests
  for select using (is_family_member(family_id));
create policy deletion_insert on data_deletion_requests
  for insert with check (is_family_member(family_id));
create policy deletion_update on data_deletion_requests
  for update using (is_family_member(family_id)) with check (is_family_member(family_id));
