# AGENTS.md — Every agent reads this on startup. No exceptions.

## Who you are working for

**[OPERATOR_NAME]**, 22, Berlin. Ex-Meta ads. Building Intaglio on €80 liquid runway.
ADHD/PTSD (active therapy). Shipping on a 60-day kill-criterion window.
Talks to agents as peers. Expects brutal honesty. No flattery. No pep talk.

## What Intaglio is (one sentence — do not paraphrase)

> Intaglio is the policy layer for the autonomous economy. We give companies running AI agents the standard, the templates, and the auto-updating compliance service that lets them deploy agents faster than competitors and stay regulator-ready without thinking about it.

## The v2 thesis (three layers)

### Layer 1 — APL (free)
The Intaglio Policy Language. MIT + CC-BY-4.0. Donated to a neutral standards body at v1.0. The funnel top — drives adoption and ecosystem integration.

### Layer 2 — Templates (freemium)
50+ curated policy templates from EU regulatory text, fraud cases, and Fortune 500 treasury controls. Free for individuals. $2K/month teams. $20K/month enterprise.

### Layer 3 — Auto-update subscription (premium)
When MiCA or DORA changes, every customer absorbs the update within 48 hours. $50K–$500K/year. The Bloomberg Terminal for agent governance. The auditor PDF is a feature of this layer.

### Three moats stacked
1. **Standards moat** — open standard, Microsoft cannot adopt
2. **Templates moat** — network effect, compounds through usage
3. **Regulatory expertise moat** — needs lawyers and policy specialists, years to build

### Acquirers (in order)
Stripe → Bloomberg/LSEG → Microsoft/Visa. No longer Ramp-primary.

---

## What you are building toward

An **open policy standard** that every agent obeys, backed by **curated regulatory templates** that keep companies audit-ready without hiring lawyers, and an **auto-updating compliance subscription** that makes the whole thing a service. The Demo Day proof is: APL spec + engine + audit exporter + 10 policy templates + live dashboard with hash chain visualization.

The acquirer we design for: **Stripe** (needs EU agent governance for MPP). The distribution lever: **Solana Superteam Germany**. The kill criterion: **≥2 paid EU design partners by June 16, 2026**.

---

## Fixed deadlines

| Date | Event |
|---|---|
| **2026-05-12** | Solana x402 Demo Day — must have live demo |
| **2026-06-16** | Kill criterion: 2 paid design partners or Intaglio pauses |
| **2026-07-01** | MiCA CASP compliance deadline (market forcing function) |
| **2026-08** | EU AI Act Article 12 deadline |
| **2026-09** | [OPERATOR_NAME] starts Tetr College — non-negotiable optionality |

---

## Current product state (as of 2026-04-26)

### ✅ Done and working
- APL v0.1 spec (`apl/SPEC.md`) + 4 compliance fixtures
- `intaglio-engine` — parser, evaluator, hash-chain auditor (TypeScript, MIT)
- `intaglio-audit` — PDFKit PDF exporter, 12 tests passing
- `services/x402-proxy` — Hono + Bun enforcement proxy, auth hardened, Solana devnet sink fixed
- `dashboard` — Next.js 15, Supabase SSR, design implemented (Apple blue, dark sidebar)
- `landing` — marketing page with hash chain visualization + live policy editor
- `infra/supabase/schema.sql` + `policies.sql` — **deployed** to live project `[SUPABASE_PROJECT_ID]`
- Supabase seeded with 20 audit records (valid hash chain)
- Codebase audit complete, PII scrubbed, SECURITY.md created
- GitHub configured, hourly auto-commit cron
- Solana sink `@ts-nocheck` removed via tsconfig paths

### ⏳ Blocking the demo (do these first)
1. **Deploy publicly** — proxy to Railway, dashboard + landing to Vercel
2. **Empty states + sidebar polish** on dashboard
3. **Publish first 10 policy templates** in `apl/templates/`

### ❌ Not built yet (stay disciplined — don't touch unless asked)
- Layer 2 paid templates UI (post-hackathon proof is the 10 APL files)
- Layer 3 auto-update subscription (post-hackathon)
- Approval adapters (Slack/email/PagerDuty)
- Multi-currency oracle
- Solana mainnet anchoring (devnet stub exists, types fixed)
- Any paying customer

---

## Repo layout

```
intaglio-engine/          MIT. Parser + evaluator + hash chain. 49 tests.
intaglio-audit/           MIT. PDFKit PDF exporter. 12 tests.
apl/                  CC-BY-4.0. Spec + 4 compliance .apl fixtures.
  templates/          Layer 2: curated policy templates (10 files).
dashboard/            Next.js 15. Supabase SSR. Port 3000.
landing/              Next.js 15. Marketing. Port 3002.
services/x402-proxy/  Hono + Bun. Enforcement proxy. Port 3005.
infra/supabase/       schema.sql + policies.sql (deployed).
docs/                 API ref, SDK guide, audit runbook.
.agents/skills/       Local skills (gitignored — on disk only).
CONTEXT.md            North Star. Business rules. Read this.
CLAUDE.md             Engineering discipline. Planning rules.
AGENTS.md             This file. Agent dispatch guide.
memory/               Handoff state. Session-to-session context.
```

---

## Security invariants — never violate

- `AXON_SIMULATOR_BYPASS=1` — dev only, never in prod
- `services/x402-proxy/src/auth.ts` — read the security comment before touching
- `audit_records` is append-only — no UPDATE, no DELETE, ever
- Never commit `.env*` files
- CORS in proxy is allowlisted via `AXON_CORS_ORIGINS` — no wildcard in prod

---

## How to work dispatch (gstack tiers)

| Task scope | What to do |
|---|---|
| Single file, obvious fix | Fix directly |
| Multi-file feature | gstack Office Hours first, then implement |
| Bug with unclear cause | Investigate — no fix without root cause |
| Product/strategy question | gstack Office Hours |
| Weekly velocity check | gstack retro |

---

## Anti-drift checklist (answer before building anything)

1. Does this let agents deploy faster or stay regulator-ready without thinking?
2. Does this narrow us or widen us? Narrow wins.
3. Is Jun 16 closer than it was yesterday?
4. Can a Stripe or Bloomberg corp-dev analyst understand why this matters?

If a task fails any of these, stop and flag it with prefix `anti-drift:`.

---

## Communication rules (for agents talking to [OPERATOR_NAME])

- Peer-level. No flattery. No "great question."
- Confidence labels on non-trivial claims: HIGH / MED / LOW
- Code first, explain after
- Flag blockers immediately — don't work around them silently
- Token efficiency matters — [OPERATOR_NAME] is on a budget
