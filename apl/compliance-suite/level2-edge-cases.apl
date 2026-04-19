# Level 2 edge-case policy — glob matching, approval workflow, concurrency.

policy "level2-edge-cases" {
  version  = "1.0.0"
  operator = "org:conformance-test"
  agent    = "edge-case-bot"

  scope {
    rails      = ["x402", "mpp"]
    endpoints  = ["*.facebook.com/*", "googleads.googleapis.com/*"]
    currencies = ["USDC", "EUR", "USD"]
    chains     = ["solana:mainnet", "ethereum:mainnet"]
    hours      = "09:00-17:00 Europe/Berlin"
  }

  limit {
    per_transaction = 500 EUR
    per_day         = 2000 EUR
    per_month       = 20000 EUR
    concurrency     = 5
  }

  require {
    human_approval_above = 1000 EUR
    approval_role        = "finance.approver"
    identity_verified    = true
  }

  deny {
    countries = ["OFAC-sanctioned"]
    merchants = ["ACME-BLOCKED-VENDOR"]
    patterns  = [".*\\.ru/.*", ".*\\.cn/payments.*"]
  }

  obligation {
    log_to            = "solana:mainnet"
    retention         = "7y"
    audit_exports     = ["eu-ai-act-article-12", "mica-casp", "dora"]
    pii_redaction     = "automatic"
    incident_webhook  = "https://hooks.example.com/axon-incidents"
  }

  approval {
    default_approver = "cfo@example.com"
    timeout          = 30m
    on_timeout       = "deny"
    channels         = ["slack", "email"]
    escalation       = ["cto@example.com"]
  }
}

# Edge-case test vectors:
#
#  glob  "api.facebook.com/v1/x" vs "*.facebook.com/*"  → MATCH
#  glob  "graph.facebook.com/v1" vs "*.facebook.com/*"  → MATCH
#  glob  "evil.notfacebook.com"  vs "*.facebook.com/*"  → NO MATCH
#
#  concurrency: ctx.open_concurrent_actions=5 → DENY limit-concurrency
#
#  approval: 80 EUR, identity_verified=true, per_day=0 → APPROVE (below threshold)
#  approval: 1200 EUR (relaxed per_tx), no prior approval → REQUIRE_APPROVAL
#  approval: 1200 EUR, ctx.human_approvals["level2-edge-cases:cfo@example.com"]=true → APPROVE
