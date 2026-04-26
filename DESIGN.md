# DESIGN.md — Intaglio Visual System v1.0

> Read this before touching any UI file. Every visual decision flows from here.
> If a request conflicts with this file, flag with prefix "design-drift:" and stop.

## North Star

Intaglio looks like regulatory infrastructure, not a fintech startup.

The reference points, in order: Linear (restraint), Stripe (precision), Vercel 
(typography), GitHub (information density). Not Crossmint. Not Skyfire. Not Ramp.

A Frankfurt compliance officer should open the site and feel: "This is the 
standard, not a vendor pitch." A Ramp corp-dev analyst should think: 
"Acquisition target. Already looks like it belongs at $50M ARR."

---

## Brand Identity

### Color Tokens (keep existing)
--color-bg:           #09090b   (zinc-950, primary background)
--color-bg-surface:   #111113   (cards, elevated surfaces)
--color-foreground:   #f4f4f5   (primary text)
--color-muted:        #71717a   (secondary text)
--color-border:       rgba(255, 255, 255, 0.08)
--color-violet:       #7C5CFF   (single accent — use sparingly)
--color-violet-muted: rgba(124, 92, 255, 0.12)
--color-good:         #22c55e   (APPROVE state)
--color-bad:          #ef4444   (DENY state)
--color-warn:         #f59e0b   (REQUIRE_APPROVAL state)

### Typography
- Sans: Inter (swap to Geist Sans for v1.1)
- Mono: JetBrains Mono (keep)
- Display sizes: Hero h1 56px / 1.05 / -0.03em / 600, Section h2 32px / 1.15 / -0.02em / 600

### Voice
- No emoji. No exclamation marks. No "AI-powered" / "next-gen" / "revolutionary."
- Numbers always specific: "MiCA, July 1 2026" not "regulations soon."
- Periods end sentences, including in nav and buttons. (Stripe rule.)

---

## Page Specs

### Landing page sections (in order):
1. Nav — sticky, blurred, 56px. Brand left, links right. Outlined CTA.
2. Hero — 60/40 split. H1: "Policy and audit / for autonomous / agents." Animated APL code block right.
3. Three layers diagram — APL → intaglio-engine → intaglio-audit
4. Hash chain visualization — 6 audit records, color-coded
5. Live policy → decision demo — interactive APL editor with live decision pill
6. Regulatory mapping table — AI Act Art.12 / MiCA Art.68 / DORA Art.17
7. Comparison table — Intaglio vs Microsoft Agent 365 / Ramp Agents / ServiceNow
8. Footer — minimal. Brand, GitHub, license, Berlin, 2026.

### Dashboard
- Dark sidebar with 1px violet glow on active item
- Empty states: show what to do, not just "No data"
- Hash chain table with connecting violet lines between rows
- Decision pills: 4px rounded (not pill-shaped), color-coded

---

## Color States
- APPROVE: green (#22c55e)
- DENY: red (#ef4444)
- REQUIRE_APPROVAL: amber (#f59e0b)

Last updated: 2026-04-26
