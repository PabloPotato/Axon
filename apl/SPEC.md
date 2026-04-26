# Intaglio Policy Language (APL) — Specification v0.1

**Status:** Draft — April 18, 2026
**License:** MIT / CC-BY-4.0
**Author:** [OPERATOR_NAME] (Intaglio)
**Target standards track:** IETF (informational) + W3C (community group) + extension to MCP (Anthropic)

---

## Abstract

APL is a declarative, machine-enforceable, human-auditable language for defining policies that govern autonomous AI agents. A single APL document describes what an agent is allowed to do, under what conditions, with what limits, and what obligations (logging, retention, approval, audit export) apply to its actions.

APL compiles to three artifacts:

1. A **runtime policy** — evaluated inline by an enforcement engine (e.g. Intaglio Engine) when an agent attempts an action.
2. A **human-readable policy document** — suitable for board review, audit, or regulator submission.
3. A **regulator-ready audit mapping** — linking policy clauses to the specific regulations they satisfy (EU AI Act Article 12, MiCA, DORA, NIST AI RMF, ISO 42001, etc.).

APL is rail-agnostic. The same policy governs an agent whether it transacts on x402 (Coinbase), MPP (Stripe/Tempo), AP2 (Google), Visa Trusted Agent Protocol, Mastercard Agent Pay, or a fiat card rail.

APL is open source (MIT). The reference implementation is open source (MIT). Any vendor may implement APL; no vendor may own it.

---

## 1. Design principles

1. **Declarative, not imperative.** APL describes *what* is permitted; the engine decides *how* to enforce.
2. **One source of truth.** A single APL document drives runtime enforcement, human audit, and regulator submission. No drift.
3. **Rail-agnostic.** APL addresses agent behaviors, not payment protocols. The same policy binds an x402 call, an MPP transaction, and a Visa charge.
4. **Composable.** Policies compose via inclusion and inheritance. Organizations define base policies; teams inherit and narrow.
5. **Regulator-aligned.** Every APL primitive maps to at least one regulatory obligation. Obligations are first-class.
6. **Human-readable.** A non-technical compliance officer can read and understand an APL policy in under ten minutes.
7. **Git-friendly.** APL is plain text. Policies live in version control. Changes are reviewable as diffs.
8. **Deterministic evaluation.** Given the same policy and the same action, the engine returns the same decision. No hidden state.

## 2. File format

APL policies are UTF-8 text files with the extension `.apl`. The top-level syntax is block-based and indentation-insensitive. Comments begin with `#` and extend to end of line.

```apl
# This is a comment
policy "marketing-agent-v1" {
  version = "1.0.0"
  # ... body ...
}
```

## 3. Top-level structure

An APL document contains exactly one `policy` block.

```apl
policy "<identifier>" {
  version       = "<semver>"
  description   = "<human-readable description>"
  operator      = "<operator identifier>"
  agent         = "<agent identifier>"
  identity      = "<identity claim>"       # optional

  scope         { ... }                     # required
  limit         { ... }                     # required
  require       { ... }                     # optional
  deny          { ... }                     # optional
  obligation    { ... }                     # required
  approval      { ... }                     # optional
  inherit_from  = "<parent-policy-uri>"    # optional
}
```

## 4. Core blocks

### 4.1 `scope` — what the agent is allowed to touch

Defines the surface area of permitted actions.

```apl
scope {
  rails      = ["x402", "mpp", "ap2", "visa-tap"]
  endpoints  = ["api.meta.com/*", "api.googleads.com/*"]
  merchants  = ["*.shopify.com", "merchant:id:12345"]
  currencies = ["USDC", "USD", "EUR"]
  chains     = ["solana:mainnet", "base:mainnet"]
  hours      = "09:00-18:00 Europe/Berlin"
  geos       = ["EU", "US", "UK"]
}
```

Each key is optional. Unspecified keys default to the engine-configured default (usually deny-all). Keys accept literal strings, glob patterns (`*`), regular expressions (wrapped in `//`), or URIs referencing external lists.

