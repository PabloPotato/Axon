# Intaglio for Institutional Issuers

**BlackRock built Aladdin because portfolio managers needed to act faster than spreadsheets allowed. Today institutional issuers running tokenized fund operations need autonomous policy enforcement that a regulator accepts as evidence. Intaglio is that layer.**

---

## The Wedge Buyers

Initial institutional design partner targets, sourced through Solana Superteam Germany and direct introductions:

| Institution | Jurisdiction | Thesis for Intaglio |
|---|---|---|
| **Sygnum** (Switzerland) | FINMA | Tokenized asset issuance needs deterministic policy enforcement with Swiss regulator-acceptable audit trails |
| **Amina** (Liechtenstein) | Liechtenstein TVTG / FMA | Blockchain-native bank running agent-based treasury operations |
| **Bitpanda Asset Management** (Austria) | FMA / CSSF MiCA passport | MiCA-compliant stablecoin and tokenized fund operations at scale |
| **Bitstamp** (UK / Luxembourg) | FCA / CSSF | Custody and payment rails that MiCA CASP rules will govern |

These are not prospects. These are design partners. The relationship is: they define the institutional primitives, Intaglio builds them, they get the first production deployment.

---

## The Pilot Offering

**Structure:** 60-day paid proof of concept
**Pricing:** 25,000–50,000 EUR
**Scope:** One fund's policy operations governed through Intaglio Engine + Audit
**Deliverable:** Auditor-accepted evidence package (PDF + hash-chain anchor + regulatory mapping)

The pilot answers one question for the partner's operations team: *"Does this reduce the time between a deal being agreed and the money moving?"*

Each pilot includes:
- Dedicated APL-FS dialect configuration for the partner's specific fund structure
- Integration with partner's existing signing entity (qualified signature or MPC wallet)
- Hash-chain anchoring to Solana devnet (mainnet in Q4 2026)
- Regulatory mapping document mapping every policy clause to the relevant regulation

---

## Product Gaps (Explicitly Not Yet Shipped)

Institutional buyers respect honesty over hype. These are the gaps we surface before they discover them:

| Gap | Planned delivery |
|---|---|
| APL-FS dialect (fund_mandate, kyc_status, sanctions_screen, redemption_gate) | Q3 2026 |
| Attestation chain (eIDAS-qualified signatures over hash chain) | Q3 2026 |
| SWIFT MT / ISO 20022 read-only ingest | Q3 2026 |
| SOC 2 Type II audit | Q4 2026 — audit engagement starts |
| eIDAS qualified signature acceptance | Q4 2026 |
| Managed compliance subscription (auto-updating templates) | Q4 2026 alpha |
| Solana mainnet anchoring | Q3 2026 |
| Multi-currency oracle | Q4 2026 |
| Enterprise SSO (SAML/OIDC) | Not yet scheduled |

---

## The Aladdin Question

Every institutional conversation starts with a variant of "How is this different from Aladdin?"

The honest answer: Aladdin is a portfolio management and risk platform built for BlackRock's internal operations. It does not speak to agents. It does not produce a regulator-acceptable evidence package from an autonomous agent action. It does not hash-chain to Solana. It does not have MiCA templates.

Intaglio is not Aladdin for portfolios. Intaglio is Aladdin for *autonomous agents moving money on behalf of those portfolios*.

The Aladdin column in our comparison table reflects this honestly. Aladdin has enterprise SSO, multi-asset support, and portfolio analytics — all things we will build over time. But it has zero agent-native policy, zero x402 support, zero open standard, zero hash-chained on-chain audit, and zero MiCA regulatory templates. Those are our moats.

---

## Contact

For design partner inquiries: [hello@intaglio.dev](mailto:hello@intaglio.dev)
