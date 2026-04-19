// axon-audit — verify.ts
// Independent re-verification of an AuditRecord[] hash chain.
//
// This exists as its own module (rather than calling engine.inMemoryChain().verify)
// because the *audit report itself* must show that verification was performed, and
// because a regulator/auditor should be able to run this code against the JSON
// export without booting the engine's policy pipeline. The logic is deliberately
// duplicated from axon-engine/src/audit.ts — verbose on purpose.

import { createHash } from "node:crypto";
import type { AuditRecord } from "@axon/engine";
import { GENESIS_HASH } from "@axon/engine";

function canonicalize(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalize).join(",")}]`;
  const keys = Object.keys(obj as object).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${canonicalize((obj as Record<string, unknown>)[k])}`)
    .join(",")}}`;
}

export type VerificationResult =
  | {
      ok: true;
      record_count: number;
      genesis_hash: string;
      first_record_hash: string | null;
      final_record_hash: string | null;
    }
  | {
      ok: false;
      record_count: number;
      genesis_hash: string;
      broken_at: number;
      reason: string;
    };

export function verifyChain(records: AuditRecord[]): VerificationResult {
  if (records.length === 0) {
    return {
      ok: true,
      record_count: 0,
      genesis_hash: GENESIS_HASH,
      first_record_hash: null,
      final_record_hash: null,
    };
  }

  let prev = GENESIS_HASH;

  for (let i = 0; i < records.length; i++) {
    const r = records[i]!;
    if (r.prev_record_hash !== prev) {
      return {
        ok: false,
        record_count: records.length,
        genesis_hash: GENESIS_HASH,
        broken_at: i,
        reason: `prev_record_hash mismatch at record ${i} — expected ${prev}, got ${r.prev_record_hash}`,
      };
    }
    const { self_hash: _omit, ...rest } = r;
    const recomputed =
      "sha256:" + createHash("sha256").update(canonicalize(rest) + prev).digest("hex");
    if (recomputed !== r.self_hash) {
      return {
        ok: false,
        record_count: records.length,
        genesis_hash: GENESIS_HASH,
        broken_at: i,
        reason: `self_hash mismatch at record ${i} — recomputed ${recomputed}, stored ${r.self_hash}`,
      };
    }
    prev = r.self_hash;
  }

  return {
    ok: true,
    record_count: records.length,
    genesis_hash: GENESIS_HASH,
    first_record_hash: records[0]!.self_hash,
    final_record_hash: records[records.length - 1]!.self_hash,
  };
}
