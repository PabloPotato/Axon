# APL — Agent Policy Language

> **The open standard for policy and compliance of autonomous AI agents.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spec: v0.1](https://img.shields.io/badge/Spec-v0.1-blue.svg)](./SPEC.md)
[![Reference: Axon Engine](https://img.shields.io/badge/Reference-axon--engine-green.svg)](../axon-engine)

---

## What is APL?

APL is a declarative, machine-enforceable, human-auditable language for defining what AI agents can and cannot do with money.

One `.apl` file describes an agent's scope, limits, required approvals, denied counterparties, and compliance obligations. That file compiles to:

1. **Runtime enforcement** — a proxy blocks disallowed actions in real-time (<5ms overhead).
2. **Human-readable policy** — a compliance officer reads it in 10 minutes.
3. **Regulator-ready audit trail** — hash-chained, Solana-anchored, exportable as EU AI Act Article 12 + MiCA + DORA + NIST AI RMF packages.

## Why APL exists

Every major AI agent payment rail launched in 2026 (Coinbase x402, Stripe MPP, Google AP2, Visa Trusted Agent Protocol, Mastercard Agent Pay) is a *rail*. None is a *policy layer*.

Microsoft Agent 365 is a policy layer — but it's closed, Windows-bundled, fiat-only, and does not interoperate with any crypto rail.

An open, vendor-neutral, rail-agnostic policy language is the missing primitive.

APL is that primitive.

## Hello World

```apl
policy "my-first-agent" {
  version  = "1.0.0"
  operator = "org:example"
  agent    = "hello-world-bot"

  scope {
    rails      = ["x402"]
    currencies = ["USDC"]
  }

  limit {
    per_transaction = 10 USDC
    per_day         = 100 USDC
  }

  obligation {
    log_to        = "solana:mainnet"
    audit_exports = ["eu-ai-act-article-12"]
  }
}
```

Ten lines. Your agent now has hard spend caps, immutable logging on Solana, and an EU AI Act Article 12 audit trail. Ship to production.

## How APL fits the stack

```
┌─────────────────────────────────────────────────────┐
│ Your AI agent (LangChain, OpenAI, Anthropic, custom) │
└────────────────────┬────────────────────────────────┘
                     │ "I want to spend 50 USDC"
                     ▼
┌─────────────────────────────────────────────────────┐
│ APL Evaluator (in-process or proxy)                  │
│  1. Resolve policy                                   │
│  2. Check scope, limits, requires, denies            │
│  3. Return APPROVE / DENY / REQUIRE_APPROVAL         │
│  4. Emit audit record                                │
└────────────────────┬────────────────────────────────┘
                     │ APPROVED
                     ▼
┌─────────────────────────────────────────────────────┐
│ Payment rail (x402, MPP, AP2, Visa, Mastercard, …)   │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│ Hash-chained audit log → Solana anchor → PDF export  │
└─────────────────────────────────────────────────────┘
```

## Key properties

- **Open source.** MIT licensed. Spec is CC-BY-4.0. No vendor owns it.
- **Rail-agnostic.** Works with every agent payment protocol shipping in 2026.
- **Regulator-aligned.** First-class mapping to EU AI Act, MiCA, DORA, NIST AI RMF, ISO 42001.
- **Human-readable.** Compliance officers review APL policies in pull requests.
- **Git-native.** Plain text, diff-friendly, reviewable, version-controlled.
- **Deterministic.** Same policy + same action = same decision. No hidden state.
- **Composable.** Inherit organization base policies. Narrow, never widen.

## What APL is not

- Not a chain, wallet, or rail. Those exist; APL governs them.
- Not a fraud-detection ML model. Axon ships one; APL does not specify it.
- Not a KYC/identity protocol. APL references identity claims; World ID, Civic, and KYAPay provide them.
- Not an agent framework. Works with any agent.

## Reference implementations

- **Axon Engine** (TypeScript, Rust) — `../axon-engine` — Level 4 conformance. MIT licensed.
- Additional implementations welcome. File a PR to list yours.

## Specification

Read the full spec: [`SPEC.md`](./SPEC.md)
Read the examples: [`EXAMPLES.md`](./EXAMPLES.md)

## Contribute

APL is developed in the open. Issues, discussions, and pull requests welcome at `github.com/axon-labs/apl`.

Proposals for new primitives, regulatory mappings, or conformance test cases are evaluated against the design principles in §1 of the spec.

## Governance

APL is maintained by Axon Labs, a Berlin-based team building the Axon Engine (the reference implementation and the enterprise SaaS).

We have committed to:

1. Never ship a closed extension to APL.
2. Never charge for conformance.
3. Donate the spec to a neutral standards body (IETF, Linux Foundation, or Agentic AI Foundation) once v1.0 is stable.

The language is bigger than the company.

---

*APL v0.1 — April 18, 2026. [OPERATOR_NAME], Axon Labs, Berlin.*
