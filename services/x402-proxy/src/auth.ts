// services/x402-proxy/src/auth.ts
// Bearer token authentication for agent requests.
//
// Token format: intaglio_agent_<agent_uuid>.<base64url_secret>
// The secret is stored as a sha256 hash in the agents table (identity_ref field
// is reused for the hashed_secret in v0.1 — a dedicated column should be added
// in the next schema migration).
//
// Security properties:
//   - Constant-time comparison via crypto.timingSafeEqual (no early exit attack)
//   - All parsing errors return the same opaque "Unauthorized" response

import { timingSafeEqual, createHash } from "node:crypto";
import { sql } from "./db.js";

export interface AuthedAgent {
  agentId: string;
  operatorId: string;
  slug: string;
}

/** Extract and validate a bearer token. Returns null if invalid. */
export async function authenticate(
  authHeader: string | undefined,
  simulatorAgentId?: string
): Promise<AuthedAgent | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  // Simulator bypass for local testing. Gated behind INTA_SIMULATOR_BYPASS=1
  // so it is impossible to enable in any environment where the env var is not
  // explicitly set (never set in prod). Without this guard, anyone who knows
  // a valid agent UUID could impersonate that agent.
  if (
    process.env["INTA_SIMULATOR_BYPASS"] === "1" &&
    authHeader === "Bearer intaglio_simulator_bypass" &&
    simulatorAgentId
  ) {
    const rows = await sql<Array<{ agentId: string; operatorId: string; slug: string }>>`
      select id as "agentId", operator_id as "operatorId", slug
      from agents
      where id = ${simulatorAgentId}
      limit 1
    `;
    return rows[0] || null;
  }

  const token = authHeader.slice(7).trim();
  const parsed = parseToken(token);
  if (!parsed) return null;

  const { agentId, rawSecret } = parsed;

  // Look up the agent + stored secret hash in one query.
  const rows = await sql<
    Array<{ agentId: string; operatorId: string; slug: string; secretHash: string }>
  >`
    select id as "agentId", operator_id as "operatorId", slug, identity_ref as "secretHash"
    from agents
    where id = ${agentId}
    limit 1
  `;

  const agent = rows[0];
  if (!agent || !agent.secretHash) return null;

  // Constant-time comparison of sha256(rawSecret) vs stored hash.
  const incoming = createHash("sha256").update(rawSecret).digest();
  let stored: Buffer;
  try {
    // stored hash is hex
    stored = Buffer.from(agent.secretHash, "hex");
  } catch {
    return null;
  }

  if (incoming.length !== stored.length) return null;
  if (!timingSafeEqual(incoming, stored)) return null;

  return {
    agentId: agent.agentId,
    operatorId: agent.operatorId,
    slug: agent.slug,
  };
}

function parseToken(
  token: string
): { agentId: string; rawSecret: string } | null {
  if (!token.startsWith("intaglio_agent_")) return null;
  const rest = token.slice("intaglio_agent_".length);
  const dotIdx = rest.indexOf(".");
  if (dotIdx === -1) return null;
  const agentId = rest.slice(0, dotIdx);
  const rawSecret = rest.slice(dotIdx + 1);
  // Validate UUID format for agentId
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      agentId
    )
  )
    return null;
  if (!rawSecret) return null;
  return { agentId, rawSecret };
}
