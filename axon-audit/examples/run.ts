// axon-audit — example/run.ts
// Produces example-report.pdf in the cwd from level3-audit.apl plus 8 synthetic
// actions. Run with:  pnpm example   (or: tsx examples/run.ts)

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  parse,
  evaluate,
  buildAuditRecord,
  inMemoryChain,
  GENESIS_HASH,
  type AgentAction,
  type EvaluationContext,
  type AuditRecord,
} from "@axon/engine";
import { generateAuditPDF } from "../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const aplPath = join(__dirname, "../../apl/compliance-suite/level3-audit.apl");
const source = readFileSync(aplPath, "utf8");
const policy = parse(source);

const chain = inMemoryChain();
const records: AuditRecord[] = [];

const ctx: EvaluationContext = {
  now: new Date("2026-04-15T10:00:00Z"),
  spend_window: { per_hour: 0, per_day: 0, per_month: 0 },
  open_concurrent_actions: 0,
  human_approvals: {},
  identity_verified: true,
  attestations_active: new Set(),
};

// 8 actions: 6 approve + 2 deny, spread across a week.
const samples: AgentAction[] = [
  { rail: "x402", endpoint: "api.example.com/pay", amount: { value: 12, currency: "USD" }, timestamp: "2026-04-12T09:15:00Z" },
  { rail: "x402", endpoint: "api.example.com/pay", amount: { value: 40, currency: "USD" }, timestamp: "2026-04-12T11:04:00Z" },
  { rail: "x402", endpoint: "api.example.com/pay", amount: { value: 1500, currency: "USD" }, timestamp: "2026-04-13T08:22:00Z" }, // > 999 limit → deny
  { rail: "x402", endpoint: "api.example.com/pay", amount: { value: 90, currency: "USD" }, timestamp: "2026-04-13T14:00:00Z" },
  { rail: "x402", endpoint: "api.example.com/pay", amount: { value: 25, currency: "USD" }, timestamp: "2026-04-14T10:30:00Z" },
  { rail: "mpp",  endpoint: "api.example.com/pay", amount: { value: 20, currency: "USD" }, timestamp: "2026-04-14T16:45:00Z" }, // rail out of scope → deny
  { rail: "x402", endpoint: "api.example.com/pay", amount: { value: 300, currency: "USD" }, timestamp: "2026-04-15T09:02:00Z" },
  { rail: "x402", endpoint: "api.example.com/pay", amount: { value: 77, currency: "USD" }, timestamp: "2026-04-15T09:58:00Z" },
];

for (const action of samples) {
  const decision = evaluate(policy, action, ctx);
  const record = buildAuditRecord({
    policy,
    action,
    decision,
    prev_record_hash: chain.last_hash(),
    obligations_emitted: ["log:solana:mainnet", "audit:eu-ai-act-article-12"],
  });
  chain.append(record);
  records.push(record);
}

const out = join(process.cwd(), "example-report.pdf");

await generateAuditPDF({
  policy,
  records,
  period: { from: "2026-04-12T00:00:00Z", to: "2026-04-15T23:59:59Z" },
  operator: {
    legal_name: "Example GmbH",
    signatory_name: "Jane Müller",
    signatory_role: "Chief Compliance Officer",
    organisation: "Example GmbH, Berlin",
  },
  output: out,
  policy_source: source,
  generated_at: "2026-04-19T12:00:00Z",
});

console.log(`Wrote ${out}`);
console.log(`genesis=${GENESIS_HASH.slice(0, 20)}…`);
console.log(`records=${records.length}  approved=${records.filter(r => r.decision.outcome === "APPROVE").length}  denied=${records.filter(r => r.decision.outcome === "DENY").length}`);
