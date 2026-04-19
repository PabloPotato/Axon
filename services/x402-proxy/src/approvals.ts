// services/x402-proxy/src/approvals.ts
// approval_requests CRUD.

import { sql } from "./db.js";

export interface ApprovalRow {
  id: string;
  status: "pending" | "approved" | "denied" | "timed_out";
  requestedApprover: string | null;
  respondedAt: string | null;
  timeoutAt: string | null;
  createdAt: string;
  auditRecordId: string;
}

export async function createApprovalRequest(args: {
  operatorId: string;
  agentId: string;
  auditRecordDbId: string;
  requestedApprover?: string | undefined;
  timeoutAt?: Date | undefined;
}): Promise<string> {
  const rows = await sql<Array<{ id: string }>>`
    insert into approval_requests (operator_id, agent_id, audit_record_id, requested_approver, timeout_at)
    values (
      ${args.operatorId},
      ${args.agentId},
      ${args.auditRecordDbId},
      ${args.requestedApprover ?? null},
      ${args.timeoutAt ?? null}
    )
    returning id
  `;
  const id = rows[0]?.id;
  if (!id) throw new Error("approval insert returned no id");
  return id;
}

export async function getApprovalRequest(
  approvalId: string,
  agentId: string,
  operatorId: string
): Promise<ApprovalRow | null> {
  const rows = await sql<Array<ApprovalRow>>`
    select
      id,
      status,
      requested_approver  as "requestedApprover",
      responded_at::text  as "respondedAt",
      timeout_at::text    as "timeoutAt",
      created_at::text    as "createdAt",
      audit_record_id     as "auditRecordId"
    from approval_requests
    where id          = ${approvalId}
      and agent_id    = ${agentId}
      and operator_id = ${operatorId}
    limit 1
  `;
  return rows[0] ?? null;
}

/** Expire timed-out pending requests. Call periodically from a cron. */
export async function expireTimedOut(): Promise<number> {
  const rows = await sql<Array<{ id: string }>>`
    update approval_requests
    set status = 'timed_out', responded_at = now()
    where status    = 'pending'
      and timeout_at < now()
    returning id
  `;
  return rows.length;
}
