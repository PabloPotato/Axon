# Prompt 03 — intaglio.tech landing page

**Target tool:** v0.dev (Vercel).
**Output:** a single-page Next.js + Tailwind + shadcn landing, exported and dropped into `landing/`.

---

## Paste this into v0

Design the landing page for **Intaglio** — the open policy and audit layer for autonomous AI agents. Single page, Next.js 15 App Router, Tailwind v4, shadcn/ui, dark mode default.

### Brand

- **Tone:** Stripe-level restraint. No emoji. No gradients more aggressive than a subtle radial behind the hero. One accent color: `#7C5CFF` (Solana-adjacent violet). Typography: Geist Sans for UI, Geist Mono for code blocks.
- **Voice:** direct, technical, slightly under-promising. No "revolutionize", no "unleash". We talk to infrastructure engineers and compliance officers, not marketers.

### Above-the-fold hero

- Headline (h1): **"The open policy layer for AI agents that move real money."**
- Subhead: "One `.apl` file governs every action your agent takes. Deterministic decisions. Tamper-evident audit. EU AI Act Article 12, MiCA, and DORA compatible out of the box."
- Two CTAs: `npm install @intaglio/engine` (primary, copy-on-click) and "Read the spec" (ghost, links to /spec).
- Right of hero: a monospace block showing the 10-line Hello World APL policy (copy it from apl/README.md).

### Sections, in order

1. **Why Intaglio exists** — three-column layout. Each column: icon (lucide), short heading, two-sentence body.
   - *Agents are about to move real money.* x402, Stripe MPP, Google AP2, Visa TAP, Mastercard Agent Pay all ship in 2026.
   - *Regulators already decided.* EU AI Act Article 12, MiCA (July 1 2026), DORA. Logging is not optional.
   - *Closed platforms won't be accepted.* Microsoft Agent 365 and the rest will not be the standard that regulators trust.

2. **How it works** — a three-step diagram built with CSS grid, not an image. `Write policy` → `Engine evaluates` → `Audit chain anchors`. Each step has a short technical caption.

3. **Positioning table** — responsive table: rows are capabilities (Open-source core, Portable policy format, Deterministic audit chain, EU-first regulatory mapping, Rail-agnostic, Self-hostable), columns are `Intaglio`, `Microsoft Agent 365`, `Ramp Agents`, `ServiceNow AI CT`. Intaglio column is the only one with all green checks.

4. **Code section** — two tabs: "Policy" (shows the marketing-agent.apl) and "Evaluation" (shows the `new IntaglioEngine(source).evaluate(action, ctx)` snippet).

5. **Governance commitments** — three bullets in a bordered card:
   - The language spec is CC-BY-4.0.
   - We will never ship a closed extension.
   - At v1.0 we donate the spec to a neutral standards body.

6. **Roadmap** — horizontal timeline, four dots: v0.1 (today), v0.2 (May 2026 — Solana anchoring + PDF export), v0.3 (Q3 2026 — multi-rail + DORA templates), v1.0 (2027 — standards donation).

7. **Footer CTA** — "Building an agent that moves money in the EU? Talk to us." → button mailto:hello@intaglio.dev.

8. **Footer** — two columns: links (Spec, Engine, GitHub, Discord) and meta (MIT + CC-BY-4.0, Berlin, © 2026 Intaglio Labs).

### Rules

- No testimonials. No logos-of-fake-customers strip. No "Trusted by" section. We do not lie on a landing page.
- No lead-capture modal. No exit-intent popup. No cookie banner for now — we'll add one when we have an analytics vendor to justify it.
- Page weight target: under 100KB first load. Inline the SVG icons, no remote fonts beyond Geist.
- Fully keyboard-navigable, semantic HTML, no div soup.

### Output

A single Next.js page component plus a Tailwind config and any shadcn component stubs you use. Make it feel like a spec homepage (Stripe, Figma, Linear, Resend), not a crypto project landing.
