// services/x402-proxy/src/forward.ts
// x402 HTTP forwarder.
// Only called AFTER evaluation produces APPROVE.
// Streams the upstream response back to the caller.

import type { AgentAction } from "@axon/engine";
import type { Context } from "hono";

export interface ForwardResult {
  ok: boolean;
  status: number;
  body: unknown;
}

/**
 * Forward an x402 request to the upstream endpoint.
 * The action.endpoint is the target URL.
 * The x402Request body is passed through verbatim.
 */
export async function forwardX402Request(
  action: AgentAction,
  x402Request: unknown
): Promise<ForwardResult> {
  const endpoint = action.endpoint;
  if (!endpoint) {
    return { ok: false, status: 400, body: { error: "action.endpoint is required for forwarding" } };
  }

  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return { ok: false, status: 400, body: { error: "action.endpoint is not a valid URL" } };
  }

  // Safety: only forward to https endpoints.
  if (url.protocol !== "https:") {
    return { ok: false, status: 400, body: { error: "only https endpoints are permitted" } };
  }

  try {
    const resp = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Do NOT forward any auth headers from the original caller.
      },
      body: JSON.stringify(x402Request),
    });

    const text = await resp.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    return { ok: resp.ok, status: resp.status, body };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "upstream_error";
    return { ok: false, status: 502, body: { error: message } };
  }
}
