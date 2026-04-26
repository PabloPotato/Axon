// Run the marketing-agent example end-to-end:
//   tsx examples/run.ts
//
// Demonstrates: parse APL → evaluate three actions → print the audit chain.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AxonEngine, type AgentAction, type EvaluationContext } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, "marketing-agent.apl"), "utf8");

const engine = new AxonEngine(source);

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

for (const action of actions) {
  const { decision, record } = await engine.evaluate(action, ctx);
  console.log("----");
  console.log("action:", action.endpoint, action.amount.value, action.amount.currency);
  console.log("decision:", decision);
  console.log("record.self_hash:", record.self_hash);
  if (decision.outcome === "APPROVE") {
    ctx.spend_window.per_day += action.amount.value;
    ctx.spend_window.per_month += action.amount.value;
  }
}

const chain = engine.getChain();
console.log("\nchain head:", chain.last_hash());
