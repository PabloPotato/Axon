# Prompt 02 — Next.js + shadcn dashboard skeleton

**Target model:** Kimi K2 via Cursor Composer (multi-file) or Bolt.new.
**Output:** a working Next.js 15 app under `dashboard/`.

---

## Paste this into the model

Build the **Axon operator dashboard**: a Next.js 15 (App Router, TypeScript, Tailwind v4, shadcn/ui) app that lets an operator manage their agents, policies, audit records, and pending approvals. Auth via Supabase (email magic link + GitHub OAuth). Data backend is the Supabase schema described in `infra/supabase/schema.sql` (tables: operators, operator_members, agents, policies, audit_records, approval_requests).

### Pages to build

1. `/` — marketing-lite homepage for signed-out users; redirect to `/app` if signed in.
2. `/login` — Supabase magic-link + GitHub OAuth.
3. `/app` — dashboard home. Four KPI cards: actions last 24h, denies last 24h, pending approvals, chain head hash (short). Recent activity table (last 20 audit records across all agents).
4. `/app/agents` — list of agents with status pill, active policy version, 24h activity sparkline.
5. `/app/agents/[slug]` — agent detail. Tabs: Overview · Policy · Audit · Approvals · Settings.
   - **Policy tab:** Monaco editor, APL syntax (treat as custom language — just use plain text highlighting for now), "Save new version" button that posts to `/api/policies` and bumps semver.
   - **Audit tab:** paginated table of audit_records; clicking a row opens a side sheet showing canonical JSON + verification badge (green if hash chain validates).
   - **Approvals tab:** pending approval_requests with Approve / Deny buttons that post to `/api/approvals/[id]`.
6. `/app/settings` — operator name, members table with role dropdown.

### API routes (App Router handlers)

- `POST /api/policies` — body `{agent_id, source, version}`. Validates semver, computes sha256 hash of source, inserts. Marks previous active version inactive in a transaction.
- `GET /api/audit?agent_id=&cursor=` — paginated (50/page) audit records.
- `GET /api/audit/verify?agent_id=` — server-side verifies the hash chain; returns `{ok: true}` or `{ok: false, broken_at, reason}`.
- `POST /api/approvals/[id]` — body `{decision: "approved" | "denied"}`. Updates approval_requests row and writes a follow-up audit record.

### Non-negotiables

- TypeScript strict. No `any`.
- All data access goes through a `createServerClient()` helper that uses the user's cookie-bound Supabase session — never a service-role key in a request handler that returns to the browser.
- RLS already enforces per-operator isolation; the dashboard MUST NOT pass operator_id from the client as a trust boundary. Resolve the active operator from a `/app/_layout.tsx` server component that reads operator_members.
- shadcn components: Card, Table, Tabs, Dialog, Sheet, Button, Badge, Skeleton, Toast. Install via `npx shadcn@latest add ...`.
- Dark mode default, light toggle in header.
- No client-side data fetching for anything server-renderable. Use server components + revalidateTag.
- Do NOT implement APL parsing or evaluation in the dashboard. Those live in `@axon/engine`. Just read/write audit records and policy source text.

### File layout expected

```
dashboard/
├── app/
│   ├── page.tsx                    — marketing-lite home
│   ├── login/page.tsx
│   ├── app/
│   │   ├── layout.tsx              — auth guard + operator resolver
│   │   ├── page.tsx                — dashboard home
│   │   ├── agents/page.tsx
│   │   ├── agents/[slug]/page.tsx
│   │   └── settings/page.tsx
│   └── api/...
├── components/ui/…                 — shadcn
├── lib/supabase/{server,client}.ts
├── lib/hash.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

### Output

Emit every file in its own code block with the full path above it. Do not skip config files. Do not add features outside this list.
