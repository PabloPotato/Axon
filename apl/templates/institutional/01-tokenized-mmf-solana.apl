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