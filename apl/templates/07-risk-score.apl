# 7. risk_score — dynamic per-action risk assessment threshold
# Use case: flag and deny actions exceeding a risk score threshold

policy "risk-score-threshold" {
  version     = "1.0.0"
  operator    = "org:example"
  agent       = "risk-aware-agent"

  scope {
    rails      = ["x402", "mpp"]
    endpoints  = ["api.example.com/*"]
    currencies = ["USDC", "USD", "EUR"]
  }

  limit {
    per_transaction = 1000 USD
    per_day         = 10000 USD
  }

  require {
    risk_score_below = 7
  }

  approval {
    default_approver = "compliance@example.com"
    timeout          = 15m
    on_timeout       = "deny"
  }

  obligation {
    log_to = "solana:devnet"
  }
}
