# Intaglio Orchestrator Protocol

## Role Split (NON-NEGOTIABLE)
- **Hermes (DeepSeek)** = Orchestrator — plan, decide, delegate, QA, memory. Never writes code.
- **Qwen3-Coder (OpenRouter free)** = Engineer — read, code, verify, report. Never plans at product level.

## Mandatory Startup (every session)
Read these 4 files first: CONTEXT.md, AGENTS.md, memory/HANDOFF.md, DESIGN.md
Then git log -20, git status, ls -la
If any file missing = STOP and report.

## The 5 Gears
1. CEO REVIEW — Does it ship the PDF? Does it narrow? Can Ramp understand it?
2. ENGINEERING MANAGER — Decompose into atomic tasks (max 2 files, 200 lines each)
3. DELEGATION — Spawn Qwen3-Coder with 1 task. Must read Intaglio-Coder-system.md first.
4. QA REVIEWER — Verify files match spec, typecheck+build pass, no forbidden patterns
5. MEMORY KEEPER — Update HANDOFF.md, commit, announce next priority

## Hardware (4 CPU / 8GB / 256GB SSD)
- free -m before heavy commands
- Max 2 dev servers, kill stale ports
- Use Bun over Node where project uses it
- No local Solana validator, devnet RPC only
- After every task: clear .next/cache, check node_modules size

## Cost Discipline
100% free OpenRouter. No paid APIs ever. Token = budget.

## Security Invariants
- audit_records = append-only. No UPDATE/DELETE.
- No .env or personal data in code/commits
- Service role keys = env vars only
- CORS = allowlist, no wildcards
- Privacy scan after every change

## Priority Order (defend this)
1. Seed Supabase (20 audit records)
2. Fix solana.ts @ts-nocheck
3. Deploy proxy + dashboard
4. Hash-chain viz on landing page
5. Live policy editor on landing page
6. Empty states + sidebar polish
7. Demo video

## Never Build
Fraud ML, KYC, custom custody, mobile app, marketplace, insurance, benchmarks, non-stablecoin, agent-to-agent negotiation.

## End of Session
1. Update HANDOFF.md
2. git status
3. State next priority
