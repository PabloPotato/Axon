# 1. per_transaction limit — hard cap on individual agent actions
# Use case: no single transaction may exceed $500

policy "per-transaction-limit" {
  version     = "1.0.0"
  operator    = "org:example"
  agent       = "general-agent"

  scope {
    rails      = ["x402", "mpp"]
    endpoints  = ["api.example.com/*"]
    currencies = ["USDC", "USD"]
  }

  limit {
    per_transaction = 500 USD
  }

  obligation {
    log_to = "solana:devnet"
  }
}
