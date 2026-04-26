# Axon Roadmap

## Now — v0.1 (shipped April 2026)
- APL v0.1 spec as open standard (MIT + CC-BY-4.0)
- Axon Engine — parser, evaluator, hash-chain auditor (TypeScript, MIT)
- Axon Audit — PDFKit PDF exporter with 12 passing tests
- x402 Proxy — Hono + Bun enforcement proxy with Solana devnet sink
- Operator dashboard — Next.js 15, Supabase SSR, Apple-blue design
- Landing page with live policy editor and hash chain visualization
- 10 compliance policy templates in `apl/templates/`
- Supabase at `wrbaygxtqrtvpzxnrkni.supabase.co` seeded with 20 audit records

## Q3 2026
- APL-FS dialect: institutional primitives (fund_mandate, kyc_status, sanctions_screen, redemption_gate, nav_calculation_window, liquidity_floor)
- Attestation chain: replace hash-chain with qualified-signature attestations compatible with eIDAS
- SWIFT MT and ISO 20022 read-only ingest for treasury reconciliation
- Solana mainnet anchoring for audit hash chains
- Multi-rail support: Stripe MPP, Google AP2 via proxy plugins
- First three institutional design partner pilots (targeting 25–50K EUR each)

## Q4 2026
- eIDAS qualified electronic signature acceptance in audit export
- SOC 2 Type II audit engagement start
- Team RBAC with approval workflows (Slack, PagerDuty adapters)
- Managed compliance subscription alpha: auto-updating templates when MiCA or DORA changes
- Design partner cohort: Sygnum, Amina, Bitpanda Asset Management
- Public Vercel + Railway deployment with documented SOC 2 controls

## H1 2027
- APL v1.0 donated to a neutral standards foundation
- BUIDL-class institutional pilot (tokenized fund end-to-end with policy attestation)
- Mainnet anchoring on Solana at configurable cadence (every 1000 records or 60s)
- 5+ institutional customers on the managed compliance subscription
- Third-party security audit completed

## H2 2027 — and beyond
- Managed compliance subscription: auto-updating regulatory templates across MiCA, DORA, EU AI Act, NIST AI RMF, ISO 42001, FINMA circulars
- EU regulatory referenceability: regulator accepts Axon audit exports as evidence
- 20+ institutional customers across tokenized funds, payment agents, and treasury operations
- Standards body governance with multiple implementing vendors
