// dashboard/app/app/page.tsx
// Dashboard home — 4 KPI cards + recent activity table (last 20 audit records).
// Server Component. No client-side data fetching.

import { createClient } from "@/lib/supabase/server";
import { formatRelativeTime, truncateHash } from "@/lib/utils";
import type { Metadata } from "next";
import { Activity, Ban, Clock, Hash } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export const revalidate = 30; // ISR: revalidate every 30s

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  // Resolve operator (same as layout, cached by Next.js deduplication).
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

  // Parallel data fetches.
  const [actionsRes, deniesRes, pendingRes, recentRes, chainHeadRes] =
    await Promise.all([
      // Actions in last 24h
      supabase
        .from("audit_records")
        .select("id", { count: "exact", head: true })
        .eq("operator_id", operatorId)
        .gte("created_at", since24h),

      // Denies in last 24h
      supabase
        .from("audit_records")
        .select("id", { count: "exact", head: true })
        .eq("operator_id", operatorId)
        .contains("decision", { outcome: "DENY" })
        .gte("created_at", since24h),

      // Pending approvals
      supabase
        .from("approval_requests")
        .select("id", { count: "exact", head: true })
        .eq("operator_id", operatorId)
        .eq("status", "pending"),

      // Recent 20 audit records
      supabase
        .from("audit_records")
        .select("id, agent_id, decision, self_hash, created_at, agents(slug, display_name)")
        .eq("operator_id", operatorId)
        .order("created_at", { ascending: false })
        .limit(20),

      // Chain head
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
      label: "Pending Approvals",
      value: pendingRes.count ?? 0,
      icon: Clock,
      color: "text-amber-400",
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of your agent fleet activity.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            id={kpi.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p
              className={`text-2xl font-bold tracking-tight ${kpi.mono ? "font-mono text-base" : ""}`}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Recent Activity</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Agent</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Decision</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">Hash</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {(recentRes.data ?? []).map((row: AuditRow) => {
                const decision = row.decision as { outcome: string; reason?: string };
                const agent = row.agents as { slug: string; display_name: string } | null;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {agent?.display_name ?? row.agent_id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <OutcomeBadge outcome={decision.outcome} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {truncateHash(row.self_hash)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatRelativeTime(row.created_at)}
                    </td>
                  </tr>
                );
              })}
              {(recentRes.data ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, { label: string; class: string }> = {
    APPROVE: { label: "Approved", class: "bg-green-500/10 text-green-400" },
    DENY: { label: "Denied", class: "bg-red-500/10 text-red-400" },
    REQUIRE_APPROVAL: { label: "Pending", class: "bg-amber-500/10 text-amber-400" },
  };
  const style = map[outcome] ?? { label: outcome, class: "bg-secondary text-muted-foreground" };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${style.class}`}>
      {style.label}
    </span>
  );
}
