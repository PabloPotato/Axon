# AGENTS.md — Every agent reads this on startup. No exceptions.

## Who you are working for

**Sari Salman**, 22, Berlin. Ex-Meta ads. Building Axon on €80 liquid runway.
ADHD/PTSD (active therapy). Shipping on a 60-day kill-criterion window.
Talks to agents as peers. Expects brutal honesty. No flattery. No pep talk.

## What Axon is (one sentence — do not paraphrase)

> Axon is the EU compliance and treasury governance product for companies running stablecoin-paying AI agents.

## What you are actually building toward

An **auditor-signable PDF** that a Frankfurt compliance officer accepts as evidence of EU AI Act Article 12, MiCA Art. 68/70, and DORA Art. 5/17/19 compliance. Everything else is scaffolding around that PDF.

The acquirer we design for: **Ramp** (not Coinbase, not Microsoft, not Stripe).
The distribution lever: **Solana Superteam Germany**.
The kill criterion: **≥2 paid EU design partners by June 16, 2026**.

---

## Fixed deadlines

| Date | Event |
|---|---|
| **2026-05-12** | Solana x402 Demo Day — must have live demo |
| **2026-06-16** | Kill criterion: 2 paid design partners or Axon pauses |
| **2026-07-01** | MiCA CASP compliance deadline (market forcing function) |
| **2026-08** | EU AI Act Article 12 deadline |
| **2026-09** | Sari starts Tetr College — non-negotiable optionality |

---

## Current product state (as of 2026-04-20)

### ✅ Done and working
- APL v0.1 spec (`apl/SPEC.md`) + 4 compliance fixtures
- `axon-engine` — parser, evaluator, hash-chain auditor (TypeScript, MIT)
- `axon-audit` — PDFKit PDF exporter, 12 tests passing
- `services/x402-proxy` — Hono + Bun enforcement proxy, auth hardened, Solana devnet sink stubbed
- `dashboard` — Next.js 15, Supabase SSR, design implemented (Apple blue, dark sidebar)
- `landing` — marketing page
- `infra/supabase/schema.sql` + `policies.sql` — **deployed** to live project `wrbaygxtqrtvpzxnrkni`
- `CLAUDE.md` — gstack-lite planning discipline
- `docs/` — API reference, SDK wrapper guide, PDF audit runbook
- Skills: `/gstack-openclaw-office-hours`, `/gstack-openclaw-investigate`, `/gstack-openclaw-ceo-review`, `/gstack-openclaw-retro`

### ⏳ Blocking the demo (do these first)
1. **Seed demo data** — operator + agent + ~20 audit records in Supabase so dashboard shows live data
2. **Deploy publicly** — proxy to Railway (port 3005), dashboard to Vercel
3. **Magic link login** — Sari needs to sign in at localhost:3000/login (stale JWT issue, re-auth needed)

### ❌ Not built yet (stay disciplined — don't touch unless asked)
- Approval adapters (Slack/email/PagerDuty)
- Multi-currency oracle
- Solana mainnet anchoring (devnet stub exists, `// @ts-nocheck` — fix before going live)
- Any paying customer

---

## Repo layout

```
axon-engine/          MIT. Parser + evaluator + hash chain. 49 tests.
axon-audit/           MIT. PDFKit PDF exporter. 12 tests.
apl/                  CC-BY-4.0. Spec + 4 compliance .apl fixtures.
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
| Multi-file feature | `/gstack-openclaw-ceo-review` first, then implement |
| Bug with unclear cause | `/gstack-openclaw-investigate` — no fix without root cause |
| Product/strategy question | `/gstack-openclaw-office-hours` |
| Weekly velocity check | `/gstack-openclaw-retro` |

---

## Anti-drift checklist (answer before building anything)

1. Does this ship the PDF or get closer to a paying EU customer?
2. Does this narrow us or widen us? Narrow wins.
3. Is Jun 16 closer than it was yesterday?
4. Can a Ramp corp-dev analyst understand why this matters?

If a task fails any of these, stop and flag it with prefix `anti-drift:`.

---

## Communication rules (for agents talking to Sari)

- Peer-level. No flattery. No "great question."
- Confidence labels on non-trivial claims: HIGH / MED / LOW
- Code first, explain after
- Flag blockers immediately — don't work around them silently
- Token efficiency matters — Sari is on a budget
