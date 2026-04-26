// End-to-end: parse the bundled marketing-agent.apl, run three actions through IntaglioEngine,
// verify the resulting chain.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { IntaglioEngine } from "../src/index.js";
import type { AgentAction, AuditRecord, EvaluationContext } from "../src/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, "../examples/marketing-agent.apl"), "utf8");

describe("IntaglioEngine — end-to-end with marketing-agent.apl", () => {
  test("approves small in-scope spend, requires approval over 1000 EUR, denies unknown endpoint", async () => {
    const engine = new IntaglioEngine(source);
    const ctx: EvaluationContext = {
      now: new Date(),
      spend_window: { per_hour: 0, per_day: 0, per_month: 0 },
      open_concurrent_actions: 0,
      human_approvals: {},
      identity_verified: true,
      attestations_active: new Set(),
    };

    const actions: AgentAction[] = [
      {
        rail: "x402",
        endpoint: "graph.facebook.com/v1/campaigns",
        amount: { value: 200, currency: "EUR" },
        chain: "solana:mainnet",
        timestamp: new Date().toISOString(),
      },
      {
        rail: "x402",
        endpoint: "graph.facebook.com/v1/campaigns",
        amount: { value: 1500, currency: "EUR" },
        chain: "solana:mainnet",
        timestamp: new Date().toISOString(),
      },
      {
        rail: "x402",
        endpoint: "api.unknown.com/v1/attack",
        amount: { value: 50, currency: "EUR" },
        chain: "solana:mainnet",
        timestamp: new Date().toISOString(),
      },
    ];

    const records: AuditRecord[] = [];
    const outcomes: string[] = [];
    for (const a of actions) {
      const { decision, record } = await engine.evaluate(a, ctx);
      outcomes.push(decision.outcome);
      records.push(record);
      if (decision.outcome === "APPROVE") {
        ctx.spend_window.per_day += a.amount.value;
        ctx.spend_window.per_month += a.amount.value;
      }
    }

    // 200 EUR approved; 1500 EUR is over per_transaction 500 so denies (limit),
    // not approval — because APL evaluates limits BEFORE require. Per SPEC §5.
    // Unknown endpoint denies at scope.
    assert.deepEqual(outcomes, ["APPROVE", "DENY", "DENY"]);

    // Chain verifies end-to-end.
    const chain = engine.getChain();
    const v = chain.verify(records);
    assert.equal(v.ok, true);
  });
});
