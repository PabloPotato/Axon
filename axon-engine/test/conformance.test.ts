// Fixture-based conformance tests.
// Each .apl in apl/compliance-suite/ must parse without error.
// Level-2 policies also run their embedded test vectors.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, evaluate, buildAuditRecord, inMemoryChain, GENESIS_HASH } from "../src/index.js";
import type { AgentAction, EvaluationContext } from "../src/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const suiteDir = join(__dirname, "../../apl/compliance-suite");

// ── Parse all fixtures ───────────────────────────────────────────────────────

describe("conformance — parse all fixtures", () => {
  const files = readdirSync(suiteDir).filter((f) => f.endsWith(".apl"));
  assert.ok(files.length > 0, "compliance-suite must have at least one .apl file");

  for (const file of files) {
    test(`parses ${file}`, () => {
      const src = readFileSync(join(suiteDir, file), "utf8");
      const policy = parse(src);
      assert.ok(policy.id, "policy must have an id");
      assert.ok(policy.operator, "policy must have an operator");
      assert.ok(policy.agent, "policy must have an agent");
    });
  }
});

// ── Level-2 reference test vectors ──────────────────────────────────────────

const mkCtx = (overrides: Partial<EvaluationContext> = {}): EvaluationContext => ({
  now: new Date("2026-06-01T12:00:00Z"),
  spend_window: { per_hour: 0, per_day: 0, per_month: 0 },
  open_concurrent_actions: 0,
  human_approvals: {},
  identity_verified: true,
  attestations_active: new Set(),
  ...overrides,
});

const action = (over: Partial<AgentAction> = {}): AgentAction => ({
  rail: "x402",
  endpoint: "api.example.com/pay",
  amount: { value: 50, currency: "USD" },
  chain: "solana:mainnet",
  timestamp: "2026-06-01T12:00:00Z",
  ...over,
});

describe("conformance — level2-evaluate test vectors", () => {
  const src = readFileSync(join(suiteDir, "level2-evaluate.apl"), "utf8");
  const policy = parse(src);

  test("vector 1: in-scope 50 USD → APPROVE", () => {
    const d = evaluate(policy, action({ geo: "DE" }), mkCtx());
    assert.equal(d.outcome, "APPROVE");
  });

  test("vector 2: geo=IR → DENY geo-denied", () => {
    const d = evaluate(policy, action({ geo: "IR" }), mkCtx());
    assert.equal(d.outcome, "DENY");
    assert.match(d.reason!, /^geo-denied:/);
  });

  test("vector 3: rail=mpp → DENY rail-out-of-scope", () => {
    const d = evaluate(policy, action({ rail: "mpp" }), mkCtx());
    assert.equal(d.outcome, "DENY");
    assert.match(d.reason!, /^rail-out-of-scope:/);
  });

  test("vector 4: unknown endpoint → DENY endpoint-out-of-scope", () => {
    const d = evaluate(policy, action({ endpoint: "api.other.com/pay" }), mkCtx());
    assert.equal(d.outcome, "DENY");
    assert.match(d.reason!, /^endpoint-out-of-scope:/);
  });

  test("vector 5: 150 USD > per_transaction 100 USD → DENY limit-per-transaction", () => {
    const d = evaluate(policy, action({ amount: { value: 150, currency: "USD" } }), mkCtx());
    assert.equal(d.outcome, "DENY");
    assert.equal(d.reason, "limit-per-transaction");
  });

  test("vector 6: 80 USD with per_day=950 → DENY limit-per-day", () => {
    const d = evaluate(
      policy,
      action({ amount: { value: 80, currency: "USD" } }),
      mkCtx({ spend_window: { per_hour: 0, per_day: 950, per_month: 950 } }),
    );
    assert.equal(d.outcome, "DENY");
    assert.equal(d.reason, "limit-per-day");
  });

  test("vector 7: identity_verified=false → DENY identity-not-verified", () => {
    const d = evaluate(policy, action(), mkCtx({ identity_verified: false }));
    assert.equal(d.outcome, "DENY");
    assert.equal(d.reason, "identity-not-verified");
  });
});

