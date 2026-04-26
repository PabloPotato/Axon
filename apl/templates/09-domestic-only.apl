# 9. foreign_transaction block — restrict to domestic transactions only
# Use case: agent may only transact within the EU, block everything foreign

policy "domestic-only" {
  version     = "1.0.0"
  operator    = "org:example"
  agent       = "domestic-agent"

  scope {
    rails      = ["mpp"]
    endpoints  = ["api.example.com/*"]
    currencies = ["EUR"]
    geos       = ["DE", "FR", "NL", "BE", "AT", "ES", "IT"]
  }

  limit {
    per_transaction = 3000 EUR
    per_day         = 15000 EUR
  }

  deny {
    countries = ["US", "CN", "SG", "AE", "CH"]
  }

  require {
    identity_verified   = true
    two_factor_above    = 1000 EUR
  }

  obligation {
    log_to = "solana:devnet"
  }
}
