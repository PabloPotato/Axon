# Axon Typescript Integration SDK

Axon enforces compliance entirely out-of-band by proxying your requests. Integrating an agent securely is easily achieved by wrapping your native API requests.

The enforcement boundary guarantees that if the `x402-proxy` rejects the action, the request will systematically short-circuit, preventing non-compliant actions.

## 1. Native Fetch Wrapper

Using a simple wrapper to intercept downstream agent requests and tunnel them safely through the Axon enforcement node.

```typescript
// axonFetcher.ts
import { randomUUID } from "crypto";

const AXON_PROXY_URL = process.env.AXON_PROXY_URL || "http://localhost:3001";
const AXON_AGENT_SECRET = process.env.AXON_AGENT_SECRET;

/**
 * Evaluates an action through the local Axon Proxy Node limit enforcements
 * before directly tunneling to the endpoint.
 */
export async function axonFetch(actionObj: any, upstreamUrl: string, fetchOptions: RequestInit = {}) {
  const idempotencyKey = randomUUID();

  const response = await fetch(`${AXON_PROXY_URL}/v1/x402/forward`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AXON_AGENT_SECRET}`,
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
    throw new Error(`[Axon] Enforced short-circuit: ${response.statusText}`);
  }

  return response;
}
```

## 2. Usage

```typescript
import { axonFetch } from "./axonFetcher";

export async function submitTransfer(amount: number) {
  const action = {
    rail: "x402",
    amount: { value: amount, currency: "USD" },
    timestamp: new Date().toISOString()
  };

  try {
    const res = await axonFetch(action, "https://api.yourbank.com/transfer", {
      method: "POST",
      body: JSON.stringify({ recipient: "uuid", amount })
    });
    
    console.log("Transfer physically completed. Transaction:", await res.json());
  } catch (err) {
    console.warn("Transfer prevented by AI Regulatory Enforcement.", err);
  }
}
```
