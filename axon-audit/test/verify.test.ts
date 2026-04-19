import { describe, it, expect } from "vitest";
import { verifyChain } from "../src/verify.js";
import { buildAuditRecord, GENESIS_HASH } from "@axon/engine";
import type { AuditRecord, Policy } from "@axon/engine";

const dummyPolicy: Policy = {
  id: "test-policy",
  version: "1.0",
  operator: "op",
  agent: "ag",
  scope: {},
  limit: {},
  obligation: { log_to: "devnet" }
};

describe("verifyChain", () => {
  it("verifies an empty chain", () => {
    const res = verifyChain([]);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.record_count).toBe(0);
      expect(res.genesis_hash).toBe(GENESIS_HASH);
    }
  });

  it("verifies a valid chain of records", () => {
    const records: AuditRecord[] = [];
    let prevHash = GENESIS_HASH;

    for (let i = 0; i < 5; i++) {
      const record = buildAuditRecord({
        policy: dummyPolicy,
        action: { rail: "x402", amount: { value: 10 * i, currency: "USD" }, timestamp: new Date().toISOString() },
        decision: { outcome: "APPROVE", reason: null },
        prev_record_hash: prevHash,
        obligations_emitted: []
      });
      records.push(record);
      prevHash = record.self_hash;
    }

    const res = verifyChain(records);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.record_count).toBe(5);
      expect(res.first_record_hash).toBe(records[0].self_hash);
      expect(res.final_record_hash).toBe(records[4].self_hash);
    }
  });

  it("detects a mutated self_hash via action tamper", () => {
    const r1 = buildAuditRecord({
      policy: dummyPolicy,
      action: { rail: "x402", amount: { value: 10, currency: "USD" }, timestamp: new Date().toISOString() },
      decision: { outcome: "APPROVE", reason: null },
      prev_record_hash: GENESIS_HASH,
      obligations_emitted: []
    });

    // Tamper the record!
    const tampered = { ...r1, action: { ...r1.action, amount: { value: 100000, currency: "USD" } } };

    const res = verifyChain([tampered]);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.broken_at).toBe(0);
      expect(res.reason).toMatch(/self_hash mismatch/);
    }
  });

  it("detects a deleted record breaking the prev_record_hash chain", () => {
    const r1 = buildAuditRecord({
      policy: dummyPolicy,
      action: { rail: "x402", amount: { value: 10, currency: "USD" }, timestamp: new Date().toISOString() },
      decision: { outcome: "APPROVE", reason: null },
      prev_record_hash: GENESIS_HASH,
      obligations_emitted: []
    });

    const r2 = buildAuditRecord({
      policy: dummyPolicy,
      action: { rail: "x402", amount: { value: 20, currency: "USD" }, timestamp: new Date().toISOString() },
      decision: { outcome: "APPROVE", reason: null },
      prev_record_hash: r1.self_hash,
      obligations_emitted: []
    });

    const r3 = buildAuditRecord({
      policy: dummyPolicy,
      action: { rail: "x402", amount: { value: 30, currency: "USD" }, timestamp: new Date().toISOString() },
      decision: { outcome: "APPROVE", reason: null },
      prev_record_hash: r2.self_hash,
      obligations_emitted: []
    });

    // Remove r2
    const res = verifyChain([r1, r3]);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.broken_at).toBe(1); // r3 occurs at index 1 now
      expect(res.reason).toMatch(/prev_record_hash mismatch/);
    }
  });

  it("detects a wrong genesis hash on the first record", () => {
    const invalidGenesis = "sha256:1111111111111111111111111111111111111111111111111111111111111111";
    const r1 = buildAuditRecord({
      policy: dummyPolicy,
      action: { rail: "x402", amount: { value: 10, currency: "USD" }, timestamp: new Date().toISOString() },
      decision: { outcome: "APPROVE", reason: null },
      prev_record_hash: invalidGenesis,
      obligations_emitted: []
    });

    const res = verifyChain([r1]);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.broken_at).toBe(0);
      expect(res.reason).toMatch(/prev_record_hash mismatch/);
    }
  });
});
