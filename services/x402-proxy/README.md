# x402-proxy

Intaglio enforcement proxy — sits between autonomous agents and x402 payment rails.

## What it does

Every agent action is evaluated against an APL policy **before** any payment is forwarded:

```
Agent → POST /v1/actions → IntaglioEngine.evaluate() → write audit_record → return decision
                                                                       ↓ (if APPROVE + /x402/forward)
                                                               → forward to upstream
```

## Invariants

| Property | Implementation |
|---|---|
| Fail-closed | Any engine/DB error → `DENY enforcement_error` |
| Evaluate before forward | `insertAuditRecord()` completes before `forwardX402Request()` is called |
| Constant-time auth | `crypto.timingSafeEqual` in `auth.ts` |
| No PII in logs | Only `record_id` + `outcome` logged |
| Hash chain atomicity | Per-agent `pg_advisory_xact_lock` in `records.ts` |
| Idempotency | In-memory cache keyed on `agent_id + Idempotency-Key` |

## Running locally

```bash
# Requires DATABASE_URL pointing to a Postgres with Intaglio schema applied.
export DATABASE_URL=postgresql://...
bun run dev
```

## Token format

```
Bearer intaglio_agent_<agent-uuid>.<raw-secret>
```

The `raw-secret` is sha256-hashed and compared against `agents.identity_ref`.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/actions` | Evaluate an action |
| `GET` | `/v1/approvals/:id` | Poll approval status |
| `POST` | `/v1/x402/forward` | Evaluate + forward if APPROVE |
| `GET` | `/healthz` | Liveness + chain head |
