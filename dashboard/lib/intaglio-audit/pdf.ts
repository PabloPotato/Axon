// intaglio-audit — pdf.ts
// PDFKit renderer for the auditor-signable report.
//
// Design rules:
//   - Every number on every page must be derivable from the record stream.
//   - No colour used for information; only for emphasis. Print-legible.
//   - Every section has a title, a short paragraph explaining what it is for,
//     and then the data. A reader who has never used Intaglio must understand.
//   - Hashes are rendered in full, not truncated, in the integrity section.

import PDFDocument from "pdfkit";
import { Writable } from "node:stream";
import type { Policy, AuditRecord } from "../intaglio-engine/index";
import { hashPolicy } from "../intaglio-engine/index";
import type { AuditSummary } from "./summarize.js";
import type { VerificationResult } from "./verify.js";
import { FRAMEWORKS, requirementsByFramework } from "./frameworks.js";

export interface RenderOptions {
  policy: Policy;
  records: AuditRecord[];
  summary: AuditSummary;
  verification: VerificationResult;
  period: { from: string; to: string };
  operator: {
    legal_name: string;
    signatory_name: string;
    signatory_role: string;
    organisation?: string;
  };
  generated_at: string; // ISO-8601
  stream: Writable;
  policy_source?: string; // raw .apl text (optional — included in policy snapshot page)
}

const COLOR = {
  ink: "#111111",
  muted: "#555555",
  rule: "#CCCCCC",
  emphasis: "#000000",
  bad: "#B00020",
  good: "#0F7B0F",
};

function fmtAmount(v: number, currency: string): string {
  const rounded = Number.isInteger(v) ? v.toFixed(2) : v.toFixed(2);
  return `${rounded} ${currency}`;
}

function fmtIso(ts: string): string {
  // ISO-8601 stays as-is; we just trim milliseconds for readability.
  return ts.replace(/\.\d{3}Z$/, "Z");
}

function fmtDate(ts: string): string {
  return ts.slice(0, 10);
}

export async function renderAuditPDF(opts: RenderOptions): Promise<void> {
  const doc = new PDFDocument({
    size: "A4",
    margin: 56,
    info: {
      Title: `Intaglio audit report — ${opts.policy.id}`,
      Author: opts.operator.legal_name,
      Subject: "Auditor-signable AI-agent compliance report",
      Keywords: "EU AI Act; MiCA; DORA; stablecoin; AI agent; audit",
      CreationDate: new Date(opts.generated_at),
    },
  });

  doc.pipe(opts.stream);

  // ── Cover page ────────────────────────────────────────────────────────────
  renderCover(doc, opts);

  // ── Executive summary ─────────────────────────────────────────────────────
  doc.addPage();
  renderExecutiveSummary(doc, opts);

  // ── Chain integrity ───────────────────────────────────────────────────────
  doc.addPage();
  renderIntegrity(doc, opts);

  // ── Framework mapping ─────────────────────────────────────────────────────
  doc.addPage();
  renderFrameworkMapping(doc);

  // ── Action ledger ─────────────────────────────────────────────────────────
  doc.addPage();
  renderLedger(doc, opts);

  // ── Policy snapshot ───────────────────────────────────────────────────────
  doc.addPage();
  renderPolicySnapshot(doc, opts);

  // ── Signature block ───────────────────────────────────────────────────────
  doc.addPage();
  renderSignatureBlock(doc, opts);

  doc.end();

  await new Promise<void>((resolve, reject) => {
    opts.stream.on("finish", () => resolve());
    opts.stream.on("error", (e) => reject(e));
  });
}

// ── Section renderers ───────────────────────────────────────────────────────

