# CONTEXT.md — the North Star

*Read this file FIRST every session. Both of us. No exceptions.*
*If a decision, feature, or pitch doesn't match this file — stop and flag it.*

---

## What Axon actually is

**One sentence. Memorize it.**

> Axon is the EU compliance and treasury governance product for companies running stablecoin-paying AI agents.

That's it. Not "financial OS." Not "control plane for the autonomous AI workforce." Not "Ramp for agents."

If the sentence gets wider, Microsoft Agent 365 or Ramp eats us. Narrow wins.

## What we are actually selling (the MVP)

**An auditor-signable PDF.**

That's the product. Everything else in the repo is scaffolding around that PDF.

A company in the EU is running AI agents that move stablecoins. Their compliance officer is scared of a €35M AI Act fine. They push a button in Axon. Out comes a hash-chained, regulator-ready PDF covering Article 12 + MiCA + DORA for the reporting period. That PDF is what they pay us for.

**If a feature doesn't make that PDF better, cheaper, or more trustworthy, it doesn't ship in v0.1.**

## Who buys this

The **~300–2,000 EU companies in 2026** running AI agents that spend stablecoins. The buyer in the room is the **compliance officer** or **CFO**, not the engineer. The engineer integrates; the compliance officer signs the PO.

Early targets: Browserbase-style session agents, crypto-native SaaS with agent workflows, EU fintechs experimenting with agent payments, stablecoin-paying DAOs.

## The one acquirer we design for

**Ramp.** Not Coinbase. Not Stripe. Not Microsoft.

Why: Ramp has the customers, the capital ($500M raise), the motivation (crypto-native EU gap they cannot credibly fill), and the aggressive pace. They will either acquire us in 24–36 months or build this themselves.

Every public artifact (README, landing page, blog post, design-partner logo) should be legible to a Ramp corp-dev analyst scanning for acquisition candidates in 18 months. Not flashy — legible.

## Fixed deadlines (do not move)

| Date | What |
|---|---|
| **2026-05-12** | Solana x402 Demo Day — fixed external anchor |
| **2026-06-16** | Kill-criterion review: ≥2 paid design partners or Axon pauses until Sep |
| **2026-07-01** | MiCA CASP compliance deadline (market forcing function) |
| **2026-08** | EU AI Act Article 12 compliance deadline for agents (market forcing function) |
| **2026-09** | Tetr College starts — Sari's fallback. Non-negotiable optionality. |

## The moat (why Microsoft can't copy us)

Three layers, all open:

1. **APL — the Axon Policy Language** (CC-BY-4.0)
2. **axon-engine** — reference implementation (MIT)
3. **axon-audit** — the PDF exporter (MIT, shipping v0.2)

Microsoft's business model forbids them from adopting an open standard as their agent governance layer. Ramp has no infrastructure team that writes DSLs. We can out-compete their bundle by being **the standard**, not a product.

**Commitment — never violate:**
- Never ship a closed APL extension.
- Never charge for conformance.
- Donate the spec to a neutral standards body at v1.0 (target 2027).

## What is built right now (as of 2026-04-19)

- ✅ APL v0.1 SPEC + 4 compliance fixtures (parse + evaluate + audit)
- ✅ axon-engine (TypeScript, 49 tests pass, CI on Node 20+22)
- ✅ Supabase schema + RLS (append-only audit, hash-chain trigger)
- ✅ x402 enforcement proxy (Hono + Bun, typechecks clean)
- ✅ **Auditor-signable PDF exporter** (axon-audit — PDFKit, 6 sections, signature block)
- ✅ Dashboard (Next.js — auth, onboarding, agents, policies, approvals, audit + PDF download)
- ✅ Landing page (Next.js — responsive, all 7 spec sections)
- ✅ Dashboard ↔ axon-audit wired via `/api/audit/pdf` endpoint
- ✅ Auth callback route + onboarding flow
- ✅ Public GitHub repo: github.com/PabloPotato/Axon
- ✅ Root README + LICENSE (MIT + CC-BY-4.0 split)

## What is NOT built (stay disciplined)

- ❌ **Supabase project provisioned** ← this is THE next priority (schema exists, not deployed)
- ❌ End-to-end smoke test (dashboard → Supabase → proxy → audit PDF)
- ❌ Solana on-chain audit anchoring (stubbed in SPEC)
- ❌ Real approval adapters (Slack/email/PagerDuty)
- ❌ Multi-currency oracle
- ❌ Any paying customer

## What to NEVER build in v0.1

Per the 60-day plan, these waste runway:

- Fraud detection ML
- Identity/KYC (use World AgentKit / Skyfire later)
- Custom custody (use Privy/Turnkey/Fireblocks)
- Mobile app, marketplace, insurance, benchmark modules
- Non-stablecoin currency support
- Agent-to-agent negotiation primitives
- Anything requested without being tied to the auditor PDF or a named EU design partner

## The priority order (do not reorder)

1. ~~**Ship the PDF exporter.**~~ ✅ Done (axon-audit + /api/audit/pdf).
2. **Deploy Supabase.** The schema is written; it does nothing until provisioned.
3. **Wire dashboard → Supabase → proxy end-to-end** so one real action produces one real audit record.
4. **Land the first EU design partner conversation.** One named compliance officer using this weekly beats five hackathon demos.
5. **Everything else.**

## The operator (Sari)

22, Berlin, ex-Meta ads, ships software, short runway (€80 liquid + Meta freelance client), ADHD/PTSD (active therapy), accepted Tetr College Sep 2026. Talks to Claude as a peer, not as an assistant.

**Do not treat Sari as fragile. Do not validate. Do not pep-talk.**

The highest-value thing Claude can produce for Sari is friction that reveals what's wrong, not support for what's visibly right.

## Communication protocol (locked)

- **ALWAYS:** peer-level, brutal honesty, confidence labels on strategic claims (HIGH/MED/LOW), minimum tokens unless depth is required, step-by-step reasoning.
- **NEVER:** flattery openers, context restating, unprompted lectures, disclaimers, hallucinated facts about Sari's life or clients.
- **Format:** simple Q → 2–5 sentences; code tasks → code first, explain after; strategy → DIAGNOSIS → LOGIC → RECOMMENDATION → ACTION.
- **Oracle mode:** answer the question that *should* have been asked. Every response contains one non-obvious insight or it didn't earn its tokens.

## The anti-drift rules (caveman mode)

Before building anything, Claude and Sari both answer these out loud:

1. **Does this ship the PDF?** If no — why are we touching it right now?
2. **Does this narrow us or widen us?** Narrow is good. Widen is banned until v1.0.
3. **Is this something Microsoft can copy in 6 months?** If yes — it's not a moat.
4. **Can a Ramp corp-dev analyst understand why this matters?** If no — rewrite.
5. **Is Jun 16 closer than it was yesterday?** If no — stop reading specs and ship.

If a request fails any of these five, don't do it. Flag it in the chat with "anti-drift:" as the prefix.

## Single source of truth

This file. Not the thesis, not the strategic synthesis, not memory. Those are context. **This is the rule set.**

When they disagree with this file, this file wins. When this file drifts from what we're actually doing, we rewrite this file — we don't silently ignore it.

Last updated: 2026-04-19.