// ── Level-2 edge cases ───────────────────────────────────────────────────────

describe("conformance — level2-edge-cases", () => {
  const src = readFileSync(join(suiteDir, "level2-edge-cases.apl"), "utf8");
  const policy = parse(src);

  const edgeAction = (over: Partial<AgentAction> = {}): AgentAction => ({
    rail: "x402",
    endpoint: "api.facebook.com/v1/campaigns",
    amount: { value: 80, currency: "EUR" },
    chain: "solana:mainnet",
    timestamp: "2026-06-01T12:00:00Z",
    ...over,
  });

  test("glob: api.facebook.com matches *.facebook.com/* → APPROVE", () => {
    const d = evaluate(policy, edgeAction(), mkCtx());
    assert.equal(d.outcome, "APPROVE");
  });

  test("glob: evil.notfacebook.com does not match *.facebook.com/* → DENY", () => {
    const d = evaluate(policy, edgeAction({ endpoint: "evil.notfacebook.com/x" }), mkCtx());
    assert.equal(d.outcome, "DENY");
    assert.match(d.reason!, /endpoint-out-of-scope/);
  });

  test("concurrency: open_concurrent_actions=5 hits limit → DENY", () => {
    const d = evaluate(policy, edgeAction(), mkCtx({ open_concurrent_actions: 5 }));
    assert.equal(d.outcome, "DENY");
    assert.equal(d.reason, "limit-concurrency");
  });

  test("approval with grant: 1200 EUR (relaxed per_tx), approved → APPROVE", () => {
    const relaxed = {
      ...policy,
      limit: { ...policy.limit, per_transaction: { value: 5000, currency: "EUR" } },
    };
    const ctx = mkCtx({
      human_approvals: { "level2-edge-cases:cfo@example.com": true },
    });
    const d = evaluate(relaxed, edgeAction({ amount: { value: 1200, currency: "EUR" } }), ctx);
    assert.equal(d.outcome, "APPROVE");
  });
});

// ── Level-3 audit fixtures ───────────────────────────────────────────────────

describe("conformance — level3-audit", () => {
  const src = readFileSync(join(suiteDir, "level3-audit.apl"), "utf8");
  const policy = parse(src);

  test("audit records form a valid hash chain", () => {
    const chain = inMemoryChain();
    const records = [];
    let prev = GENESIS_HASH;

    for (let i = 0; i < 5; i++) {
      const a: AgentAction = {
        rail: "x402",
        endpoint: "api.example.com/pay",
        amount: { value: 10, currency: "USD" },
        timestamp: new Date(Date.now() + i * 1000).toISOString(),
      };
      const decision = evaluate(policy, a, mkCtx());
      const record = buildAuditRecord({
        policy,
        action: a,
        decision,
        prev_record_hash: prev,
        obligations_emitted: ["log:solana:mainnet", "audit:eu-ai-act-article-12"],
      });
      chain.append(record);
      records.push(record);
      prev = record.self_hash;
    }

    assert.equal(records.length, 5);
    const v = chain.verify(records);
    assert.equal(v.ok, true);
  });

  test("genesis record has the genesis hash as prev", () => {
    const a: AgentAction = {
      rail: "x402",
      amount: { value: 1, currency: "USD" },
      timestamp: new Date().toISOString(),
    };
    const record = buildAuditRecord({
      policy,
      action: a,
      decision: { outcome: "APPROVE", reason: null },
      prev_record_hash: GENESIS_HASH,
      obligations_emitted: [],
    });
    assert.equal(record.prev_record_hash, GENESIS_HASH);
    assert.match(record.self_hash, /^sha256:[0-9a-f]{64}$/);
  });
});
