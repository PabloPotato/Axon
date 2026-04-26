# DESIGN_V2 — Axon Landing Page Design Contract

## Rationale
The current live site is functional but does not look like infrastructure. It looks like a hackathon project.
This document is the single source of truth for the design v2 refresh. The subagent reads this before every change.

## Color Tokens
- Background: zinc-950 (#09090b)
- Surface: #111113
- Foreground: #f4f4f5
- Muted: #71717a
- Border: rgba(255, 255, 255, 0.08)
- Violet primary: #7C5CFF (appears at most 3 times per viewport)
- Violet hover: #6b4cf0
- Good: #22c55e
- Bad: #ef4444
- Warn: #f59e0b
- Gradient stop 1: #7C5CFF
- Gradient stop 2: #4F46E5
  This gradient used only in hero radial glow and CTA button hover state.

## Typography
- All text: Geist Sans
- All code: JetBrains Mono
- H1 hero: 72px desktop, 48px mobile, line-height 1.05, letter-spacing -0.04em, weight 600
- H2: 36px, line-height 1.15, weight 600
- H3: 22px, weight 600
- Body: 16px, line-height 1.6, weight 400
- Caption: 13px, color muted
- Mono code: 14px, line-height 1.6

## Layout
- Container max-width: 1180px
- Section vertical padding: 128px desktop, 80px mobile
- Card radius: 8px (never higher)
- Border: 1px (never thicker)
- Hover state on cards: border color change to violet at 30% opacity — no shadow, no scale, no lift (Linear rule)

## Motion
- All transitions: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- Page load: instant, no fade
- Scroll-triggered animation: hash chain only
- Hover lift on cards: forbidden
- Max one animated element per fold — this separates premium from busy
- No framer-motion imports — CSS transitions only

## Voice
- No emoji
- No exclamation marks
- No "AI-powered", "next-gen", "revolutionary", "the future of"
- Numbers and dates always specific: "MiCA, July 1, 2026" not "regulations soon"
- Sentences end with periods

## Section Order (Frozen — 9 sections, no more, no less)
1. Sticky nav (56px, blurred backdrop, Geist Mono brand, 3 links + CTA)
2. Hero (90vh, 3-line H1, subhead, CTAs, EU badge, violet radial gradient + static APL code block)
3. Three layers diagram (APL standard, axon-engine runtime, axon-audit evidence — CSS-only, 3 boxes)
4. Hash chain visualization (existing — do not touch)
5. Live policy editor (existing — do not touch)
6. Ten policy templates grid (dynamic from apl/templates/)
7. Regulatory mapping table (6 columns, 6 rows, green dots)
8. Comparison table (6 rows, 4 columns, honest minus rows)
9. Minimal footer

## What Does NOT Belong
No fake logo wall / founder photos / testimonials / "trusted by" / sparkle emojis /
"get started in 60 seconds" / floating chat widget / cookie banner

## Reference Sites (study, don't copy)
linear.app — restraint and motion
stripe.com — precision and code blocks
vercel.com — typography
cursor.com — hero density
resend.com — product surface visibility
inngest.com — developer-infra positioning

## Anti-Hallucination Rules
- Never invent component imports that don't exist
- When importing, confirm file exists at path
- Never invent framer-motion imports
- When in doubt with Tailwind v4, use arbitrary values: text-[72px]
- Only these EU citations allowed: AI Act Art. 12, MiCA Art. 68, MiCA Art. 70, DORA Art. 17, NIST AI RMF, ISO 42001