### 4.2 `limit` — quantitative ceilings

Defines spend, frequency, and concurrency caps.

```apl
limit {
  per_transaction = 500 USD
  per_hour        = 2000 USD
  per_day         = 10000 USD
  per_month       = 100000 USD
  concurrency     = 5                # max simultaneous open actions
  frequency       = 100 per hour     # max actions per window
}
```

All currency amounts carry a unit (ISO 4217 for fiat, ticker for crypto). The engine resolves cross-currency limits at enforcement time using a configured oracle.

### 4.3 `require` — preconditions

Defines conditions that must hold for an action to be permitted.

```apl
require {
  business_hours      = true
  human_approval_above = 1000 USD
  approval_role       = "finance.admin"
  two_factor_above    = 5000 USD
  attestation         = "iso-42001:active"
  identity_verified   = true
}
```

### 4.4 `deny` — explicit blocklists

Overrides any scope/require clause. If a `deny` matches, the action is denied regardless.

```apl
deny {
  countries = ["OFAC-sanctioned", "EU-sanctioned"]
  merchants = ["blacklist:crypto-mixers", "blacklist:darknet"]
  patterns  = [/.*\.onion$/]
  after     = "2026-12-31T23:59:59Z"   # hard expiry
}
```

### 4.5 `obligation` — what must happen when an action occurs

Defines required logging, retention, and audit outputs. Obligations are the heart of regulatory compliance.

```apl
obligation {
  log_to            = "solana:mainnet"      # anchor chain for audit hashes
  log_format        = "intaglio-audit-v1"
  retention         = "7y"
  audit_exports     = ["eu-ai-act-article-12", "mica-casp", "dora-ict-risk"]
  pii_redaction     = "automatic"
  notify_operator   = ["denied", "limit-exceeded"]
  incident_webhook  = "https://ops.example.com/intaglio/webhook"
}
```

### 4.6 `approval` — human-in-the-loop workflows

Defines how and by whom edge-case approvals are requested.

```apl
approval {
  default_approver  = "finance.admin@example.com"
  timeout           = 15m
  on_timeout        = "deny"
  channels          = ["slack", "email"]
  escalation        = ["cfo@example.com", "ceo@example.com"]
}
```

### 4.7 `inherit_from` — composition

A policy may inherit from a parent. Child clauses narrow (never widen) parent clauses. Inheritance is resolved at parse time.

```apl
policy "team-marketing-v1" {
  inherit_from = "org:acme:base-policy-v3"
  # ... overrides ...
}
```

## 5. Evaluation semantics

For an incoming agent action `a`, the engine evaluates:

```
1. Resolve effective policy P (with inheritance applied).
2. If any deny clause matches a → DENY(reason).
3. If a falls outside scope → DENY(reason="out-of-scope").
4. If a violates a limit → DENY(reason="limit-exceeded") or QUEUE.
5. If a triggers a require clause that isn't satisfied →
   a. If approval block exists → REQUEST_APPROVAL(approver, timeout).
   b. Else → DENY(reason="require-not-met").
6. Else → APPROVE.
7. Emit obligations (log, notify, export hooks) regardless of outcome.
```

Evaluation is deterministic and side-effect-scoped: the engine emits obligations as a separate, idempotent pipeline.

## 6. Audit artifact format

Every evaluation produces a canonical `AuditRecord`:

```json
{
  "intaglio_version": "0.1",
  "record_id": "uuid-v4",
  "timestamp": "2026-04-18T14:22:01Z",
  "policy_id": "marketing-agent-v1",
  "policy_hash": "sha256:...",
  "agent_id": "meta-ads-bot",
  "operator_id": "org:acme",
  "action": {
    "rail": "x402",
    "endpoint": "api.meta.com/v1/campaigns",
    "amount": "342.00",
    "currency": "USDC"
  },
  "decision": "APPROVE",
  "reason": null,
  "obligations_emitted": ["solana-log", "audit-export"],
  "chain_anchor": {
    "chain": "solana:mainnet",
    "tx_hash": "...",
    "block_height": 312788201
  },
  "prev_record_hash": "sha256:...",
  "self_hash": "sha256:..."
}
```

