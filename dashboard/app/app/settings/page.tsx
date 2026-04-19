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

  // All members for this operator
  const { data: members } = await supabase
    .from("operator_members")
    .select("user_id, role, created_at")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: true });

  const isAdmin = ["owner", "admin"].includes(membership.role);

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Operator configuration</p>
      </div>

      {/* Operator info */}
      <section>
        <h2 className="text-sm font-semibold mb-4">Operator</h2>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" value={operator.name} />
            <Field label="Legal entity" value={operator.legal_entity} />
            <Field label="Country" value={operator.country_code} />
            <Field label="Billing email" value={operator.billing_email} />
          </div>
          {isAdmin && (
            <p className="text-xs text-muted-foreground">
              Editing operator details coming in v0.2.
            </p>
          )}
        </div>
      </section>

      {/* Members */}
      <section>
        <h2 className="text-sm font-semibold mb-4">Members</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">User ID</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Role</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(members ?? []).map((m) => (
                <tr key={m.user_id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {m.user_id.slice(0, 16)}…
                    {m.user_id === session.user.id && (
                      <span className="ml-1.5 text-primary">(you)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin && m.role !== "owner" ? (
                      <select
                        id={`role-select-${m.user_id}`}
                        defaultValue={m.role}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="admin">admin</option>
                        <option value="member">member</option>
                        <option value="viewer">viewer</option>
                      </select>
                    ) : (
                      <span className="text-xs font-mono">{m.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isAdmin && (
          <p className="text-xs text-muted-foreground mt-3">
            Role changes take effect on next login. Member invitation coming in v0.2.
          </p>
        )}
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
