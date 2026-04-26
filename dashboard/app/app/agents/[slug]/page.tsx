// dashboard/app/app/agents/[slug]/page.tsx
// Agent detail — tabs: Overview · Policy · Audit · Approvals · Settings.
// Server-rendered. Monaco editor for Policy tab is loaded client-side only.

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AgentTabs from "./AgentTabs";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug };
}

export const revalidate = 30;

export default async function AgentDetailPage({ params }: Props) {
  const { slug } = await params;
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

  const { data: agent } = await supabase
    .from("agents")
    .select("id, slug, display_name, identity_ref, created_at")
    .eq("operator_id", operatorId)
    .eq("slug", slug)
    .single();

  if (!agent) notFound();

  const [policiesRes, auditRes, approvalsRes] = await Promise.all([
    supabase
      .from("policies")
      .select("id, version, source, hash, active, created_at")
      .eq("agent_id", agent.id)
      .eq("operator_id", operatorId)
      .order("created_at", { ascending: false }),

    supabase
      .from("audit_records")
      .select("id, decision, self_hash, prev_record_hash, created_at, action")
      .eq("agent_id", agent.id)
      .eq("operator_id", operatorId)
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("approval_requests")
      .select("id, status, requested_approver, timeout_at, created_at, audit_record_id")
      .eq("agent_id", agent.id)
      .eq("operator_id", operatorId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  type PolicyRow = NonNullable<typeof policiesRes.data>[number];
  const activePolicy: PolicyRow | null =
    (policiesRes.data ?? []).find((p: PolicyRow) => p.active) ?? null;

  return (
    <div className="ax-page">
      {/* Header */}
      <div className="ax-page-header">
        <p className="ax-mono ax-muted" style={{ fontSize: 12, marginBottom: 4 }}>{agent.slug}</p>
        <h1 className="ax-page-title">{agent.display_name}</h1>
        {agent.identity_ref && (
          <p className="ax-mono ax-muted" style={{ fontSize: 12, marginTop: 4 }}>
            {agent.identity_ref}
          </p>
        )}
      </div>

      <AgentTabs
        agent={agent}
        policies={policiesRes.data ?? []}
        auditRecords={auditRes.data ?? []}
        approvals={approvalsRes.data ?? []}
        activePolicy={activePolicy}
        operatorId={operatorId}
      />
    </div>
  );
}