Records are hash-chained: `self_hash = H(canonical(record) || prev_record_hash)`. The latest hash is anchored to Solana (or another chain configured via `obligation.log_to`) at a configurable cadence (default: every 1000 records or 60 seconds, whichever comes first).

This structure satisfies EU AI Act Article 12 ("automatic logging of events") and provides cryptographic proof of non-tampering for regulator submission.

## 7. Regulatory mapping (initial set)

| APL primitive | EU AI Act | MiCA | DORA | NIST AI RMF | ISO 42001 |
|---|---|---|---|---|---|
| `obligation.log_to` + hash chain | Art. 12 (logging) | Art. 68 (record-keeping) | Art. 6 (ICT incident logging) | GOVERN-1.6 | 8.2.1 |
| `limit.*` | Art. 15 (accuracy/robustness) | Art. 74 (operational resilience) | Art. 17 (ICT risk) | MANAGE-2.3 | 8.3 |
| `require.human_approval_*` | Art. 14 (human oversight) | — | — | GOVERN-3.2 | 8.1.3 |
| `deny.countries` | Art. 5 (prohibited practices) | Art. 22 (sanctions) | — | — | 8.2.3 |
| `obligation.audit_exports` | Art. 12 + Annex IV | Art. 68 | Art. 28 | MEASURE-3 | 9.2 |
| `require.identity_verified` | Art. 16 (transparency) | Art. 75 (KYC/AML) | — | MAP-5.1 | 8.2.1 |

Maintained as a living matrix. Regulatory changes land as spec PRs.

## 8. Grammar (informal EBNF)

```ebnf
policy        ::= "policy" string "{" policy-body "}"
policy-body   ::= (field | block)*
field         ::= identifier "=" value
block         ::= identifier "{" (field | nested-block)* "}"
nested-block  ::= identifier "{" field* "}"
value         ::= string | number currency | boolean | list | duration
list          ::= "[" (value ("," value)*)? "]"
duration      ::= number ("s"|"m"|"h"|"d"|"y")
currency      ::= "USD" | "EUR" | "USDC" | "USDT" | ...
```

Full PEG grammar is in `apl/grammar.peg` in the reference implementation.

## 9. Conformance levels

**Level 1 — Reader.** Parses APL, validates syntax, renders human-readable output. Required for all implementations.
**Level 2 — Evaluator.** Implements §5 evaluation semantics. Can enforce policies at runtime.
**Level 3 — Audit-anchoring.** Implements §6 hash chain with on-chain anchoring. Can produce regulator-ready exports.
**Level 4 — Full compliance.** Implements §7 regulatory mapping, emits audit exports in all supported formats, passes the APL compliance test suite.

Intaglio Engine targets Level 4.

## 10. Versioning

APL follows semantic versioning. Breaking changes require a major version bump. Parsers MUST accept documents from any minor version equal to or lower than their own and MUST reject documents with a higher minor version unless explicitly operating in lenient mode.

## 11. Security considerations

- APL documents are not executable code. Parsers MUST NOT evaluate or `eval` any field.
- Regex and glob patterns MUST be bounded-time (deny ReDoS).
- Inherit_from URIs MUST be resolved through a trust boundary; the parser MUST NOT fetch arbitrary URLs by default.
- Hash chain verification is mandatory for Level 3+ audit output.

## 12. Contributing

The APL specification is developed in the open at `github.com/axon-labs/apl`. Changes are proposed as pull requests with a rationale section and regulatory-mapping impact analysis. The maintainers operate a lightweight consensus model; decisions are documented in `DECISIONS.md`.

---

*APL is the open standard. Intaglio Engine is one implementation. The language is bigger than the company.*
