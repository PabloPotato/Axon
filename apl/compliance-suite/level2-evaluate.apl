# Level 2 conformance — evaluation semantics.
# A conformant evaluator MUST return the correct decision for each of
# the three reference actions defined in the companion test spec.

policy "level2-evaluate" {
  version     = "1.0.0"
  operator    = "org:conformance-test"
  agent       = "evaluator-test-bot"

  scope {
    rails      = ["x402"]
    endpoints  = ["api.example.com/*"]
    currencies = ["USD"]
    chains     = ["solana:mainnet"]
  }

  limit {
    per_transaction = 100 USD
    per_day         = 1000 USD
  }

  require {
    human_approval_above = 500 USD
    identity_verified    = true
  }

  deny {
    countries = ["IR", "KP", "CU", "SY"]
    after     = "2027-01-01T00:00:00Z"
  }

  obligation {
    log_to = "solana:mainnet"
  }

  approval {
    default_approver = "compliance@example.com"
    timeout          = 30m
    on_timeout       = "deny"
  }
}

# Reference test vectors — a Level 2 evaluator MUST produce these outcomes:
#
#  1. action { rail="x402", endpoint="api.example.com/pay", amount=50 USD,
#              chain="solana:mainnet", geo="DE" }
#     ctx { identity_verified=true, per_day=0, per_month=0 }
#     → APPROVE
#
#  2. action { rail="x402", endpoint="api.example.com/pay", amount=50 USD,
#              chain="solana:mainnet", geo="IR" }
#     ctx { identity_verified=true }
#     → DENY  (reason starts with "geo-denied:")
#
#  3. action { rail="mpp", endpoint="api.example.com/pay", amount=50 USD }
#     ctx { identity_verified=true }
#     → DENY  (reason starts with "rail-out-of-scope:")
#
#  4. action { rail="x402", endpoint="api.other.com/pay", amount=50 USD,
#              chain="solana:mainnet" }
#     ctx { identity_verified=true }
#     → DENY  (reason starts with "endpoint-out-of-scope:")
#
#  5. action { rail="x402", endpoint="api.example.com/pay", amount=150 USD,
#              chain="solana:mainnet" }
#     ctx { identity_verified=true }
#     → DENY  (reason = "limit-per-transaction")
#
#  6. action { rail="x402", endpoint="api.example.com/pay", amount=80 USD,
#              chain="solana:mainnet" }
#     ctx { identity_verified=true, per_day=950 }
#     → DENY  (reason = "limit-per-day")
#
#  7. action { rail="x402", endpoint="api.example.com/pay", amount=80 USD,
#              chain="solana:mainnet" }
#     ctx { identity_verified=false }
#     → DENY  (reason = "identity-not-verified")
