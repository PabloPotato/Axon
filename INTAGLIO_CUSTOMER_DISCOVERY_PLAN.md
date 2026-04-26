# AXON — Customer Discovery Plan (first 15 calls)

## Prioritization logic

Rank by: (a) likelihood they're already running agents that spend money, (b) crypto-native or crypto-tolerant, (c) EU exposure forcing them to care about AI Act / MiCA, (d) reachability (warm intro possible via Superteam / a16z crypto / Coinbase Ventures network). SMB to mid-market first. No Microsoft/SAP/Oracle shops on this list — they'll default to Agent 365.

---

### 1. Browserbase (San Francisco, YC)
- **Who to reach:** CTO Paul Klein. CFO / ops lead.
- **Why they matter:** Confirmed production agent customer of Stripe Tempo/MPP — agents pay per browser session. Archetype of pay-as-you-go agent workload.
- **Talking points:** How are you currently capping per-tenant agent spend on MPP? How do you reconcile MPP spend back to your AWS/corporate ledger? Is the Tempo logging enough to pass an Article 12 audit if a regulator asked today?
- **Ask:** 30-min design-partner call. Free tier of Intaglio for 90 days in exchange for feedback + logo.

### 2. PostalForm (Tempo / MPP production customer)
- **Why:** Same as Browserbase — physical-mail agent payments. Real production dollar flow.
- **Talking points:** Agent abuse patterns (a malicious agent mailing 10K envelopes); refund/chargeback flow; multi-tenant spend policy.
- **Ask:** Scoping call.

### 3. Prospect Butcher Co. (NYC, MPP production customer)
- **Why:** Proves agents-buying-sandwiches works. Likely terrible margin — spend caps are existential.
- **Ask:** Can they share policy/limit pain on record?

### 4. Emergence AI (NYC, Learn Capital, $97M)
- **Why:** Already on Skyfire payment network. Building orchestration for enterprise agent workflows. Middle of the stack.
- **Talking points:** Who enforces spend policy across their enterprise agents today? Is KYAPay enough, or do they also need per-agent budget caps and audit export?
- **Ask:** Partnership exploration (Intaglio below, Emergence workflows above).

### 5. Natural (YC, $9.8M, Ramp founders' bet)
- **Why:** Overlapping TAM. Better to partner than compete. Their customer base (freight, healthcare, procurement) is where Intaglio wants to land.
- **Talking points:** You're building payments infra; we're building governance SaaS above. Where's the natural seam?
- **Ask:** Exploratory call, possible referral channel.

### 6. Halliday (a16z, $20M)
- **Why:** Closest direct competitor in DeFi-adjacent agent workflows. Know thy enemy + possible ally.
- **Ask:** Positioning call. Learn their wedge. Likely declined but worth the ask.

### 7. Crossmint (SF, $23.6M)
- **Why:** 40K enterprise developer base. Possible distribution channel for Intaglio's governance layer above their wallet infra.
- **Talking points:** What % of your agent-wallet customers ask you for policy/spend enforcement? If the answer is >30%, partnership is obvious.
- **Ask:** Explore integration — Intaglio as the "policy layer" sold to Crossmint customers.

### 8. Perplexity (SF, $9B+ val, Computer agent platform)
- **Why:** Multi-model agentic platform in enterprise beta. 100+ enterprises requested access in one weekend. Every customer will need agent spend governance.
- **Talking points:** How do you govern per-enterprise spend across your 19-model Computer product today? Would you OEM a treasury layer?
- **Ask:** Platform partnership — Intaglio as default governance tier.

### 9. Cognition (Devin, $73M ARR)
- **Why:** Devin runs at Goldman, Citi, Dell, Cisco, Ramp, Palantir, Nubank, Mercado Libre. These customers need per-seat Devin spend caps and audit.
- **Talking points:** Who governs Devin's cloud/API spend inside Goldman today? Is it Devin-side, Goldman-side, or neither?
- **Ask:** Feasibility of a Devin-Intaglio pilot.

