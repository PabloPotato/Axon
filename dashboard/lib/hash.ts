// dashboard/lib/hash.ts
// sha256 utility for policy source hashing (used in API routes).

import { createHash } from "node:crypto";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function sha256PolicyHash(source: string): string {
  return `sha256:${sha256Hex(source)}`;
}
