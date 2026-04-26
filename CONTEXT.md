# CONTEXT.md — the North Star

*Read this file FIRST every session. Both of us. No exceptions.*
*If a decision, feature, or pitch doesn't match this file — stop and flag it.*

---

## What Axon actually is

**One sentence. Memorize it.**

> Axon is the policy layer for the autonomous economy. We give companies running AI agents the standard, the templates, and the auto-updating compliance service that lets them deploy agents faster than competitors and stay regulator-ready without thinking about it.

Not "EU compliance product." Not "Ramp for agents." Not "auditor PDF generator."

Compliance is a tax buyers pay reluctantly. Productivity is what they pay enthusiastically for. Every billion-dollar B2B infrastructure company sold productivity and bundled compliance, never the reverse. Stripe sold payments not PCI. Datadog sold observability not SOC2. ServiceNow sold workflow not compliance.

We follow the right template now.

## What we are actually selling (three layers)

**Layer 1 — APL, the Axon Policy Language** (free, MIT + CC-BY-4.0)
The open standard. Declarative DSL for agent policy. Frozen at v1.0 and donated to a neutral standards body. This is the funnel top — drives adoption, integrations, and ecosystem.

**Layer 2 — Curated policy template library** (freemium)
50+ templates derived from EU regulatory text, fraud cases, and Fortune 500 treasury controls. Free for individual developers. Paid at $2K/month for unlimited templates. $20K/month for enterprise with custom templates and SLA on regulatory updates.

**Layer 3 — Auto-updating compliance subscription** (premium)
When MiCA gets amended, every customer's templates absorb the change within 48 hours. When DORA adds a clause, every customer is updated automatically. This is the Bloomberg Terminal play — $50K–$500K/year contracts. The auditor PDF is a feature of this layer, not the product itself.

**If a feature doesn't make agents deploy faster or stay regulator-ready without thinking, it doesn't ship in v0.1.**

## Who buys this

CFOs at companies running 5–50 production AI agents. The buyer wants permission to scale agents without legal anxiety. Compliance is the side effect they tell their board about. Autonomy is the reason they actually pay.

Early targets: EU fintechs experimenting with agent payments, crypto-native SaaS with agent workflows, Browserbase-style session agent companies, stablecoin-paying DAOs, large e-commerce with procurement bots.

## The acquirers we design for (new, in order of likelihood)

1. **Stripe** — needs EU compliance specificity for Agent MPP and needs agent governance. They have the distribution, we have the standard.
2. **Bloomberg or LSEG** — we look like a Bloomberg Terminal for agent governance. Regulatory data subscription is their exact business model.
3. **Microsoft or Visa** — defensive acquirers if we get large enough to threaten their bundles.

Ramp is no longer primary. Ramp's business model lets them fork APL. Our new acquirers cannot replicate regulatory expertise and curated templates as easily.

## Fixed deadlines (do not move)

| Date | What |
|---|---|
| **2026-05-12** | Solana x402 Demo Day — fixed external anchor |
| **2026-06-16** | Kill-criterion review: ≥2 paid design partners or Axon pauses until Sep |
| **2026-07-01** | MiCA CASP compliance deadline (market forcing function) |
| **2026-08** | EU AI Act Article 12 compliance deadline for agents (market forcing function) |
| **2026-09** | Tetr College starts — [OPERATOR_NAME]'s fallback. Non-negotiable optionality. |

## The moat (three stacked moats)

1. **The standards moat.** MIT + CC-BY-4.0 with a foundation donation at v1.0. Microsoft cannot adopt because their bundle business model forbids them. They can build a competitor, but they cannot own the standard.

2. **The templates moat.** 50+ expertly curated policy templates that compound through usage data. Ramp cannot replicate years of policy refinements quickly even if they fork the engine. Templates are the network effect.

3. **The regulatory expertise moat.** Embedded EU compliance knowledge updated continuously. This takes lawyers and policy specialists — years to build, impossible to replicate overnight.

## What is built right now (as of 2026-04-26)

