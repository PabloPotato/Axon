# Axon

**The open policy and audit layer for autonomous AI agents.**

Axon is an open-source standard that lets AI agents prove, in real time, that every action they take — every payment, every API call, every on-chain transaction — is inside a policy a human wrote and a regulator would accept.

One `.apl` file. One deterministic decision. One tamper-evident record. Every time.

MIT licensed. Vendor-neutral. EU-first.

---

## Why this exists

Autonomous agents are about to move real money on behalf of real companies. In the next eighteen months:

- **Coinbase x402**, **Stripe/Tempo MPP**, **Google AP2**, **Visa TAP**, and **Mastercard Agent Pay** all ship agent-native payment rails.
- **EU AI Act Article 12** makes logging of high-risk agent decisions mandatory.
- **MiCA** (July 1 2026) forces every CASP-adjacent operator in the EU to keep auditable records of stablecoin movements.
- **DORA** extends operational resilience obligations to ICT third parties — which now includes your agents.

Today, every agent vendor solves this the same way: a closed policy engine, a proprietary dashboard, a bundled SKU. Microsoft Agent 365 (May 2026 GA) is the loudest example.

That is the wrong shape. Policy and audit are **infrastructure**. They should look like TLS, not like a Salesforce add-on.

Axon is that infrastructure.

## The three layers

```
┌──────────────────────────────────────────────────────────────────┐
│  APL — Axon Policy Language                                      │
│  Declarative DSL. MIT + CC-BY-4.0. Frozen at v1.0 and donated.   │
│  apl/SPEC.md                                                     │
├──────────────────────────────────────────────────────────────────┤
│  axon-engine — reference implementation                          │
│  TypeScript first, Rust/WASM next. Parse · Evaluate · Audit.     │
│  axon-engine/                                                    │
├──────────────────────────────────────────────────────────────────┤
│  axon-audit — compliance exporter                                │
│  EU AI Act Art. 12 · MiCA · DORA · NIST AI RMF · ISO 42001       │
│  One-click signable PDF + Solana-anchored hash. (v0.2)           │
└──────────────────────────────────────────────────────────────────┘
```

## Hello world

```apl
policy "acme-marketing-bot-v1" {
  operator = "org:acme-gmbh"
  agent    = "acme-marketing-bot"

  scope {
    rails     = ["x402"]
    endpoints = ["graph.facebook.com/*"]
  }

  limit {
    per_transaction = 500 EUR
    per_day         = 2000 EUR
  }

  require {
    human_approval_above = 1000 EUR
  }

  obligation {
    log_to        = "solana:mainnet"
    audit_exports = ["eu-ai-act-article-12", "mica-casp"]
  }
}
```

```ts
import { AxonEngine } from "@axon/engine";
const engine = new AxonEngine(readFileSync("marketing.apl", "utf8"));
const { decision, record } = await engine.evaluate(action, ctx);
// decision: APPROVE | DENY | REQUIRE_APPROVAL
// record:   canonical, hash-chained, regulator-ready
```

## What makes this different

**It is a standard, not a product.** The language and grammar are CC-BY-4.0. The reference engine is MIT. The governance commitment is written into [apl/README.md](apl/README.md): no closed extensions, no paid conformance, donation to a neutral standards body at v1.0.

**It is deterministic and verifiable.** Given the same policy, action, and context, every compliant implementation returns the same decision and the same record hash. No model-in-the-loop. No vendor lock-in.

**It is regulator-shaped.** The AuditRecord format maps directly to EU AI Act Article 12, MiCA CASP record-keeping, DORA ICT incident registers, NIST AI RMF, and ISO 42001 Annex B. A compliance officer can read it without training.

**It is rail-agnostic.** x402, MPP, AP2, TAP, Agent Pay, and any future rail are just values of `scope.rails`. The policy outlives the rail.

## Positioning

|                              | Axon                           | Microsoft Agent 365            | Ramp Agents             | ServiceNow AI Control Tower |
| ---------------------------- | ------------------------------ | ------------------------------ | ----------------------- | --------------------------- |
| Open-source core             | Yes (MIT + CC-BY-4.0)          | No                             | No                      | No                          |
| Portable policy format       | Yes (APL)                      | No                             | No                      | No                          |
| Deterministic audit chain    | Yes (hash-chained, anchorable) | Proprietary log                | Internal                | Internal                    |
| EU-first regulatory mapping  | Article 12, MiCA, DORA native  | Global, US-tilted              | US                      | Global                      |
| Rail coverage                | All (declarative)              | Microsoft-first                | Ramp card + wire        | Connectors                  |
| Priced per seat              | No (infra; later SaaS)         | $15/user/mo in E7              | Per card                | Enterprise                  |
| Can you self-host end-to-end | Yes                            | No                             | No                      | No                          |

Microsoft can copy features. They cannot copy a standard their business model forbids them to adopt.

## Repo layout

```
Axon/
├── apl/                     — the language
│   ├── SPEC.md              — normative spec, v0.1 draft
│   ├── EXAMPLES.md          — five realistic policies
│   └── README.md            — public framing + governance
├── axon-engine/             — TypeScript reference implementation
│   ├── src/                 — parser · evaluator · audit chain · API
│   ├── examples/            — runnable end-to-end demo
│   └── README.md
├── prompts/                 — cheap-model prompts for parallel bulk work
└── README.md                — this file
```

Strategy artifacts (thesis, competitive map, customer-discovery plan, 60-day build plan, Oracle note) live at the repo root as `AXON_*.md` and are not part of the shipped library.

## Status

- **v0.1 (this release)** — APL spec draft · TypeScript engine · parse + evaluate + hash chain (APL Conformance Level 2 + Level 3 hash anchoring).
- **v0.2 (May 2026)** — Solana anchoring emitter · PDF audit exporter (EU AI Act Article 12 template) · ReDoS-safe regex via re2.
- **v0.3 (Q3 2026)** — Cross-currency oracle · Slack/email/PagerDuty approval adapters · DORA + MiFID II export templates.
- **v0.4 (Q4 2026)** — Rust + WASM build, sub-1ms evaluation.
- **v1.0 (2027)** — Full APL Level 4 conformance. Spec donated to a neutral standards body.

## Get involved

- Read [the spec](apl/SPEC.md) — start at §5 (evaluation semantics) or §7 (regulatory mapping).
- Try [the engine](axon-engine/) — `npm install @axon/engine` and run the example.
- Open issues and PRs. The language is still pre-1.0; syntax changes are expected.

## License

Spec and grammar: **CC-BY-4.0**.
Reference implementation: **MIT**.

© Axon Labs (Berlin), 2026. Built in the open for the operator economy that is coming whether anyone is ready or not.
