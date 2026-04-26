# APL-FS — Institutional Dialect for Tokenized Fund Operations

**Status:** Draft specification under active design.  
**Target APL version:** v0.2 (post-v1.0)  
**Author:** Intaglio Labs  
**License:** CC-BY-4.0

---

## Problem Statement

APL v0.1 governs generic AI agents executing actions on payment rails. This covers a wide range of use cases — marketing spend, procurement, treasury rebalancing — but it does not cover the institutional financial agent that operates within a regulated fund structure.

A tokenized money market fund has a richer operational vocabulary than a generic agent:

- It has a **fund mandate** that constrains which assets the fund may hold
- It has **investor classes** (qualified, retail, accredited) each with different disclosure and confirmation requirements
- It requires **KYC/AML status checks** before every redemption
- It operates a **redemption gate** that can be triggered by market conditions or NAV deviation
- It calculates **NAV** within a defined window and must attest to the calculation method
- It reports to specific regulators under specific instruments (1940 Act, MiCA Title V, FINMA circulars)

APL-FS adds these primitives to the existing APL grammar. The resulting policy is both machine-enforceable (by an institutional-grade Intaglio Engine) and human-auditable (by a compliance officer, external auditor, or regulator).

---

## New Primitives (20)

Each primitive maps to at least one institutional regulation. The mapping is documented in the comments of the example policy below.

### Fund Structure

| Primitive | Type | Description |
|---|---|---|
| `fund_mandate` | string set | Which asset classes, sectors, or strategies the fund may pursue |
| `fund_type` | string | `money_market`, `bond`, `equity`, `multi_asset`, `tokenized`, `credit` |
| `domicile` | string | Fund's legal domicile (e.g., `LU`, `IE`, `CH`, `US`) |
| `investor_class` | string set | Permitted investor types: `qualified`, `retail`, `accredited`, `institutional` |

### Identity & Risk

| Primitive | Type | Description |
|---|---|---|
| `kyc_status` | string | Required KYC status level: `screening_complete`, `enhanced_due_diligence`, `ongoing_monitoring` |
| `sanctions_screen` | boolean | Whether to screen against OFAC, EU, UN sanctions lists before action |
| `risk_profile` | string | Fund or investor risk profile: `conservative`, `moderate`, `aggressive` |
| `country_restrictions` | string set | Jurisdictions the fund may not accept capital from |

### Operations

| Primitive | Type | Description |
|---|---|---|
| `redemption_gate` | number + currency | Maximum total redemptions per day before gate triggers |
| `redemption_gate_override` | string | Who can override a gate: `board`, `fund_manager`, `compliance` |
| `liquidity_floor` | number + currency | Minimum liquidity the fund must maintain at all times |
| `nav_calculation_window` | duration | Time window for NAV calculation (e.g., `16:00-17:00 UTC`) |
| `nav_deviation_threshold` | number | Percentage deviation from expected NAV that triggers investigation |

### Attestation & Audit

| Primitive | Type | Description |
|---|---|---|
| `attestation_required` | structured | `{ signer: string, role: string, registered_entity: string }` |
| `attestation_chain` | structured | Ordered list of signers whose signatures form the attestation chain |
| `audit_trail_level` | string | `standard` or `enhanced` (enhanced captures all intermediate state, not just decisions) |
| `regulator_reporting` | string set | Regulators to whom reports must be filed: `sec`, `fma_li`, `finma`, `cssf`, `fca` |

### Rails & Settlement

| Primitive | Type | Description |
|---|---|---|
| `settlement_rails` | string set | Allowed settlement networks: `solana`, `ethereum`, `swift_mt`, `iso_20022` |
| `settlement_currencies` | string set | Currencies for settlement: `USDC`, `EURC`, `CHF`, `USD`, `EUR` |
| `settlement_timing` | string | Expected settlement timing: `t0`, `t1`, `t2` |
| `custodian` | string | Who holds assets during settlement: `sygnum`, `amina`, `bitstamp`, `coinbase_custody` |

---

## Example: Tokenized Money Market Fund (Solana-Native)

