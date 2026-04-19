// axon-engine — index.ts
// Public API surface.

export { parse } from "./parser.js";
export { evaluate } from "./evaluator.js";
export {
  buildAuditRecord,
  canonicalize,
  hashPolicy,
  inMemoryChain,
  GENESIS_HASH,
} from "./audit.js";
export type {
  Amount,
  AgentAction,
  AuditRecord,
  Approval,
  Chain,
  Currency,
  Decision,
  Deny,
  EvaluationContext,
  Limit,
  Obligation,
  Policy,
  Rail,
  Require,
  Scope,
} from "./types.js";
export type { AuditChain } from "./audit.js";

import { parse } from "./parser.js";
import { evaluate } from "./evaluator.js";
import { buildAuditRecord, inMemoryChain } from "./audit.js";
import type { AuditChain } from "./audit.js";
import type { AgentAction, EvaluationContext, Policy } from "./types.js";

export interface AxonEngineOptions {
  chain?: AuditChain;
  obligationEmitters?: Array<(record: import("./types.js").AuditRecord) => Promise<void> | void>;
}

export class AxonEngine {
  private readonly policy: Policy;
  private readonly chain: AuditChain;
  private readonly emitters: NonNullable<AxonEngineOptions["obligationEmitters"]>;

  constructor(policySource: string | Policy, opts: AxonEngineOptions = {}) {
    this.policy = typeof policySource === "string" ? parse(policySource) : policySource;
    this.chain = opts.chain ?? inMemoryChain();
    this.emitters = opts.obligationEmitters ?? [];
  }

  async evaluate(action: AgentAction, ctx: EvaluationContext) {
    const decision = evaluate(this.policy, action, ctx);
    const record = buildAuditRecord({
      policy: this.policy,
      action,
      decision,
      prev_record_hash: this.chain.last_hash(),
      obligations_emitted: this.planObligations(decision.outcome),
    });
    this.chain.append(record);
    await Promise.all(this.emitters.map((e) => e(record)));
    return { decision, record };
  }

  private planObligations(outcome: import("./types.js").Decision["outcome"]): string[] {
    const o = this.policy.obligation;
    const emitted: string[] = [];
    if (o.log_to) emitted.push(`log:${o.log_to}`);
    if (o.audit_exports) emitted.push(...o.audit_exports.map((e) => `audit:${e}`));
    if (o.incident_webhook && outcome !== "APPROVE") emitted.push(`webhook:${o.incident_webhook}`);
    return emitted;
  }

  getPolicy(): Policy {
    return this.policy;
  }

  getChain(): AuditChain {
    return this.chain;
  }
}

