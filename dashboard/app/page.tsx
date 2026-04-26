// dashboard/app/page.tsx
// Marketing-lite homepage for signed-out users.
// Redirects to /app if a Supabase session exists.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowRight, Github } from "lucide-react";

export const metadata: Metadata = {
  title: "Axon — Policy & Audit Layer for AI Agents",
  description:
    "The open policy and audit layer for autonomous AI agents that move real money. EU AI Act, MiCA, and DORA compatible.",
  robots: { index: true },
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/app");
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Nav ───────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 56,
        borderBottom: "1px solid var(--color-border)",
        background: "rgba(9, 9, 11, 0.85)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield className="w-5 h-5 text-primary" strokeWidth={2.5} />
          <span style={{ fontWeight: 700, fontSize: 17, color: "var(--color-primary)", letterSpacing: "-0.02em" }}>
            Axon
          </span>
          <span className="ax-mono ax-muted" style={{ fontSize: 10, background: "var(--color-primary-muted)", padding: "1px 6px", borderRadius: 4 }}>
            v0.1
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="https://github.com/PabloPotato/Axon"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-muted-foreground)", textDecoration: "none" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-4 h-4" />
            GitHub
          </Link>
          <Link href="/login" className="ax-btn ax-btn--primary" style={{ fontSize: 13 }}>
            Sign in
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", paddingTop: 80, paddingBottom: 64, paddingLeft: 24, paddingRight: 24,
      }}>
        {/* Status badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          borderRadius: 999, border: "1px solid var(--color-border)",
          padding: "4px 14px", fontSize: 12, color: "var(--color-muted-foreground)",
          marginBottom: 32,
        }}>
          <span className="ax-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-success)" }} />
          Open-source beta — MIT + CC-BY-4.0
        </div>

        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700,
          letterSpacing: "-0.04em", lineHeight: 1.08,
          textAlign: "center", maxWidth: 640, marginBottom: 20,
        }}>
          The open policy layer for AI agents that move real money.
        </h1>

        <p style={{
          fontSize: 17, color: "var(--color-muted-foreground)",
          lineHeight: 1.65, textAlign: "center", maxWidth: 540, marginBottom: 36,
        }}>
          One <code className="ax-mono" style={{
            background: "var(--color-primary-muted)",
            color: "var(--color-primary)",
            padding: "1px 6px", borderRadius: 4, fontSize: 15,
          }}>.apl</code> file governs every action
          your agent takes. Deterministic decisions. Tamper-evident audit. EU AI Act Article 12,
          MiCA, and DORA compatible out of the box.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/login" className="ax-btn ax-btn--primary" style={{ padding: "12px 24px" }}>
            Start free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://github.com/PabloPotato/Axon"
            target="_blank"
            rel="noopener noreferrer"
            className="ax-btn ax-btn--ghost"
            style={{ padding: "12px 24px" }}
          >
            <Github className="w-4 h-4" />
            View on GitHub
          </a>
        </div>

        {/* APL snippet */}
        <div style={{
          width: "100%", maxWidth: 560, marginTop: 48,
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)",
          background: "var(--color-card)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "8px 16px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {["#ef4444", "#f59e0b", "#22c55e"].map((c) => (
              <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
            ))}
            <span className="ax-mono ax-muted" style={{ fontSize: 11, marginLeft: 8 }}>
              marketing-agent.apl
            </span>
          </div>
          <pre className="ax-mono" style={{
            padding: "16px", fontSize: 12, lineHeight: 1.7,
            overflowX: "auto", margin: 0, color: "var(--color-foreground)",
          }}>
{`policy marketing-agent v1.0.0
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
  log_to  solana:mainnet
  retention  7y
}`}
          </pre>
        </div>
      </div>
    </main>
  );
}
