# AXON — Competitive Map (April 2026)

## Layer model

```
┌────────────────────────────────────────────────────────────────┐
│ LAYER 5: Enterprise Control Plane (governance, policy, audit)  │
│   ┌──────────────────────────────────────────────────────────┐ │
│   │ IDENTITY/OBSERVABILITY (fiat-first, in-enterprise):      │ │
│   │   Microsoft Agent 365 (May 1 GA, $15/user/mo)            │ │
│   │   ServiceNow AI Agent Studio + AI Control Tower          │ │
│   │   MeshAI (agent control plane, EU AI Act scoring)        │ │
│   │   Galileo Agent Control (open-source guardrails)         │ │
│   │                                                          │ │
│   │ FINANCIAL POLICY on HUMAN spend (fiat):                  │ │
│   │   Ramp ($1B ARR, $32B val, 62% out-of-policy reduction)  │ │
│   │                                                          │ │
│   │ GAP → AXON: Financial policy on AGENT spend, multi-rail, │ │
│   │             crypto+fiat, EU AI Act + MiCA bundled        │ │
│   └──────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────┤
│ LAYER 4: Agent Payment/Identity Middleware                     │
│   Skyfire (KYAPay, $9.5M, a16z/Coinbase, Visa pilot)          │
│   Crossmint (40K enterprises, Adidas, Red Bull, $23.6M)       │
│   Natural ($9.8M, traction: logistics/healthcare/procurement)  │
│   Payman AI ($14M, banking-rail agent txns)                   │
│   Halliday ($20M Series A a16z, Workflow Protocol, DeFi-nat.) │
│   Nekuda, PayOS, Highnote, Payabli, Diddo, Sumvin (Visa VIC)  │
├────────────────────────────────────────────────────────────────┤
│ LAYER 3: Open Protocols (rails + governance primitives)        │
│   x402 (Coinbase + Cloudflare → x402 Foundation)              │
│     - 100M+ txs, $600M annualized, Solana ~49% share          │
│     - "Upto" usage-based pricing live April 2026              │
│   MPP (Stripe + Tempo mainnet March 18, 2026)                 │
│     - Visa anchor validator + Zodia custody                   │
│     - Production: Browserbase, PostalForm, Prospect Butcher   │
│   AP2 (Google, April 3 launch; 60+ partners)                  │
│     - A2A-x402 extension w/ Coinbase, Ethereum Fdn, MetaMask  │
│   ACP (shopping), UCP (universal commerce) — OpenAI/Google    │
│   MCP (Anthropic, donated to Agentic AI Foundation)           │
│   A2A (agent-to-agent) — companion to MCP                     │
│   Trusted Agent Protocol (Visa, 10+ partners)                 │
│   World AgentKit (human identity behind agents, x402-based)   │
├────────────────────────────────────────────────────────────────┤
│ LAYER 2: Wallets / Card Rails                                  │
│   Coinbase Agentic Wallets (TEE-secured, non-custodial)       │
│   Tempo L1 (Stripe/Paradigm mainnet)                          │
│   Visa Intelligent Commerce (100+ partners, 30+ in sandbox)   │
│   Mastercard Agentic Tokens + Agent Pay + BVNK ($1.8B acq.)   │
│   Privy, Turnkey, lobster.cash (agent wallet infra)           │
├────────────────────────────────────────────────────────────────┤
│ LAYER 1: Chains / Settlement                                   │
│   Solana (400ms finality, $0.00025/tx, $11B stablecoin TVL)   │
│   Base, Ethereum, Tempo L1, ApeChain, Avalanche               │
└────────────────────────────────────────────────────────────────┘
```

## Tier 1 — giants already shipped

| Company | Product | Shipped | Named customers / partners | Weakness |
|---|---|---|---|---|
| Microsoft | Agent 365 | GA May 1, 2026, $15/user/mo; bundled into M365 E7 ($99) | Bundled via M365 enterprise base | Won't touch crypto rails; fiat-only; locks to MS Entra / ecosystem |
| ServiceNow | AI Agent Studio + AI Control Tower | GA | Existing ServiceNow install base | Stuck to ITSM workflows; not financial-first |
| Salesforce | Agentforce + Data Cloud | ~$1.8B ARR combined | 22K Q4 deals; "buy don't build" mentality | CRM-centric, not treasury-layer |
| Workday | Agent System of Record | 1.7B AI actions FY26 | HR/finance installed base | Locked to Workday ERP workflows |
| Coinbase | Agentic Wallets + x402 | Live, 100M+ txs | x402 Foundation w/ Cloudflare | Rail, not governance layer. TEE-bound. |
| Stripe/Tempo | MPP + Tempo mainnet | March 18, 2026 | Browserbase, PostalForm, Prospect Butcher, Visa/Zodia validators | Protocol + chain, not policy-layer product |
| Visa | Intelligent Commerce + Trusted Agent Protocol | Pilot phase | Aldar, AWS, Diddo, Highnote, Mesh, Payabli, Sumvin; agent-enablers Skyfire/Nekuda/PayOS/Ramp | Card-first; limited crypto |
| Mastercard | Agent Pay + Agentic Tokens + BVNK | Q2 2026 Agent Suite | Microsoft (partner); Singapore/Malaysia live | Closed network; slow enterprise rollout |
| Google | AP2 + A2A-x402 ext | April 3, 2026 | 60+: Adyen, PayPal, Amex, Revolut, UnionPay, JCB, Etsy, Intuit, Mysten, Forter, Salesforce, ServiceNow, Worldpay | Protocol, not SaaS |
| World (Altman) | AgentKit + World ID | March 17, 2026 beta | Iris-backed agent passports | Identity-only, not financial |

