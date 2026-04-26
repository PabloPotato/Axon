# 2. per_day limit — daily spend ceiling for autonomous agents
# Use case: an agent may spend up to $10,000 per calendar day

policy "per-day-limit" {
  version     = "1.0.0"
  operator    = "org:example"
  agent       = "spend-agent"

  scope {
    rails      = ["x402", "mpp", "visa-tap"]
    endpoints  = ["api.example.com/*"]
    currencies = ["USD", "EUR"]
  }

  limit {
    per_day = 10000 USD
  }

  obligation {
    log_to = "solana:devnet"
  }
}
