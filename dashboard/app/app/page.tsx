// dashboard/app/app/page.tsx
// Dashboard home — 4 KPI cards + recent activity table.
// Server Component. No client-side data fetching.

import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime, truncateHash } from "@/lib/utils";
import type { Metadata } from "next";
import { Activity, Ban, Clock, Hash } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 30;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: membership } = await supabase
    .from("operator_members")
    .select("operator_id")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  const operatorId = membership?.operator_id;
  if (!operatorId) return null;

  const since24h = new Date(Date.now() - 86_400_000).toISOString();

  const [actionsRes, deniesRes, pendingRes, recentRes, chainHeadRes] =
    await Promise.all([
      supabase
        .from("audit_records")
        .select("id", { count: "exact", head: true })
        .eq("operator_id", operatorId)
        .gte("created_at", since24h),

      supabase
        .from("audit_records")
        .select("id", { count: "exact", head: true })
        .eq("operator_id", operatorId)
        .contains("decision", { outcome: "DENY" })
        .gte("created_at", since24h),

      supabase
        .from("approval_requests")
        .select("id", { count: "exact", head: true })
        .eq("operator_id", operatorId)
        .eq("status", "pending"),

      supabase
        .from("audit_records")
        .select("id, agent_id, decision, self_hash, created_at, agents(slug, display_name)")
        .eq("operator_id", operatorId)
        .order("created_at", { ascending: false })
        .limit(20),

      supabase
        .from("audit_records")
        .select("self_hash")
        .eq("operator_id", operatorId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

  const kpis = [
    {
      id: "kpi-actions",
      label: "Actions (24h)",
      value: actionsRes.count ?? 0,
      icon: Activity,
      color: "text-primary",
    },
    {
      id: "kpi-denies",
      label: "Denies (24h)",
      value: deniesRes.count ?? 0,
      icon: Ban,
      color: "text-destructive",
    },
    {
      id: "kpi-pending",
      label: "Pending",
      value: pendingRes.count ?? 0,
      icon: Clock,
      color: "text-warning",
    },
    {
      id: "kpi-chain",
      label: "Chain Head",
      value: chainHeadRes.data
        ? truncateHash(chainHeadRes.data.self_hash)
        : "—",
      icon: Hash,
      color: "text-muted-foreground",
      mono: true,
    },
  ];

  type AuditRow = NonNullable<typeof recentRes.data>[number];

  return (
    <div className="ax-page">
      <div className="ax-page-header">
        <h1 className="ax-page-title">Dashboard</h1>
        <p className="ax-page-subtitle">
          Real-time overview of your agent fleet.
        </p>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────── */}
      <div className="ax-kpi-grid" style={{ marginBottom: 28 }}>
        {kpis.map((kpi) => (
          <div key={kpi.id} id={kpi.id} className="ax-kpi">
            <div className="ax-kpi-header">
              <span className="ax-kpi-label">{kpi.label}</span>
              <kpi.icon className={`ax-kpi-icon ${kpi.color}`} />
            </div>
            <p className={kpi.mono ? "ax-kpi-value--mono" : "ax-kpi-value"}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Recent activity ──────────────────────────────────────────── */}
      <div className="ax-table-card">
        <div className="ax-table-card-header">
          <span className="ax-table-card-title">Recent Activity</span>
          <span className="ax-muted" style={{ fontSize: 12 }}>
            Last 20 records
          </span>
        </div>
        <table className="ax-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Decision</th>
              <th>Hash</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {(recentRes.data ?? []).map((row: AuditRow) => {
              const decision = row.decision as { outcome: string; reason?: string };
              const agent = row.agents as { slug: string; display_name: string } | null;
              return (
                <tr key={row.id}>
                  <td>
                    <span className="ax-mono" style={{ fontSize: 12 }}>
                      {agent?.display_name ?? row.agent_id.slice(0, 8)}
                    </span>
                  </td>
                  <td>
                    <OutcomeBadge outcome={decision.outcome} />
                  </td>
                  <td>
                    <span className="ax-mono ax-muted" style={{ fontSize: 12 }}>
                      {truncateHash(row.self_hash)}
                    </span>
                  </td>
                  <td>
                    <span className="ax-muted" style={{ fontSize: 12 }}>
                      {formatRelativeTime(row.created_at)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {(recentRes.data ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="ax-table-empty">
                  No activity yet. Deploy your first agent to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    APPROVE: { label: "Approved", cls: "ax-badge--approve" },
    DENY: { label: "Denied", cls: "ax-badge--deny" },
    REQUIRE_APPROVAL: { label: "Pending", cls: "ax-badge--pending" },
  };
  const style = map[outcome] ?? { label: outcome, cls: "" };
  return <span className={`ax-badge ${style.cls}`}>{style.label}</span>;
}
