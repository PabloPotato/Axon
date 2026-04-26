# axon-engine

Reference implementation of the **Axon Policy Language (APL)** — parse, evaluate, and audit autonomous AI agent actions.

MIT licensed. TypeScript first. Rust implementation ships next.

---

## Quick start

```bash
npm install @axon/engine
```

```ts
import { AxonEngine } from "@axon/engine";
import { readFileSync } from "node:fs";

const source = readFileSync("./marketing-agent.apl", "utf8");
const engine = new AxonEngine(source);

const action = {
  rail: "x402",
  endpoint: "graph.facebook.com/v1/campaigns",
  amount: { value: 200, currency: "EUR" },
  chain: "solana:mainnet",
  timestamp: new Date().toISOString(),
};

const ctx = {
  now: new Date(),
  spend_window: { per_hour: 0, per_day: 0, per_month: 0 },
  open_concurrent_actions: 0,
  human_approvals: {},
  identity_verified: true,
  attestations_active: new Set<string>(),
};

const { decision, record } = await engine.evaluate(action, ctx);
console.log(decision); // { outcome: "APPROVE", reason: null }
console.log(record.self_hash); // "sha256:..."
```

## What this library does

1. **Parses** `.apl` files into typed `Policy` objects.
2. **Evaluates** an `AgentAction` against a `Policy` and returns a deterministic `Decision` (`APPROVE` / `DENY` / `REQUIRE_APPROVAL`).
3. **Produces** a canonical `AuditRecord` with a hash-chained lineage, suitable for EU AI Act Article 12 + MiCA + DORA submissions.
4. **Emits** obligations (log targets, audit exports, webhooks) via pluggable emitters.

## What it does *not* do (yet)

- On-chain anchoring to Solana — stub in v0.1; Solana emitter lands in v0.2.
- Full regex engine with ReDoS guards — v0.1 uses `RegExp` directly; v0.2 swaps in `re2`.
- Currency oracle for cross-currency limits — v0.1 is same-currency only.
- Rust + WASM build — v0.2.

Run the example:

```bash
npm run example
```

## Conformance

Targets APL Level 4 (see spec §9) at v0.3. v0.1 implements Level 2 (parse + evaluate). Level 3 (hash chain) is in place; on-chain anchoring is stubbed.

## Testing

```bash
npm test
```

The test suite lives under `test/` and covers:

- Lexer + parser (syntax edge cases, error messages)
- Evaluator (every APL clause — 40+ cases)
- Audit chain (tampering detection — if a single byte changes, verification fails)
- Fixture-based conformance tests against `apl/compliance-suite/*.apl`

## Structure

```
axon-engine/
├── src/
│   ├── types.ts         — canonical APL types
│   ├── parser.ts        — recursive-descent APL parser
│   ├── evaluator.ts     — APL §5 evaluation semantics
│   ├── audit.ts         — canonicalization + hash chain
│   └── index.ts         — public API
├── examples/
│   ├── marketing-agent.apl
│   └── run.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Roadmap

- **v0.2** — Solana anchoring emitter, regex-safety layer, audit PDF exporter (EU AI Act Article 12 template).
- **v0.3** — Cross-currency oracle, approval workflow adapters (Slack/email/PagerDuty), DORA + MiFID II export templates.
- **v0.4** — Rust + WASM build for sub-1ms evaluation.
- **v1.0** — Full Level 4 conformance; spec donated to a neutral standards body.

## License

MIT © Axon Labs (Berlin)

Read [the APL spec](../apl/SPEC.md). Open issues and PRs welcome.
