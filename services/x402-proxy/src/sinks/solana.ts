// @ts-nocheck
import { Connection, Keypair, Transaction, TransactionInstruction, PublicKey } from "@solana/web3.js";
import { readFileSync } from "node:fs";
import type { AuditRecord } from "@axon/engine";
import { sql } from "../db.js";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

let connection: Connection | null = null;
let payer: Keypair | null = null;

function initSolana() {
  if (connection && payer) return;
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  connection = new Connection(rpcUrl, "confirmed");

  const keypairPath = process.env.SOLANA_PAYER_KEYPAIR_PATH;
  if (!keypairPath) {
    console.warn("[axon] SOLANA_PAYER_KEYPAIR_PATH not set, Solana sink will operate in dry-run mode.");
    return;
  }

  try {
    const rawData = readFileSync(keypairPath, "utf-8");
    const secretKey = Uint8Array.from(JSON.parse(rawData));
    payer = Keypair.fromSecretKey(secretKey);
    console.log(`[axon] Solana sink active. Payer: ${payer.publicKey.toBase58()} (RPC: ${rpcUrl})`);
  } catch (err) {
    console.error(`[axon] Failed to load Solana keypair from ${keypairPath}:`, err);
  }
}

/** 
 * Idempotently anchors a single audit record to the Solana blockchain via Memo program. 
 * Returns true if properly anchored (or dry-run passed/already emitted).
 */
export async function anchorRecord(record: AuditRecord): Promise<boolean> {
  return bulkAnchor([record]);
}

/** 
 * Idempotently anchors multiple audit records in a single Solana transaction.
 */
export async function bulkAnchor(records: AuditRecord[]): Promise<boolean> {
  const pendingRecords = records.filter(
    (r) => !r.obligations_emitted?.includes("log:solana:devnet")
  );

  if (pendingRecords.length === 0) {
    return true; // nothing to do, all idempotently anchored
  }

  initSolana();

  const payloads = pendingRecords.map((r) => ({
    axon: "0.1",
    record_id: r.record_id,
    self_hash: r.self_hash,
  }));

  const memoString = JSON.stringify(payloads);

  if (!payer || !connection) {
    console.log(`[axon] (dry-run) Solana Memo Anchor: ${memoString}`);
    await markAnchored(pendingRecords);
    return true;
  }

  try {
    const tx = new Transaction().add(
      new TransactionInstruction({
        keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
        data: Buffer.from(memoString, "utf-8"),
        programId: MEMO_PROGRAM_ID,
      })
    );

    const signature = await connection.sendTransaction(tx, [payer]);
    await connection.confirmTransaction(signature, "confirmed");
    console.log(`[axon] Solana anchor successful: ${signature}`);

    await markAnchored(pendingRecords);
    return true;
  } catch (err) {
    console.error("[axon] Solana anchor failed:", err);
    return false;
  }
}

/** Updates the db array to ensure idempotency. */
async function markAnchored(records: AuditRecord[]): Promise<void> {
  const recordUuids = records.map((r) => r.record_id);
  if (recordUuids.length === 0) return;

  try {
    await sql`
      update audit_records
      set obligations_emitted = array_append(obligations_emitted, 'log:solana:devnet')
      where record_uuid = any(${recordUuids}::text[])
    `;
    
    // Update memory refs to prevent double-sends in current process
    for (const r of records) {
      if (!r.obligations_emitted) r.obligations_emitted = [];
      if (!r.obligations_emitted.includes("log:solana:devnet")) {
        r.obligations_emitted.push("log:solana:devnet");
      }
    }
  } catch (dbErr) {
    console.error("[axon] Failed to mark records as obligations_emitted in DB:", dbErr);
  }
}
