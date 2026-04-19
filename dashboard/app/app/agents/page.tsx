// dashboard/app/app/agents/page.tsx
// Agent list — status pill, active policy version, 24h activity count.

import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Bot } from "lucide-react";

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

  // Agents + their active policy
  const { data: agents } = await supabase
    .from("agents")
    .select("id, slug, display_name, created_at, policies(version, active)")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false });

  // 24h action counts per agent
  const { data: activityRows } = await supabase
    .from("audit_records")
    .select("agent_id")
    .eq("operator_id", operatorId)
    .gte("created_at", since24h);

  const activityByAgent = (activityRows ?? []).reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.agent_id] = (acc[row.agent_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(agents ?? []).length} agent{(agents ?? []).length !== 1 ? "s" : ""} in this operator.
          </p>
        </div>
        <button
          id="agents-create-btn"
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New agent
        </button>
      </div>

      {/* Agent cards */}
      <div className="space-y-3">
        {(agents ?? []).map((agent) => {
          const activePolicy = (
            agent.policies as Array<{ version: string; active: boolean }> | null
          )?.find((p) => p.active);
          const actions24h = activityByAgent[agent.id] ?? 0;

          return (
            <Link
              key={agent.id}
              href={`/app/agents/${agent.slug}`}
              id={`agent-card-${agent.slug}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 hover:border-border/80 hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{agent.display_name}</p>
                <p className="text-xs text-muted-foreground font-mono">{agent.slug}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                <span>
                  {activePolicy ? (
                    <span className="text-green-400 font-mono">v{activePolicy.version}</span>
                  ) : (
                    <span className="text-amber-400">No policy</span>
                  )}
                </span>
                <span>{actions24h} actions / 24h</span>
                <span className="text-muted-foreground/40">›</span>
              </div>
            </Link>
          );
        })}

        {(agents ?? []).length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Bot className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No agents yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Create your first agent to start enforcing policies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
