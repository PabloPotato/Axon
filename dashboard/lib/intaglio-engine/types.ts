// intaglio-engine — types.ts
// Canonical types for APL v0.1. See ../../apl/SPEC.md for the specification.

export type Currency = string; // "USD" | "EUR" | "USDC" | "USDT" | ticker
export type Rail = "x402" | "mpp" | "ap2" | "visa-tap" | "mastercard-ap" | string;
export type Chain = string; // "solana:mainnet", "ethereum:mainnet", "base:mainnet", ...

export interface Amount {
  value: number;
  currency: Currency;
}

export interface Scope {
  rails?: Rail[];
  endpoints?: string[];
  merchants?: string[];
  currencies?: Currency[];
  chains?: Chain[];
  hours?: string; // e.g. "09:00-18:00 Europe/Berlin"
  geos?: string[];
}

export interface Limit {
  per_transaction?: Amount;
  per_hour?: Amount;
  per_day?: Amount;
  per_month?: Amount;
  concurrency?: number;
  frequency?: { count: number; window: "second" | "minute" | "hour" | "day" };
}

export interface Require {
  business_hours?: boolean;
  human_approval_above?: Amount;
  approval_role?: string;
  two_factor_above?: Amount;
  attestation?: string;
  identity_verified?: boolean;
}

export interface Deny {
  countries?: string[];
  merchants?: string[];
  patterns?: string[]; // raw regex strings — must be bounded-time
  after?: string; // ISO-8601 timestamp
}

export interface Obligation {
  log_to: Chain;
  log_format?: string;
  retention?: string; // "7y" | "forever" | ...
  audit_exports?: string[];
  pii_redaction?: "automatic" | "manual" | "none";
  notify_operator?: string[];
  incident_webhook?: string;
}

export interface Approval {
  default_approver?: string;
  timeout?: string;
  on_timeout?: "approve" | "deny";
  channels?: string[];
  escalation?: string[];
}

export interface Policy {
  id: string;
  version: string;
  description?: string;
  operator: string;
  agent: string;
  identity?: string;
  inherit_from?: string;

  scope: Scope;
  limit: Limit;
  require?: Require;
  deny?: Deny;
  obligation: Obligation;
  approval?: Approval;
}

export interface AgentAction {
  rail: Rail;
  endpoint?: string;
  merchant?: string;
  amount: Amount;
  chain?: Chain;
  geo?: string;
  timestamp: string; // ISO-8601
  metadata?: Record<string, unknown>;
}

export type Decision =
  | { outcome: "APPROVE"; reason: null }
  | { outcome: "DENY"; reason: string }
  | { outcome: "REQUIRE_APPROVAL"; reason: string; approver?: string; timeout?: string };

export interface AuditRecord {
  intaglio_version: string;
  record_id: string;
  timestamp: string;
  policy_id: string;
  policy_hash: string;
  agent_id: string;
  operator_id: string;
  action: AgentAction;
  decision: Decision;
  obligations_emitted: string[];
  chain_anchor?: {
    chain: Chain;
    tx_hash: string;
    block_height?: number;
  };
  prev_record_hash: string;
  self_hash: string;
}

export interface EvaluationContext {
  now: Date;
  spend_window: {
    per_transaction?: number;
    per_hour: number;
    per_day: number;
    per_month: number;
  };
  open_concurrent_actions: number;
  human_approvals: Record<string, boolean>;
  identity_verified: boolean;
  attestations_active: Set<string>;
}
