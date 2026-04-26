// landing/app/CodeTabs.tsx
"use client";

import { useState } from "react";

const POLICY_TAB = `policy marketing-agent v1.0.0
agent  marketing-bot-01
operator acme-gmbh

scope {
  rails      [x402 mpp]
  currencies [USDC USDT]
}

limit {
  per_transaction { value 500  currency USDC }
  per_day         { value 5000 currency USDC }
}

require {
  human_approval_above { value 1000 currency USDC }
}

obligation {
  log_to    solana:mainnet
  retention 7y
}`;

const EVAL_TAB = `import { IntaglioEngine } from "@intaglio/engine";
import fs from "node:fs";

const source = fs.readFileSync("marketing-agent.apl", "utf8");
const engine = new IntaglioEngine(source);

const { decision, record } = await engine.evaluate(
  {
    rail: "x402",
    amount: { value: 250, currency: "USDC" },
    endpoint: "https://api.vendor.com/pay",
    timestamp: new Date().toISOString(),
  },
  {
    now: new Date(),
    spend_window: { per_hour: 0, per_day: 800, per_month: 3200 },
    open_concurrent_actions: 1,
    human_approvals: {},
    identity_verified: true,
    attestations_active: new Set(),
  }
);

// decision.outcome → "APPROVE"
// record.self_hash → "sha256:a3f9c1…"`;

export default function CodeTabs() {
  const [active, setActive] = useState<"policy" | "eval">("policy");

  return (
    <div className="ax-code-block">
      {/* Tab bar */}
      <div className="ax-codetabs-bar">
        {[
          { id: "policy" as const, label: "Policy (.apl)" },
          { id: "eval" as const, label: "Evaluation (TypeScript)" },
        ].map(({ id, label }) => (
          <button
            key={id}
            id={`code-tab-${id}`}
            onClick={() => setActive(id)}
            className={`ax-codetab ${active === id ? "ax-codetab--active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Code */}
      <pre className="ax-code-pre" style={{ minHeight: 260 }}>
        {active === "policy" ? POLICY_TAB : EVAL_TAB}
      </pre>
    </div>
  );
}
