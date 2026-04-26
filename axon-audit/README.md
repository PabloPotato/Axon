# @axon/audit

**Auditor-signable PDF exporter for Axon.**

Input: a parsed APL `Policy` + an `AuditRecord[]` hash chain.
Output: a single PDF with cover page, executive summary, independent chain re-verification, EU-framework mapping (AI Act Art. 12, MiCA, DORA), full action ledger, policy snapshot, and operator signature block.

License: MIT.

## Usage

```ts
import { parse } from "@axon/engine";
import { generateAuditPDF } from "@axon/audit";

await generateAuditPDF({
  policy: parse(policySource),
  records,                                // AuditRecord[]
  period: { from: "2026-04-01T00:00:00Z", to: "2026-04-30T23:59:59Z" },
  operator: {
    legal_name: "Example GmbH",
    signatory_name: "Jane Müller",
    signatory_role: "Chief Compliance Officer",
  },
  output: "./april-2026-report.pdf",
  policy_source: policySource,            // optional, rendered verbatim
});
```

## Run the example

```bash
cd axon-audit
npm install
npm run example
open example-report.pdf
```

## What's in the PDF

1. **Cover** — operator, agent, reporting period, policy hash.
2. **Executive summary** — counts, spend by currency, top denial reasons.
3. **Chain integrity** — re-computes every `self_hash` and prints PASS/FAIL. Full first/final hashes printed unbroken.
4. **Framework mapping** — each AI Act / MiCA / DORA requirement cited, plus the exact `AuditRecord` fields that satisfy it.
5. **Action ledger** — every record in chain order.
6. **Policy snapshot** — exact `.apl` source.
7. **Operator attestation** — signature + date block.

## Independent re-verification

The chain can be re-verified without Axon:

```
sha256( canonical_json(record_minus_self_hash) + prev_record_hash ) == self_hash
```

Canonicalization is deterministic sorted-key JSON, as defined in APL SPEC §6.
