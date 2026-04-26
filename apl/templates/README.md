# Intaglio Policy Templates

Ten curated policy templates covering common compliance and treasury scenarios. Each file parses cleanly with the Intaglio Engine. Use these as starting points for your own agent policies.

## Template catalog

| # | File | Purpose |
|---|------|---------|
| 1 | `01-per-transaction.apl` | Hard cap on individual agent actions |
| 2 | `02-per-day.apl` | Daily spend ceiling for autonomous agents |
| 3 | `03-velocity.apl` | Frequency cap on agent actions |
| 4 | `04-allowlist.apl` | Restrict to explicitly allowed endpoints and merchants |
| 5 | `05-blocklist.apl` | Explicitly deny sanctioned jurisdictions and bad merchants |
| 6 | `06-time-window.apl` | Restrict agent activity to EU business hours |
| 7 | `07-risk-score.apl` | Dynamic per-action risk assessment threshold |
| 8 | `08-usdc-treasury.apl` | USDC treasury operations with conservative limits |
| 9 | `09-domestic-only.apl` | Restrict to domestic transactions only |
| 10 | `10-combined-compliance.apl` | Full-featured MiCA-ready compliance policy |

## Verification

```bash
npx tsx intaglio-engine/examples/verify-templates.ts
```

All templates must exit zero.
