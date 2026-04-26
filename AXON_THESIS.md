# AXON

*The treasury control plane for the autonomous AI workforce.*

---

## The bet

By 2030, every company with more than ten employees will operate hundreds to thousands of AI agents that spend money autonomously — buying compute, data, APIs, shipping, and software from other agents. Gartner sizes the agentic AI opportunity at $400B; the agentic-AI governance segment alone is $7.28B today and $38.94B by 2030 (Mordor Intelligence, April 2026).

No enterprise will operate a fleet of autonomous financial actors without a control layer — the same way no company today operates without payroll, expense management, or HR software. That control layer is the prize.

## Where the stack is going

Three things are now built or being built by other teams:

1. **Payment rails for agents** — Coinbase x402 (100M+ transactions, $600M annualized), Stripe/Tempo MPP (mainnet March 2026), Google AP2 (60+ partners), Visa Trusted Agent Protocol, Mastercard Agent Pay + Agentic Tokens.
2. **Agent wallets** — Coinbase Agentic Wallets, Crossmint (40K enterprises incl. Adidas, Red Bull), Skyfire, Privy, Turnkey.
3. **Agent identity/observability** — Microsoft Agent 365 (May 1 GA), ServiceNow AI Control Tower, MeshAI, Galileo Agent Control.

One thing is not:

> **The financial governance layer that sits above all of it — multi-rail treasury control, per-agent policy enforcement, regulatory audit, and fiat↔stablecoin reconciliation — as an enterprise SaaS.**

That's Axon.

## Why this is the unfilled seat

Microsoft Agent 365 owns identity and observability for agents inside M365 enterprises, but structurally won't touch crypto rails. Ramp ($1B ARR, $32B valuation) owns financial policy on human spend in fiat, but its compliance DNA cannot credibly serve EU MiCA-regulated crypto agent operations. The rail protocols (x402, MPP, AP2) are primitives, not SaaS — enterprises still need a vendor that owns the buyer relationship above them.

The gap is a narrow beachhead: **crypto-native and hybrid-rail agent operators who need policy-enforced multi-rail spending, EU AI Act Article 12 audit trails, and MiCA-ready custodian integration in one product.** From that beachhead, Axon expands into the broader treasury layer as the fiat and crypto sides converge.

## Why regulation is the moat

- **EU AI Act Article 12** (in force, Aug 2026 compliance deadline for agents): mandatory event logging across the lifecycle, with structured audit output required for high-risk AI (including financial decision-making agents under Articles 14, 15, and Annex III).
- **MiCA** (full CASP compliance deadline July 1, 2026): wallet providers and agent-operating companies must meet asset segregation, KYC, and operational standards.
- **NIST AI RMF + CAISI** (US): agent standards initiative under way; COSAiS extends SP 800-53 security controls to AI agents.

Compliance isn't a feature — it's the wedge. One-button export of a time-bounded, hash-chained audit package that satisfies Article 12 and MiCA in a single document is the product enterprises will pay for.

## The 60-day wedge

**Axon v0 — "Agent Treasury"**

- Per-agent scoped wallets (Solana + USDC native, chain-agnostic architecture).
- Declarative policy DSL: spend caps per agent, per-endpoint, per-protocol.
- In-line proxy that enforces policy on every x402 / MPP / AP2 call — approve, deny, or route to human.
- Immutable audit log with one-button EU AI Act + MiCA export.
- SDKs and MCP server so agents can self-report and request budget.

Solana-first, because the Solana Foundation / Superteam Germany is the distribution lever. Chain-agnostic architecture, because chain-bets get commoditized.

## The 10-year arc

- **Year 1 (2026):** Axon Treasury — wedge.
- **Year 2–3:** Axon Policy (multi-agent RBAC), Axon Observe (anomaly detection), Axon Compliance (regulatory automation).
- **Year 4–6:** Axon Budget, Axon Identity, Axon Audit, Axon Benchmark, Axon Insurance.
- **Year 7–10:** the default control plane for enterprise agent finance, or acquired into Coinbase / Stripe / Ramp / Visa / Mastercard at $1–2B range (BVNK $1.8B and Bridge $1.1B are the comps).

## Why now

- Rails just became real (x402, MPP, AP2 all shipped in Q1 2026).
- Regulation just became binding (EU AI Act Article 12, MiCA deadline July 1 2026).
- Enterprise deployment just became material (Salesforce Agentforce $1.8B ARR; Workday 1.7B AI actions; Sierra serving Fortune 100s; Devin at Goldman, Citi, Dell, Cisco, Ramp, Palantir).
- No incumbent has bundled all three.

## Who is building this

[OPERATOR_NAME]. Ex-Meta / Concentrix advertiser of record, $5-6M annual spend under management, ROAS 1.5 → 8 case study. Built and shut down one company (S.N.A Digital). Ships software. Berlin-based. Backed-intro to Solana Superteam Germany operator. 22 years old. Runway: short. Conviction: high.

---

*For the pitch — `AXON_SUPERTEAM_PITCH.md`. For the build — `AXON_60_DAY_BUILD_PLAN.md`. For the numbers — `AXON_STRATEGIC_SYNTHESIS.md`. For the hidden insight — `AXON_ORACLE_NOTE.md`.*