function renderCover(doc: PDFKit.PDFDocument, opts: RenderOptions): void {
  const { policy, period, operator, generated_at } = opts;
  const pHash = hashPolicy(policy);

  doc.fillColor(COLOR.muted).fontSize(10).text("Intaglio audit report v0.1", { align: "left" });
  doc.moveDown(0.4);
  rule(doc);

  doc.moveDown(2);
  doc
    .fillColor(COLOR.ink)
    .fontSize(26)
    .font("Helvetica-Bold")
    .text("Regulator-Ready Audit Report", { align: "left" });

  doc.moveDown(0.5);
  doc
    .fillColor(COLOR.muted)
    .fontSize(12)
    .font("Helvetica")
    .text(
      "Hash-chained evidence of AI-agent actions under a published Intaglio Policy Language (APL) policy.",
      { align: "left" },
    );

  doc.moveDown(3);
  kv(doc, "Operator", operator.legal_name);
  if (operator.organisation) kv(doc, "Organisation", operator.organisation);
  kv(doc, "Policy ID", policy.id);
  kv(doc, "Policy version", policy.version);
  kv(doc, "Agent", policy.agent);
  kv(doc, "Reporting period", `${fmtDate(period.from)}  →  ${fmtDate(period.to)}`);
  kv(doc, "Report generated", fmtIso(generated_at));

  doc.moveDown(2);
  doc
    .fillColor(COLOR.muted)
    .fontSize(9)
    .font("Helvetica")
    .text("Policy hash (SHA-256)");
  doc.fillColor(COLOR.ink).fontSize(10).font("Courier").text(pHash);

  doc.moveDown(6);
  rule(doc);
  doc
    .fillColor(COLOR.muted)
    .fontSize(9)
    .font("Helvetica")
    .text(
      "This report was produced by intaglio-audit, an open-source (MIT) conformance implementation of the Intaglio Policy Language (APL, CC-BY-4.0). Any third party can independently re-verify the hash chain using the JSON export referenced in the Chain Integrity section.",
      { align: "left" },
    );
}

function renderExecutiveSummary(doc: PDFKit.PDFDocument, opts: RenderOptions): void {
  sectionHeader(doc, "1. Executive summary");

  para(
    doc,
    "This page aggregates every agent action recorded for the reporting period. The numbers are computed from the record stream included with this report. A reader who reconstructs the stream will arrive at the same totals.",
  );

  const s = opts.summary;
  doc.moveDown(1);

  kv(doc, "Total records", String(s.record_count));
  kv(doc, "Approved", String(s.approve_count));
  kv(doc, "Denied", String(s.deny_count));
  kv(doc, "Pending approval", String(s.require_approval_count));
  kv(doc, "Unique endpoints", String(s.unique_endpoints));
  kv(doc, "Unique agents", String(s.unique_agents));
  kv(doc, "Obligations emitted", String(s.obligations_emitted_count));
  kv(doc, "First record", s.period_first_ts ? fmtIso(s.period_first_ts) : "—");
  kv(doc, "Last record", s.period_last_ts ? fmtIso(s.period_last_ts) : "—");

  doc.moveDown(1);
  subHeader(doc, "Spend by currency");
  if (s.spend_by_currency.length === 0) {
    doc.fillColor(COLOR.muted).fontSize(10).text("No spend recorded in this period.");
  } else {
    for (const row of s.spend_by_currency) {
      kv(
        doc,
        row.currency,
        `approved ${fmtAmount(row.approved_total, row.currency)} (${row.approved_count})  ·  denied ${fmtAmount(row.denied_total, row.currency)} (${row.denied_count})`,
      );
    }
  }

  doc.moveDown(1);
  subHeader(doc, "Top denial reasons");
  if (s.top_denial_reasons.length === 0) {
    doc.fillColor(COLOR.muted).fontSize(10).text("No denials in this period.");
  } else {
    for (const r of s.top_denial_reasons) {
      kv(doc, r.reason, String(r.count));
    }
  }
}

function renderIntegrity(doc: PDFKit.PDFDocument, opts: RenderOptions): void {
  sectionHeader(doc, "2. Chain integrity");

  para(
    doc,
    "Every Intaglio audit record contains a SHA-256 self-hash computed over the canonical JSON encoding of the record plus the hash of the previous record. Removing, reordering, or mutating any single byte of any record breaks the chain at the mutation point. The verification below was performed on the complete record stream enclosed with this report.",
  );

  const v = opts.verification;
  doc.moveDown(1);
  kv(doc, "Genesis hash", v.genesis_hash);
  kv(doc, "Records verified", String(v.record_count));

  doc.moveDown(0.5);

  if (v.ok) {
    doc
      .fillColor(COLOR.good)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("RESULT: chain verified");
    doc.fillColor(COLOR.ink).fontSize(10).font("Helvetica");

    if (v.first_record_hash) {
      doc.moveDown(0.5);
      doc.fillColor(COLOR.muted).fontSize(9).text("First record self-hash");
      doc.fillColor(COLOR.ink).fontSize(10).font("Courier").text(v.first_record_hash);
    }
    if (v.final_record_hash) {
      doc.moveDown(0.5);
      doc.font("Helvetica").fillColor(COLOR.muted).fontSize(9).text("Final record self-hash");
      doc.fillColor(COLOR.ink).fontSize(10).font("Courier").text(v.final_record_hash);
    }
  } else {
    doc
      .fillColor(COLOR.bad)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("RESULT: CHAIN BROKEN");
    doc.font("Helvetica").fillColor(COLOR.ink).fontSize(10);
    kv(doc, "Broken at record index", String(v.broken_at));
    kv(doc, "Reason", v.reason);
  }

  doc.moveDown(2);
  subHeader(doc, "How to independently re-verify");
  para(
    doc,
    "1. Export the record stream via the intaglio-audit CLI as records.json.\n" +
      "2. Run intaglio-audit verify records.json — exit code 0 iff the chain is intact.\n" +
      "3. For each record, recompute: sha256( canonical_json(record_without_self_hash) + prev_record_hash ). The result must equal self_hash. The canonicalization is deterministic sorted-key JSON (see APL SPEC §6).",
  );
}

