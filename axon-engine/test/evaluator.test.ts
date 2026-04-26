// Evaluator tests — APL §5 semantics.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../src/evaluator.js";
import type { AgentAction, EvaluationContext, Policy } from "../src/types.js";

const basePolicy: Policy = {
  id: "test",
  version: "1.0.0",
  operator: "org:test",
  agent: "test-bot",
  scope: {
    rails: ["x402"],
    endpoints: ["api.example.com/*"],
    currencies: ["EUR"],
    chains: ["solana:mainnet"],
  },
  limit: {
    per_transaction: { value: 500, currency: "EUR" },
    per_day: { value: 2000, currency: "EUR" },
  },
  require: {
    human_approval_above: { value: 1000, currency: "EUR" },
  },
  obligation: { log_to: "solana:mainnet" },
  approval: { default_approver: "cfo@test.org", timeout: "30m" },
};

const baseCtx = (): EvaluationContext => ({
  now: new Date("2026-05-01T10:00:00Z"),
  spend_window: { per_hour: 0, per_day: 0, per_month: 0 },
  open_concurrent_actions: 0,
  human_approvals: {},
  identity_verified: true,
  attestations_active: new Set(),
});

const baseAction = (over: Partial<AgentAction> = {}): AgentAction => ({
  rail: "x402",
  endpoint: "api.example.com/v1/pay",
  amount: { value: 100, currency: "EUR" },
  chain: "solana:mainnet",
  timestamp: "2026-05-01T10:00:00Z",
  ...over,
});

describe("evaluator — approve path", () => {
  test("in-scope action under all limits approves", () => {
    const d = evaluate(basePolicy, baseAction(), baseCtx());
    assert.equal(d.outcome, "APPROVE");
  });
});

describe("evaluator — deny (scope)", () => {
  test("out-of-scope rail denies", () => {
    const d = evaluate(basePolicy, baseAction({ rail: "mpp" }), baseCtx());
    assert.equal(d.outcome, "DENY");
    assert.match(d.reason!, /rail-out-of-scope/);
  });

  test("out-of-scope endpoint denies", () => {
    const d = evaluate(basePolicy, baseAction({ endpoint: "api.evil.com/x" }), baseCtx());
    assert.equal(d.outcome, "DENY");
    assert.match(d.reason!, /endpoint-out-of-scope/);
  });

  test("out-of-scope currency denies", () => {
    const d = evaluate(
      basePolicy,
      baseAction({ amount: { value: 100, currency: "USD" } }),
      baseCtx(),
    );
    assert.equal(d.outcome, "DENY");
    assert.match(d.reason!, /currency-out-of-scope/);
  });

  test("out-of-scope chain denies", () => {
    const d = evaluate(basePolicy, baseAction({ chain: "ethereum:mainnet" }), baseCtx());
    assert.equal(d.outcome, "DENY");
    assert.match(d.reason!, /chain-out-of-scope/);
  });
});

describe("evaluator — deny (limit)", () => {
  test("per_transaction limit", () => {
    const d = evaluate(
      basePolicy,
      baseAction({ amount: { value: 600, currency: "EUR" } }),
      baseCtx(),
    );
    assert.equal(d.outcome, "DENY");
    assert.equal(d.reason, "limit-per-transaction");
  });

  test("per_day cumulative limit", () => {
    const ctx = baseCtx();
    ctx.spend_window.per_day = 1950;
    const d = evaluate(basePolicy, baseAction({ amount: { value: 100, currency: "EUR" } }), ctx);
    assert.equal(d.outcome, "DENY");
    assert.equal(d.reason, "limit-per-day");
  });

  test("concurrency limit", () => {
    const p = { ...basePolicy, limit: { ...basePolicy.limit, concurrency: 3 } };
    const ctx = baseCtx();
    ctx.open_concurrent_actions = 3;
    const d = evaluate(p, baseAction(), ctx);
    assert.equal(d.outcome, "DENY");
    assert.equal(d.reason, "limit-concurrency");
  });
});

describe("evaluator — require approval", () => {
  test("amount above threshold requires approval", () => {
    const d = evaluate(
      basePolicy,
      baseAction({ amount: { value: 1500, currency: "EUR" } }),
      baseCtx(),
    );
    // 1500 > per_transaction 500 → denied before reaching approval.
    // Test the approval path with a policy that permits larger per-tx.
    const relaxed = {
      ...basePolicy,
      limit: { ...basePolicy.limit, per_transaction: { value: 5000, currency: "EUR" } },
    };
    const d2 = evaluate(
      relaxed,
      baseAction({ amount: { value: 1500, currency: "EUR" } }),
      baseCtx(),
    );
    assert.equal(d.outcome, "DENY");
    assert.equal(d2.outcome, "REQUIRE_APPROVAL");
    if (d2.outcome === "REQUIRE_APPROVAL") {
      assert.equal(d2.approver, "cfo@test.org");
    }
  });

  test("approval already granted → approves", () => {
    const relaxed = {
      ...basePolicy,
      limit: { ...basePolicy.limit, per_transaction: { value: 5000, currency: "EUR" } },
    };
    const ctx = baseCtx();
    ctx.human_approvals["test:cfo@test.org"] = true;
    const d = evaluate(relaxed, baseAction({ amount: { value: 1500, currency: "EUR" } }), ctx);
    assert.equal(d.outcome, "APPROVE");
  });
});

describe("evaluator — deny block", () => {
  test("geo in deny.countries denies", () => {
    const p: Policy = { ...basePolicy, deny: { countries: ["IR", "KP"] } };
    const d = evaluate(p, baseAction({ geo: "IR" }), baseCtx());
    assert.equal(d.outcome, "DENY");
    assert.match(d.reason!, /geo-denied/);
  });

  test("expired policy denies", () => {
    const p: Policy = { ...basePolicy, deny: { after: "2026-01-01T00:00:00Z" } };
    const d = evaluate(p, baseAction(), baseCtx());
    assert.equal(d.outcome, "DENY");
    assert.equal(d.reason, "policy-expired");
  });
});

describe("evaluator — determinism", () => {
  test("same inputs yield identical decisions across calls", () => {
    const a = evaluate(basePolicy, baseAction(), baseCtx());
    const b = evaluate(basePolicy, baseAction(), baseCtx());
    assert.deepEqual(a, b);
  });
});
