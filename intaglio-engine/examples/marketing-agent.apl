policy "acme-marketing-bot-v1" {
  version     = "1.0.0"
  description = "Acme GmbH's Meta/Google ads agent. Caps daily spend, requires human approval above EUR 1000, logs to Solana."
  operator    = "org:acme-gmbh"
  agent       = "acme-marketing-bot"
  identity    = "world-id:0xab12cd34"

  scope {
    rails      = ["x402", "mpp"]
    endpoints  = ["graph.facebook.com/*", "googleads.googleapis.com/*"]
    currencies = ["USDC", "EUR"]
    chains     = ["solana:mainnet"]
  }

  limit {
    per_transaction = 500 EUR
    per_day         = 2000 EUR
    per_month       = 50000 EUR
  }

  require {
    human_approval_above = 1000 EUR
    approval_role        = "marketing.manager"
  }

  deny {
    countries = ["OFAC-sanctioned"]
  }

  obligation {
    log_to        = "solana:mainnet"
    retention     = "7y"
    audit_exports = ["eu-ai-act-article-12", "mica-casp"]
  }

  approval {
    default_approver = "cmo@acme.de"
    timeout          = 30m
    on_timeout       = "deny"
    channels         = ["slack", "email"]
  }
}
