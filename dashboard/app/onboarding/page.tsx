// dashboard/app/onboarding/page.tsx
// First-run experience: create an operator and become its owner.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Building2 } from "lucide-react";

const COUNTRIES = [
  { code: "AT", name: "Austria" }, { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" }, { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" }, { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
  { code: "DE", name: "Germany" }, { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" }, { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" }, { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" }, { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" }, { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" }, { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" }, { code: "CH", name: "Switzerland" },
  { code: "GB", name: "United Kingdom" }, { code: "US", name: "United States" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [legalEntity, setLegalEntity] = useState("");
  const [country, setCountry] = useState("DE");
  const [billingEmail, setBillingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("You must be signed in.");
      setLoading(false);
      return;
    }

    const { data: operator, error: opErr } = await supabase
      .from("operators")
      .insert({
        name,
        legal_entity: legalEntity,
        country_code: country,
        billing_email: billingEmail || session.user.email || "",
      })
      .select("id")
      .single();

    if (opErr || !operator) {
      setError(opErr?.message ?? "Failed to create operator");
      setLoading(false);
      return;
    }

    const { error: memberErr } = await supabase
      .from("operator_members")
      .insert({
        operator_id: operator.id,
        user_id: session.user.id,
        role: "owner",
      });

    if (memberErr) {
      setError(memberErr.message);
      setLoading(false);
      return;
    }

    router.push("/app");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Shield className="w-6 h-6" style={{ color: "var(--color-primary)" }} strokeWidth={2.5} />
          <span style={{ fontWeight: 700, fontSize: 20, color: "var(--color-primary)", letterSpacing: "-0.02em" }}>Intaglio</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--color-primary-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Building2 className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
              Set up your operator
            </h1>
          </div>
          <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", lineHeight: 1.5 }}>
            An operator is the legal entity that owns and governs your AI agents.
            This maps to the <code className="ax-mono" style={{
              background: "var(--color-primary-muted)", color: "var(--color-primary)",
              padding: "1px 5px", borderRadius: 4, fontSize: 12,
            }}>operator</code> field in your APL policies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="ax-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="onboard-name" className="ax-label">Operator name</label>
            <input id="onboard-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme GmbH" className="ax-input" />
          </div>

          <div>
            <label htmlFor="onboard-legal" className="ax-label">Legal entity name</label>
            <input id="onboard-legal" type="text" required value={legalEntity} onChange={(e) => setLegalEntity(e.target.value)} placeholder="Acme Ventures GmbH" className="ax-input" />
            <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 4 }}>
              This appears on audit reports submitted to regulators.
            </p>
          </div>

          <div>
            <label htmlFor="onboard-country" className="ax-label">Country</label>
            <select id="onboard-country" value={country} onChange={(e) => setCountry(e.target.value)} className="ax-input">
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="onboard-email" className="ax-label">
              Billing email <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <input id="onboard-email" type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} placeholder="billing@acme.com" className="ax-input" />
            <p style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 4 }}>
              Defaults to your login email if left blank.
            </p>
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "var(--color-destructive)" }}>{error}</p>
          )}

          <button id="onboard-submit" type="submit" disabled={loading || !name || !legalEntity} className="ax-btn ax-btn--primary" style={{ width: "100%", padding: "10px 16px" }}>
            {loading ? "Creating…" : "Create operator"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--color-muted-foreground)", marginTop: 20, opacity: 0.7 }}>
          You will be the owner of this operator. You can invite team members later.
        </p>
      </div>
    </div>
  );
}
