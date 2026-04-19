// dashboard/app/page.tsx
// Marketing-lite homepage for signed-out users.
// Redirects to /app if a Supabase session exists.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

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
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-primary font-semibold tracking-tight text-lg">Axon</span>
          <span className="text-muted-foreground text-xs font-mono">v0.1</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/axon-labs/axon-engine"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-2xl text-center pt-24 pb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground mb-8">
          <span className="size-1.5 rounded-full bg-axon-green animate-pulse"></span>
          Open-source beta — MIT + CC-BY-4.0
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
          The open policy layer for AI agents that move real money.
        </h1>
        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
          One <code className="font-mono text-primary text-sm">.apl</code> file governs every action
          your agent takes. Deterministic decisions. Tamper-evident audit. EU AI Act Article 12,
          MiCA, and DORA compatible out of the box.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Start free
          </Link>
          <a
            href="https://github.com/axon-labs/axon-engine"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>

      {/* Simple APL snippet */}
      <div className="w-full max-w-xl rounded-lg border border-border bg-card p-4">
        <pre className="text-xs text-muted-foreground font-mono leading-relaxed overflow-x-auto">
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
    </main>
  );
}
