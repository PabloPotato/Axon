// services/x402-proxy/src/context.ts
// Builds an EvaluationContext from live DB state for a given agent.
//
// Spend windows: sum of approved (APPROVE-outcome) audit record amounts
//   over trailing 1h / 24h / 30d windows.
// Concurrency: count of audit_records created in the last 5 minutes that
//   have no corresponding approval_requests DENY (i.e., in-flight actions).
// Human approvals: pending approved approval_requests for this agent.

import type { EvaluationContext } from "@intaglio/engine";
import { sql } from "./db.js";

export async function buildContext(
  agentId: string,
  operatorId: string
): Promise<EvaluationContext> {
  const now = new Date();

  // All three spend windows in one query.
  const spendRows = await sql<
    Array<{
      perHour: string;
      perDay: string;
      perMonth: string;
    }>
  >`
    select
      coalesce(sum(case when created_at > now() - interval '1 hour'  then (decision->>'amount')::numeric else 0 end), 0)::text as "perHour",
      coalesce(sum(case when created_at > now() - interval '1 day'   then (decision->>'amount')::numeric else 0 end), 0)::text as "perDay",
      coalesce(sum(case when created_at > now() - interval '30 days' then (decision->>'amount')::numeric else 0 end), 0)::text as "perMonth"
    from audit_records
    where agent_id    = ${agentId}
      and operator_id = ${operatorId}
      and decision->>'outcome' = 'APPROVE'
  `;

  const spend = spendRows[0] ?? { perHour: "0", perDay: "0", perMonth: "0" };

  // Concurrent in-flight: actions in last 5 min with APPROVE outcome and no denial.
  const concRows = await sql<Array<{ cnt: string }>>`
    select count(*)::text as cnt
    from audit_records ar
    where ar.agent_id    = ${agentId}
      and ar.operator_id = ${operatorId}
      and ar.created_at  > now() - interval '5 minutes'
      and ar.decision->>'outcome' = 'APPROVE'
      and ar.id not in (
        select audit_record_id from approval_requests ap
        where ap.status = 'denied'
      )
  `;

  const openConcurrent = parseInt(concRows[0]?.cnt ?? "0", 10);

  // Human approvals: build a map of approval_key → true for approved requests.
  const approvalRows = await sql<Array<{ auditRecordId: string }>>`
    select audit_record_id as "auditRecordId"
    from approval_requests
    where agent_id    = ${agentId}
      and operator_id = ${operatorId}
      and status      = 'approved'
  `;

  const humanApprovals: Record<string, boolean> = {};
  for (const row of approvalRows) {
    humanApprovals[row.auditRecordId] = true;
  }

  return {
    now,
    spend_window: {
      per_hour: parseFloat(spend.perHour),
      per_day: parseFloat(spend.perDay),
      per_month: parseFloat(spend.perMonth),
    },
    open_concurrent_actions: openConcurrent,
    human_approvals: humanApprovals,
    identity_verified: false, // resolved from agents.identity_ref in future
    attestations_active: new Set<string>(),
  };
}
