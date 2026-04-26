# 8. USDC default — policy configured for stablecoin treasury operations
# Use case: agent manages USDC treasury with conservative limits

policy "usdc-treasury" {
  version     = "1.0.0"
  operator    = "org:example"
  agent       = "treasury-agent"

  scope {
    rails      = ["x402"]
    endpoints  = ["api.example.com/transfer", "api.example.com/swap"]
    currencies = ["USDC"]
    chains     = ["solana:mainnet", "base:mainnet"]
  }

  limit {
    per_transaction = 50000 USDC
    per_day         = 250000 USDC
    concurrency     = 3
  }

  require {
    human_approval_above = 10000 USDC
    approval_role        = "finance.admin"
    identity_verified    = true
  }

  deny {
    merchants = ["unverified-protocol.example.com"]
  }

  obligation {
    log_to    = "solana:mainnet"
    retention = "7y"
  }

  approval {
    default_approver = "treasury@example.com"
    timeout          = 30m
    on_timeout       = "deny"
  }
}
