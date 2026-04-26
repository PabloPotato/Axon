# Intaglio Typescript Integration SDK

Intaglio enforces compliance entirely out-of-band by proxying your requests. Integrating an agent securely is easily achieved by wrapping your native API requests.

The enforcement boundary guarantees that if the `x402-proxy` rejects the action, the request will systematically short-circuit, preventing non-compliant actions.

## 1. Native Fetch Wrapper

Using a simple wrapper to intercept downstream agent requests and tunnel them safely through the Intaglio enforcement node.

```typescript
// intaglioFetcher.ts
import { randomUUID } from "crypto";

const INTA_PROXY_URL = process.env.INTA_PROXY_URL || "http://localhost:3001";
const INTA_AGENT_SECRET = process.env.INTA_AGENT_SECRET;

/**
 * Evaluates an action through the local Intaglio Proxy Node limit enforcements
 * before directly tunneling to the endpoint.
 */
export async function intaglioFetch(actionObj: any, upstreamUrl: string, fetchOptions: RequestInit = {}) {
  const idempotencyKey = randomUUID();

  const response = await fetch(`${INTA_PROXY_URL}/v1/x402/forward`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${INTA_AGENT_SECRET}`,
      "Idempotency-Key": idempotencyKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: actionObj,
      x402_request: {
        url: upstreamUrl,
        options: fetchOptions
      }
    })
  });

  if (!response.ok) {
    throw new Error(`[Intaglio] Enforced short-circuit: ${response.statusText}`);
  }

  return response;
}
```

## 2. Usage

```typescript
import { intaglioFetch } from "./intaglioFetcher";

export async function submitTransfer(amount: number) {
  const action = {
    rail: "x402",
    amount: { value: amount, currency: "USD" },
    timestamp: new Date().toISOString()
  };

  try {
    const res = await intaglioFetch(action, "https://api.yourbank.com/transfer", {
      method: "POST",
      body: JSON.stringify({ recipient: "uuid", amount })
    });
    
    console.log("Transfer physically completed. Transaction:", await res.json());
  } catch (err) {
    console.warn("Transfer prevented by AI Regulatory Enforcement.", err);
  }
}
```