function renderFrameworkMapping(doc: PDFKit.PDFDocument): void {
  sectionHeader(doc, "3. Compliance framework mapping");
  para(
    doc,
    "This section maps the fields of each Intaglio audit record to the specific articles of the three EU frameworks most relevant to stablecoin-paying AI agents in 2026: the AI Act, MiCA, and DORA. The mapping is informational; final sufficiency determination rests with the operator's legal counsel.",
  );

  for (const framework of ["EU AI Act", "MiCA", "DORA"] as const) {
    doc.moveDown(1);
    subHeader(doc, framework);
    for (const req of requirementsByFramework(framework)) {
      doc.moveDown(0.5);
      doc
        .fillColor(COLOR.emphasis)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(req.citation, { continued: false });
      doc
        .fillColor(COLOR.ink)
        .font("Helvetica")
        .fontSize(10)
        .text(`Requirement: ${req.requirement}`);
      doc
        .fillColor(COLOR.muted)
        .fontSize(10)
        .text(`Intaglio evidence: ${req.intaglio_evidence}`);
      doc
        .fillColor(COLOR.muted)
        .fontSize(9)
        .font("Courier")
        .text(`fields: ${req.satisfied_by_record_field.join(", ")}`);
      doc.font("Helvetica");

      // If we're getting near the bottom of the page, insert a page break.
      if (doc.y > doc.page.height - 100) {
        doc.addPage();
      }
    }
  }
}

function renderLedger(doc: PDFKit.PDFDocument, opts: RenderOptions): void {
  sectionHeader(doc, "4. Action ledger");
  para(
    doc,
    "Every action evaluated by the policy during the reporting period, in chain order. The self-hash column shows the first 12 hex characters of the record's SHA-256 self-hash — sufficient for spot-checking against the enclosed JSON export.",
  );

  doc.moveDown(0.5);

  const cols: Array<{ key: string; label: string; width: number; align?: "left" | "right" }> = [
    { key: "idx", label: "#", width: 22 },
    { key: "ts", label: "Timestamp (UTC)", width: 120 },
    { key: "endpoint", label: "Endpoint", width: 130 },
    { key: "amount", label: "Amount", width: 70, align: "right" },
    { key: "outcome", label: "Outcome", width: 60 },
    { key: "reason", label: "Reason", width: 80 },
    { key: "hash", label: "self-hash", width: 80 },
  ];

  const tableLeft = doc.page.margins.left;
  const tableRight = doc.page.width - doc.page.margins.right;
  const rowHeight = 16;

  // Header row.
  doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.ink);
  let x = tableLeft;
  for (const c of cols) {
    doc.text(c.label, x + 2, doc.y, { width: c.width - 4, continued: false, align: c.align ?? "left" });
    x += c.width;
  }
  doc.moveDown(0.2);
  doc
    .strokeColor(COLOR.rule)
    .lineWidth(0.5)
    .moveTo(tableLeft, doc.y)
    .lineTo(tableRight, doc.y)
    .stroke();
  doc.moveDown(0.2);

  doc.font("Helvetica").fontSize(8.5).fillColor(COLOR.ink);

  for (let i = 0; i < opts.records.length; i++) {
    const r = opts.records[i]!;
    // Page break.
    if (doc.y > doc.page.height - doc.page.margins.bottom - rowHeight) {
      doc.addPage();
      // Re-draw header on the new page.
      doc.font("Helvetica-Bold").fontSize(9).fillColor(COLOR.ink);
      let xh = tableLeft;
      for (const c of cols) {
        doc.text(c.label, xh + 2, doc.y, { width: c.width - 4, continued: false, align: c.align ?? "left" });
        xh += c.width;
      }
      doc.moveDown(0.2);
      doc
        .strokeColor(COLOR.rule)
        .lineWidth(0.5)
        .moveTo(tableLeft, doc.y)
        .lineTo(tableRight, doc.y)
        .stroke();
      doc.moveDown(0.2);
      doc.font("Helvetica").fontSize(8.5).fillColor(COLOR.ink);
    }

    const rowY = doc.y;
    const values: Record<string, string> = {
      idx: String(i),
      ts: fmtIso(r.timestamp),
      endpoint: r.action.endpoint ?? r.action.merchant ?? "—",
      amount: fmtAmount(r.action.amount.value, r.action.amount.currency),
      outcome: r.decision.outcome,
      reason: r.decision.reason ?? "",
      hash: r.self_hash.replace(/^sha256:/, "").slice(0, 12),
    };

    let cx = tableLeft;
    for (const c of cols) {
      const v = values[c.key] ?? "";
      doc.text(v, cx + 2, rowY, {
        width: c.width - 4,
        lineBreak: false,
        align: c.align ?? "left",
      });
      cx += c.width;
    }

    doc.y = rowY + rowHeight;
  }
}

