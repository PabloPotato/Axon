// dashboard/app/app/agents/page.tsx
// Agent list — status pill, active policy version, 24h activity count.

import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Bot, ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Agents" };
export const revalidate = 30;

export default async function AgentsPage() {
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

  const { data: agents } = await supabase
    .from("agents")
    .select("id, slug, display_name, created_at, policies(version, active)")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false });

  const { data: activityRows } = await supabase
    .from("audit_records")
    .select("agent_id")
    .eq("operator_id", operatorId)
    .gte("created_at", since24h);

  const activityByAgent = (activityRows ?? []).reduce(
    (acc: Record<string, number>, row: { agent_id: string }) => {
      acc[row.agent_id] = (acc[row.agent_id] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="ax-page">
      <div className="ax-page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="ax-page-title">Agents</h1>
          <p className="ax-page-subtitle">
            {(agents ?? []).length} agent{(agents ?? []).length !== 1 ? "s" : ""} in this operator.
          </p>
        </div>
        <button id="agents-create-btn" className="ax-btn ax-btn--primary">
          <Plus className="w-4 h-4" />
          New agent
        </button>
      </div>

      {/* Agent cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(agents ?? []).map((agent: { id: string; slug: string; display_name: string; created_at: string; policies: Array<{ version: string; active: boolean }> | null }) => {
          const activePolicy = (
            agent.policies as Array<{ version: string; active: boolean }> | null
          )?.find((p) => p.active);
          const actions24h = activityByAgent[agent.id] ?? 0;

          return (
            <Link
              key={agent.id}
              href={`/app/agents/${agent.slug}`}
              id={`agent-card-${agent.slug}`}
              className="ax-agent-card"
            >
              <div className="ax-agent-icon">
                <Bot className="w-5 h-5" />
              </div>
              <div className="ax-agent-info">
                <p className="ax-agent-name">{agent.display_name}</p>
                <p className="ax-agent-slug">{agent.slug}</p>
              </div>
              <div className="ax-agent-meta">
                {activePolicy ? (
                  <span className="ax-badge ax-badge--approve" style={{ fontSize: 11 }}>
                    v{activePolicy.version}
                  </span>
                ) : (
                  <span className="ax-badge ax-badge--pending" style={{ fontSize: 11 }}>
                    No policy
                  </span>
                )}
                <span>{actions24h} actions / 24h</span>
                <ChevronRight className="w-4 h-4" style={{ opacity: 0.3 }} />
              </div>
            </Link>
          );
        })}

        {(agents ?? []).length === 0 && (
          <div className="ax-agent-empty">
            <Bot className="w-10 h-10 ax-muted" style={{ opacity: 0.3, margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13 }} className="ax-muted">No agents yet.</p>
            <p style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }} className="ax-muted">
              Create your first agent to start enforcing policies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
