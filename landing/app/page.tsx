// landing/app/page.tsx
// Axon landing page — Stripe-level restraint, dark mode, no emoji.
// All 7 sections per spec. No fake testimonials. No capture modals.

"use client";

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



export default function LandingPage() {
  return (
    <>
      {/* Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--border)",
          background: "rgba(9,9,11,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--violet)", letterSpacing: "-0.02em" }}>
            Axon
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {[
              { label: "Spec", href: "/spec" },
              { label: "Engine", href: "https://github.com/axon-labs/axon-engine" },
              { label: "GitHub", href: "https://github.com/axon-labs/axon-engine" },
              { label: "Discord", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  fontSize: 14,
                  color: "var(--muted)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <section
          id="hero"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
            paddingTop: 96,
            paddingBottom: 96,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                marginBottom: 20,
                color: "var(--foreground)",
              }}
            >
              The open policy layer for AI agents that move real money.
            </h1>
            <p
              style={{
                fontSize: 17,
                color: "var(--muted)",
                lineHeight: 1.65,
                marginBottom: 32,
              }}
            >
              One{" "}
              <code
                style={{
                  background: "var(--violet-muted)",
                  color: "var(--violet)",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontSize: 15,
                }}
              >
                .apl
              </code>{" "}
              file governs every action your agent takes. Deterministic decisions.
              Tamper-evident audit. EU AI Act Article 12, MiCA, and DORA compatible
              out of the box.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <CopyButton code="npm install @axon/engine" />
              <a
                id="hero-read-spec"
                href="/spec"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "10px 20px",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--muted)",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--foreground)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--muted)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                Read the spec
              </a>
            </div>
          </div>

          {/* APL code block */}
          <div
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid var(--border)",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              ))}
              <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8, fontFamily: "monospace" }}>
                marketing-agent.apl
              </span>
            </div>
            <pre
              style={{
                padding: "20px 16px",
                fontSize: 12.5,
                lineHeight: 1.7,
                color: "var(--foreground)",
                overflowX: "auto",
                fontFamily: "monospace",
                margin: 0,
              }}
            >
              {HELLO_WORLD_APL}
            </pre>
          </div>
        </section>

        {/* ─── Why Axon exists ──────────────────────────────────────────── */}
        <section id="why" style={{ paddingBottom: 80 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {[
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
            ].map(({ icon, heading, body }) => (
              <div
                key={heading}
                style={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                  padding: 28,
                }}
              >
                <div style={{ color: "var(--violet)", marginBottom: 14 }}>{icon}</div>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>{heading}</p>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.65 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" style={{ paddingBottom: 80 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 40, textAlign: "center" }}>
            How it works
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr auto 1fr",
              alignItems: "center",
              gap: 16,
            }}
          >
            {[
              {
                step: "01",
                title: "Write policy",
                caption: "Author an .apl file declaring allowed rails, spend limits, approval rules, and logging obligations.",
              },
              null,
              {
                step: "02",
                title: "Engine evaluates",
                caption: "Before every agent action, AxonEngine.evaluate() returns APPROVE, DENY, or REQUIRE_APPROVAL in deterministic time.",
              },
              null,
              {
                step: "03",
                title: "Audit chain anchors",
                caption: "Every decision is hash-chained into a tamper-evident audit record. Optional: anchor to Solana, export to PDF for regulators.",
              },
            ].map((item, i) => {
              if (item === null) {
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "center", color: "var(--muted)", fontSize: 20 }}>
                    →
                  </div>
                );
              }
              return (
                <div
                  key={item.step}
                  style={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                    padding: 24,
                    height: "100%",
                  }}
                >
                  <p style={{ fontFamily: "monospace", color: "var(--violet)", fontSize: 12, marginBottom: 10 }}>
                    {item.step}
                  </p>
                  <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{item.title}</p>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{item.caption}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Positioning table ────────────────────────────────────────── */}
        <section id="positioning" style={{ paddingBottom: 80 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 32, textAlign: "center" }}>
            How Axon compares
          </h2>
          <div
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "14px 20px", textAlign: "left", color: "var(--muted)", fontWeight: 500 }}>Capability</th>
                  {["Axon", "Microsoft Agent 365", "Ramp Agents", "ServiceNow AI CT"].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: "14px 20px",
                        textAlign: "center",
                        color: col === "Axon" ? "var(--violet)" : "var(--muted)",
                        fontWeight: col === "Axon" ? 700 : 500,
                        fontSize: col === "Axon" ? 15 : 13,
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Open-source core", true, false, false, false],
                  ["Portable policy format", true, false, false, false],
                  ["Deterministic audit chain", true, false, false, false],
                  ["EU AI Act / MiCA mapping", true, false, false, false],
                  ["Rail-agnostic (x402, MPP, AP2…)", true, false, false, false],
                  ["Self-hostable", true, false, false, false],
                ].map(([label, ...checks]) => (
                  <tr
                    key={String(label)}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "12px 20px", color: "var(--muted)", fontSize: 13 }}>{label}</td>
                    {checks.map((v, i) => (
                      <td key={i} style={{ padding: "12px 20px", textAlign: "center", fontSize: 16 }}>
                        {v ? (
                          <span style={{ color: "#22c55e" }}>✓</span>
                        ) : (
                          <span style={{ color: "var(--border)" }}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, textAlign: "right" }}>
            Based on public information as of April 2026.
          </p>
        </section>

        {/* ─── Code section ────────────────────────────────────────────── */}
        <section id="code" style={{ paddingBottom: 80 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 32, textAlign: "center" }}>
            Drop it into any TypeScript project
          </h2>
          <CodeTabs />
        </section>

        {/* ─── Governance ──────────────────────────────────────────────── */}
        <section id="governance" style={{ paddingBottom: 80 }}>
          <div
            style={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              padding: "32px 36px",
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              Governance commitments
            </h2>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "The APL language spec is CC-BY-4.0. Perpetually.",
                "We will never ship a closed extension that creates lock-in.",
                "At v1.0 we donate the spec to a neutral standards body.",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    fontSize: 14,
                    color: "var(--muted)",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ color: "var(--violet)", marginTop: 2, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Roadmap ─────────────────────────────────────────────────── */}
        <section id="roadmap" style={{ paddingBottom: 80 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 40, textAlign: "center" }}>
            Roadmap
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0,
              position: "relative",
            }}
          >
            {/* Connecting line */}
            <div
              style={{
                position: "absolute",
                top: 17,
                left: "12.5%",
                right: "12.5%",
                height: 1,
                background: "var(--border)",
                zIndex: 0,
              }}
            />
            {[
              { version: "v0.1", label: "Today", desc: "Engine, APL spec, hash-chain audit, operator dashboard." },
              { version: "v0.2", label: "May 2026", desc: "Solana anchoring, PDF audit export, DORA templates." },
              { version: "v0.3", label: "Q3 2026", desc: "Multi-rail support (MPP, AP2), team RBAC, webhook notifications." },
              { version: "v1.0", label: "2027", desc: "Standards donation, third-party audited, ISO 42001 mapping." },
            ].map(({ version, label, desc }, i) => (
              <div
                key={version}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "0 12px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: `2px solid ${i === 0 ? "var(--violet)" : "var(--border)"}`,
                    background: i === 0 ? "var(--violet-muted)" : "var(--bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  {i === 0 && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--violet)" }} />
                  )}
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, fontFamily: "monospace", color: i === 0 ? "var(--violet)" : "var(--foreground)", marginBottom: 4 }}>
                  {version}
                </p>
                <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>{label}</p>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Footer CTA ──────────────────────────────────────────────── */}
        <section
          id="footer-cta"
          style={{
            textAlign: "center",
            paddingBottom: 64,
            paddingTop: 40,
            borderTop: "1px solid var(--border)",
          }}
        >
          <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 16 }}>
            Building an agent that moves money in the EU?
          </p>
          <a
            id="footer-cta-mailto"
            href="mailto:sari@axon.dev"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 28px",
              background: "var(--violet)",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Talk to us
          </a>
        </section>

        {/* ─── Footer ──────────────────────────────────────────────────── */}
        <footer
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 32,
            paddingBottom: 48,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Spec", href: "/spec" },
              { label: "Engine", href: "https://github.com/axon-labs/axon-engine" },
              { label: "GitHub", href: "https://github.com/axon-labs/axon-engine" },
              { label: "Discord", href: "#" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}
              >
                {label}
              </a>
            ))}
          </div>
          <div style={{ textAlign: "right", fontSize: 13, color: "var(--muted)" }}>
            <p>MIT + CC-BY-4.0 &nbsp;·&nbsp; Berlin &nbsp;·&nbsp; © 2026 Axon Labs</p>
          </div>
        </footer>
      </main>
    </>
  );
}

