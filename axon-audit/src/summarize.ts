// axon-audit — summarize.ts
// Pure aggregation over an AuditRecord[] for the executive-summary page.
// No I/O. No PDF. Just stats.

import type { AuditRecord, Decision } from "@axon/engine";

export interface SpendByCurrency {
  currency: string;
  approved_total: number;
  denied_total: number;
  approved_count: number;
  denied_count: number;
}

export interface DenialReason {
  reason: string;
  count: number;
}

export interface AuditSummary {
  record_count: number;
  approve_count: number;
  deny_count: number;
  require_approval_count: number;
  unique_endpoints: number;
  unique_agents: number;
  period_first_ts: string | null;
  period_last_ts: string | null;
  spend_by_currency: SpendByCurrency[];
  top_denial_reasons: DenialReason[]; // up to 5, sorted desc
  obligations_emitted_count: number;
}

function outcomeOf(d: Decision): Decision["outcome"] {
  return d.outcome;
}

export function summarize(records: AuditRecord[]): AuditSummary {
  const spend = new Map<string, SpendByCurrency>();
  const denialReasons = new Map<string, number>();
  const endpoints = new Set<string>();
  const agents = new Set<string>();

  let approve = 0;
  let deny = 0;
  let requireApproval = 0;
  let obligations = 0;
  let firstTs: string | null = null;
  let lastTs: string | null = null;

  for (const r of records) {
    const o = outcomeOf(r.decision);
    if (o === "APPROVE") approve++;
    else if (o === "DENY") deny++;
    else requireApproval++;

    agents.add(r.agent_id);
    if (r.action.endpoint) endpoints.add(r.action.endpoint);
    obligations += r.obligations_emitted.length;

    if (firstTs === null || r.timestamp < firstTs) firstTs = r.timestamp;
    if (lastTs === null || r.timestamp > lastTs) lastTs = r.timestamp;

    const cur = r.action.amount.currency;
    const entry =
      spend.get(cur) ??
      {
        currency: cur,
        approved_total: 0,
        denied_total: 0,
        approved_count: 0,
        denied_count: 0,
      };
    if (o === "APPROVE") {
      entry.approved_total += r.action.amount.value;
      entry.approved_count += 1;
    } else if (o === "DENY") {
      entry.denied_total += r.action.amount.value;
      entry.denied_count += 1;
    }
    spend.set(cur, entry);

    if (r.decision.outcome === "DENY") {
      const reason = r.decision.reason ?? "unspecified";
      denialReasons.set(reason, (denialReasons.get(reason) ?? 0) + 1);
    }
  }

  const top_denial_reasons: DenialReason[] = [...denialReasons.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const spend_by_currency = [...spend.values()].sort((a, b) =>
    b.approved_total - a.approved_total
  );

  return {
    record_count: records.length,
    approve_count: approve,
    deny_count: deny,
    require_approval_count: requireApproval,
    unique_endpoints: endpoints.size,
    unique_agents: agents.size,
    period_first_ts: firstTs,
    period_last_ts: lastTs,
    spend_by_currency,
    top_denial_reasons,
    obligations_emitted_count: obligations,
  };
}
