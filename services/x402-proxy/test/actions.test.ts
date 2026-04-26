// services/x402-proxy/test/actions.test.ts
// Integration tests for POST /v1/actions.
// Uses bun:test. Requires a live Postgres (set DATABASE_URL env).
//
// Run: bun test

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { sql } from "../src/db.js";

// ─── Test helpers ─────────────────────────────────────────────────────────────

const BASE = `http://localhost:${process.env["PORT"] ?? 3001}`;

async function post(path: string, body: unknown, token?: string) {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

let testOperatorId: string;
let testAgentId: string;
let testPolicyId: string;
const TEST_SECRET_RAW = "test-secret-do-not-use-in-production";

import { createHash } from "node:crypto";
const TEST_SECRET_HASH = createHash("sha256").update(TEST_SECRET_RAW).digest("hex");

beforeAll(async () => {
  // Insert operator
  const opRows = await sql<Array<{ id: string }>>`
    insert into operators (name, legal_entity, country_code, billing_email)
    values ('Test Operator', 'Test GmbH', 'DE', 'test@example.com')
    returning id
  `;
  testOperatorId = opRows[0]!.id;

  // Insert agent (identity_ref holds the secret hash for v0.1)
  const agRows = await sql<Array<{ id: string }>>`
    insert into agents (operator_id, slug, display_name, identity_ref)
    values (${testOperatorId}, 'test-agent', 'Test Agent', ${TEST_SECRET_HASH})
    returning id
  `;
  testAgentId = agRows[0]!.id;

  // Insert policy
  const source = `
    policy test-policy v0.1
    agent   test-agent
    operator test-operator

    scope {
      rails    [x402]
      currencies [USDC]
    }

    limit {
      per_transaction { value 100  currency USDC }
      per_day         { value 1000 currency USDC }
    }

    obligation {
      log_to solana:devnet
    }
  `;
  const policyHash = "sha256:" + createHash("sha256").update(source).digest("hex");

  const polRows = await sql<Array<{ id: string }>>`
    insert into policies (operator_id, agent_id, version, source, hash, active)
    values (${testOperatorId}, ${testAgentId}, '0.1.0', ${source}, ${policyHash}, true)
    returning id
  `;
  testPolicyId = polRows[0]!.id;
});

afterAll(async () => {
  // Clean up in reverse dependency order.
  await sql`delete from audit_records where operator_id = ${testOperatorId}`;
  await sql`delete from approval_requests where operator_id = ${testOperatorId}`;
  await sql`delete from policies where operator_id = ${testOperatorId}`;
  await sql`delete from agents where operator_id = ${testOperatorId}`;
  await sql`delete from operators where id = ${testOperatorId}`;
  await sql.end();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /v1/actions", () => {
  const validAction = {
    rail: "x402",
    endpoint: "https://example.com/pay",
    amount: { value: 50, currency: "USDC" },
    timestamp: new Date().toISOString(),
  };
  const token = `intaglio_agent_${testAgentId}.${TEST_SECRET_RAW}`;

  test("returns 401 with no auth", async () => {
    const res = await post("/v1/actions", { action: validAction });
    expect(res.status).toBe(401);
  });

  test("returns 401 with malformed token", async () => {
    const res = await post("/v1/actions", { action: validAction }, "bad-token");
    expect(res.status).toBe(401);
  });

  test("approves a valid action within limits", async () => {
    const res = await post("/v1/actions", { action: validAction }, token);
    expect(res.status).toBe(200);
    const body = await res.json() as { decision: { outcome: string }; record: unknown };
    expect(body.decision.outcome).toBe("APPROVE");
    expect(body.record).toBeTruthy();
  });

  test("denies an action exceeding per_transaction limit", async () => {
    const bigAction = { ...validAction, amount: { value: 200, currency: "USDC" } };
    const res = await post("/v1/actions", { action: bigAction }, token);
    const body = await res.json() as { decision: { outcome: string; reason: string } };
    expect(body.decision.outcome).toBe("DENY");
    expect(body.decision.reason).toContain("limit-per-transaction");
  });

  test("honors Idempotency-Key — second call returns same record", async () => {
    const key = crypto.randomUUID();
    const action = { ...validAction, amount: { value: 10, currency: "USDC" } };
    const r1 = await fetch(`${BASE}/v1/actions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": key,
      },
      body: JSON.stringify({ action }),
    });
    const b1 = await r1.json() as { record: { record_id: string } };

    const r2 = await fetch(`${BASE}/v1/actions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": key,
      },
      body: JSON.stringify({ action }),
    });
    const b2 = await r2.json() as { record: { record_id: string } };

    expect(b1.record.record_id).toBe(b2.record.record_id);
  });
});

describe("GET /healthz", () => {
  test("returns ok", async () => {
    const res = await fetch(`${BASE}/healthz`);
    const body = await res.json() as { ok: boolean };
    expect(body.ok).toBe(true);
  });
});
