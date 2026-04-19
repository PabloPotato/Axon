// services/x402-proxy/src/index.ts
// Axon x402 enforcement proxy — Hono app.
//
// Routes:
//   POST   /v1/actions           — evaluate action against APL policy
//   GET    /v1/approvals/:id     — poll approval status
//   POST   /v1/x402/forward      — evaluate + forward if APPROVE
//   GET    /healthz              — liveness check
//
// Security invariants:
//   - Fail-closed: any error → DENY with enforcement_error
//   - Evaluate THEN forward (never in parallel, never before)
//   - No PII in logs (only record_id + outcome)
//   - Constant-time bearer comparison (in auth.ts)
//   - Idempotency-Key honored

import { Hono } from "hono";
import { authenticate } from "./auth.js";
import { buildContext } from "./context.js";
import {
  insertAuditRecord,
  getLastRecordHash,
  getRecordsForVerification,
} from "./records.js";
import {
  createApprovalRequest,
  getApprovalRequest,
} from "./approvals.js";
import { forwardX402Request } from "./forward.js";
import { sql } from "./db.js";
import {
  AxonEngine,
  inMemoryChain,
  GENESIS_HASH,
  buildAuditRecord,
} from "@axon/engine";
import type { AgentAction, EvaluationContext } from "@axon/engine";

const app = new Hono();

// ─── Idempotency store (in-memory, v0.1 — use Redis in production) ───────────
const idempotencyCache = new Map<string, unknown>();

// ─── Middleware: resolve agent from bearer ────────────────────────────────────

async function resolveAgent(c: import("hono").Context) {
  const agent = await authenticate(c.req.header("Authorization")).catch(() => null);
  if (!agent) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  c.set("agent" as never, agent);
  return null;
}

// ─── Helper: load active policy source from DB ────────────────────────────────

async function loadActivePolicy(
  agentId: string,
  operatorId: string
): Promise<{ policyId: string; source: string } | null> {
  const rows = await sql<Array<{ id: string; source: string }>>`
    select id, source
    from policies
    where agent_id    = ${agentId}
      and operator_id = ${operatorId}
      and active      = true
    limit 1
  `;
  if (!rows[0]) return null;
  return { policyId: rows[0].id, source: rows[0].source };
}

// ─── POST /v1/actions ─────────────────────────────────────────────────────────

app.post("/v1/actions", async (c) => {
  const authErr = await resolveAgent(c);
  if (authErr) return authErr;

  const agent = c.get("agent" as never) as {
    agentId: string;
    operatorId: string;
    slug: string;
  };

  // Idempotency check.
  const idempotencyKey = c.req.header("Idempotency-Key");
  if (idempotencyKey) {
    const cacheKey = `${agent.agentId}:${idempotencyKey}`;
    const cached = idempotencyCache.get(cacheKey);
    if (cached !== undefined) {
      return c.json(cached);
    }
  }

  let body: { action: AgentAction; context_overrides?: Partial<EvaluationContext> };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { action, context_overrides } = body;
  if (!action) return c.json({ error: "action is required" }, 400);

  // Fail-closed wrapper.
  try {
    const policyData = await loadActivePolicy(agent.agentId, agent.operatorId);
    if (!policyData) {
      // No active policy → deny by default.
      return c.json(
        { decision: { outcome: "DENY", reason: "no-active-policy" }, record: null },
        200
      );
    }

    const ctx = await buildContext(agent.agentId, agent.operatorId);

    // Apply context_overrides — only for non-spend fields (cannot override spend_window).
    const mergedCtx: EvaluationContext = {
      ...ctx,
      ...(context_overrides
        ? {
            identity_verified:
              context_overrides.identity_verified ?? ctx.identity_verified,
            attestations_active:
              context_overrides.attestations_active ?? ctx.attestations_active,
            // spend_window is intentionally NOT overridable
          }
        : {}),
    };

    // Build a chain that seeds from the DB's last hash.
    const lastHash = await getLastRecordHash(agent.agentId, agent.operatorId);
    const chain = inMemoryChain();
    // Patch the chain so last_hash() returns the DB value
    // (we append a synthetic sentinel — clean this up by adding a seed() method to the chain API)
    if (lastHash !== GENESIS_HASH) {
      (chain as unknown as { _last: string })._last = lastHash;
    }

    const engine = new AxonEngine(policyData.source, { chain });
    const { decision, record } = await engine.evaluate(action, mergedCtx);

    // Insert audit record (with advisory lock to protect chain integrity).
    const dbRecordId = await insertAuditRecord(
      record,
      policyData.policyId,
      agent.agentId,
      agent.operatorId
    );

    // Log: record_id + outcome only. No action body.
    console.log(`[axon] record=${record.record_id} outcome=${decision.outcome}`);

    let approvalId: string | undefined;

    if (decision.outcome === "REQUIRE_APPROVAL") {
      const timeoutAt = decision.timeout
        ? new Date(Date.now() + parseDuration(decision.timeout))
        : undefined;
      approvalId = await createApprovalRequest({
        operatorId: agent.operatorId,
        agentId: agent.agentId,
        auditRecordDbId: dbRecordId,
        requestedApprover: decision.approver,
        timeoutAt,
      });
    }

    const response = { decision, record, ...(approvalId ? { approval_id: approvalId } : {}) };

    if (idempotencyKey) {
      idempotencyCache.set(`${agent.agentId}:${idempotencyKey}`, response);
    }

    return c.json(response, 200);
  } catch (err: unknown) {
    console.error(`[axon] enforcement_error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json(
      { decision: { outcome: "DENY", reason: "enforcement_error" }, record: null },
      200
    );
  }
});

// ─── GET /v1/approvals/:id ────────────────────────────────────────────────────

app.get("/v1/approvals/:id", async (c) => {
  const authErr = await resolveAgent(c);
  if (authErr) return authErr;

  const agent = c.get("agent" as never) as {
    agentId: string;
    operatorId: string;
  };
  const approvalId = c.req.param("id");

  try {
    const row = await getApprovalRequest(
      approvalId,
      agent.agentId,
      agent.operatorId
    );
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json(row);
  } catch (err) {
    console.error(`[axon] approval_fetch_error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ error: "enforcement_error" }, 500);
  }
});

