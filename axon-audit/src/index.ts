// axon-audit — index.ts
// Public API. One function. Produces an auditor-signable PDF.

import { createWriteStream } from "node:fs";
import { Writable } from "node:stream";
import type { Policy, AuditRecord } from "@axon/engine";
import { summarize } from "./summarize.js";
import { verifyChain } from "./verify.js";
import { renderAuditPDF } from "./pdf.js";

export { summarize } from "./summarize.js";
export { verifyChain } from "./verify.js";
export { FRAMEWORKS, requirementsByFramework } from "./frameworks.js";
export type { AuditSummary, SpendByCurrency, DenialReason } from "./summarize.js";
export type { VerificationResult } from "./verify.js";
export type { FrameworkRequirement } from "./frameworks.js";

export interface GenerateAuditPDFOptions {
  policy: Policy;
  records: AuditRecord[];
  period: { from: string; to: string };
  operator: {
    legal_name: string;
    signatory_name: string;
    signatory_role: string;
    organisation?: string;
  };
  /** Either a filesystem path, or a writable stream. */
  output: string | Writable;
  /** Optional raw .apl text; rendered verbatim in the Policy Snapshot section. */
  policy_source?: string;
  /** Defaults to new Date().toISOString(). */
  generated_at?: string;
}

export async function generateAuditPDF(opts: GenerateAuditPDFOptions): Promise<void> {
  const stream: Writable =
    typeof opts.output === "string" ? createWriteStream(opts.output) : opts.output;

  const summary = summarize(opts.records);
  const verification = verifyChain(opts.records);

  await renderAuditPDF({
    policy: opts.policy,
    records: opts.records,
    summary,
    verification,
    period: opts.period,
    operator: opts.operator,
    generated_at: opts.generated_at ?? new Date().toISOString(),
    stream,
    ...(opts.policy_source !== undefined ? { policy_source: opts.policy_source } : {}),
  });
}
