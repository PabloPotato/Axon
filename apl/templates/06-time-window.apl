# 6. time_window — restrict agent activity to business hours
# Use case: agent may only operate during EU business hours

policy "time-window" {
  version     = "1.0.0"
  operator    = "org:example"
  agent       = "business-hours-agent"

  scope {
    rails      = ["x402", "mpp"]
    endpoints  = ["api.example.com/*"]
    currencies = ["USD", "EUR"]
    hours      = "09:00-18:00 Europe/Berlin"
    geos       = ["EU", "UK"]
  }

  limit {
    per_transaction = 2000 USD
    per_day         = 20000 USD
  }

  require {
    business_hours = true
  }

  obligation {
    log_to = "solana:devnet"
  }
}
