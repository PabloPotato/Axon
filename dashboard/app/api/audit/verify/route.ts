// dashboard/app/api/audit/verify/route.ts
// GET /api/audit/verify?agent_id=
// Server-side verifies the hash chain for an agent.
// Returns { ok: true } or { ok: false, broken_at, reason }.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "node:crypto";

// Reimplement the chain verification here (not importing @axon/engine to avoid Node/Edge compat issues).
const GENESIS =
  "sha256:0000000000000000000000000000000000000000000000000000000000000000";

function canonicalize(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${(obj as unknown[]).map(canonicalize).join(",")}]`;
  const keys = Object.keys(obj as object).sort();
  return `{${keys
    .map(
      (k) =>
        `${JSON.stringify(k)}:${canonicalize((obj as Record<string, unknown>)[k])}`
    )
    .join(",")}}`;
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("operator_members")
    .select("operator_id")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agent_id");
  if (!agentId) return NextResponse.json({ error: "agent_id is required" }, { status: 400 });

  const { data: records, error } = await supabase
    .from("audit_records")
    .select(
      "id, policy_id, policy_hash, record_uuid, action, decision, obligations_emitted, prev_record_hash, self_hash, created_at"
    )
    .eq("agent_id", agentId)
    .eq("operator_id", membership.operator_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!records || records.length === 0) {
    return NextResponse.json({ ok: true, records: 0 });
  }

  let prev = GENESIS;
  for (let i = 0; i < records.length; i++) {
    const r = records[i]!;

    if (r.prev_record_hash !== prev) {
      return NextResponse.json({
        ok: false,
        broken_at: i,
        reason: `prev_record_hash mismatch at record ${i}: expected ${prev.slice(0, 20)}… got ${String(r.prev_record_hash).slice(0, 20)}…`,
      });
    }

    // Recompute self_hash from the record fields (excluding self_hash itself).
    const base = {
      axon_version: "0.1",
      record_id: r.record_uuid,
      timestamp: r.created_at,
      policy_id: r.policy_id,
      policy_hash: r.policy_hash,
      agent_id: agentId,
      operator_id: membership.operator_id,
      action: r.action,
      decision: r.decision,
      obligations_emitted: r.obligations_emitted,
      prev_record_hash: r.prev_record_hash,
    };

    const recomputed =
      "sha256:" +
      createHash("sha256")
        .update(canonicalize(base) + String(r.prev_record_hash))
        .digest("hex");

    if (recomputed !== r.self_hash) {
      return NextResponse.json({
        ok: false,
        broken_at: i,
        reason: `self_hash mismatch at record ${i}`,
      });
    }

    prev = String(r.self_hash);
  }

  return NextResponse.json({ ok: true, records: records.length, chain_head: prev });
}
