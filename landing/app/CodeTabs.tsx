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

const EVAL_TAB = `import { AxonEngine } from "@axon/engine";
import fs from "node:fs";

const source = fs.readFileSync("marketing-agent.apl", "utf8");
const engine = new AxonEngine(source);

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

console.log(decision.outcome); // "APPROVE"
console.log(record.self_hash); // "sha256:a3f9c1…"`;

export default function CodeTabs() {
  const [active, setActive] = useState<"policy" | "eval">("policy");

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--bg-surface)",
        overflow: "hidden",
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {[
          { id: "policy" as const, label: "Policy (.apl)" },
          { id: "eval" as const, label: "Evaluation (TypeScript)" },
        ].map(({ id, label }) => (
          <button
            key={id}
            id={`code-tab-${id}`}
            onClick={() => setActive(id)}
            style={{
              padding: "12px 20px",
              fontSize: 13,
              fontWeight: 500,
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${active === id ? "var(--violet)" : "transparent"}`,
              color: active === id ? "var(--foreground)" : "var(--muted)",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Code */}
      <pre
        style={{
          padding: "24px 20px",
          fontSize: 13,
          lineHeight: 1.7,
          color: "var(--foreground)",
          overflowX: "auto",
          fontFamily: "monospace",
          margin: 0,
          minHeight: 260,
        }}
      >
        {active === "policy" ? POLICY_TAB : EVAL_TAB}
      </pre>
    </div>
  );
}
