# Prompt 01 — Supabase schema for Intaglio control plane

**Target model:** DeepSeek V3.1 (web UI) or Kimi K2.
**Output:** a single `schema.sql` file + a `policies.sql` RLS file, to be saved under `infra/supabase/`.

---

## Paste this into the model

You are writing the initial Postgres schema for **Intaglio**, an open-source policy + audit layer for autonomous AI agents. Intaglio stores:

- **Operators** — the legal entity that owns agents (e.g. "Acme GmbH").
- **Agents** — autonomous AI actors owned by an operator.
- **Policies** — versioned APL (Intaglio Policy Language) documents that bind an agent's behavior. Stored as source text plus a content hash.
- **Audit records** — one per agent action. Hash-chained: each record references the hash of the previous one, and computes its own `self_hash` over its canonical contents. This chain is tamper-evident.
- **Approval requests** — pending human-approval events created when a policy evaluates to `REQUIRE_APPROVAL`.

### Requirements

1. Postgres 15+, using Supabase conventions (auth.users exists; use `uuid` PKs with `gen_random_uuid()`; all tables have `created_at timestamptz default now()`).
2. Every row owned by an operator. Row-Level Security (RLS) enabled on every table. Policies: an operator's members can read/write their own rows; nobody else can see them.
3. Membership is tracked via an `operator_members` table joining `auth.users` to `operators` with a role enum (`owner`, `admin`, `member`, `viewer`).
4. `audit_records` is append-only. Write a trigger that raises an exception on `UPDATE` or `DELETE`.
5. The hash chain is enforced at the DB layer: a trigger on insert must verify that `prev_record_hash` equals the `self_hash` of the latest existing record for that `(operator_id, agent_id)` pair, or `'sha256:0000...0000'` if this is the first record for the pair.
6. Include useful indexes: `audit_records (operator_id, agent_id, created_at desc)`, `policies (operator_id, agent_id, version)`, `approval_requests (operator_id, status, created_at)`.
7. Store the full `action` and `decision` payloads as `jsonb`.
8. Use `text` for all hash fields and validate shape with a `check (value ~ '^sha256:[0-9a-f]{64}$')`.

### Tables to create

- `operators` — id, name, legal_entity, country_code, billing_email, created_at.
- `operator_members` — operator_id, user_id, role, created_at (unique on operator_id + user_id).
- `agents` — id, operator_id, slug, display_name, identity_ref (optional text — e.g. `world-id:0xab12...`), created_at, unique on (operator_id, slug).
- `policies` — id, operator_id, agent_id, version (semver text), source (text), hash (sha256 text, computed at write time if null), active (bool), created_at. Unique on (agent_id, version).
- `audit_records` — id, operator_id, agent_id, policy_id, policy_hash, record_uuid (the id that lives inside the record), action (jsonb), decision (jsonb), obligations_emitted (text[]), prev_record_hash (text), self_hash (text), created_at. Unique on (operator_id, self_hash).
- `approval_requests` — id, operator_id, agent_id, audit_record_id, requested_approver (text), status (enum: pending, approved, denied, timed_out), approved_by (uuid, nullable → auth.users), responded_at, timeout_at, created_at.

### Output

Two files, in this order, in two separate code blocks:

1. `schema.sql` — extensions, enums, tables, indexes, triggers.
2. `policies.sql` — RLS enablement and policy definitions.

No prose, no comments beyond short inline explanations of non-obvious choices. Do not invent columns outside this list.