function renderPolicySnapshot(doc: PDFKit.PDFDocument, opts: RenderOptions): void {
  sectionHeader(doc, "5. Policy snapshot");
  para(
    doc,
    "The APL source below is the exact policy that evaluated every action in this report. Any change produces a new policy_hash and therefore a new report series. The hash is printed on the cover page.",
  );

  doc.moveDown(0.5);
  doc.font("Courier").fontSize(9).fillColor(COLOR.ink);

  const source = opts.policy_source
    ? opts.policy_source
    : `# Original .apl source not provided; rendering canonical JSON.\n${JSON.stringify(opts.policy, null, 2)}`;

  doc.text(source, {
    lineGap: 1,
  });

  doc.font("Helvetica");
}

function renderSignatureBlock(doc: PDFKit.PDFDocument, opts: RenderOptions): void {
  sectionHeader(doc, "6. Operator attestation");

  para(
    doc,
    "By signing below, the operator attests that the enclosed record stream was produced by a deployment of intaglio-engine operating under the policy whose hash appears on the cover page, that no records have been removed, and that the operator is authorised to certify this report on behalf of the organisation.",
  );

  doc.moveDown(3);

  // Signature line.
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const signY = doc.y + 40;

  doc.strokeColor(COLOR.ink).lineWidth(0.75).moveTo(left, signY).lineTo(left + 280, signY).stroke();
  doc.fillColor(COLOR.muted).fontSize(9).text("Signature", left, signY + 4);

  doc.strokeColor(COLOR.ink).lineWidth(0.75).moveTo(right - 160, signY).lineTo(right, signY).stroke();
  doc.fillColor(COLOR.muted).fontSize(9).text("Date", right - 160, signY + 4);

  doc.moveDown(5);
  doc.fillColor(COLOR.ink).fontSize(11).font("Helvetica-Bold").text(opts.operator.signatory_name);
  doc.fillColor(COLOR.muted).fontSize(10).font("Helvetica").text(opts.operator.signatory_role);
  doc.fillColor(COLOR.muted).fontSize(10).text(opts.operator.legal_name);
  if (opts.operator.organisation) {
    doc.fillColor(COLOR.muted).fontSize(10).text(opts.operator.organisation);
  }
}

// ── Primitives ──────────────────────────────────────────────────────────────

function rule(doc: PDFKit.PDFDocument): void {
  const y = doc.y;
  doc
    .strokeColor(COLOR.rule)
    .lineWidth(0.5)
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
}

function sectionHeader(doc: PDFKit.PDFDocument, title: string): void {
  doc.fillColor(COLOR.ink).font("Helvetica-Bold").fontSize(16).text(title);
  doc.moveDown(0.5);
  rule(doc);
  doc.moveDown(0.7);
  doc.font("Helvetica");
}

function subHeader(doc: PDFKit.PDFDocument, title: string): void {
  doc.fillColor(COLOR.ink).font("Helvetica-Bold").fontSize(11).text(title);
  doc.font("Helvetica");
  doc.moveDown(0.2);
}

function para(doc: PDFKit.PDFDocument, text: string): void {
  doc.fillColor(COLOR.muted).font("Helvetica").fontSize(10).text(text, {
    align: "left",
    lineGap: 2,
  });
  doc.fillColor(COLOR.ink);
}

function kv(doc: PDFKit.PDFDocument, label: string, value: string): void {
  const labelWidth = 140;
  const y = doc.y;
  doc.fillColor(COLOR.muted).font("Helvetica").fontSize(10).text(label, doc.page.margins.left, y, {
    width: labelWidth,
    continued: false,
  });
  doc.fillColor(COLOR.ink).font("Helvetica").fontSize(10).text(value, doc.page.margins.left + labelWidth, y, {
    width: doc.page.width - doc.page.margins.right - doc.page.margins.left - labelWidth,
  });
}
