// services/x402-proxy/src/db.ts
// Single postgres client shared across the process.
// Uses porsager/postgres — works natively with Bun.

import postgres from "postgres";

const DATABASE_URL = process.env["DATABASE_URL"];
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Single connection pool for the whole process.
export const sql = postgres(DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  // Never log query text — may contain action bodies.
  debug: false,
  transform: postgres.camel,
});
