import { createClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const GENESIS_HASH =
  "sha256:0000000000000000000000000000000000000000000000000000000000000000";

function sha256(input: string): string {
  return "sha256:" + createHash("sha256").update(input, "utf-8").digest("hex");
}

// Deterministic sorted-key JSON for canonical hashing
function canonical(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

const DECISIONS: Array<{ verdict: string; reason: string; confidence: number }> = [
  { verdict: "APPROVE", reason: "within policy limits", confidence: 0.99 },
  { verdict: "APPROVE", reason: "within policy limits", confidence: 0.98 },
  { verdict: "APPROVE", reason: "within policy limits", confidence: 0.97 },
  { verdict: "APPROVE", reason: "within policy limits", confidence: 0.99 },
  { verdict: "APPROVE", reason: "within policy limits", confidence: 0.95 },
  { verdict: "APPROVE", reason: "within policy limits", confidence: 0.99 },
  { verdict: "APPROVE", reason: "within policy limits", confidence: 0.98 },
  { verdict: "APPROVE", reason: "whitelisted vendor", confidence: 0.99 },
  { verdict: "APPROVE", reason: "whitelisted vendor", confidence: 0.99 },
  { verdict: "APPROVE", reason: "whitelisted vendor", confidence: 0.98 },
  { verdict: "APPROVE", reason: "within policy limits", confidence: 0.96 },
  { verdict: "APPROVE", reason: "within policy limits", confidence: 0.97 },
  { verdict: "DENY", reason: "exceeds per_transaction limit", confidence: 0.99 },
  { verdict: "DENY", reason: "vendor not in allowlist", confidence: 0.99 },
  { verdict: "DENY", reason: "exceeds per_transaction limit", confidence: 0.98 },
  { verdict: "DENY", reason: "vendor not in allowlist", confidence: 0.99 },
  { verdict: "DENY", reason: "exceeds daily volume limit", confidence: 0.97 },
  { verdict: "REQUIRE_APPROVAL", reason: "amount exceeds approval threshold", confidence: 0.90 },
  { verdict: "REQUIRE_APPROVAL", reason: "new vendor requires approval", confidence: 0.85 },
  { verdict: "REQUIRE_APPROVAL", reason: "amount exceeds approval threshold", confidence: 0.88 },
];

const VENDORS = [
  "compute-provider.io",
  "api.gpu-cloud.com",
  "data-oracle.network",
  "inference-endpoint.ai",
  "storage.solana.org",
  "cdn.img-gen.xyz",
  "vector-db.dev",
  "monitoring.prometheus.io",
];

async function main() {
  console.log("Seeding Intaglio demo data...");

  // 1. Insert operator
  const { data: operator, error: opErr } = await supabase
    .from("operators")
    .insert({
      name: "Acme GmbH",
      legal_entity: "Acme GmbH",
      country_code: "DE",
      billing_email: "[OPERATOR_EMAIL]",
    })
    .select()
    .single();

  if (opErr) {
    console.error("Failed to insert operator:", opErr);
    process.exit(1);
  }
  console.log(`✅ Operator created: ${operator.id}`);

  // 2. Read the APL policy source
  const policySource = `# Level 3 conformance — hash-chained audit records.
# Any implementation that generates AuditRecords MUST satisfy:
#
#  1. Every AuditRecord contains \`self_hash\`, \`prev_record_hash\`, \`policy_hash\`,
#     \`agent_id\`, \`operator_id\`, \`action\`, \`decision\`, \`obligations_emitted\`,
#     \`timestamp\`, \`record_id\`, \`intaglio_version\`.
#
#  2. self_hash = sha256( canonical(record_without_self_hash) + prev_record_hash )
#     where canonical() is deterministic sorted-key JSON.
#
#  3. The genesis record MUST have
#     prev_record_hash = "sha256:0000000000000000000000000000000000000000000000000000000000000000"
#
#  4. Any single-byte mutation to any field breaks self_hash verification.
#
#  5. Removing or reordering records breaks the chain at the mutation point.

policy "acme-purchase-policy" {
  version  = "1.0.0"
  operator = "org:acme-gmbh"
  agent    = "purchase-agent-v1"

  scope {
    rails = ["x402"]
  }

  limit {
    per_transaction = 2000 USD
  }

  obligation {
    log_to            = "solana:devnet"
    retention         = "7y"
    audit_exports     = ["eu-ai-act-article-12", "mica-68-70"]
  }
}`;

  // Policy hash
  const policyHash = sha256(policySource);

  // 3. Insert agent first (policies need agent_id)
  const { data: agent, error: agErr } = await supabase
    .from("agents")
    .insert({
      operator_id: operator.id,
      slug: "purchase-agent-v1",
      display_name: "Purchase Agent v1",
    })
    .select()
    .single();

  if (agErr) {
    console.error("Failed to insert agent:", agErr);
    process.exit(1);
  }
  console.log(`✅ Agent created: ${agent.id}`);

  // 4. Insert policy
  const { data: policy, error: polErr } = await supabase
    .from("policies")
    .insert({
      operator_id: operator.id,
      agent_id: agent.id,
      version: "1.0.0",
      source: policySource,
      hash: policyHash,
      active: true,
    })
    .select()
    .single();

  if (polErr) {
    console.error("Failed to insert policy:", polErr);
    process.exit(1);
  }
  console.log(`✅ Policy created: ${policy.id}`);

  // 5. Build audit records with hash chain
  const records: Array<Record<string, unknown>> = [];
  const now = Date.now();
  const DAY_MS = 86400000;

  let prevHash = GENESIS_HASH;
  // Generate deterministic timestamps spread across 14 days (oldest first)
  const timestamps: Date[] = [];
  for (let i = 0; i < DECISIONS.length; i++) {
    const daysAgo = 13 - (i * 13) / (DECISIONS.length - 1); // 13 days ago → now
    timestamps.push(new Date(now - daysAgo * DAY_MS));
  }

  for (let i = 0; i < DECISIONS.length; i++) {
    const dec = DECISIONS[i];
    const amount = Math.floor(Math.random() * 1951) + 50;
    const vendor = VENDORS[Math.floor(Math.random() * VENDORS.length)];
    const timestamp = timestamps[i];
    const recordId = randomUUID();

    const record = {
      prev_record_hash: prevHash,
      record_id: recordId,
      operator_id: operator.id,
      agent_id: agent.id,
      policy_hash: policyHash,
      intaglio_version: "0.1.0",
      timestamp: timestamp.toISOString(),
      action: {
        type: "x402_payment",
        target: vendor,
        amount: amount,
        currency: "USDC",
        chain: "solana",
      },
      decision: {
        verdict: dec.verdict,
        reason: dec.reason,
        confidence: dec.confidence,
      },
      obligations_emitted: dec.verdict === "APPROVE"
        ? ["log_to_solana:devnet", "export_eu_ai_act_art12"]
        : [],
    };

    // Compute self_hash: sha256(canonical(record) + prev_record_hash)
    const recordForHash = { ...record };
    delete recordForHash.prev_record_hash;
    const canonicalRecord = canonical(recordForHash as Record<string, unknown>);
    // self_hash = sha256(canonical(record_without_self_hash) + prev_record_hash)
    // Where prev_record_hash is the PREVIOUS record's self_hash (or genesis)
    const selfHash = sha256(canonicalRecord + record.prev_record_hash);

    prevHash = selfHash;

    records.push({
      operator_id: record.operator_id,
      agent_id: record.agent_id,
      policy_id: policy.id,
      policy_hash: record.policy_hash,
      record_uuid: record.record_id,
      action: record.action,
      decision: record.decision,
      obligations_emitted: record.obligations_emitted,
      prev_record_hash: record.prev_record_hash,
      self_hash: selfHash,
      created_at: record.timestamp,
    });
  }

  // Insert all audit records sequentially (hash chain dependency in DB trigger)
  for (let i = 0; i < records.length; i++) {
    const { error: recErr } = await supabase
      .from("audit_records")
      .insert(records[i]);

    if (recErr) {
      console.error(`Failed to insert audit record ${i + 1}:`, recErr);
      console.error("Record data:", JSON.stringify(records[i], null, 2));
      process.exit(1);
    }
    console.log(`✅ Audit record ${i + 1}/${records.length} inserted`);
  }

  console.log("\n🎉 Seed complete!");
  console.log(`  Operator: Acme GmbH (${operator.id})`);
  console.log(`  Agent: purchase-agent-v1 (${agent.id})`);
  console.log(`  Policy: acme-purchase-policy v1.0.0 (${policy.id})`);
  console.log(`  Audit records: ${records.length}`);
  console.log(`  Decisions: 12 APPROVE, 5 DENY, 3 REQUIRE_APPROVAL`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
