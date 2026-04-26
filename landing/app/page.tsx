// landing/app/page.tsx
// Axon landing page — Stripe-level restraint, dark mode, no emoji.
// All 7 sections per spec. No fake testimonials. No capture modals.

"use client";

import React from "react";

import CopyButton from "./CopyButton";
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

const HOW_STEPS = [
  {
    step: "01",
    title: "Write policy",
    caption: "Author an .apl file declaring allowed rails, spend limits, approval rules, and logging obligations.",
  },
  {
    step: "02",
    title: "Engine evaluates",
    caption: "Before every agent action, AxonEngine.evaluate() returns APPROVE, DENY, or REQUIRE_APPROVAL in deterministic time.",
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

const TABLE_COLS = ["Axon", "Microsoft Agent 365", "Ramp Agents", "ServiceNow AI CT"];

const ROADMAP = [
  { version: "v0.1", label: "Today", desc: "Engine, APL spec, hash-chain audit, operator dashboard." },
  { version: "v0.2", label: "May 2026", desc: "Solana anchoring, PDF audit export, DORA templates." },
  { version: "v0.3", label: "Q3 2026", desc: "Multi-rail support (MPP, AP2), team RBAC, webhook notifications." },
  { version: "v1.0", label: "2027", desc: "Standards donation, third-party audited, ISO 42001 mapping." },
];

const NAV_LINKS = [
  { label: "Spec", href: "/spec" },
  { label: "Engine", href: "https://github.com/PabloPotato/Axon" },
  { label: "GitHub", href: "https://github.com/PabloPotato/Axon" },
  { label: "Discord", href: "#" },
];

const FOOTER_LINKS = [
  { label: "Spec", href: "/spec" },
  { label: "Engine", href: "https://github.com/PabloPotato/Axon" },
  { label: "GitHub", href: "https://github.com/PabloPotato/Axon" },
  { label: "Discord", href: "#" },
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
          <a href="/" className="ax-nav-brand">Axon</a>
          <div className="ax-nav-links">
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="ax-nav-link">
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="ax-container">
        {/* ─── Hero ──────────────────────────────────────────────────────── */}
        <section id="hero" className="ax-hero">
          <div className="ax-animate">
            <h1 className="ax-hero-title">
              The open policy layer for AI agents that move real money.
            </h1>
            <p className="ax-hero-sub">
              One <code className="ax-code-inline">.apl</code> file governs every action
              your agent takes. Deterministic decisions. Tamper-evident audit. EU AI Act
              Article 12, MiCA, and DORA compatible out of the box.
            </p>
            <div className="ax-hero-ctas">
              <CopyButton code="npm install @axon/engine" />
              <a id="hero-read-spec" href="/spec" className="ax-btn-ghost">
                Read the spec
              </a>
            </div>
          </div>

          {/* APL code block */}
          <div className="ax-code-block ax-animate ax-delay-2">
            <div className="ax-code-header">
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                <div key={c} className="ax-code-dot" style={{ background: c }} />
              ))}
              <span className="ax-code-filename">marketing-agent.apl</span>
            </div>
            <pre className="ax-code-pre">{HELLO_WORLD_APL}</pre>
          </div>
        </section>

        {/* ─── Why Axon exists ───────────────────────────────────────────── */}
        <section id="why" className="ax-section">
          <div className="ax-why-grid">
            {WHY_ITEMS.map(({ icon, heading, body }, i) => (
              <div key={heading} className={`ax-why-card ax-animate ax-delay-${i + 1}`}>
                <div className="ax-why-icon">{icon}</div>
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

        {/* ─── Positioning table ─────────────────────────────────────────── */}
        <section id="positioning" className="ax-section">
          <h2 className="ax-section-title">How Axon compares</h2>
          <div className="ax-table-wrap">
            <table className="ax-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Capability</th>
                  {TABLE_COLS.map((col) => (
                    <th key={col} className={col === "Axon" ? "ax-table-axon" : ""}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map(([label, ...checks]) => (
                  <tr key={String(label)}>
                    <td>{label}</td>
                    {checks.map((v, i) => (
                      <td key={i}>
                        {v ? (
                          <span className="ax-check">✓</span>
                        ) : (
                          <span className="ax-dash">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
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
          <a id="footer-cta-mailto" href="mailto:sari@axon.dev" className="ax-btn-primary">
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
            <p>MIT + CC-BY-4.0 &nbsp;·&nbsp; Berlin &nbsp;·&nbsp; © 2026 Axon Labs</p>
          </div>
        </footer>
      </main>
    </>
  );
}
