# Intaglio

**The policy layer for the autonomous economy.**

Open standard. Curated regulatory templates. Auto-updating compliance.

Build agents that scale without lawyers.

---

## Why this exists

Companies want to deploy fifty AI agents to run their treasury operations and sleep at night. Today, that is impossible. Every agent vendor solves this with closed policy engines and proprietary dashboards. Microsoft Agent 365 is the loudest example. That bundling is the wrong shape. Policy and audit for autonomous agents are infrastructure, like TLS or JSON. They should look like protocols, not products. Intaglio is that protocol layer, plus the curated templates and managed updates that turn it into a service.

Autonomous agents are about to move real money on behalf of real companies. In the next eighteen months:

- **Coinbase x402**, **Stripe/Tempo MPP**, **Google AP2**, **Visa TAP**, and **Mastercard Agent Pay** all ship agent-native payment rails.
- **EU AI Act Article 12** makes logging of high-risk agent decisions mandatory.
- **MiCA** (July 1 2026) forces every CASP-adjacent operator in the EU to keep auditable records of stablecoin movements.
- **DORA** extends operational resilience obligations to ICT third parties — which now includes your agents.

## The three layers

```
┌──────────────────────────────────────────────────────────────────┐
│  APL — Intaglio Policy Language                                      │
│  Declarative DSL. MIT + CC-BY-4.0. Frozen at v1.0 and donated.   │
│  apl/SPEC.md                                                     │
├──────────────────────────────────────────────────────────────────┤
│  Curated template library                                        │
│  50+ templates from EU regulatory text, fraud cases, controls.   │
│  Free for individuals. Paid for teams. $2K–$20K/month.           │
│  apl/templates/                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Auto-updating compliance subscription                           │
│  MiCA/DORA amendments absorbed in 48h.                           │
│  $50K–$500K/year. The Bloomberg Terminal for agent governance.   │
│  (shipping post-hackathon)                                       │
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
import { IntaglioEngine } from "@intaglio/engine";
const engine = new IntaglioEngine(readFileSync("marketing.apl", "utf8"));
const { decision, record } = await engine.evaluate(action, ctx);
// decision: APPROVE | DENY | REQUIRE_APPROVAL
// record:   canonical, hash-chained, regulator-ready
```

## What makes this different

**It is a standard, not a product.** The language and grammar are CC-BY-4.0. The reference engine is MIT. Donated to a neutral standards body at v1.0.

**It is deterministic and verifiable.** Given the same policy, action, and context, every compliant implementation returns the same decision and the same record hash.

**It is regulator-shaped.** The AuditRecord format maps directly to EU AI Act Article 12, MiCA CASP, DORA, NIST AI RMF, and ISO 42001.

**It is rail-agnostic.** x402, MPP, AP2, TAP, Agent Pay, and any future rail are just values of `scope.rails`. The policy outlives the rail.

**It auto-updates.** When regulations change, your templates change with them. No lawyers required.

## Positioning

|                              | Intaglio                           | Microsoft Agent 365            | Ramp Treasury           | ServiceNow AI Control Tower |
| ---------------------------- | ------------------------------ | ------------------------------ | ----------------------- | --------------------------- |
| Open-source core             | Yes (MIT + CC-BY-4.0)          | No                             | No                      | No                          |
| Portable policy format       | Yes (APL)                      | No                             | No                      | No                          |
| Deterministic audit chain    | Yes (hash-chained, anchorable) | Proprietary log                | Internal                | Internal                    |
| EU-first regulatory mapping  | Article 12, MiCA, DORA native  | Global, US-tilted              | US                      | Global                      |
| Auto-updating templates      | Yes (48h on regulation change) | No                             | No                      | No                          |
| Rail coverage                | All (declarative)              | Microsoft-first                | Ramp card + wire        | Connectors                  |
| Priced per seat              | No (infra; later SaaS)         | $15/user/mo in E7              | Per card                | Enterprise                  |
| Can you self-host end-to-end | Yes                            | No                             | No                      | No                          |

Microsoft can copy features. They cannot copy a standard their business model forbids them to adopt.

## Repo layout

```
Intaglio/
├── apl/                     — the language
│   ├── SPEC.md              — normative spec, v0.1 draft
│   ├── EXAMPLES.md          — five realistic policies
│   ├── templates/           — 10 curated policy templates (v0.1)
│   └── README.md            — public framing + governance
├── intaglio-engine/             — TypeScript reference implementation
│   ├── src/                 — parser · evaluator · audit chain · API
│   ├── examples/            — runnable end-to-end demo
│   └── README.md
├── dashboard/               — Next.js 15 operator dashboard
├── landing/                 — marketing page
├── services/                — x402 enforcement proxy
└── README.md                — this file
```

## Status

- **v0.1 (this release)** — APL spec draft · TypeScript engine · 10 template starters · hash chain visualization · live policy editor on landing page
- **v0.2 (May 2026)** — Solana anchoring · PDF audit exporter · v1 template library (50 templates) · deployment to Railway/Vercel
- **v0.3 (Q3 2026)** — Cross-currency oracle · Slack/email approval adapters · DORA + MiFID II export templates · paid tier billing
- **v1.0 (2027)** — Full APL Level 4 conformance · spec donated to neutral standards body · auto-updating compliance subscription

## Get involved

- Read [the spec](apl/SPEC.md) — start at §5 (evaluation semantics) or §7 (regulatory mapping).
- Browse [policy templates](apl/templates/) — ready-to-use `.apl` files for common agent use cases.
- Try [the engine](intaglio-engine/) — `npm install @intaglio/engine` and run the example.
- Open issues and PRs. The language is still pre-1.0; syntax changes are expected.

## License

Spec and grammar: **CC-BY-4.0**.
Reference implementation: **MIT**.

© Intaglio Labs (Berlin), 2026. Built in the open for the autonomous economy that is coming whether anyone is ready or not.
