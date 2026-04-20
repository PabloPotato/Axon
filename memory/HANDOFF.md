# HANDOFF.md — Living session state
# Update this at the end of every session. Don't let it go stale.
# Last updated: 2026-04-20

---

## Current status: DEMO BLOCKED — needs live data + deployment

The product builds and typechecks clean. The database schema is deployed. The auth flow is correct. The blocker is: no seed data and no public URL. These are the only two things between now and a Demo Day-ready product.

---

## What was just completed (last 3 sessions)

### Session: 2026-04-20 (this session)
- Fixed `.env.local` Supabase URL typo (`wrbayqxt` → `wrbaygxt`) — **was breaking all auth**
- Killed stale Next.js ghost process on port 3000; dashboard running clean
- Installed 4 gstack OpenClaw skills (office-hours, investigate, ceo-review, retro)
- Created `CLAUDE.md` + `AGENTS.md` (this file's companion)
- Redesigned `AgentTabs.tsx` — full v2 design: Ledger/Policy/Approvals/Audit tabs, hash chain table, countdown timers, audit drawer

### Session: 2026-04-19 (Gemini + Claude Code)
- Gemini shipped: axon-audit test suite (12 tests), proxy e2e tests (2 tests), Solana devnet sink, docs/
- Claude Code shipped: Supabase schema fully deployed to `wrbaygxtqrtvpzxnrkni`, bootstrap RLS policy added
- Security fix: gated `Bearer axon_simulator_bypass` behind `AXON_SIMULATOR_BYPASS=1` env var
- Security fix: CORS replaced with `AXON_CORS_ORIGINS` allowlist
- Stale `.mcp.json` + `infra/supabase/package.json` deleted

### Session: 2026-04-18 (Antigravity)
- Full dashboard redesign committed (`4b670eb`)
- Added onboarding page, auth callback route
- x402-proxy simulator wired with `X-Simulator-Agent-Id` header

---

## Immediate next actions (in order)

### 1. Get Sari logged in (URGENT — blocks everything else)
```
http://localhost:3000/login
→ Enter abuahmadsari2@gmail.com
→ Click magic link in email
→ Complete /onboarding (org name, legal entity, country DE, billing email)
→ Land on /app
```
Root cause of past failures: expired JWT from URL-typo era. New magic link = clean tokens.

### 2. Seed demo data (Claude Code task)
Tell Claude Code in Antigravity:
> "Using Supabase MCP, seed: 1 agent named 'purchase-agent-v1', 1 active policy (use level3-audit.apl source), 20 audit records with mixed APPROVE/DENY/REQUIRE_APPROVAL outcomes spread over 14 days, realistic EUR amounts (50-2000 USDC). I need the hash chain to be valid."

### 3. Deploy for Demo Day
- Dashboard → Vercel: `vercel --prod` from `dashboard/`
- Proxy → Railway: `railway up` from `services/x402-proxy/`
- Set env vars on both platforms (copy from `.env.local` + add `AXON_SIMULATOR_BYPASS=1` on Railway)

### 4. Fix Solana `// @ts-nocheck` before devnet goes live
File: `services/x402-proxy/src/sinks/solana.ts`
Issue: `@solana/web3.js` proxy typing conflicts. Fix the types, remove the nocheck.

---

## Known issues / technical debt

| Issue | File | Severity | Notes |
|---|---|---|---|
| Solana sink `// @ts-nocheck` | `services/x402-proxy/src/sinks/solana.ts` | MED | Works at runtime, types unsuppressed before devnet |
| `iconv-lite` warnings in build | `axon-audit` → pdfkit deps | LOW | Harmless optional dep, ignore |
| Auth token refresh on onboarding | `dashboard/app/onboarding/page.tsx` | LOW | Use `getUser()` not `getSession()` for verified auth |
| No approval adapters | `services/x402-proxy/src/approvals.ts` | LOW | REQUIRE_APPROVAL works but only stores in DB, no notifications |

---

## Environment map

| Service | Local URL | Prod URL | Notes |
|---|---|---|---|
| Dashboard | http://localhost:3000 | TBD (Vercel) | Next.js 15, `.env.local` required |
| Proxy | http://localhost:3005 | TBD (Railway) | Requires `AXON_SIMULATOR_BYPASS=1` for simulator |
| Landing | http://localhost:3002 | TBD | Static |
| Supabase | — | wrbaygxtqrtvpzxnrkni | Schema + RLS deployed |

### Required env vars for dashboard (`dashboard/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://wrbaygxtqrtvpzxnrkni.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase dashboard>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Required env vars for proxy (`services/x402-proxy/.env`)
```
DATABASE_URL=<Supabase connection string>
AXON_SIMULATOR_BYPASS=1
AXON_CORS_ORIGINS=http://localhost:3000
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PAYER_KEYPAIR_PATH=<path to keypair json>  # optional, dry-run if absent
```

---

## Business context: where we are vs where we need to be

### The pitch (30 seconds)
EU companies running AI agents that spend stablecoins are about to be hit by three simultaneous compliance deadlines: MiCA CASP (Jul 2026), EU AI Act Article 12 (Aug 2026), DORA (ongoing). Zero tooling exists that handles all three for agent payments. Axon is the audit layer: one `.apl` policy file governs every agent action, and every action produces a tamper-evident record that exports as a regulator-ready PDF. Open-source core (APL spec CC-BY-4.0, engine MIT), SaaS dashboard paid.

### The moat
APL is an open standard. Microsoft can't adopt it as their governance layer — their business model forbids it. Ramp has no DSL team. We can out-compete their bundle by *being the standard*.

### Target customer
Frankfurt compliance officer at a company with 5-50 AI agents spending USDC/USDT. Buyer is CFO/CCO. Engineer integrates in a day. CCO signs the PO.

### Revenue model
- **Free tier**: engine + spec, forever (community, moat)
- **Paid tier**: dashboard + PDF export + approval workflows ($X/month per operator)
- **Enterprise**: custom policy templates, audit attestation SLAs, Solana anchoring

### Competition
- Microsoft Agent 365: enterprise-only, closed, no stablecoin, no EU compliance specificity
- Ramp: treasury for humans, not agents, no policy DSL
- Coinbase CDP: payments, no governance layer
- No one has the compliance PDF as a product

---

## People and assets

- **GitHub**: github.com/PabloPotato/Axon (public)
- **Supabase project**: wrbaygxtqrtvpzxnrkni
- **Sari's email**: abuahmadsari2@gmail.com
- **Distribution target**: Solana Superteam Germany (Demo Day: 2026-05-12)
- **Potential acquirer**: Ramp (design every artifact so their corp-dev can find us)
