# 3. maximum_velocity — frequency cap on agent actions
# Use case: an agent may submit at most 100 actions per hour

policy "maximum-velocity" {
  version     = "1.0.0"
  operator    = "org:example"
  agent       = "high-frequency-agent"

  scope {
    rails      = ["x402"]
    endpoints  = ["api.example.com/trades", "api.example.com/orders"]
    currencies = ["USDC"]
  }

  limit {
    per_transaction = 200 USDC
    frequency       = 100 per hour
  }

  obligation {
    log_to = "solana:devnet"
  }
}
