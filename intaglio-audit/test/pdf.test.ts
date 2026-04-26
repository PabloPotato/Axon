import { describe, it, expect } from "vitest";
import { Writable } from "node:stream";
import { generateAuditPDF } from "../src/index.js";
import { buildAuditRecord, GENESIS_HASH } from "@intaglio/engine";
import type { AuditRecord, Policy } from "@intaglio/engine";

const dummyPolicy: Policy = {
  id: "test-policy",
  version: "1.0",
  operator: "op",
  agent: "ag",
  scope: {},
  limit: {},
  obligation: { log_to: "devnet" }
};

class MemoryStream extends Writable {
  public chunks: Buffer[] = [];
  _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
    this.chunks.push(Buffer.from(chunk));
    callback();
  }
}

describe("generateAuditPDF", () => {
  it("generates a valid PDF byte string into the Writable stream", async () => {
    // Scaffold 2 dummy records
    const r1 = buildAuditRecord({
      policy: dummyPolicy,
      action: { rail: "x402", amount: { value: 10, currency: "USD" }, timestamp: new Date().toISOString() },
      decision: { outcome: "APPROVE", reason: null },
      prev_record_hash: GENESIS_HASH,
      obligations_emitted: []
    });

    const r2 = buildAuditRecord({
      policy: dummyPolicy,
      action: { rail: "x402", amount: { value: 50, currency: "USD" }, timestamp: new Date().toISOString(), endpoint: "api.openai.com" },
      decision: { outcome: "DENY", reason: "limit-exceeded" },
      prev_record_hash: r1.self_hash,
      obligations_emitted: ["email-notify"]
    });

    const memStream = new MemoryStream();

    await generateAuditPDF({
      policy: dummyPolicy,
      records: [r1, r2],
      period: { from: "2026-04-01T00:00:00Z", to: "2026-04-19T00:00:00Z" },
      operator: {
        legal_name: "Test Operator Corp",
        signatory_name: "Jane Doe",
        signatory_role: "Compliance Officer",
      },
      output: memStream
    });

    const fullBuffer = Buffer.concat(memStream.chunks);

    // Assert the buffer is fairly large (PDFs are not 10 bytes)
    expect(fullBuffer.length).toBeGreaterThan(1000);

    // Verify PDF Magic Bytes (%PDF-)
    const head = fullBuffer.subarray(0, 5).toString("utf-8");
    expect(head).toBe("%PDF-");
  });
});
