import { describe, it, expect } from "vitest";
import { summarize } from "../src/summarize.js";
import type { AuditRecord } from "@intaglio/engine";

describe("summarize", () => {
  it("computes accurate aggregates for mixed spend outcomes", () => {
    const records: AuditRecord[] = [
      {
        intaglio_version: "0.1",
        record_id: "r1",
        timestamp: "2026-04-01T10:00:00Z",
        policy_id: "pol-1",
        policy_hash: "hash",
        agent_id: "ag-1",
        operator_id: "op-1",
        action: { rail: "x402", amount: { value: 100, currency: "USDC" }, endpoint: "api.one.com" },
        decision: { outcome: "APPROVE", reason: null },
        obligations_emitted: ["solana-log"],
        prev_record_hash: "prev",
        self_hash: "sh1"
      },
      {
        intaglio_version: "0.1",
        record_id: "r2",
        timestamp: "2026-04-01T11:00:00Z",
        policy_id: "pol-1",
        policy_hash: "hash",
        agent_id: "ag-1",
        operator_id: "op-1",
        action: { rail: "x402", amount: { value: 50, currency: "USDC" }, endpoint: "api.two.com" },
        decision: { outcome: "DENY", reason: "limit-exceeded" },
        obligations_emitted: [],
        prev_record_hash: "sh1",
        self_hash: "sh2"
      },
      {
        intaglio_version: "0.1",
        record_id: "r3",
        timestamp: "2026-04-01T12:00:00Z",
        policy_id: "pol-1",
        policy_hash: "hash",
        agent_id: "ag-2",
        operator_id: "op-1",
        action: { rail: "x402", amount: { value: 200, currency: "EUR" }, endpoint: "api.one.com" },
        decision: { outcome: "APPROVE", reason: null },
        obligations_emitted: ["solana-log", "email-alert"],
        prev_record_hash: "sh2",
        self_hash: "sh3"
      }
    ];

    const result = summarize(records);

    expect(result.record_count).toBe(3);
    expect(result.approve_count).toBe(2);
    expect(result.deny_count).toBe(1);
    expect(result.require_approval_count).toBe(0);
    expect(result.unique_endpoints).toBe(2);
    expect(result.unique_agents).toBe(2);
    expect(result.period_first_ts).toBe("2026-04-01T10:00:00Z");
    expect(result.period_last_ts).toBe("2026-04-01T12:00:00Z");
    expect(result.obligations_emitted_count).toBe(3);

    // Sort order shouldn't matter but let's check values
    const usdc = result.spend_by_currency.find((s) => s.currency === "USDC");
    expect(usdc).toBeDefined();
    expect(usdc?.approved_total).toBe(100);
    expect(usdc?.denied_total).toBe(50);
    expect(usdc?.approved_count).toBe(1);
    expect(usdc?.denied_count).toBe(1);

    const eur = result.spend_by_currency.find((s) => s.currency === "EUR");
    expect(eur).toBeDefined();
    expect(eur?.approved_total).toBe(200);

    // Denial reasons
    expect(result.top_denial_reasons).toHaveLength(1);
    expect(result.top_denial_reasons[0].reason).toBe("limit-exceeded");
    expect(result.top_denial_reasons[0].count).toBe(1);
  });

  it("handles empty record streams", () => {
    const result = summarize([]);
    expect(result.record_count).toBe(0);
    expect(result.approve_count).toBe(0);
    expect(result.unique_endpoints).toBe(0);
    expect(result.period_first_ts).toBeNull();
    expect(result.period_last_ts).toBeNull();
    expect(result.spend_by_currency).toEqual([]);
    expect(result.top_denial_reasons).toEqual([]);
  });

  it("caps top denial reasons at 5", () => {
    const records = Array.from({ length: 15 }).map((_, i): AuditRecord => ({
      intaglio_version: "0.1",
      record_id: `r${i}`,
      timestamp: "2026-04-01T10:00:00Z",
      policy_id: "pol",
      policy_hash: "hash",
      agent_id: "ag",
      operator_id: "op",
      action: { rail: "x402", amount: { value: 10, currency: "USD" }, endpoint: "api" },
      decision: { outcome: "DENY", reason: `reason-${i % 6}` }, // 6 unique reasons
      obligations_emitted: [],
      prev_record_hash: "prev",
      self_hash: "hash"
    }));

    const result = summarize(records);
    expect(result.top_denial_reasons).toHaveLength(5);
  });

  it("handles REQUIRE_APPROVAL states", () => {
    const records: AuditRecord[] = [
      {
        intaglio_version: "0.1",
        record_id: "r1",
        timestamp: "2026-04-01T10:00:00Z",
        policy_id: "pol-1",
        policy_hash: "hash",
        agent_id: "ag-1",
        operator_id: "op-1",
        action: { rail: "x402", amount: { value: 1000, currency: "USDC" } },
        decision: { outcome: "REQUIRE_APPROVAL", reason: "human_approval_above" },
        obligations_emitted: [],
        prev_record_hash: "prev",
        self_hash: "sh1"
      }
    ];

    const result = summarize(records);
    expect(result.require_approval_count).toBe(1);
    expect(result.approve_count).toBe(0);
    expect(result.unique_endpoints).toBe(0);
  });
});
