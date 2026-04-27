// landing/app/page.tsx
// Intaglio landing page — Stripe-level restraint, dark mode, no emoji.
// All 7 sections per spec. No fake testimonials. No capture modals.

"use client";

import React from "react";

import { Lock, Zap, Globe } from "lucide-react";
import CodeTabs from "./CodeTabs";

const HELLO_WORLD_APL = `policy marketing-agent v1.0.0
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

const WHY_ITEMS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    heading: "Agents are about to move real money.",
    body: "x402, Stripe MPP, Google AP2, Visa TAP, and Mastercard Agent Pay all ship in 2026. Every autonomous agent will need a policy layer before it touches a payment rail.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    heading: "Regulators already decided.",
    body: "EU AI Act Article 12, MiCA (July 1 2026), and DORA require audit trails for autonomous AI financial decisions. Logging is not optional.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
    heading: "Closed platforms will not be accepted.",
    body: "Microsoft Agent 365 and the rest will not become the regulatory standard. Enterprises and regulators need an auditable open standard they can inspect and fork.",
  },
];

const DIFFERENT_CARDS = [
  {
    icon: <Lock size={20} />,
    title: "Open Standard",
    body: "The APL specification is CC-BY-4.0, the reference engine is MIT. Any company, competitor, or regulator can inspect, fork, and contribute. MIT licensed engine, CC-BY-4.0 specification, donated to a foundation at v1.0.",
  },
  {
    icon: <Zap size={20} />,
    title: "Deterministic Compliance",
    body: "Given the same policy, action, and context, every compliant implementation returns the same decision and the same record hash. Every audit record is reproducible from the same inputs.",
  },
  {
    icon: <Globe size={20} />,
    title: "Regulator-Shaped",
    body: "The AuditRecord format maps directly to the fields regulators expect to see. No translation layer. No post-hoc justification. AuditRecord format maps directly to EU AI Act Article 12, MiCA Articles 68 and 70, DORA Article 17, NIST AI RMF, and ISO 42001.",
  },
];

const HOW_STEPS = [
  {
    step: "01",
    title: "Write policy",
    caption: "Author an .apl file declaring allowed rails, spend limits, approval rules, and logging obligations.",
  },
  {
    step: "02",
    title: "Engine evaluates",
    caption: "Before every agent action, IntaglioEngine.evaluate() returns APPROVE, DENY, or REQUIRE_APPROVAL in deterministic time.",
  },
  {
    step: "03",
    title: "Audit chain anchors",
    caption: "Every decision is hash-chained into a tamper-evident audit record. Optional: anchor to Solana, export to PDF for regulators.",
  },
];

const TABLE_ROWS = [
  ["Open-source core", true, false, false, false],
  ["Portable policy format", true, false, false, false],
  ["Deterministic audit chain", true, false, false, false],
  ["EU AI Act / MiCA mapping", true, false, false, false],
  ["Rail-agnostic (x402, MPP, AP2…)", true, false, false, false],
  ["Self-hostable", true, false, false, false],
] as const;

const HASH_CHAIN_DATA = [
  {
    ts: "2026-04-19T08:14:23Z",
    decision: "APPROVE" as const,
    amount: "750 USDC",
    agent: "purchase-agent-v1",
    prev: "sha256:0000...",
    curr: "sha256:a1b2c3d4e5f6...",
    prevFull: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
    currFull: "sha256:a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    ts: "2026-04-19T09:32:11Z",
    decision: "APPROVE" as const,
    amount: "1,250 USDC",
    agent: "analytics-bot-02",
    prev: "sha256:a1b2...",
    curr: "sha256:5e6f7a8b9c0d...",
    prevFull: "sha256:a1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
    currFull: "sha256:5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
  },
  {
    ts: "2026-04-20T14:05:47Z",
    decision: "DENY" as const,
    amount: "2,000 USDC",
    agent: "compliance-checker-01",
    prev: "sha256:5e6f...",
    curr: "sha256:f0e1d2c3b4a5...",
    prevFull: "sha256:5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6",
    currFull: "sha256:f0e1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4",
  },
  {
    ts: "2026-04-21T16:22:09Z",
    decision: "APPROVE" as const,
    amount: "320 USDC",
    agent: "data-indexer-03",
    prev: "sha256:f0e1...",
    curr: "sha256:7a8b9c0d1e2f...",
    prevFull: "sha256:f0e1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4",
    currFull: "sha256:7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
  },
  {
    ts: "2026-04-22T11:48:33Z",
    decision: "REQUIRE_APPROVAL" as const,
    amount: "1,800 USDC",
    agent: "purchase-agent-v1",
    prev: "sha256:7a8b...",
    curr: "sha256:3c4d5e6f7a8b...",
    prevFull: "sha256:7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
    currFull: "sha256:3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
  },
  {
    ts: "2026-04-23T07:01:55Z",
    decision: "APPROVE" as const,
    amount: "90 USDC",
    agent: "analytics-bot-02",
    prev: "sha256:3c4d...",
    curr: "sha256:b8a9c0d1e2f3...",
    prevFull: "sha256:3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    currFull: "sha256:b8a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
  },
];

function HashChainRow({ row }: { row: typeof HASH_CHAIN_DATA[number] }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative" }}
    >
      <td><span className="ax-hashchain-time">{row.ts}</span></td>
      <td>
        <span className={`ax-hashchain-decision ax-hashchain-decision--${row.decision === "REQUIRE_APPROVAL" ? "require" : row.decision.toLowerCase()}`}>
          {row.decision}
        </span>
      </td>
      <td><span className="ax-hashchain-amount">{row.amount}</span></td>
      <td><span className="ax-hashchain-agent">{row.agent}</span></td>
      <td>
        <span className="ax-hashchain-hash">
          <span className="ax-hashchain-hash-prev">{row.prev}</span>
          <span className="ax-hashchain-arrow">→</span>
          <span className="ax-hashchain-hash-curr">{row.curr}</span>
          <div className={`ax-hashchain-tooltip ${hovered ? "visible" : ""}`}>
            <div className="ax-hashchain-tooltip-label">Previous hash</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", wordBreak: "break-all", marginBottom: "8px" }}>
              {row.prevFull}
            </div>
            <div className="ax-hashchain-tooltip-label">Current hash</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", wordBreak: "break-all" }}>
              {row.currFull}
            </div>
          </div>
        </span>
      </td>
    </tr>
  );
}

function PolicyEditor() {
  const [limitValue, setLimitValue] = React.useState(500);
  const ATTEMPTED_AMOUNT = 750;
  const isApproved = limitValue >= ATTEMPTED_AMOUNT;

  return (
    <section id="policy-editor" className="ax-section">
      <h2 className="ax-section-title">Try the engine</h2>
      <p style={{
        textAlign: "center",
        fontSize: "14px",
        color: "var(--color-muted)",
        marginBottom: "28px",
        lineHeight: 1.6,
      }}>
        Edit the policy below. Watch the decision update in real time.
      </p>
      <div className="ax-policy-editor">
        {/* Left column: Policy editor */}
        <div className="ax-policy-editor-left">
          <div className="ax-policy-editor-header">
            <span className="ax-policy-editor-label">Policy</span>
          </div>
          <div className="ax-policy-editor-content">
            <pre className="ax-policy-editor-code">
{`policy purchase-agent v1.0.0
agent  purchase-agent-v1
limit {
  per_transaction { value ${limitValue}  currency USDC }
}`}
            </pre>
            <div className="ax-policy-editor-input-wrap">
              <label className="ax-policy-editor-input-label">per_transaction limit:</label>
              <input
                type="number"
                min="0"
                max="10000"
                step="50"
                value={limitValue}
                onChange={(e) => setLimitValue(Number(e.target.value))}
                className="ax-policy-editor-input"
              />
            </div>
          </div>
        </div>

        {/* Right column: Decision display */}
        <div className="ax-policy-editor-right">
          <div className="ax-policy-editor-header">
            <span className="ax-policy-editor-label">Decision</span>
          </div>
          <div className="ax-policy-editor-content">
            <div className="ax-policy-editor-action">
              <span className="ax-policy-editor-agent">purchase-agent-v1</span>
              <span className="ax-policy-editor-verb">attempts</span>
              <span className="ax-policy-editor-amount">{ATTEMPTED_AMOUNT} USDC</span>
              <span className="ax-policy-editor-target">payment to vendor.io</span>
            </div>
            <div className={`ax-policy-editor-decision ax-policy-editor-decision--${isApproved ? "approve" : "deny"}`}>
              {isApproved ? "APPROVE" : "DENY"}
            </div>
            <div className="ax-policy-editor-reason">
              {isApproved
                ? `Limit (${limitValue} USDC) covers attempted amount (${ATTEMPTED_AMOUNT} USDC)`
                : `Limit (${limitValue} USDC) below attempted amount (${ATTEMPTED_AMOUNT} USDC)`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const APL_FS_POLICY = `# APL-FS specimen — Tokenized Money Market Fund on Solana