### 10. A Solana-ecosystem DAO treasury (e.g., Helium, Jupiter, Jito, Drift)
- **Why:** Running automated treasury bots and agent strategies. Native crypto. EU-exposed. Warm-intro reachable via Superteam.
- **Talking points:** Your treasury/bot policy is code in a gnarly repo — would a policy DSL + Article-12 audit export be worth €2-5K/month?
- **Ask:** Pick one, run a scoped pilot (30 days).

### 11. Sierra-powered enterprise running regulated workflows (Nubank, Nordstrom, Chime, ADT)
- **Why:** Sierra agents authenticate patients, process mortgages, originate financial workflows. High-risk per EU AI Act.
- **Approach:** Reach via Sierra's enterprise ops / partnerships team, not direct. Pitch: "your Sierra deployment passes Article 12 if the auditor shows up tomorrow — yes or no?"
- **Ask:** Sierra partnership referral.

### 12. Ramp (indirect, Amanda Scott / Eric Glyman orbit)
- **Why:** Potential acquirer. Softest possible intro via Natural investors (Eric Glyman is listed as Natural backer).
- **Angle:** Not pitching for customer, pitching "eventual acquisition target." Intaglio is the EU / crypto-native extension Ramp doesn't want to build itself.
- **Ask:** Get on Ramp's radar. Do not pitch for buyout.

### 13. Coinbase Ventures (warm intro via Skyfire or Halliday a16z overlap)
- **Why:** Strategic investor AND acquirer. Builds the rail (x402, Agentic Wallets) but cannot build SaaS above it fast enough.
- **Talking points:** Intaglio is the enterprise enforcement layer above x402 — you ship the protocol, we ship the product ops buy.
- **Ask:** Intro to appropriate partner; possible CSX follow-on.

### 14. A mid-sized EU e-commerce shop running agentic procurement (Zalando, About You, MyProtein, any DACH brand)
- **Why:** EU exposure = MiCA + AI Act pressure. Likely pilot target.
- **Approach:** [OPERATOR_NAME]'s Concentrix / Meta network. Warmer than cold.
- **Talking points:** If your procurement agent spends €50K/quarter on ads APIs + shipping, who signs off policy, and how do you prove compliance on an audit?
- **Ask:** 60-day paid pilot (€3K/month) in Q3 2026.

### 15. George Hanna (existing Meta ads client) + 2 similar SMB agencies
- **Why:** [OPERATOR_NAME] has the relationship. Smallest fish but zero-friction entry.
- **Angle:** They run Meta/Google agents for their clients today. Can Intaglio govern those agents' spend and audit their client-facing reports?
- **Ask:** Free alpha in exchange for weekly feedback + referrals.

---

## Call script (90 seconds, adapt per call)

> "I'm [OPERATOR_NAME], building Intaglio — the treasury control plane for companies running AI agents that spend money. Your Browserbase/Devin/Sierra/Natural deployment already handles identity and payments. Nobody handles the layer where your finance team caps per-agent spend, enforces policy in real-time, and exports one audit package that passes EU AI Act Article 12. I'm not asking you to buy anything. I'm asking if that pain is in your top 5, how you solve it today, and whether you'd look at an alpha in 60 days."

## Target outcomes by call type

| Call type | Goal |
|---|---|
| Production agent operators (1–5) | 3 paid design partners (€1–3K/mo, 90-day) |
| Platform plays (7, 8, 9) | 1 OEM/platform partnership LOI |
| Competitors (5, 6) | Clarity on positioning + "stay out of our lane" map |
| Acquirer-adjacent (12, 13) | Recognition + follow-up cadence |
| SMB pilots (14, 15) | 2 low-friction early customers with logos |

## Tracking

Single sheet. Columns: company, contact, date first contact, warmest path, status (no reply / qualified / meeting / pilot / closed), dollar value, blockers. Weekly review every Friday for first 8 weeks.