- ✅ APL v0.1 SPEC + 4 compliance fixtures (parse + evaluate + audit)
- ✅ axon-engine (TypeScript, 49 tests pass)
- ✅ axon-audit — PDF exporter, 12 tests, wired into `/api/audit/pdf`
- ✅ Supabase schema + RLS **deployed** to project `[SUPABASE_PROJECT_ID]`
- ✅ x402 enforcement proxy (Hono + Bun, auth hardened, Solana devnet sink)
- ✅ Dashboard (Next.js 15 — auth, onboarding, agents, policy editor, approvals, audit)
- ✅ Dashboard design: Apple-light, dark sidebar, JetBrains Mono, hash chain ledger
- ✅ Landing page (Next.js — responsive, hash chain visualization, live policy editor)
- ✅ Proxy e2e tests (2 pass), axon-audit tests (12 pass)
- ✅ docs/ — API ref, SDK wrapper, PDF audit runbook
- ✅ CLAUDE.md + AGENTS.md + memory/HANDOFF.md
- ✅ 4 gstack OpenClaw skills installed (.claude/skills/, .agents/skills/)
- ✅ Public GitHub: github.com/PabloPotato/Axon
- ✅ Codebase audit complete — PII scrubbed, dependency audit, SECURITY.md
- ✅ Supabase seeded with 20 audit records (valid hash chain)
- ✅ Solana sink `@ts-nocheck` removed (tsconfig paths)
- ✅ Hash chain visualization on landing page
- ✅ Live policy editor on landing page

## What is NOT built (stay disciplined)

- ❌ Deployed to Railway + Vercel ← current priority
- ❌ [OPERATOR_NAME] logged into live dashboard (needs fresh magic link)
- ❌ Layer 2 paid templates UI (post-hackathon)
- ❌ Layer 3 auto-update subscription (post-hackathon)
- ❌ First 10 policy templates as APL files in `apl/templates/`
- ❌ Solana devnet anchoring live (stub exists, fix applied)
- ❌ Real approval adapters (Slack/email/PagerDuty)
- ❌ Any paying customer

## What we NEVER build in v0.1

- Fraud detection ML
- Agent identity/KYC — Skyfire's lane, we integrate
- Custom custody — Privy/Turnkey/Fireblocks
- The payment rail itself — Coinbase x402, Stripe MPP — we govern what runs on top
- Mobile app, marketplace, insurance, benchmark modules
- Agent-to-agent negotiation primitives
- Anything requested without being tied to faster agent deployment or regulatory readiness

## The priority order (do not reorder)

1. ~~**Seed Supabase + audit records.**~~ ✅ Done.
2. ~~**Fix Solana sink @ts-nocheck.**~~ ✅ Done.
3. **Deploy to Railway + Vercel.** Public URL for Demo Day.
4. **Hash chain visualization on landing page.** ✅ Done.
5. **Live policy editor on landing page.** ✅ Done.
6. **Empty states + sidebar polish.**
7. **Record demo video.**
8. **Publish first 10 policy templates** — `apl/templates/` — proves layer 2 thesis tangibly.

## The funnel

```
Free spec         → adoption
Free engine       → prototyping
Paid templates    → teams monetized
Paid auto-update  → enterprises monetized
Foundation v1.0   → standard becomes infrastructure
```

## The operator ([OPERATOR_NAME])

22, Berlin, ex-Meta ads, ships software, short runway (€80 liquid + Meta freelance client), ADHD/PTSD (active therapy), accepted Tetr College Sep 2026. Talks to agents as peers.

**Do not treat [OPERATOR_NAME] as fragile. Do not validate. Do not pep-talk.**

The highest-value thing we can produce is friction that reveals what's wrong, not support for what's visibly right.

## Communication protocol (locked)

- **ALWAYS:** peer-level, brutal honesty, confidence labels on strategic claims (HIGH/MED/LOW), minimum tokens unless depth is required, step-by-step reasoning.
- **NEVER:** flattery openers, context restating, unprompted lectures, disclaimers, hallucinated facts about [OPERATOR_NAME]'s life or clients.
- **Format:** simple Q → 2–5 sentences; code tasks → code first, explain after; strategy → DIAGNOSIS → LOGIC → RECOMMENDATION → ACTION.

## The anti-drift rules (caveman mode)

Before building anything, answer these out loud:

1. **Does this let agents deploy faster or stay regulator-ready without thinking?** If no — why are we touching it right now?
2. **Does this narrow us or widen us?** Narrow is good. Widen is banned until v1.0.
3. **Is this something Microsoft can copy in 6 months?** If yes — it's not a moat.
4. **Can a Stripe or Bloomberg corp-dev analyst understand why this matters?** If no — rewrite.
5. **Is Jun 16 closer than it was yesterday?** If no — stop reading specs and ship.

If a request fails any of these five, don't do it. Flag it with "anti-drift:" as the prefix.

## Single source of truth

This file. Not the thesis, not the strategic synthesis, not memory. Those are context. **This is the rule set.**

When they disagree with this file, this file wins. When this file drifts from what we're actually doing, we rewrite this file — we don't silently ignore it.

Last updated: 2026-04-26.
