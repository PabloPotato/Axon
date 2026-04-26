# AXON — 60-Day Build Plan (Apr 17 → Jun 16, 2026)

## Guiding constraints
- Solo operator ([OPERATOR_NAME]). Co-founder TBD via Superteam intro — assumed not yet onboard for this plan.
- €80 liquid + Meta-ads client income. Claude Code subscription is the primary labor multiplier.
- Solana x402 Hackathon runs April 6 → May 11; Buildstation Berlin Apr 27 → May 11; Demo Day **May 12**. This is the fixed external deadline.
- All infra on managed services (Supabase, Vercel, Privy/Turnkey) — no self-hosted anything.

## Milestones

| Day | Milestone |
|---|---|
| 7 | Domain, landing page, thesis public, x402 hackathon registered, 15 discovery calls scheduled |
| 14 | v0.1 Solana wallet fleet + policy DSL (read-only) deployed to Vercel + Supabase |
| 21 | x402 in-line proxy working on Solana; policy enforcement live |
| 35 | v0.5 MPP integration, Article-12 audit export, first design partner using it |
| 42 | AP2 integration, MCP server published, two more design partners |
| 50 | Buildstation Berlin shipped code; hackathon submission filed |
| 52 | **Demo Day — May 12** |
| 60 | Three paid pilots (€1–3K MRR each), Superteam operator follow-up, first pre-seed conversations logged |

## Weekly breakdown

### Week 1 (Apr 17 – Apr 23) — Foundation, discovery, narrative
- Domain + minimal landing page (Vercel + Tailwind + shadcn). 1 day.
- Publish `INTAGLIO_THESIS.md` as a public post; short video intro optional.
- Register for x402 hackathon + Buildstation Berlin.
- Draft + schedule 15 discovery calls (see plan). Target 10 held by end of week 2.
- Set up: Supabase (DB + auth), Vercel (host), Privy or Turnkey (wallet infra), GitHub, Linear (task tracking), PostHog (analytics), Resend (email).
- Deliverable: empty but real product skeleton deployed.

### Week 2 (Apr 24 – Apr 30) — Wallet fleet v0.1
- Solana wallet provisioning: corporate treasury (Phantom or Squads multisig) → delegated per-agent sub-wallets via Privy.
- USDC-SPL funding flow.
- Simple dashboard: list of agents, balance, last txn.
- Read-only policy DSL schema: `{agent_id, limit_per_day, allowed_endpoints[], deny_by_default}`.
- First discovery calls held. Log learnings. Adjust policy DSL if 3+ customers name the same missing field.
- **Start Buildstation Berlin (Apr 27)** — physically co-locate with Superteam if possible.

### Week 3 (May 1 – May 7) — x402 in-line proxy + enforcement
- Fastify/Hono service that sits between agent and x402 endpoint. Intercepts, checks policy, signs or denies.
- Structured event log → Supabase + S3 archive (hash-chained).
- Basic dashboard: approval queue, denied txns, spend burn.
- Public README + one demo video (Loom, 90 sec).
- Continue discovery calls. Aim: one design partner verbally committed.

### Week 4 (May 8 – May 14) — Hackathon sprint + Demo Day
- MPP integration (via Stripe Tempo SDK).
- Article-12 audit exporter: signed JSON + PDF with structured events, policy reference, hash chain.
- Buildstation Berlin: demo to Superteam operators in person.
- **Demo Day — May 12.** File submission, present.
- Post-hackathon: publish findings, links, demo video.

### Week 5 (May 15 – May 21) — AP2 + MCP + design partner #1
- AP2 integration (Google AP2 SDK).
- MCP server: expose `request_budget`, `report_spend`, `check_policy` as MCP tools so agents can self-interact.
- First paid design partner (€1–3K/mo). Use their workflow to stress-test.
- Write first blog post on "What EU AI Act Article 12 actually demands of your agents" — positioning, not just content.

### Week 6 (May 22 – May 28) — Ramp toward second design partner
- Fix whatever breaks under real load.
- Second design partner onboarded.
- First Superteam Germany operator follow-up meeting.
- Start mapping Coinbase Ventures + a16z CSX warm-intro paths.

### Week 7 (May 29 – Jun 4) — Compliance polish + third partner
- MiCA compliance surface: add custodian-integration adapter (Privy / Turnkey / Fireblocks).
- Third paid design partner.
- Pricing page: publish — $99/mo starter, $999/mo team, custom enterprise.

### Week 8 (Jun 5 – Jun 11) — Narrative + fundraise prep
- Case study from design partner #1.
- Deck v1 for pre-seed conversations (12 slides).
- Schedule 5 pre-seed conversations via warm-intro network.

### Week 9 / Day 60 (Jun 12 – Jun 16) — Decision point
- Review: €? MRR, how many active agents governed, how many compliance exports run.
- If ≥3 paid pilots and Superteam intros producing conversations: continue Intaglio full-time.
- If <2 paid pilots and no inbound interest: honest reassessment — likely a positioning problem, not a product problem; retune before doubling down.

## What NOT to build in 60 days
- Fraud detection ML, identity/KYC (use World AgentKit / Skyfire later), custom custody (use Privy/Turnkey/Fireblocks), mobile app, marketplace, insurance module, benchmark module, agent-to-agent negotiation primitives, non-USDC currency support.

## Daily rhythm
- 2 hours morning: deep work on core product (hyperfocus-compatible slot).
- 1 hour midday: discovery calls / outreach.
- 1 hour evening: content / design partner support.
- Weekly Friday review: metrics + rewrite next week's plan based on what's true.

## Risk gates
- **Week 3 no working proxy?** → drop AP2 support from scope, keep x402+MPP only.
- **Week 5 no verbal design partner?** → the wedge is wrong. Re-interview 5 customers before building more.
- **Week 7 no paid pilot?** → lower price (€299/mo), sign 2 SMBs, defer fundraise.
- **Sustained burnout?** → explicitly pause. The deadline is Sep 2026 Tetr, not June.
