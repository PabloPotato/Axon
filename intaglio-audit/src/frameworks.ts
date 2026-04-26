// intaglio-audit — frameworks.ts
// Maps Intaglio audit-record fields to specific articles of the three EU frameworks
// an Intaglio customer is trying to satisfy:
//
//   - EU AI Act (Regulation 2024/1689) — Article 12 "Record-keeping", Art. 13–15
//   - MiCA (Regulation 2023/1114) — Title V CASP obligations
//   - DORA (Regulation 2022/2554) — ICT risk & incident reporting
//
// This module is intentionally plain data: an auditor reading the PDF should
// be able to trace any evidence claim back to a specific article citation.
//
// NOTE: This is the *mapping*, not legal advice. Sari's design partners still
// need their own counsel. We make the mapping legible — they decide sufficiency.

export interface FrameworkRequirement {
  framework: "EU AI Act" | "MiCA" | "DORA";
  citation: string;
  requirement: string;
  intaglio_evidence: string;
  satisfied_by_record_field: string[];
}

export const FRAMEWORKS: FrameworkRequirement[] = [
  // ── EU AI Act ────────────────────────────────────────────────────────────
  {
    framework: "EU AI Act",
    citation: "Art. 12(1)",
    requirement:
      "High-risk AI systems shall technically allow for the automatic recording of events ('logs') over the lifetime of the system.",
    intaglio_evidence:
      "Every agent action emits an append-only AuditRecord sealed with a SHA-256 self-hash and a prev_record_hash. The chain covers the full operating lifetime of the deployed policy.",
    satisfied_by_record_field: ["record_id", "timestamp", "self_hash", "prev_record_hash"],
  },
  {
    framework: "EU AI Act",
    citation: "Art. 12(2)(a)",
    requirement:
      "Logs shall ensure identification of situations that may result in the AI system presenting a risk within the meaning of Article 79(1).",
    intaglio_evidence:
      "Every DENY and REQUIRE_APPROVAL decision records its machine-readable reason code (e.g. geo-denied, limit-per-transaction, identity-not-verified) alongside the policy clause that fired.",
    satisfied_by_record_field: ["decision.outcome", "decision.reason", "policy_hash"],
  },
  {
    framework: "EU AI Act",
    citation: "Art. 12(2)(b)",
    requirement:
      "Logs shall facilitate post-market monitoring as referred to in Article 72.",
    intaglio_evidence:
      "Intaglio chain-exports are replayable end-to-end: given the policy source and the record stream, any third party can re-evaluate the decision and confirm it matches the recorded outcome.",
    satisfied_by_record_field: ["policy_hash", "action", "decision", "obligations_emitted"],
  },
  {
    framework: "EU AI Act",
    citation: "Art. 12(2)(c)",
    requirement:
      "Logs shall facilitate monitoring of the operation of the high-risk AI system referred to in Article 26(5).",
    intaglio_evidence:
      "Each record captures the operator_id, agent_id, action rail, endpoint, amount, and obligations emitted. The operator retains these logs for the retention window declared in the policy (default 7 years).",
    satisfied_by_record_field: ["operator_id", "agent_id", "action", "obligations_emitted"],
  },

  // ── MiCA ─────────────────────────────────────────────────────────────────
  {
    framework: "MiCA",
    citation: "Art. 68(9)",
    requirement:
      "CASPs shall keep all records of all their services, activities, orders and transactions for at least five years.",
    intaglio_evidence:
      "All stablecoin-rail transactions (x402, MPP, AP2) are recorded with amount, currency, chain, and tx_hash when anchored. Retention is governed by obligation.retention (≥ 5y enforced).",
    satisfied_by_record_field: ["action.amount", "action.chain", "chain_anchor", "timestamp"],
  },
  {
    framework: "MiCA",
    citation: "Art. 68(7)",
    requirement:
      "CASPs shall have sound administrative and accounting procedures, internal control mechanisms, effective procedures for risk assessment, and effective control and safeguard arrangements for information processing systems.",
    intaglio_evidence:
      "APL declares risk limits (per_transaction, per_day, per_month, concurrency) and approval thresholds. Every breach produces a DENY or REQUIRE_APPROVAL record — never a silent failure.",
    satisfied_by_record_field: ["decision.outcome", "decision.reason", "policy_hash"],
  },
  {
    framework: "MiCA",
    citation: "Art. 70",
    requirement:
      "CASPs shall have in place a complaints handling procedure with records of complaints and measures taken.",
    intaglio_evidence:
      "obligations_emitted captures incident_webhook calls; the audit chain flags any record that triggered an incident obligation, and the chain_anchor proves no incident record was silently removed.",
    satisfied_by_record_field: ["obligations_emitted", "chain_anchor"],
  },

  // ── DORA ─────────────────────────────────────────────────────────────────
  {
    framework: "DORA",
    citation: "Art. 5",
    requirement:
      "Financial entities shall have an internal governance and control framework that ensures an effective and prudent management of ICT risk.",
    intaglio_evidence:
      "The APL policy is a machine-readable governance artefact. Its hash is embedded in every record; any change to governance produces a new policy_hash trail visible in the chain.",
    satisfied_by_record_field: ["policy_hash"],
  },
  {
    framework: "DORA",
    citation: "Art. 17",
    requirement:
      "Financial entities shall have in place an ICT-related incident management process to detect, manage, and notify ICT-related incidents.",
    intaglio_evidence:
      "Non-APPROVE decisions optionally emit an incident_webhook obligation. The obligations_emitted array is part of the hashed record — incidents cannot be deleted without breaking the chain.",
    satisfied_by_record_field: ["decision.outcome", "obligations_emitted", "self_hash"],
  },
  {
    framework: "DORA",
    citation: "Art. 19",
    requirement:
      "Financial entities shall report major ICT-related incidents to the relevant competent authority.",
    intaglio_evidence:
      "The Intaglio audit export is structured so that the operator can filter records by (decision.outcome ≠ APPROVE) and hand the resulting subset, with independently-verifiable hashes, to the competent authority.",
    satisfied_by_record_field: ["decision", "obligations_emitted", "self_hash", "prev_record_hash"],
  },
];

export function requirementsByFramework(
  framework: FrameworkRequirement["framework"],
): FrameworkRequirement[] {
  return FRAMEWORKS.filter((r) => r.framework === framework);
}