```apl
# APL-FS specimen — Tokenized Money Market Fund on Solana
# Status: Draft. APL-FS primitives are post-v1 design.
# Parser may return errors for unknown primitives.

policy "tokenized-mmf-solana-v1" {
  version     = "0.2.0-draft"
  operator    = "org:sygnum"
  agent       = "mmf-oracle-bot"

  # Fund structure
  fund_mandate    = ["money_market", "short_term_government", "repo"]
  fund_type       = "money_market"
  domicile        = "CH"
  investor_class  = ["qualified", "institutional"]

  scope {
    rails      = ["x402", "solana:transfer"]
    endpoints  = ["api.sygnum.com/funds/mmf/*"]
    currencies = ["USDC", "EURC", "CHF"]
    chains     = ["solana:mainnet"]
  }

  limit {
    per_transaction = 5000000 USDC
    per_day         = 25000000 USDC
    concurrency     = 5
  }

  require {
    kyc_status                 = "enhanced_due_diligence"
    sanctions_screen           = true
    identity_verified          = true
    human_approval_above       = 1000000 USDC
    approval_role              = "fund_manager"
    nav_calculation_window     = "16:00-17:00 UTC"
    redemption_gate            = 50000000 USDC
    redemption_gate_override   = "board"
    liquidity_floor            = 10000000 USDC
    risk_profile               = "conservative"
  }

  attestation_required {
    signer             = "sygnum-compliance-officer-01"
    role               = "compliance_officer"
    registered_entity  = "Sygnum AG (CHE-123.456.789)"
  }

  deny {
    countries           = ["IR", "KP", "CU", "SY", "RU", "BY"]
    country_restrictions = ["US"]  # fund does not accept US persons
    liquidity_below     = 10000000 USDC
  }

  approval {
    default_approver  = "sygnum-fund-admin@sygnum.com"
    timeout           = 30m
    on_timeout        = "deny"
    escalation        = ["sygnum-head-of-funds@sygnum.com"]
  }

  obligation {
    log_to            = "solana:mainnet"
    retention         = "10y"
    audit_trail_level = "enhanced"
    regulator_reporting = ["finma"]
    attestation_chain = [
      "compliance_officer",
      "fund_manager",
      "board_member"
    ]
    audit_exports     = [
      "finma-circular-2026-1",
      "mica-title-v",
      "1940-investment-company-act"
    ]
  }
}
```

---

## Regulatory Mapping

| APL-FS Primitive | 1940 Investment Company Act | MiCA Title V | FINMA Circular 2026/1 |
|---|---|---|---|
| `fund_mandate` | Section 8(b) | Art. 48 | 3.1 |
| `investor_class` | Section 2(a)(51) | Art. 52 | 4.2 |
| `kyc_status` | — | Art. 73 | 5.1 |
| `redemption_gate` | Section 22(e) | Art. 51 | 6.3 |
| `liquidity_floor` | Section 30 | — | 6.5 |
| `nav_calculation_window` | Section 2(a)(41) | Art. 50 | 6.1 |
| `attestation_required` | — | Art. 76 | 7.2 |
| `regulator_reporting` | Section 30(b) | Art. 83 | 8.1 |
| `settlement_rails` | — | Art. 56 | 9.1 |
| `custodian` | Section 17(f) | Art. 54 | 9.3 |

---

## Implementation Status

APL-FS primitives are **not yet implemented** in the Intaglio Engine parser. The grammar will be extended in the v0.2 development cycle. The example policy above exists as a forward-looking specimen to guide design partner conversations.

**What exists today:**
- APL v0.1 parser (200-line recursive-descent in `intaglio-engine/src/parser.ts`)
- Full evaluation semantics for `scope`, `limit`, `require`, `deny`, `obligation`, `approval`
- Hash-chain audit with Solana devnet anchoring
- PDF audit export via `intaglio-audit`

**What we are building next:**
- APL-FS grammar extensions (new field types for structured attestations)
- Attestation chain evaluation (verify qualified signature before permitting action)
- SWIFT MT and ISO 20022 read-only ingest for treasury reconciliation

---

## Contributing

This is a draft specification under active design with prospective design partners. Comments welcome via GitHub issues.

**Target first institutional design partner pilot:** Q3 2026