## Tier 2 — funded startups

| Startup | Funding | Position | Named customers | Weakness |
|---|---|---|---|---|
| Crossmint | $23.6M (Franklin Templeton, Ribbit, Nyca, Lightspeed) | Agent wallet infra + virtual cards | 40K enterprises, Adidas, Red Bull | Infra, not governance SaaS. Enterprise-priced; hard for SMB. |
| Skyfire | $9.5M (a16z CSX, Coinbase Ventures, DCVC, Brevan Howard) | KYAPay ID + agent checkout | Visa VIC pilot; F5 partnership; Emergence AI | Payment-only; governance not the focus |
| Natural | $9.8M (Abstract, Human Capital, Forerunner, founders of Ramp/Mercury/Vercel) | Agentic payments infra | Freight/logistics, healthcare back-office, procurement, marketing | Very early; US-centric |
| Halliday | $26M total (a16z crypto, Avalanche Blizzard) | Workflow Protocol — AI-driven smart-contract replacement | DeFi Kingdoms, Core Wallet (Ava Labs), ApeChain | Crypto-native only; not enterprise-facing |
| Payman AI | $14M | Agentic AI that executes real banking txns | N/A disclosed | Fiat-only; banking-rail friction |
| Emergence AI | $97.2M (Learn Capital) | Agentic workflow platform | e& MENA | Not payments-first |
| MeshAI | N/A disclosed | Agent control plane (governance+observability) | N/A | No financial governance; no rail integration |
| Galileo | N/A (Agent Control is OSS) | Open-source guardrails | N/A | Tooling, not a SaaS product |

## The gap Intaglio fills

Three orthogonal layers exist today, none of them are bundled:

1. **Enterprise governance** (Microsoft Agent 365, ServiceNow, MeshAI) → identity + permissions, no money.
2. **Financial policy on human spend** (Ramp) → fiat-only, human-actor-assumption baked in.
3. **Agent payment rails** (x402, MPP, AP2, Coinbase, Stripe, Visa, Mastercard) → movement, no enterprise control layer.

The Intaglio wedge: **treasury governance for crypto-native agent operators** — policy-enforced multi-rail spending (x402 + MPP + AP2 abstracted), agent-level budgets, EU AI Act Article 12 audit trails + MiCA-compliant custodian relationships in one SaaS. Microsoft won't touch crypto; Ramp won't touch non-fiat rails; Coinbase/Stripe are protocols, not SaaS.

## Competitor weaknesses — tactical attack surface

- **Microsoft Agent 365** → fiat-only, lock-in to Entra, no x402/MPP/AP2 support, $15/user/mo requires M365 base → **can't serve crypto-native teams or Solana ecosystem**.
- **Ramp** → expense-management DNA, card-rail assumption, US banking focus, no EU AI Act / MiCA positioning, no crypto → **won't serve EU agent operators needing MiCA+AI-Act bundle**.
- **ServiceNow** → ITSM/ERP workflows, no payment-rail integration, slow cycle → **not financial-primitive**.
- **Crossmint** → infra layer, sells APIs not governance SaaS; enterprise-only pricing excludes startups → **weak policy/compliance UX**.
- **Skyfire** → identity/payment; governance is tacked-on, not the product → **no treasury or policy primitive**.
- **Halliday** → DeFi-native (DeFi Kingdoms, ApeChain) → not enterprise-buyer positioned; compliance is an afterthought.
- **x402/MPP/AP2** → protocols, not products. Enterprises need someone to own the buyer relationship → **open surface for SaaS above them**.
- **Coinbase Agentic Wallets** → TEE-bound individual wallets; multi-agent policy across fleets isn't the design → **weak at org-level governance**.
