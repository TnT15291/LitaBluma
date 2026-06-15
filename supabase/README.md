# LitaBluma — Supabase

SQL schema, Row Level Security, and static-content seed for MVP Core persistence.
The data model mirrors [`docs/architecture.md`](../docs/architecture.md) and the
domain types in [`src/lib/domain/types.ts`](../src/lib/domain/types.ts).

## Migrations

Run in order (the Supabase CLI applies them lexicographically):

| File | Purpose |
| --- | --- |
| `migrations/0001_schema.sql` | Enums, tables, constraints, indexes, the append-only ledger + overdraft guard |
| `migrations/0002_rls.sql` | Membership helpers, `bootstrap_family()`, RLS policies on every table |
| `migrations/0003_seed_content.sql` | Static app content (behavior templates, recognition phrases, parent-pause prompts) — idempotent |

## Apply

**Local (Docker required):**

```bash
supabase start
supabase db reset   # runs every migration, then seeds
```

**Linked cloud project:**

```bash
supabase link --project-ref <ref>
supabase db push
```

## Design notes

- **Ownership.** A `family` is the billing/ownership unit; `caregivers` link an
  `auth.users` row to a family. Every child/operational row is reachable from a
  family, and RLS scopes access through `is_family_member()` / `owns_child()`
  (both `security definer`, so they don't recurse inside policies).
- **First sign-in.** Call the `bootstrap_family()` RPC once — it creates the
  family + the caller's caregiver row atomically and is idempotent. There are
  deliberately no INSERT policies on `families`/`caregivers`.
- **Ledger integrity.** `point_ledger` has no UPDATE/DELETE policy (immutable),
  a `ledger_sign` CHECK (only redemptions go negative), and a `BEFORE INSERT`
  trigger that refuses a redemption that would overdraw the balance.
- **Privacy.** `birth_date` is the only mildly-sensitive child field; age is
  always derived, never stored. `child_profiles` supports soft-delete
  (`deleted_at`) before a controlled hard delete; deleting a profile cascades to
  all logs/ledger/rewards so detailed history is purged with the child.
- **Static content** (`behavior_templates`, `recognition_phrases`,
  `parent_pause_prompts`) is world-readable to authenticated users and only
  written by migrations — never by the client.

## Environment

The frontend needs (see `.env.example`):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Service-role keys and any AI provider keys live ONLY in the backend proxy /
Edge Function environment — never in the browser bundle.
