// dashboard/app/api/policies/route.ts
// POST /api/policies
// Validates semver, computes sha256 hash of source, inserts.
// Marks previous active version inactive in a transaction.
//
// SECURITY: operator resolved from session — never from request body.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sha256PolicyHash } from "@/lib/hash";
import semver from "semver";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Resolve operator from session (never from body).
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

  const operatorId = membership.operator_id;

  let body: { agent_id?: string; source?: string; version?: string };
  try {
    body = await req.json() as { agent_id?: string; source?: string; version?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { agent_id, source, version } = body;

  if (!agent_id || !source) {
    return NextResponse.json({ error: "agent_id and source are required" }, { status: 400 });
  }

  // Verify agent belongs to this operator.
  const { data: agent } = await supabase
    .from("agents")
    .select("id")
    .eq("id", agent_id)
    .eq("operator_id", operatorId)
    .single();

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  // Determine version: if provided, validate semver; otherwise auto-bump.
  let newVersion: string;

  if (version) {
    if (!semver.valid(version)) {
      return NextResponse.json({ error: "version must be valid semver" }, { status: 400 });
    }
    newVersion = version;
  } else {
    // Find latest version and bump patch.
    const { data: latest } = await supabase
      .from("policies")
      .select("version")
      .eq("agent_id", agent_id)
      .eq("operator_id", operatorId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latest) {
      newVersion = semver.inc(latest.version, "patch") ?? "0.0.1";
    } else {
      newVersion = "0.1.0";
    }
  }

  // Check version doesn't already exist.
  const { data: existing } = await supabase
    .from("policies")
    .select("id")
    .eq("agent_id", agent_id)
    .eq("version", newVersion)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: `Version ${newVersion} already exists` },
      { status: 409 }
    );
  }

  const hash = sha256PolicyHash(source);

  // Transaction: deactivate old, insert new active.
  // Supabase JS doesn't support multi-statement transactions — we do it as two operations.
  // The partial unique index on (agent_id) where active = true prevents race conditions
  // at the DB level (it will reject the second concurrent insert of an active policy).
  const { error: deactivateErr } = await supabase
    .from("policies")
    .update({ active: false })
    .eq("agent_id", agent_id)
    .eq("operator_id", operatorId)
    .eq("active", true);

  if (deactivateErr) {
    return NextResponse.json({ error: "Failed to deactivate previous version" }, { status: 500 });
  }

  const { data: newPolicy, error: insertErr } = await supabase
    .from("policies")
    .insert({
      operator_id: operatorId,
      agent_id,
      version: newVersion,
      source,
      hash,
      active: true,
    })
    .select("id, version, hash")
    .single();

  if (insertErr || !newPolicy) {
    return NextResponse.json(
      { error: insertErr?.message ?? "Insert failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: newPolicy.id, version: newPolicy.version, hash: newPolicy.hash });
}
