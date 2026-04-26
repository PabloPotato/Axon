// intaglio-engine — audit.ts
// Canonical AuditRecord generation + hash-chain anchoring.
// Implements APL SPEC §6.

import { createHash, randomUUID } from "node:crypto";
import type { Policy, AgentAction, Decision, AuditRecord } from "./types.js";

const INTAGLIO_VERSION = "0.1";

export function canonicalize(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalize).join(",")}]`;
  const keys = Object.keys(obj as object).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize((obj as Record<string, unknown>)[k])}`).join(",")}}`;
}

export function hashPolicy(policy: Policy): string {
  return "sha256:" + createHash("sha256").update(canonicalize(policy)).digest("hex");
}

export function buildAuditRecord(args: {
  policy: Policy;
  action: AgentAction;
  decision: Decision;
  prev_record_hash: string;
  obligations_emitted: string[];
}): AuditRecord {
  const { policy, action, decision, prev_record_hash, obligations_emitted } = args;
  const base: Omit<AuditRecord, "self_hash"> = {
    intaglio_version: INTAGLIO_VERSION,
    record_id: randomUUID(),
    timestamp: new Date().toISOString(),
    policy_id: policy.id,
    policy_hash: hashPolicy(policy),
    agent_id: policy.agent,
    operator_id: policy.operator,
    action,
    decision,
    obligations_emitted,
    prev_record_hash,
  };
  const self_hash =
    "sha256:" + createHash("sha256").update(canonicalize(base) + prev_record_hash).digest("hex");
  return { ...base, self_hash };
}

export const GENESIS_HASH = "sha256:0000000000000000000000000000000000000000000000000000000000000000";

export interface AuditChain {
  last_hash(): string;
  append(record: AuditRecord): void;
  verify(records: AuditRecord[]): { ok: true } | { ok: false; broken_at: number; reason: string };
}

export function inMemoryChain(): AuditChain {
  let last = GENESIS_HASH;
  return {
    last_hash: () => last,
    append(record) {
      last = record.self_hash;
    },
    verify(records) {
      let prev = GENESIS_HASH;
      for (let i = 0; i < records.length; i++) {
        const r = records[i]!;
        if (r.prev_record_hash !== prev) {
          return { ok: false, broken_at: i, reason: "prev_record_hash mismatch" };
        }
        const { self_hash: _omit, ...rest } = r;
        const recomputed =
          "sha256:" +
          createHash("sha256").update(canonicalize(rest) + prev).digest("hex");
        if (recomputed !== r.self_hash) {
          return { ok: false, broken_at: i, reason: "self_hash mismatch" };
        }
        prev = r.self_hash;
      }
      return { ok: true };
    },
  };
}
