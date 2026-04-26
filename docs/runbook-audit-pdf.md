# AI Audit PDF Verification Runbook

Intaglio is an end-to-end local enforcement boundary tailored for the EU AI Act, MiCA, and DORA regulations. To maintain strict neutrality, Intaglio produces an **Auditor-Signable PDF** acting as a cryptographically verifiable ledger.

As a compliance officer, this runbook outlines exactly how you can locally cryptographically re-verify the PDF contents against the raw database snapshots, guaranteeing no records were mutated or dropped mid-chain.

## 1. Extract the Raw Archive
The generated PDF comes packaged with the `raw_ledger.json` representing exactly what the `intaglio-audit` compiler processed.

In a normal workflow, secure this JSON output directly from the PostgreSQL instance securing your records.

## 2. Re-Verifying the Chain
Intaglio hashes records serially (genesis-linked) using standard SHA-256 serialization algorithms natively documented in the `intaglio-engine`.

You can independently execute the mathematical verification without trusting Intaglio's proxies.

To do this:
1. Extract `raw_ledger.json` from the compliance artifacts.
2. Initialize the audit process manually:

```sh
node --import tsx --test ./intaglio-audit/test/verify.test.ts
```

*Or Programmatically:*
```typescript
import { inMemoryChain } from "@intaglio/engine";
import fs from "node:fs";

const rawLedger = JSON.parse(fs.readFileSync("raw_ledger.json", "utf-8"));

// 1. Instantiates a neutral validator seeded with a Genesis 000 hash.
const verifier = inMemoryChain();

// 2. Map serial verification matching previous record self-hashes dynamically.
const result = verifier.verify(rawLedger);

if (result.ok) {
   console.log("Integrity fully intact. No records mutated.");
} else {
   console.warn("BREACH DETECTED: Chain fractured at index", result.broken_at);
   console.warn("Reason:", result.reason); // "prev_record_hash_mismatch" or "self_hash_mismatch"
}
```

## 3. Solana Anchor Verifications
If your system utilizes the `log:solana:devnet` obligation emitter, Intaglio anchors chunks of audit hashes directly into Solana using the Memo program (`MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr`).

You can extract the `self_hash` values from the ledger and query Solana Devnet to guarantee that the chronological insertion matches the block time, mathematically proving the audit was not modified retroactively (Time-Travel tampering).
