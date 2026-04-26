import { describe, it, expect } from "vitest";
import { FRAMEWORKS, requirementsByFramework } from "../src/frameworks.js";
import { buildAuditRecord, GENESIS_HASH } from "@intaglio/engine";
import type { AuditRecord } from "@intaglio/engine";

// Helper to reliably pluck dot-notation paths
function getPath(obj: any, path: string): boolean {
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  return true;
}

describe("frameworks", () => {
  it("groups requirements by framework correctly", () => {
    const miCA = requirementsByFramework("MiCA");
    expect(miCA.length).toBeGreaterThan(0);
    for (const req of miCA) {
      expect(req.framework).toBe("MiCA");
    }

    const aiAct = requirementsByFramework("EU AI Act");
    expect(aiAct.length).toBeGreaterThan(0);
  });

  it("ensures all declared evidence mappings exist on a canonical AuditRecord", () => {
    // Generate a maximally fleshed out AuditRecord
    const dummyRecord = buildAuditRecord({
      policy: {
        id: "test",
        version: "1.0",
        operator: "op",
        agent: "ag",
        scope: {},
        limit: {},
        obligation: { log_to: "devnet" }
      },
      action: {
        rail: "x402",
        amount: { value: 10, currency: "USD" },
        timestamp: "timestamp",
        chain: "solana:mainnet"
      },
      decision: { outcome: "DENY", reason: "geo-blocked" },
      prev_record_hash: GENESIS_HASH,
      obligations_emitted: ["test"]
    });

    // Also populate optional fields for the property checks
    const populatedRecord: AuditRecord = {
      ...dummyRecord,
      chain_anchor: {
        chain: "solana:mainnet",
        tx_hash: "abcd"
      }
    };

    // Assert that EVERY path mapped actually resolves in the TS interface instance
    for (const req of FRAMEWORKS) {
      for (const fieldPath of req.satisfied_by_record_field) {
        const exists = getPath(populatedRecord, fieldPath);
        // If this fails, the frameworks.ts mapping became desynced with types.ts
        expect(exists, `Field mapping ${fieldPath} in ${req.citation} does NOT exist on AuditRecord!`).toBe(true);
      }
    }
  });
});
