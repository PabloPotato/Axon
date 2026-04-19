# Prompt 04 — x402 enforcement proxy

**Target model:** DeepSeek V3.1 (web) or Kimi K2.
**Output:** a Hono + Bun server under `services/x402-proxy/`.

---

## Paste this into the model

Build an **x402 enforcement proxy** for Axon. This is the thing that sits between an autonomous agent and the real x402 payment rail: every outbound request passes through this proxy, gets evaluated against the agent's APL policy, and is either forwarded, rejected, or parked for human approval.

### Stack

- Runtime: **Bun** (not Node). Framework: **Hono**. TypeScript strict.
- Dependency: **`@axon/engine`** (the workspace package next door at `../axon-engine/` — use a workspace reference). You import `AxonEngine`, `AgentAction`, `EvaluationContext`, `AuditRecord` from it.
- Storage: Postgres via `postgres` (porsager/postgres). Schema matches `infra/supabase/schema.sql`.
- Auth to the proxy: bearer token with shape `axon_agent_<uuid>.<secret>`. The uuid maps to an agents row; the secret is compared via `timingSafeEqual` against a stored hash.

### Endpoints

- `POST /v1/actions` — the main evaluation endpoint an agent calls before every action.
  - Body: `{ action: AgentAction, context_overrides?: Partial<EvaluationContext> }`.
  - Server resolves the agent from the bearer, loads its active policy, loads the current `EvaluationContext` from the DB (spend_window: sum of approved audit_records in trailing windows; open_concurrent_actions: count of in-flight records; human_approvals: from approval_requests), merges `context_overrides` for testable fields only (never `spend_window`), calls `engine.evaluate(action, ctx)`.
  - On `APPROVE`: writes an audit_record and returns `{decision, record}`.
  - On `REQUIRE_APPROVAL`: writes an audit_record AND creates an approval_requests row with the computed `timeout_at`. Returns `{decision, record, approval_id}`. The caller is expected to poll `/v1/approvals/:id` or subscribe via the webhook configured in `obligation`.
  - On `DENY`: writes an audit_record and returns `{decision, record}` with HTTP 200 (the API call succeeded; the action was denied — do not conflate transport errors with policy denials).

- `GET /v1/approvals/:id` — returns the current status of an approval_requests row for the authenticated agent only.

- `POST /v1/x402/forward` — convenience: body `{ action, x402_request }`. Internally calls the same evaluation path; if APPROVE, forwards `x402_request` to the real x402 endpoint (use the endpoint in the action), streams the response back. If not APPROVE, returns the decision without forwarding.

- `GET /healthz` — returns `{ok: true, chain_head: "sha256:..."}`.

### Non-negotiables

1. **Never forward before evaluate.** The proxy must evaluate first, write the audit record, THEN forward. Not in parallel.
2. **Fail closed.** If the policy cannot be loaded, the DB is unreachable, or the engine throws, return `DENY` with reason `"enforcement_error"`. Log, do not crash the process.
3. **Constant-time secret comparison.** Never `===` on the bearer.
4. **No PII in logs.** Log the record_id and the decision.outcome. Do not log action bodies or headers.
5. **Idempotency.** Honor an `Idempotency-Key` header on `POST /v1/actions`: same key + same agent + same action payload → return the prior record verbatim, no new evaluation.
6. **Hash chain atomicity.** The audit_record insert must happen in the same transaction that reads the previous `self_hash` — otherwise two concurrent actions will fork the chain. Use `SELECT ... FOR UPDATE` on a per-agent advisory lock.

### Out of scope for v0.1

- WebSocket or SSE approval notifications (polling only for now).
- Multi-tenant rate limiting (add Cloudflare or a reverse proxy in front).
- Anchoring to Solana (the SPEC allows it as an `obligation`; emit an event but do not implement the on-chain write yet).

### File layout expected

```
services/x402-proxy/
├── src/
│   ├── index.ts         — Hono app + routes
│   ├── auth.ts          — bearer parsing, constant-time compare
│   ├── context.ts       — builds EvaluationContext from DB
│   ├── records.ts       — audit_record insert + advisory lock
│   ├── approvals.ts     — approval_requests CRUD
│   ├── forward.ts       — x402 forwarder
│   └── db.ts            — postgres client
├── test/
│   └── actions.test.ts  — bun:test, with a real Postgres (testcontainer or docker-compose)
├── package.json         — workspace ref to ../../axon-engine
├── tsconfig.json
└── README.md
```

### Output

Emit every file in its own code block with the full path above it. Strict TypeScript. No placeholder TODOs.
