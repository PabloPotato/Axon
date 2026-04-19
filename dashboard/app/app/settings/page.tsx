// dashboard/app/app/settings/page.tsx
// Operator name + members table with role dropdown.

import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };
export const revalidate = 60;

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: membership } = await supabase
    .from("operator_members")
    .select("operator_id, role, operators(id, name, legal_entity, country_code, billing_email)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  const operatorId = membership?.operator_id;
  const operator = membership?.operators as {
    id: string;
    name: string;
    legal_entity: string;
    country_code: string;
    billing_email: string;
  } | null;

  if (!operatorId || !operator) return null;

  const { data: members } = await supabase
    .from("operator_members")
    .select("user_id, role, created_at")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: true });

  const isAdmin = ["owner", "admin"].includes(membership.role);

  return (
    <div className="ax-page" style={{ maxWidth: 640 }}>
      <div className="ax-page-header">
        <h1 className="ax-page-title">Settings</h1>
        <p className="ax-page-subtitle">Operator configuration</p>
      </div>

      {/* ── Operator info ────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <p className="ax-section-label">Operator</p>
        <div className="ax-card">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <p className="ax-label">Name</p>
              <p style={{ fontSize: 13 }}>{operator.name}</p>
            </div>
            <div>
              <p className="ax-label">Legal entity</p>
              <p style={{ fontSize: 13 }}>{operator.legal_entity}</p>
            </div>
            <div>
              <p className="ax-label">Country</p>
              <p style={{ fontSize: 13 }}>{operator.country_code}</p>
            </div>
            <div>
              <p className="ax-label">Billing email</p>
              <p style={{ fontSize: 13 }}>{operator.billing_email}</p>
            </div>
          </div>
          {isAdmin && (
            <p className="ax-muted" style={{ fontSize: 12, marginTop: 16 }}>
              Editing operator details coming in v0.2.
            </p>
          )}
        </div>
      </div>

      {/* ── Members ──────────────────────────────────────────────────── */}
      <div>
        <p className="ax-section-label">Members</p>
        <div className="ax-table-card">
          <table className="ax-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(members ?? []).map((m: { user_id: string; role: string; created_at: string }) => (
                <tr key={m.user_id}>
                  <td>
                    <span className="ax-mono ax-muted" style={{ fontSize: 12 }}>
                      {m.user_id.slice(0, 16)}…
                      {m.user_id === session.user.id && (
                        <span style={{ marginLeft: 6, color: "var(--color-primary)" }}>(you)</span>
                      )}
                    </span>
                  </td>
                  <td>
                    {isAdmin && m.role !== "owner" ? (
                      <select
                        id={`role-select-${m.user_id}`}
                        defaultValue={m.role}
                        className="ax-input"
                        style={{ width: "auto", padding: "4px 8px", fontSize: 12 }}
                      >
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                        <option value="viewer">viewer</option>
                      </select>
                    ) : (
                      <span className="ax-mono" style={{ fontSize: 12 }}>{m.role}</span>
                    )}
                  </td>
                  <td>
                    <span className="ax-muted" style={{ fontSize: 12 }}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isAdmin && (
          <p className="ax-muted" style={{ fontSize: 12, marginTop: 12 }}>
            Role changes take effect on next login. Member invitation coming in v0.2.
          </p>
        )}
      </div>
    </div>
  );
}