// ─── POST /v1/x402/forward ────────────────────────────────────────────────────
// Evaluate + forward if APPROVE.

app.post("/v1/x402/forward", async (c) => {
  const authErr = await resolveAgent(c);
  if (authErr) return authErr;

  const agent = c.get("agent" as never) as {
    agentId: string;
    operatorId: string;
    slug: string;
  };

  let body: { action: AgentAction; x402_request: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { action, x402_request } = body;
  if (!action) return c.json({ error: "action is required" }, 400);

  try {
    const policyData = await loadActivePolicy(agent.agentId, agent.operatorId);
    if (!policyData) {
      return c.json({ decision: { outcome: "DENY", reason: "no-active-policy" } }, 200);
    }

    const ctx = await buildContext(agent.agentId, agent.operatorId);
    const lastHash = await getLastRecordHash(agent.agentId, agent.operatorId);
    const chain = inMemoryChain();
    if (lastHash !== GENESIS_HASH) {
      (chain as unknown as { _last: string })._last = lastHash;
    }

    const engine = new AxonEngine(policyData.source, { chain });
    const { decision, record } = await engine.evaluate(action, ctx);

    // Write audit record BEFORE forwarding.
    const dbRecordId = await insertAuditRecord(
      record,
      policyData.policyId,
      agent.agentId,
      agent.operatorId
    );

    console.log(`[axon] forward record=${record.record_id} outcome=${decision.outcome}`);

    if (decision.outcome !== "APPROVE") {
      let approvalId: string | undefined;
      if (decision.outcome === "REQUIRE_APPROVAL") {
        const timeoutAt = decision.timeout
          ? new Date(Date.now() + parseDuration(decision.timeout))
          : undefined;
        approvalId = await createApprovalRequest({
          operatorId: agent.operatorId,
          agentId: agent.agentId,
          auditRecordDbId: dbRecordId,
          requestedApprover: decision.approver,
          timeoutAt,
        });
      }
      return c.json({ decision, record, ...(approvalId ? { approval_id: approvalId } : {}) }, 200);
    }

    // APPROVE — forward to upstream.
    const fwd = await forwardX402Request(action, x402_request);
    return c.json({ decision, record, upstream: fwd }, fwd.ok ? 200 : 502);
  } catch (err) {
    console.error(`[axon] forward_error: ${err instanceof Error ? err.message : String(err)}`);
    return c.json({ decision: { outcome: "DENY", reason: "enforcement_error" }, record: null }, 200);
  }
});

// ─── GET /healthz ─────────────────────────────────────────────────────────────

app.get("/healthz", async (c) => {
  try {
    const rows = await sql<Array<{ selfHash: string }>>`
      select self_hash as "selfHash"
      from audit_records
      order by created_at desc
      limit 1
    `;
    const chainHead = rows[0]?.selfHash ?? GENESIS_HASH;
    return c.json({ ok: true, chain_head: chainHead });
  } catch {
    return c.json({ ok: false, chain_head: null }, 503);
  }
});

// ─── Duration parser (e.g. "30m", "2h", "1d") ────────────────────────────────

function parseDuration(s: string): number {
  const m = s.match(/^(\d+)(s|m|h|d)$/);
  if (!m || !m[1]) return 3600_000; // default 1h
  const n = parseInt(m[1], 10);
  switch (m[2]) {
    case "s": return n * 1_000;
    case "m": return n * 60_000;
    case "h": return n * 3_600_000;
    case "d": return n * 86_400_000;
    default:  return 3_600_000;
  }
}

// ─── Start ────────────────────────────────────────────────────────────────────

const port = parseInt(process.env["PORT"] ?? "3001", 10);
console.log(`[axon] x402-proxy listening on :${port}`);

export default {
  port,
  fetch: app.fetch,
};
