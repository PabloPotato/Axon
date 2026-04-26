// intaglio-engine — evaluator.ts
// Implements APL §5 evaluation semantics. Deterministic. Side-effect-free.
//
// For a given (Policy, AgentAction, EvaluationContext), returns a Decision.
// Side effects (logging, webhooks, on-chain anchoring) are emitted separately by the audit pipeline.

import type { Policy, AgentAction, Decision, EvaluationContext, Amount } from "./types.js";

const amountToBase = (a: Amount): number => a.value; // v0.1: naive, same-currency only. See roadmap.

const matchesGlob = (value: string, pattern: string): boolean => {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`).test(value);
};

const matchesAny = (value: string, patterns: string[] | undefined): boolean => {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some((p) => matchesGlob(value, p));
};

const inScope = <T extends string>(value: T | undefined, allowed: T[] | undefined): boolean => {
  if (!allowed || allowed.length === 0) return true;
  if (value === undefined) return false;
  return allowed.includes(value) || allowed.some((p) => matchesGlob(value, p));
};

export function evaluate(policy: Policy, action: AgentAction, ctx: EvaluationContext): Decision {
  // 1. Explicit DENY short-circuits first.
  if (policy.deny) {
    const d = policy.deny;
    if (d.after && new Date(d.after).getTime() < ctx.now.getTime()) {
      return { outcome: "DENY", reason: "policy-expired" };
    }
    if (action.geo && matchesAny(action.geo, d.countries)) {
      return { outcome: "DENY", reason: `geo-denied:${action.geo}` };
    }
    if (action.merchant && matchesAny(action.merchant, d.merchants)) {
      return { outcome: "DENY", reason: `merchant-denied:${action.merchant}` };
    }
    if (d.patterns && action.endpoint) {
      for (const pat of d.patterns) {
        try {
          if (new RegExp(pat).test(action.endpoint)) {
            return { outcome: "DENY", reason: `pattern-denied:${pat}` };
          }
        } catch {
          /* invalid regex in policy — skip defensively */
        }
      }
    }
  }

  // 2. Scope checks.
  const s = policy.scope;
  if (!inScope(action.rail, s.rails)) {
    return { outcome: "DENY", reason: `rail-out-of-scope:${action.rail}` };
  }
  if (action.endpoint && s.endpoints && !matchesAny(action.endpoint, s.endpoints)) {
    return { outcome: "DENY", reason: `endpoint-out-of-scope:${action.endpoint}` };
  }
  if (action.merchant && s.merchants && !matchesAny(action.merchant, s.merchants)) {
    return { outcome: "DENY", reason: `merchant-out-of-scope:${action.merchant}` };
  }
  if (!inScope(action.amount.currency, s.currencies)) {
    return { outcome: "DENY", reason: `currency-out-of-scope:${action.amount.currency}` };
  }
  if (action.chain && !inScope(action.chain, s.chains)) {
    return { outcome: "DENY", reason: `chain-out-of-scope:${action.chain}` };
  }
  if (action.geo && s.geos && !inScope(action.geo, s.geos)) {
    return { outcome: "DENY", reason: `geo-out-of-scope:${action.geo}` };
  }
  if (s.hours && !withinHours(ctx.now, s.hours)) {
    return { outcome: "DENY", reason: "outside-permitted-hours" };
  }

  // 3. Limit checks.
  const amt = amountToBase(action.amount);
  const l = policy.limit;
  if (l.per_transaction && amt > amountToBase(l.per_transaction)) {
    return { outcome: "DENY", reason: "limit-per-transaction" };
  }
  if (l.per_hour && ctx.spend_window.per_hour + amt > amountToBase(l.per_hour)) {
    return { outcome: "DENY", reason: "limit-per-hour" };
  }
  if (l.per_day && ctx.spend_window.per_day + amt > amountToBase(l.per_day)) {
    return { outcome: "DENY", reason: "limit-per-day" };
  }
  if (l.per_month && ctx.spend_window.per_month + amt > amountToBase(l.per_month)) {
    return { outcome: "DENY", reason: "limit-per-month" };
  }
  if (l.concurrency && ctx.open_concurrent_actions >= l.concurrency) {
    return { outcome: "DENY", reason: "limit-concurrency" };
  }

  // 4. Require checks → may trigger approval.
  const r = policy.require;
  if (r) {
    if (r.identity_verified && !ctx.identity_verified) {
      return { outcome: "DENY", reason: "identity-not-verified" };
    }
    if (r.attestation && !ctx.attestations_active.has(r.attestation)) {
      return { outcome: "DENY", reason: `attestation-missing:${r.attestation}` };
    }
    if (r.human_approval_above && amt > amountToBase(r.human_approval_above)) {
      const approver = policy.approval?.default_approver;
      if (ctx.human_approvals[`${policy.id}:${approver ?? "default"}`] !== true) {
        return {
          outcome: "REQUIRE_APPROVAL",
          reason: `human-approval-required-above:${amountToBase(r.human_approval_above)}`,
          approver,
          timeout: policy.approval?.timeout,
        };
      }
    }
  }

  // 5. Approved.
  return { outcome: "APPROVE", reason: null };
}

function withinHours(now: Date, spec: string): boolean {
  // spec format: "HH:MM-HH:MM <IANA-TZ>" — tolerant fallback: accept any format we can't parse.
  const m = spec.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})\s+([A-Za-z_\/+\-]+)$/);
  if (!m) return true;
  const [, sh, sm, eh, em, tz] = m;
  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz!,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(now);
    const hh = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
    const mm = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
    const cur = hh * 60 + mm;
    const start = parseInt(sh!, 10) * 60 + parseInt(sm!, 10);
    const end = parseInt(eh!, 10) * 60 + parseInt(em!, 10);
    return start <= cur && cur <= end;
  } catch {
    return true;
  }
}
