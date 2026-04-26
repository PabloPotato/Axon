# 5. blocklist — explicitly deny specific countries and merchants
# Use case: block sanctioned jurisdictions and known-bad merchants

policy "blocklist" {
  version     = "1.0.0"
  operator    = "org:example"
  agent       = "compliant-agent"

  scope {
    rails      = ["x402", "mpp"]
    endpoints  = ["api.example.com/*"]
    currencies = ["USD", "EUR"]
  }

  limit {
    per_transaction = 5000 USD
    per_day         = 50000 USD
  }

  deny {
    countries = ["IR", "KP", "CU", "SY", "RU"]
    merchants = ["sanctioned-mixer.example.com", "darknet-market.example.com"]
  }

  obligation {
    log_to = "solana:devnet"
  }
}
