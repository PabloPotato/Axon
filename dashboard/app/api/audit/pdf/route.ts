// dashboard/app/api/audit/pdf/route.ts
// GET /api/audit/pdf?agent_id=<uuid>[&from=ISO][&to=ISO]
//
// Fetches all audit records for the agent, reconstructs AuditRecord[],
// calls @intaglio/audit generateAuditPDF, and returns the binary PDF.
//
// Runs in Node.js runtime (not edge) — required for pdfkit + crypto.
// serverExternalPackages includes pdfkit + @intaglio/* in next.config.ts.

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { PassThrough } from "node:stream";
import { createClient } from "@/lib/supabase/server";
import { parse } from "@/lib/intaglio-engine/index";
import type { AuditRecord } from "@/lib/intaglio-engine/types";
import { generateAuditPDF } from "@/lib/intaglio-audit/index";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Resolve operator from session.
  const { data: membership } = await supabase
    .from("operator_members")
    .select(
      "operator_id, role, operators(name, legal_entity, country_code, billing_email)",
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const operatorId = membership.operator_id;
  const op = membership.operators as {
    name: string;
    legal_entity: string;
    country_code: string;
    billing_email: string;
  } | null;

  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agent_id");
  if (!agentId) {
    return NextResponse.json({ error: "agent_id is required" }, { status: 400 });
  }
  const fromTs = searchParams.get("from") ?? new Date(0).toISOString();
  const toTs = searchParams.get("to") ?? new Date().toISOString();

  // Verify agent belongs to this operator.
  const { data: agent } = await supabase
    .from("agents")
    .select("id, slug, display_name")
    .eq("id", agentId)
    .eq("operator_id", operatorId)
    .single();

  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  // Fetch audit records for this period (ascending — chain order).
  const { data: rows, error: auditErr } = await supabase
    .from("audit_records")
    .select(
      "id, policy_id, policy_hash, record_uuid, action, decision, obligations_emitted, prev_record_hash, self_hash, created_at",
    )
    .eq("agent_id", agentId)
    .eq("operator_id", operatorId)
    .gte("created_at", fromTs)
    .lte("created_at", toTs)
    .order("created_at", { ascending: true });

  if (auditErr) {
    return NextResponse.json({ error: auditErr.message }, { status: 500 });
  }

  // Fetch active policy source for this agent.
  const { data: policyRow } = await supabase
    .from("policies")
    .select("source, hash")
    .eq("agent_id", agentId)
    .eq("operator_id", operatorId)
    .eq("active", true)
    .single();

  // Reconstruct AuditRecord[] from DB rows.
  const records: AuditRecord[] = (rows ?? []).map((r) => ({
    intaglio_version: "0.1",
    record_id: r.record_uuid as string,
    timestamp: r.created_at as string,
    policy_id: r.policy_id as string,
    policy_hash: r.policy_hash as string,
    agent_id: agentId,
    operator_id: operatorId,
    action: r.action as unknown as AuditRecord["action"],
    decision: r.decision as unknown as AuditRecord["decision"],
    obligations_emitted: r.obligations_emitted as string[],
    prev_record_hash: r.prev_record_hash as string,
    self_hash: r.self_hash as string,
  }));

  // Parse policy — use DB source if available, else fall back to minimal stub.
  let policy: ReturnType<typeof parse>;
  let policySource: string | undefined;
  if (policyRow?.source) {
    policySource = policyRow.source as string;
    try {
      policy = parse(policySource);
    } catch {
      return NextResponse.json({ error: "Active policy failed to parse" }, { status: 500 });
    }
  } else if (records.length > 0) {
    // No active policy — synthesize a minimal one from first record's metadata.
    const first = records[0]!;
    policySource = `# Reconstructed stub — original .apl source not found in DB.\npolicy "${first.policy_id}" {\n  version  = "0.0.0"\n  operator = "${first.operator_id}"\n  agent    = "${first.agent_id}"\n  scope {}\n  limit {}\n  obligation { log_to = "solana:mainnet" }\n}`;
    policy = parse(policySource);
  } else {
    return NextResponse.json({ error: "No records and no active policy" }, { status: 404 });
  }

  // Render PDF into a buffer via PassThrough stream.
  const pass = new PassThrough();
  const chunks: Buffer[] = [];
  pass.on("data", (chunk: Buffer) => chunks.push(chunk));

  const pdfPromise = new Promise<Buffer>((resolve, reject) => {
    pass.on("end", () => resolve(Buffer.concat(chunks)));
    pass.on("error", reject);
  });

  const signatory = session.user.email ?? "Unknown";
  const legalName = op?.legal_entity ?? op?.name ?? "Unknown organisation";

  await generateAuditPDF({
    policy,
    records,
    period: { from: fromTs, to: toTs },
    operator: {
      legal_name: legalName,
      signatory_name: signatory,
      signatory_role: "Compliance officer",
      ...(op?.name ? { organisation: op.name } : {}),
    },
    output: pass,
    ...(policySource !== undefined ? { policy_source: policySource } : {}),
  });

  const pdfBuffer = await pdfPromise;

  const filename = `intaglio-audit-${agent.slug}-${toTs.slice(0, 10)}.pdf`;

  // Next.js 15 Response body: cast through unknown to satisfy TS lib's BodyInit.
  const body = new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.byteLength);

  return new NextResponse(body as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "no-store",
    },
  });
}
