-- axon — policies.sql
-- Row-Level Security for all Intaglio tables.
-- Run AFTER schema.sql.
--
-- Isolation model:
--   A user can only read/write rows belonging to operators where they appear
--   in operator_members. The membership check is done via a helper function
--   to avoid repeating a correlated subquery in every policy.

-- ─── Helper ──────────────────────────────────────────────────────────────────

create or replace function intaglio_is_operator_member(oid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from operator_members
     where operator_id = oid
       and user_id     = auth.uid()
  );
$$;

-- ─── operators ───────────────────────────────────────────────────────────────

alter table operators enable row level security;

create policy "operators: members can read"
  on operators for select
  using (intaglio_is_operator_member(id));

create policy "operators: owners can update"
  on operators for update
  using (
    exists (
      select 1 from operator_members
       where operator_id = operators.id
         and user_id     = auth.uid()
         and role        in ('owner', 'admin')
    )
  );

-- Insert: any authenticated user can create an operator (will add themselves as owner).
create policy "operators: authenticated can insert"
  on operators for insert
  with check (auth.uid() is not null);

-- Delete: owners only. Cascade handles children.
create policy "operators: owners can delete"
  on operators for delete
  using (
    exists (
      select 1 from operator_members
       where operator_id = operators.id
         and user_id     = auth.uid()
         and role        = 'owner'
    )
  );

-- ─── operator_members ────────────────────────────────────────────────────────

alter table operator_members enable row level security;

create policy "operator_members: members can read"
  on operator_members for select
  using (intaglio_is_operator_member(operator_id));

create policy "operator_members: admins can insert"
  on operator_members for insert
  with check (
    exists (
      select 1 from operator_members om
       where om.operator_id = operator_members.operator_id
         and om.user_id     = auth.uid()
         and om.role        in ('owner', 'admin')
    )
  );

create policy "operator_members: admins can update role"
  on operator_members for update
  using (
    exists (
      select 1 from operator_members om
       where om.operator_id = operator_members.operator_id
         and om.user_id     = auth.uid()
         and om.role        in ('owner', 'admin')
    )
  );

create policy "operator_members: admins can remove"
  on operator_members for delete
  using (
    exists (
      select 1 from operator_members om
       where om.operator_id = operator_members.operator_id
         and om.user_id     = auth.uid()
         and om.role        in ('owner', 'admin')
    )
  );

-- ─── agents ──────────────────────────────────────────────────────────────────

alter table agents enable row level security;

create policy "agents: members can read"
  on agents for select
  using (intaglio_is_operator_member(operator_id));

create policy "agents: admins can insert"
  on agents for insert
  with check (
    exists (
      select 1 from operator_members
       where operator_id = agents.operator_id
         and user_id     = auth.uid()
         and role        in ('owner', 'admin')
    )
  );

create policy "agents: admins can update"
  on agents for update
  using (
    exists (
      select 1 from operator_members
       where operator_id = agents.operator_id
         and user_id     = auth.uid()
         and role        in ('owner', 'admin')
    )
  );

create policy "agents: admins can delete"
  on agents for delete
  using (
    exists (
      select 1 from operator_members
       where operator_id = agents.operator_id
         and user_id     = auth.uid()
         and role        in ('owner', 'admin')
    )
  );

-- ─── policies ────────────────────────────────────────────────────────────────

alter table policies enable row level security;

create policy "policies: members can read"
  on policies for select
  using (intaglio_is_operator_member(operator_id));

create policy "policies: admins can insert"
  on policies for insert
  with check (
    exists (
      select 1 from operator_members
       where operator_id = policies.operator_id
         and user_id     = auth.uid()
         and role        in ('owner', 'admin', 'member')
    )
  );

create policy "policies: admins can update"
  on policies for update
  using (
    exists (
      select 1 from operator_members
       where operator_id = policies.operator_id
         and user_id     = auth.uid()
         and role        in ('owner', 'admin')
    )
  );

-- ─── audit_records ───────────────────────────────────────────────────────────
-- Append-only at the application layer (triggers enforce immutability).
-- RLS: members can read; nobody can update or delete (triggers handle that too).

alter table audit_records enable row level security;

create policy "audit_records: members can read"
  on audit_records for select
  using (intaglio_is_operator_member(operator_id));

-- Insert is done via the service role from the proxy (trusted server).
-- Dashboard never inserts audit_records directly.
-- To allow the proxy's service-role client to bypass RLS on insert, no insert
-- policy is needed here — service role bypasses RLS by design.
-- If you want the anon / authenticated role to insert, uncomment:
-- create policy "audit_records: members can insert"
--   on audit_records for insert
--   with check (intaglio_is_operator_member(operator_id));

-- ─── approval_requests ───────────────────────────────────────────────────────

alter table approval_requests enable row level security;

create policy "approval_requests: members can read"
  on approval_requests for select
  using (intaglio_is_operator_member(operator_id));

-- Approve/deny comes from the dashboard, which is authenticated.
create policy "approval_requests: members can update"
  on approval_requests for update
  using (intaglio_is_operator_member(operator_id));
