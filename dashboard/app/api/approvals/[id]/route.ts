// dashboard/app/api/approvals/[id]/route.ts
// POST /api/approvals/[id]
// Body: { decision: "approved" | "denied" }
// Approves or denies a pending approval request and writes a follow-up note.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("operator_members")
    .select("operator_id, role")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!membership || !["owner", "admin", "member"].includes(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { decision?: string };
  try {
    body = await req.json() as { decision?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { decision } = body;
  if (decision !== "approved" && decision !== "denied") {
    return NextResponse.json(
      { error: 'decision must be "approved" or "denied"' },
      { status: 400 }
    );
  }

  // Fetch the approval request to confirm ownership and status.
  const { data: approval } = await supabase
    .from("approval_requests")
    .select("id, status, operator_id")
    .eq("id", id)
    .eq("operator_id", membership.operator_id)
    .single();

  if (!approval) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (approval.status !== "pending") {
    return NextResponse.json(
      { error: `approval is already ${approval.status}` },
      { status: 409 }
    );
  }

  const { error: updateErr } = await supabase
    .from("approval_requests")
    .update({
      status: decision,
      approved_by: session.user.id,
      responded_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ id, decision });
}
