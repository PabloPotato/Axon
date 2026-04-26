// dashboard/app/login/page.tsx
// Supabase magic-link + GitHub OAuth login page.

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, Github, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  const handleGitHub = async () => {
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Back link */}
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "var(--color-muted-foreground)",
            textDecoration: "none", marginBottom: 32,
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Shield className="w-6 h-6" style={{ color: "var(--color-primary)" }} strokeWidth={2.5} />
          <span style={{ fontWeight: 700, fontSize: 20, color: "var(--color-primary)", letterSpacing: "-0.02em" }}>Intaglio</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", marginBottom: 32 }}>
          Sign in to your operator dashboard
        </p>

        <div className="ax-card" style={{ padding: 24 }}>
          {sent ? (
            /* ── Confirmation ─────────────────────────────────────────── */
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: "var(--color-success-muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <Mail className="w-5 h-5" style={{ color: "var(--color-success)" }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Check your email</p>
              <p style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}>
                We sent a magic link to <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <>
              {/* ── GitHub OAuth ────────────────────────────────────────── */}
              <button
                id="login-github"
                onClick={handleGitHub}
                disabled={loading}
                className="ax-btn ax-btn--ghost"
                style={{ width: "100%", padding: "10px 16px", marginBottom: 16 }}
              >
                <Github className="w-4 h-4" />
                Continue with GitHub
              </button>

              {/* ── Divider ────────────────────────────────────────────── */}
              <div style={{ position: "relative", marginBottom: 16 }}>
                <div style={{
                  position: "absolute", inset: 0, display: "flex", alignItems: "center",
                }}>
                  <div style={{ width: "100%", height: 1, background: "var(--color-border)" }} />
                </div>
                <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                  <span style={{
                    fontSize: 11, color: "var(--color-muted-foreground)",
                    background: "var(--color-card)", padding: "0 8px",
                  }}>or</span>
                </div>
              </div>

              {/* ── Magic link ─────────────────────────────────────────── */}
              <form onSubmit={handleMagicLink} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label htmlFor="login-email" className="ax-label">Email address</label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="ax-input"
                  />
                </div>
                {error && (
                  <p style={{ fontSize: 12, color: "var(--color-destructive)" }}>{error}</p>
                )}
                <button
                  id="login-magic-link"
                  type="submit"
                  disabled={loading || !email}
                  className="ax-btn ax-btn--primary"
                  style={{ width: "100%", padding: "10px 16px" }}
                >
                  {loading ? "Sending…" : "Send magic link"}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-muted-foreground)", marginTop: 24 }}>
          By signing in you agree to our{" "}
          <a href="/terms" style={{ textDecoration: "underline", color: "inherit" }}>Terms</a>{" "}
          and{" "}
          <a href="/privacy" style={{ textDecoration: "underline", color: "inherit" }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
