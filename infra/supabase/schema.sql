-- axon — schema.sql
-- Postgres 15+, Supabase conventions.
-- Run: psql $DATABASE_URL --set ON_ERROR_STOP=1 -f schema.sql

-- ─── Extensions ──────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- future: fuzzy search on agent names

-- ─── Enums ───────────────────────────────────────────────────────────────────

do $$ begin
  create type member_role as enum ('owner', 'admin', 'member', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum ('pending', 'approved', 'denied', 'timed_out');
exception when duplicate_object then null; end $$;

-- ─── Operators ───────────────────────────────────────────────────────────────
-- The legal entity that owns one or more agents.

create table if not exists operators (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  legal_entity   text not null,
  country_code   text not null check (char_length(country_code) = 2),
  billing_email  text not null,
  created_at     timestamptz not null default now()
);

-- ─── Operator Members ─────────────────────────────────────────────────────────
-- Maps auth.users ↔ operators with a role.

create table if not exists operator_members (
  operator_id  uuid not null references operators(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         member_role not null default 'member',
  created_at   timestamptz not null default now(),
  primary key (operator_id, user_id)
);

-- ─── Agents ──────────────────────────────────────────────────────────────────
-- Autonomous AI actors owned by an operator. Slug is the stable external key.

create table if not exists agents (
  id             uuid primary key default gen_random_uuid(),
  operator_id    uuid not null references operators(id) on delete cascade,
  slug           text not null,
  display_name   text not null,
  identity_ref   text,  -- optional: "world-id:0xab12..." or similar
  created_at     timestamptz not null default now(),
  unique (operator_id, slug)
);

-- ─── Policies ─────────────────────────────────────────────────────────────────
-- Versioned APL documents. One active version per agent at any time.
-- hash computed by the application layer (sha256 over canonical source text).

create table if not exists policies (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null references operators(id) on delete cascade,
  agent_id     uuid not null references agents(id) on delete cascade,
  version      text not null,  -- semver, e.g. "1.0.0"
  source       text not null,
  hash         text not null check (hash ~ '^sha256:[0-9a-f]{64}$'),
  active       boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (agent_id, version)
);

-- Only one active policy per agent — enforced by partial unique index.
create unique index if not exists policies_one_active_per_agent
  on policies (agent_id)
  where (active = true);

-- ─── Audit Records ────────────────────────────────────────────────────────────
-- Append-only hash-chained log. One row per agent action evaluation.
-- self_hash = sha256(canonical(all other fields) + prev_record_hash).

create table if not exists audit_records (
  id                  uuid primary key default gen_random_uuid(),
  operator_id         uuid not null references operators(id) on delete restrict,
  agent_id            uuid not null references agents(id) on delete restrict,
  policy_id           uuid not null references policies(id) on delete restrict,
  policy_hash         text not null check (policy_hash ~ '^sha256:[0-9a-f]{64}$'),
  record_uuid         text not null,  -- the record_id field that lives *inside* the record JSON
  action              jsonb not null,
  decision            jsonb not null,
  obligations_emitted text[] not null default '{}',
  prev_record_hash    text not null check (prev_record_hash ~ '^sha256:[0-9a-f]{64}$'),
  self_hash           text not null check (self_hash ~ '^sha256:[0-9a-f]{64}$'),
  created_at          timestamptz not null default now(),
  unique (operator_id, self_hash)
);

-- ─── Approval Requests ────────────────────────────────────────────────────────

create table if not exists approval_requests (
  id                  uuid primary key default gen_random_uuid(),
  operator_id         uuid not null references operators(id) on delete cascade,
  agent_id            uuid not null references agents(id) on delete cascade,
  audit_record_id     uuid not null references audit_records(id) on delete restrict,
  requested_approver  text,  -- role name or email
  status              approval_status not null default 'pending',
  approved_by         uuid references auth.users(id),
  responded_at        timestamptz,
  timeout_at          timestamptz,
  created_at          timestamptz not null default now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists idx_audit_records_lookup
  on audit_records (operator_id, agent_id, created_at desc);

create index if not exists idx_policies_lookup
  on policies (operator_id, agent_id, version);

create index if not exists idx_approval_requests_lookup
  on approval_requests (operator_id, status, created_at);

create index if not exists idx_agents_operator
  on agents (operator_id);

create index if not exists idx_operator_members_user
  on operator_members (user_id);

-- ─── Triggers ─────────────────────────────────────────────────────────────────

-- 1. audit_records is append-only: reject UPDATE and DELETE.
create or replace function audit_records_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'audit_records rows are immutable (intaglio policy)';
end;
$$;

drop trigger if exists trg_audit_records_no_update on audit_records;
create trigger trg_audit_records_no_update
  before update on audit_records
  for each row execute function audit_records_immutable();

drop trigger if exists trg_audit_records_no_delete on audit_records;
create trigger trg_audit_records_no_delete
  before delete on audit_records
  for each row execute function audit_records_immutable();

-- 2. Hash-chain integrity: verify prev_record_hash on insert.
--    The chain tail is genesis hash if this is the first record for the pair.
create or replace function audit_records_verify_chain()
returns trigger language plpgsql as $$
declare
  genesis constant text := 'sha256:0000000000000000000000000000000000000000000000000000000000000000';
  expected_prev text;
begin
  select self_hash
    into expected_prev
    from audit_records
   where operator_id = new.operator_id
     and agent_id    = new.agent_id
   order by created_at desc
   limit 1;

  if expected_prev is null then
    expected_prev := genesis;
  end if;

  if new.prev_record_hash <> expected_prev then
    raise exception 'audit_records hash chain broken: expected prev_record_hash=% got=%',
      expected_prev, new.prev_record_hash;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_audit_records_chain on audit_records;
create trigger trg_audit_records_chain
  before insert on audit_records
  for each row execute function audit_records_verify_chain();
