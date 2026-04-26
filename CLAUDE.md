# Intaglio — Claude Code Instructions

Read CONTEXT.md first every session. It is the North Star. This file adds engineering discipline on top of it.

## Planning Discipline (gstack-lite)

1. Read every file you will modify. Understand existing patterns before touching anything.
2. Before writing code, state your plan: what, why, which files, test case, risk.
3. When ambiguous, prefer: completeness over shortcuts, existing patterns over new ones, reversible choices over irreversible ones, safe defaults over clever ones.
4. Self-review your changes before reporting done. Check: missed files, broken imports, untested paths, style inconsistencies.
5. Report when done: what shipped, what decisions you made, anything uncertain.

## Work Dispatch Tiers

| Tier | Scope | Approach |
|---|---|---|
| **SIMPLE** | Single-file, obvious fix (<10 lines) | Fix directly |
| **MEDIUM** | Multi-file feature, clear approach | Plan → implement → verify |
| **HEAVY** | Needs a specific skill (/qa, /review, /investigate) | Run the skill first |
| **FULL** | Complete feature, multi-day scope | office-hours → ceo-review → implement → ship |
| **PLAN** | Design/spec work, no coding yet | office-hours → design doc only |

## Available Skills

- `/gstack-openclaw-office-hours` — YC-style product validation, design docs
- `/gstack-openclaw-investigate` — root cause debugging (use before any non-obvious fix)
- `/gstack-openclaw-ceo-review` — plan review before building anything MEDIUM or larger
- `/gstack-openclaw-retro` — weekly git retrospective and velocity report

## Security Rules

- `AXON_SIMULATOR_BYPASS=1` must never be set in production environments
- `services/x402-proxy/src/auth.ts` — read the security comment before touching
- Never commit `.env*` files
- RLS is append-only on `audit_records` — do not add UPDATE or DELETE

## Repo Layout

```
intaglio-engine/     — APL parser + evaluator + hash chain (MIT)
intaglio-audit/      — PDF exporter (MIT)
dashboard/       — Next.js 15 app (Supabase SSR)
landing/         — Marketing page
services/x402-proxy/ — Hono enforcement proxy (Bun)
infra/supabase/  — schema.sql + policies.sql (deployed to [SUPABASE_PROJECT_ID])
apl/             — APL spec + compliance fixtures
```
