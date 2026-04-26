# Level 3 conformance — hash-chained audit records.
# Any implementation that generates AuditRecords MUST satisfy:
#
#  1. Every AuditRecord contains `self_hash`, `prev_record_hash`, `policy_hash`,
#     `agent_id`, `operator_id`, `action`, `decision`, `obligations_emitted`,
#     `timestamp`, `record_id`, `intaglio_version`.
#
#  2. self_hash = sha256( canonical(record_without_self_hash) + prev_record_hash )
#     where canonical() is deterministic sorted-key JSON.
#
#  3. The genesis record MUST have
#     prev_record_hash = "sha256:0000000000000000000000000000000000000000000000000000000000000000"
#
#  4. Any single-byte mutation to any field breaks self_hash verification.
#
#  5. Removing or reordering records breaks the chain at the mutation point.

policy "level3-audit" {
  version  = "1.0.0"
  operator = "org:conformance-test"
  agent    = "audit-test-bot"

  scope {
    rails = ["x402"]
  }

  limit {
    per_transaction = 999 USD
  }

  obligation {
    log_to            = "solana:mainnet"
    retention         = "7y"
    audit_exports     = ["eu-ai-act-article-12"]
  }
}
