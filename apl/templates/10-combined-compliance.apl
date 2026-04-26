# 10. combined_compliance — full-featured policy with all blocks
# Use case: MiCA-ready compliance for high-value agent operations

policy "combined-compliance" {
  version     = "1.0.0"
  description = "Full compliance policy for MiCA CASP-ready agent operations"
  operator    = "org:example"
  agent       = "compliance-agent"

  scope {
    rails      = ["x402", "mpp"]
    endpoints  = ["api.example.com/*"]
    currencies = ["USDC", "USD", "EUR"]
    chains     = ["solana:mainnet"]
    geos       = ["EU"]
  }

  limit {
    per_transaction = 500 USD
    per_hour        = 5000 USD
    per_day         = 25000 USD
    per_month       = 250000 USD
    concurrency     = 5
  }

  require {
    business_hours       = true
    human_approval_above = 1000 USD
    approval_role        = "compliance.officer"
    identity_verified    = true
    risk_score_below     = 8
  }

  deny {
    countries = ["IR", "KP", "CU", "SY", "RU"]
  }

  approval {
    default_approver = "compliance@example.com"
    timeout          = 30m
    on_timeout       = "deny"
    channels         = ["slack", "email"]
    escalation       = ["cfo@example.com"]
  }

  obligation {
    log_to        = "solana:mainnet"
    retention     = "7y"
    audit_exports = ["eu-ai-act-article-12", "mica-casp"]
    notify_operator = ["denied", "limit-exceeded"]
  }
}
