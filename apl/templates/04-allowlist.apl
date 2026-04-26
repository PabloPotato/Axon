# 4. allowlist — restrict to explicitly allowed endpoints and merchants
# Use case: agent can only interact with approved services

policy "allowlist" {
  version     = "1.0.0"
  operator    = "org:example"
  agent       = "restricted-agent"

  scope {
    rails      = ["x402"]
    endpoints  = ["api.example.com/pay", "api.example.com/refund"]
    merchants  = ["trusted-merchant.example.com"]
    currencies = ["USDC"]
    chains     = ["solana:mainnet"]
  }

  limit {
    per_transaction = 1000 USDC
    per_day         = 5000 USDC
  }

  obligation {
    log_to = "solana:devnet"
  }
}
