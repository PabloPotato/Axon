# APL — Examples

Real-world policies demonstrating APL v0.1. All examples are MIT-licensed and free to copy.

---

## Example 1 — Marketing ads agent (SMB, single-tenant)

An agent that manages Meta and Google ad campaigns for a single brand. Pays per-campaign via x402 stablecoin and via credit card via MPP.

```apl
policy "acme-marketing-bot-v1" {
  version     = "1.0.0"
  description = "Acme GmbH's Meta/Google ads agent. Caps daily spend, requires human approval above €1K, logs to Solana."
  operator    = "org:acme-gmbh"
  agent       = "acme-marketing-bot"
  identity    = "world-id:0xab12...cd34"

  scope {
    rails      = ["x402", "mpp"]
    endpoints  = ["graph.facebook.com/*", "googleads.googleapis.com/*"]
    currencies = ["USDC", "EUR"]
    chains     = ["solana:mainnet"]
    hours      = "00:00-23:59 Europe/Berlin"
  }

  limit {
    per_transaction = 500 EUR
    per_day         = 2000 EUR
    per_month       = 50000 EUR
    frequency       = 20 per hour
  }

  require {
    human_approval_above = 1000 EUR
    approval_role        = "marketing.manager"
  }

  deny {
    countries = ["OFAC-sanctioned"]
  }

  obligation {
    log_to        = "solana:mainnet"
    retention     = "7y"
    audit_exports = ["eu-ai-act-article-12"]
  }

  approval {
    default_approver = "cmo@acme.de"
    timeout          = 30m
    on_timeout       = "deny"
    channels         = ["slack", "email"]
  }
}
```

---

## Example 2 — Institutional treasury agent (asset manager, regulated)

A fund's rebalancing agent that can move up to €10M/day across tokenized assets.

```apl
policy "dws-rebalance-agent-v2" {
  version     = "2.1.0"
  description = "DWS tokenized-fund rebalancing agent. MiFID II + DORA + EU AI Act bound. Two-person approval above €1M."
  operator    = "org:dws-group"
  agent       = "treasury-rebalance-eu"
  identity    = "attestation:iso-42001:cert:dws-2026-q2"
  inherit_from = "org:dws-group:institutional-base-v5"

  scope {
    rails      = ["ap2", "mpp"]
    merchants  = ["custodian:blackrock-buidl", "custodian:franklin-benji", "dex:uniswap-v4"]
    currencies = ["EUR", "USD", "USDC"]
    chains     = ["ethereum:mainnet", "solana:mainnet"]
    hours      = "07:00-20:00 Europe/Frankfurt"
    geos       = ["EU", "US"]
  }

  limit {
    per_transaction = 250000 EUR
    per_hour        = 2000000 EUR
    per_day         = 10000000 EUR
    concurrency     = 3
  }

  require {
    business_hours       = true
    human_approval_above = 1000000 EUR
    approval_role        = "portfolio.manager"
    two_factor_above     = 100000 EUR
    attestation          = "iso-42001:active"
  }

  deny {
    countries = ["OFAC-sanctioned", "EU-sanctioned", "UK-sanctioned"]
    merchants = ["blacklist:crypto-mixers"]
  }

  obligation {
    log_to            = "solana:mainnet"
    log_format        = "intaglio-audit-v1"
    retention         = "10y"
    audit_exports     = ["eu-ai-act-article-12", "mifid-ii", "dora-ict-risk", "sec-15c3-3"]
    pii_redaction     = "automatic"
    incident_webhook  = "https://compliance.dws.com/intaglio"
  }

  approval {
    default_approver = "portfolio.lead@dws.com"
    timeout          = 10m
    on_timeout       = "deny"
    channels         = ["slack", "pager"]
    escalation       = ["cro@dws.com", "ceo@dws.com"]
  }
}
```

---

## Example 3 — Developer tool agent (Browserbase-style)

An agent that pays per browser session on Tempo/MPP. No human approval — hard caps only.

```apl
policy "browserbase-session-agent-v1" {
  version     = "1.2.0"
  description = "Per-session browser agent paying via MPP. Deny-by-default, hard caps, no HITL."
  operator    = "org:browserbase-inc"
  agent       = "session-orchestrator"

  scope {
    rails      = ["mpp"]
    endpoints  = ["browserbase.com/session/*"]
    currencies = ["USDC"]
  }

  limit {
    per_transaction = 2 USDC
    per_hour        = 100 USDC
    per_day         = 500 USDC
    frequency       = 300 per hour
  }

  deny {
    patterns = [/.*malicious.*/]
  }

  obligation {
    log_to        = "solana:mainnet"
    retention     = "2y"
    audit_exports = ["eu-ai-act-article-12"]
  }
}
```

---

## Example 4 — DAO treasury bot (Solana-native)

A community-owned DAO's automated yield-farming agent.

```apl
policy "jito-dao-yield-bot-v3" {
  version     = "3.0.1"
  description = "Jito DAO yield-deployment agent. Multisig approval above 5% TVL. All actions on-chain verifiable."
  operator    = "dao:jito-network"
  agent       = "yield-router"

  scope {
    rails      = ["x402"]
    merchants  = ["defi:kamino", "defi:marginfi", "defi:drift"]
    currencies = ["USDC", "SOL", "JitoSOL"]
    chains     = ["solana:mainnet"]
  }

  limit {
    per_transaction = 100000 USDC
    per_day         = 1000000 USDC
  }

  require {
    human_approval_above = 500000 USDC
    approval_role        = "dao.multisig"
  }

  obligation {
    log_to        = "solana:mainnet"
    retention     = "forever"
    audit_exports = ["community-transparency-report"]
  }

  approval {
    default_approver = "multisig:solana:JitoD...pubkey"
    timeout          = 24h
    on_timeout       = "deny"
    channels         = ["squads-ui"]
  }
}
```

---

## Example 5 — Base policy with inheritance

Demonstrates composition — an organization-wide base policy that team policies inherit from.

**`acme-base-v1.apl`:**
```apl
policy "acme-base-v1" {
  version = "1.0.0"
  operator = "org:acme-gmbh"

  deny {
    countries = ["OFAC-sanctioned", "EU-sanctioned"]
    merchants = ["blacklist:crypto-mixers", "blacklist:darknet"]
  }

  obligation {
    log_to        = "solana:mainnet"
    retention     = "7y"
    audit_exports = ["eu-ai-act-article-12", "mica-casp"]
    incident_webhook = "https://compliance.acme.de/intaglio"
  }
}
```

**`acme-marketing-v2.apl`:**
```apl
policy "acme-marketing-v2" {
  version      = "2.0.0"
  inherit_from = "file:acme-base-v1.apl"
  agent        = "marketing-bot"

  scope {
    rails      = ["x402", "mpp"]
    endpoints  = ["graph.facebook.com/*"]
    currencies = ["EUR", "USDC"]
  }

  limit {
    per_day = 2000 EUR
  }
}
```

The child policy inherits the `deny` and `obligation` blocks from the base, overrides nothing, and adds its own `scope` and `limit`. A compliance audit checks the parent once; children are provably bounded.

---

## How to use these

1. Copy the closest example to your use case.
2. Change the `operator`, `agent`, `identity`, and specific limits.
3. Save as `<name>.apl` in your repo.
4. Validate with `intaglio lint your-policy.apl`.
5. Deploy with `intaglio apply your-policy.apl`.
6. Every agent action your code performs now routes through the Intaglio enforcement proxy.

The language is bigger than the company. If you'd rather self-host, the reference implementation (`intaglio-engine`) is MIT-licensed and ships in Rust and TypeScript.
