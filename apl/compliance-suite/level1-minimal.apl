# Level 1 conformance — minimal parseable policy.
# A conformant parser MUST accept this without error.

policy "level1-minimal" {
  operator = "org:test"
  agent    = "test-bot"

  scope {}
  limit {}
  obligation { log_to = "solana:mainnet" }
}