# Status: Draft. APL-FS primitives are post-v1 design.

policy "tokenized-mmf-solana-v1" {
  version     = "0.2.0-draft"
  operator    = "org:sygnum"
  agent       = "mmf-oracle-bot"

  fund_mandate    = ["money_market", "short_term_government", "repo"]
  fund_type       = "money_market"
  domicile        = "CH"
  investor_class  = ["qualified", "institutional"]

  scope {
    rails      = ["x402", "solana:transfer"]
    endpoints  = ["api.sygnum.com/funds/mmf/*"]
    currencies = ["USDC", "EURC", "CHF"]
    chains     = ["solana:mainnet"]
  }

  limit {
    per_transaction = 5000000 USDC
    per_day         = 25000000 USDC
    concurrency     = 5
  }

  require {
    kyc_status                 = "enhanced_due_diligence"
    sanctions_screen           = true
    identity_verified          = true
    human_approval_above       = 1000000 USDC
    redemption_gate            = 50000000 USDC
    liquidity_floor            = 10000000 USDC
  }

  attestation_required {
    signer             = "compliance-officer-01"
    role               = "compliance_officer"
    registered_entity  = "Sygnum AG"
  }

  deny {
    countries = ["IR", "KP", "CU", "SY", "RU"]
  }

  approval {
    default_approver  = "fund-admin@sygnum.com"
    timeout           = 30m
    on_timeout        = "deny"
  }

  obligation {
    log_to            = "solana:mainnet"
    retention         = "10y"
    audit_exports     = ["finma-circular-2026-1", "mica-title-v"]
  }
}`;

const TEMPLATE_CARDS = [
  {name: "01 — per-transaction", desc: "Hard cap on individual agent actions", regs: ["AI Act Art. 12", "MiCA Art. 68"]},
  {name: "02 — per-day", desc: "Daily spend ceiling for autonomous agents", regs: ["AI Act Art. 12", "MiCA Art. 68"]},
  {name: "03 — velocity", desc: "Frequency cap on agent actions", regs: ["AI Act Art. 12", "MiCA Art. 74"]},
  {name: "04 — allowlist", desc: "Restrict to explicitly approved endpoints", regs: ["AI Act Art. 15", "DORA Art. 17"]},
  {name: "05 — blocklist", desc: "Deny sanctioned jurisdictions and merchants", regs: ["MiCA Art. 22", "NIST AI RMF"]},
  {name: "06 — time-window", desc: "Restrict activity to EU business hours", regs: ["AI Act Art. 14", "ISO 42001"]},
  {name: "07 — risk-score", desc: "Dynamic per-action risk assessment", regs: ["AI Act Art. 15", "NIST AI RMF"]},
  {name: "08 — USDC treasury", desc: "Stablecoin treasury with conservative limits", regs: ["MiCA Art. 68", "MiCA Art. 74"]},
  {name: "09 — domestic-only", desc: "Restrict to EU domestic transactions", regs: ["MiCA Art. 22", "AI Act Art. 5"]},
  {name: "10 — combined", desc: "Full MiCA-ready compliance policy", regs: ["AI Act Art. 12", "MiCA Art. 68", "DORA Art. 17"]},
];

const ROADMAP = [
  { version: "v0.1", label: "Today", desc: "Engine, APL spec, hash-chain audit, operator dashboard." },
  { version: "v0.2", label: "May 2026", desc: "Solana anchoring, PDF audit export, DORA templates." },
  { version: "v0.3", label: "Q3 2026", desc: "Multi-rail support (MPP, AP2), team RBAC, webhook notifications." },
  { version: "v1.0", label: "2027", desc: "Standards donation, third-party audited, ISO 42001 mapping." },
];

const NAV_LINKS = [
  { label: "Spec", href: "https://github.com/PabloPotato/Intaglio#readme" },
  { label: "Engine", href: "https://github.com/PabloPotato/Intaglio/tree/main/intaglio-engine" },
  { label: "GitHub", href: "https://github.com/PabloPotato/Intaglio" },
  { label: "Discord", href: "https://discord.gg/intaglio", ariaLabel: "Join our Discord" },
];

const FOOTER_LINKS = [
  { label: "Spec", href: "https://github.com/PabloPotato/Intaglio#readme" },
  { label: "Engine", href: "https://github.com/PabloPotato/Intaglio/tree/main/intaglio-engine" },
  { label: "GitHub", href: "https://github.com/PabloPotato/Intaglio" },
  { label: "Discord", href: "https://discord.gg/intaglio" },
];

const GOVERNANCE = [
  "The APL language spec is CC-BY-4.0. Perpetually.",
  "We will never ship a closed extension that creates lock-in.",
  "At v1.0 we donate the spec to a neutral standards body.",
];

export default function LandingPage() {
  return (
    <>
      {/* ─── Nav ────────────────────────────────────────────────────────── */}
      <nav className="ax-nav">
        <div className="ax-container ax-nav-inner">
          <a href="/" className="ax-nav-brand">Intaglio</a>
          <div className="ax-nav-links">
            {NAV_LINKS.map(({ label, href, ariaLabel }) => (
              <a key={label} href={href} className="ax-nav-link" {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="ax-container">
        {/* ─── Hero ──────────────────────────────────────────────────────── */}
        <section id="hero" className="ax-hero">
          <div className="ax-hero-content">
            <h1 className="ax-hero-title ax-hero-title--single">
              The policy layer for the autonomous economy.
            </h1>
            <p className="ax-hero-breadcrumb">
              Open standard · Deterministic compliance · Multi-rail ready
            </p>
            <p className="ax-hero-sub">
              The open standard EU compliance officers accept as evidence under AI Act Article 12, MiCA, and DORA.
            </p>
            <div className="ax-hero-ctas">
              <a href="https://github.com/PabloPotato/Intaglio" className="ax-btn-primary">
                View on GitHub
              </a>
              <a href="https://github.com/PabloPotato/Intaglio#readme" className="ax-btn-ghost">
                Read the spec
              </a>
            </div>
            <div className="ax-hero-badge">
              <span className="ax-hero-badge-dot" />
              EU AI Act Article 12 ready
            </div>
          </div>

          {/* Static APL code block */}
          <div className="ax-hero-code">
            <div className="ax-hero-code-block">
              <pre className="ax-hero-code-pre">{HELLO_WORLD_APL}</pre>
            </div>
          </div>
        </section>

        {/* ─── Why Intaglio is different ─────────────────────────────────── */}
        <section id="different" className="ax-section">
          <h2 className="ax-section-title">Why Intaglio is different</h2>
          <p className="ax-section-subtitle">
            We are building an open standard, not another closed product.
          </p>
          <div className="ax-different-grid">
            {DIFFERENT_CARDS.map((card) => (
              <div key={card.title} className="ax-different-card">
                <div className="ax-different-icon" aria-hidden="true">{card.icon}</div>
                <h3 className="ax-different-title">{card.title}</h3>
                <p className="ax-different-body">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Why Intaglio exists ───────────────────────────────────────────── */}
        <section id="why" className="ax-section">
          <div className="ax-why-grid">
            {WHY_ITEMS.map(({ icon, heading, body }, i) => (
              <div key={heading} className={`ax-why-card ax-animate ax-delay-${i + 1}`}>
                <div className="ax-why-icon" aria-hidden="true">{icon}</div>
                <p className="ax-why-heading">{heading}</p>
                <p className="ax-why-body">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How it works ──────────────────────────────────────────────── */}
        <section id="how-it-works" className="ax-section">
          <h2 className="ax-section-title">How it works</h2>
          <div className="ax-how-grid">
            {HOW_STEPS.map((item, i) => (
              <React.Fragment key={item.step}>
                {i > 0 && (
                  <div className="ax-how-arrow">→</div>
                )}
                <div className="ax-how-card">
                  <p className="ax-how-step">{item.step}</p>
                  <p className="ax-how-title">{item.title}</p>
                  <p className="ax-how-caption">{item.caption}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>
        {/* ─── Hash chain visualization ────────────────────────────────── */}
        <section id="hashchain" className="ax-section">
          <h2 className="ax-section-title">Live audit chain</h2>
          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--color-muted)", marginBottom: "28px", lineHeight: 1.6 }}>
            Every agent action produces a tamper-evident record hash-chained to the one before it. No gaps. No retroactive edits.
          </p>
          <div className="ax-hashchain-wrap">
            <table className="ax-hashchain-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Decision</th>
                  <th>Amount</th>
                  <th>Agent</th>
                  <th>Hash chain</th>
                </tr>
              </thead>
              <tbody>
                {HASH_CHAIN_DATA.map((row) => (
                  <HashChainRow key={row.ts} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── Policy Editor ─────────────────────────────────────────────── */}
        <PolicyEditor />

        {/* ─── Ten Templates Grid ─────────────────────────────────────────── */}
        <section id="templates" className="ax-section">
          <h2 className="ax-section-title">Ten templates. Pre-mapped to EU regulation.</h2>
          <p style={{ textAlign: "center", fontSize: "14px", color: "var(--color-muted)", marginBottom: "28px", lineHeight: 1.6 }}>
            Procurement bots. Treasury rebalancing. Marketing spend. Each one cites the clause it satisfies.
          </p>
          <div className="ax-templates-grid">
            {TEMPLATE_CARDS.map((t, i) => (
              <div key={i} className="ax-template-card">
                <div className="ax-template-name">{t.name}</div>
                <div className="ax-template-desc">{t.desc}</div>
                <div className="ax-template-badges">
                  {t.regs.map((r, j) => (
                    <span key={j} className="ax-template-badge">{r}</span>
                  ))}
                </div>
                <a href="https://github.com/PabloPotato/Intaglio/tree/main/apl/templates" className="ax-template-link" aria-label={`View ${t.name} template`}>View template</a>
              </div>
            ))}
          </div>
        </section>

        {/* ─── For Institutional Issuers ─────────────────────────────────────── */}
        <section id="institutional" className="ax-section">
          <div className="ax-institutional">
            <h2 className="ax-section-title">For institutional issuers</h2>
            <p className="ax-institutional-text">
              Tokenized fund operations require deterministic policy enforcement, attestation chains tied to regulated signing entities, and integration with traditional rails. Intaglio's institutional dialect, APL-FS, adds these primitives.
            </p>
            <div className="ax-institutional-code">
              <pre className="ax-institutional-code-pre">{APL_FS_POLICY}</pre>
            </div>
            <div className="ax-institutional-badges">
              <span className="ax-institutional-badge">1940 Investment Company Act compatible</span>
              <span className="ax-institutional-badge">MiCA Title V compatible</span>
              <span className="ax-institutional-badge">FINMA circular 2026/1 compatible</span>
            </div>
            <a href="https://github.com/PabloPotato/Intaglio/tree/main/apl" className="ax-institutional-link">Read the APL spec on GitHub →</a>
          </div>
        </section>

        {/* ─── Regulatory Mapping ───────────────────────────────────────────── */}
        <section id="regulatory-mapping" className="ax-section">
          <h2 className="ax-section-title">Every APL primitive maps to a regulation</h2>
          <div className="ax-table-wrap">
            <table className="ax-reg-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Primitive</th>
                  <th>EU AI Act<br />Art. 12</th>
                  <th>MiCA<br />Art. 68</th>
                  <th>MiCA<br />Art. 70</th>
                  <th>DORA<br />Art. 17</th>
                  <th>NIST<br />AI RMF</th>
                  <th>ISO<br />42001</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>obligation.log_to</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td></tr>
                <tr><td>limit (per_transaction, per_day)</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td></tr>
                <tr><td>require.human_approval</td><td className="ax-reg-check">✓</td><td className="ax-reg-minus">—</td><td className="ax-reg-minus">—</td><td className="ax-reg-minus">—</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td></tr>
                <tr><td>deny.countries</td><td className="ax-reg-check">✓</td><td className="ax-reg-minus">—</td><td className="ax-reg-minus">—</td><td className="ax-reg-minus">—</td><td className="ax-reg-minus">—</td><td className="ax-reg-check">✓</td></tr>
                <tr><td>obligation.audit_exports</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td><td className="ax-reg-minus">—</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td></tr>
                <tr><td>require.identity_verified</td><td className="ax-reg-check">✓</td><td className="ax-reg-minus">—</td><td className="ax-reg-check">✓</td><td className="ax-reg-minus">—</td><td className="ax-reg-check">✓</td><td className="ax-reg-check">✓</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── How Intaglio compares ──────────────────────────────────────────── */}
        <section id="positioning" className="ax-section">
          <h2 className="ax-section-title">How Intaglio compares</h2>
          <div className="ax-table-wrap">
            <table className="ax-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Capability</th>
                  <th>Intaglio</th>
                  <th>Microsoft<br />Agent 365</th>
                  <th>Ramp<br />Treasury</th>
                  <th>Crossmint</th>
                  <th>Aladdin<br />(BlackRock)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Open standard</td><td className="ax-check">✓</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-dash">—</td></tr>
                <tr><td>EU regulation citations</td><td className="ax-check">✓</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-dash">—</td></tr>
                <tr><td>Hash-chained audit trail</td><td className="ax-check">✓</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-dash">—</td></tr>
                <tr><td>Auto-updating compliance</td><td className="ax-check">✓</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-dash">—</td></tr>
                <tr><td>Agent-framework agnostic</td><td className="ax-check">✓</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-dash">—</td></tr>
                <tr><td>MIT licensed</td><td className="ax-check">✓</td><td className="ax-dash">—</td><td className="ax-dash">—</td><td className="ax-check">✓</td><td className="ax-dash">—</td></tr>
              </tbody>
            </table>
          </div>
          <p className="ax-table-note">Based on public information as of April 2026.</p>
        </section>

        {/* ─── Code section ──────────────────────────────────────────────── */}
        <section id="code" className="ax-section">
          <h2 className="ax-section-title">Drop it into any TypeScript project</h2>
          <CodeTabs />
        </section>

        {/* ─── Governance ────────────────────────────────────────────────── */}
        <section id="governance" className="ax-section">
          <div className="ax-governance">
            <h2 className="ax-governance-title">Governance commitments</h2>
            <ul className="ax-governance-list">
              {GOVERNANCE.map((item) => (
                <li key={item} className="ax-governance-item">
                  <span className="ax-governance-check">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Roadmap ───────────────────────────────────────────────────── */}
        <section id="roadmap" className="ax-section">
          <h2 className="ax-section-title">Roadmap</h2>
          <div className="ax-roadmap">
            <div className="ax-roadmap-line" />
            {ROADMAP.map(({ version, label, desc }, i) => (
              <div key={version} className="ax-roadmap-item">
                <div className={`ax-roadmap-dot ${i === 0 ? "ax-roadmap-dot--active" : ""}`}>
                  {i === 0 && <div className="ax-roadmap-dot-inner" />}
                </div>
                <p className={`ax-roadmap-version ${i === 0 ? "ax-roadmap-version--active" : ""}`}>
                  {version}
                </p>
                <p className="ax-roadmap-label">{label}</p>
                <p className="ax-roadmap-desc">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Footer CTA ────────────────────────────────────────────────── */}
        <section id="footer-cta" className="ax-footer-cta">
          <p className="ax-footer-cta-title">
            Building an agent that moves money in the EU?
          </p>
          <a id="footer-cta-mailto" href="mailto:hello@intaglio.dev" className="ax-btn-primary">
            Talk to us
          </a>
        </section>

        {/* ─── Footer ────────────────────────────────────────────────────── */}
        <footer className="ax-footer">
          <div className="ax-footer-links">
            {FOOTER_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="ax-footer-link">
                {label}
              </a>
            ))}
          </div>
          <div className="ax-footer-meta">
            <p>MIT + CC-BY-4.0 &nbsp;·&nbsp; Berlin &nbsp;·&nbsp; © 2026 Intaglio Labs</p>
          </div>
        </footer>
      </main>
    </>
  );
}

