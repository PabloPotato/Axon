// dashboard/app/api/audit/route.ts
// GET /api/audit?agent_id=&cursor=
// Paginated audit records, 50/page.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  const operatorId = membership.operator_id;

  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agent_id");
  const cursor = searchParams.get("cursor"); // ISO-8601 timestamp of last record

  let query = supabase
    .from("audit_records")
    .select("id, agent_id, decision, self_hash, created_at")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (agentId) {
    query = query.eq("agent_id", agentId);
  }
  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const next_cursor = data && data.length === 50 ? data[data.length - 1]?.created_at ?? null : null;
  return NextResponse.json({ records: data ?? [], next_cursor });
}
