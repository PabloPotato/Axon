# Axon — Supabase schema

Postgres 15+ schema for the Axon control plane. Matches the canonical `AuditRecord` shape in [`axon-engine/src/types.ts`](../../axon-engine/src/types.ts) and the hash-chain rules in [`apl/SPEC.md`](../../apl/SPEC.md) §6.

## Files

- [`schema.sql`](schema.sql) — extensions, enums, tables, indexes, append-only + hash-chain triggers.
- [`policies.sql`](policies.sql) — Row-Level Security: operator-scoped isolation for every table.

## Applying

```bash
psql "$DATABASE_URL" --set ON_ERROR_STOP=1 -f schema.sql
psql "$DATABASE_URL" --set ON_ERROR_STOP=1 -f policies.sql
```

Or via the Supabase CLI:

```bash
supabase db reset          # local dev only
supabase migration new axon_initial
# paste schema.sql + policies.sql content into the generated migration
supabase db push
```

## Invariants the DB enforces

1. **Every row belongs to exactly one operator.** Foreign keys + RLS guarantee cross-tenant isolation.
2. **`audit_records` is append-only.** `UPDATE` and `DELETE` raise. If you need to "remove" a record, you don't — the whole point is that you can't.
3. **Hash chain is atomic.** On insert, the trigger reads the latest `self_hash` for `(operator_id, agent_id)` under a lock and verifies `prev_record_hash` matches, or matches genesis if this is the first record. Concurrent inserts serialize; they cannot fork the chain.
4. **One active policy per agent.** Partial unique index `policies_one_active_per_agent`.

## Writing from the proxy

The x402 proxy writes `audit_records` using the Supabase **service role**, which bypasses RLS by design. Never expose the service role key in the dashboard — the dashboard uses per-user sessions and reads through RLS.

## Assumptions

- `auth.users` exists (Supabase Auth).
- `pgcrypto` is available for `gen_random_uuid()`.
- `pg_trgm` is enabled for future fuzzy search; not used yet but harmless.
