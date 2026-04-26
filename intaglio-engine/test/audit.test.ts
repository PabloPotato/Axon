// Audit chain tests — tamper detection, canonicalization, hash stability.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  buildAuditRecord,
  canonicalize,
  hashPolicy,
  inMemoryChain,
  GENESIS_HASH,
} from "../src/audit.js";
import type { Policy, AgentAction, Decision } from "../src/types.js";

const policy: Policy = {
  id: "p1",
  version: "1.0.0",
  operator: "org:x",
  agent: "bot",
  scope: { rails: ["x402"] },
  limit: { per_transaction: { value: 100, currency: "USD" } },
  obligation: { log_to: "solana:mainnet" },
};

const action: AgentAction = {
  rail: "x402",
  endpoint: "api.example.com/x",
  amount: { value: 50, currency: "USD" },
  timestamp: "2026-05-01T10:00:00Z",
};

const decision: Decision = { outcome: "APPROVE", reason: null };

describe("canonicalize — key order independence", () => {
  test("sorts keys deterministically", () => {
    assert.equal(
      canonicalize({ b: 1, a: 2 }),
      canonicalize({ a: 2, b: 1 }),
    );
  });

  test("handles nested objects and arrays", () => {
    const v = canonicalize({ x: [1, { b: 2, a: 1 }], y: null });
    assert.equal(v, '{"x":[1,{"a":1,"b":2}],"y":null}');
  });
});

describe("hashPolicy — stability", () => {
  test("same policy → same hash", () => {
    assert.equal(hashPolicy(policy), hashPolicy(policy));
  });

  test("mutation → different hash", () => {
    const mutated = { ...policy, version: "1.0.1" };
    assert.notEqual(hashPolicy(policy), hashPolicy(mutated));
  });

  test("hash has sha256: prefix", () => {
    assert.match(hashPolicy(policy), /^sha256:[0-9a-f]{64}$/);
  });
});

describe("buildAuditRecord", () => {
  test("produces a self_hash and references prev", () => {
    const r = buildAuditRecord({
      policy,
      action,
      decision,
      prev_record_hash: GENESIS_HASH,
      obligations_emitted: ["log:solana:mainnet"],
    });
    assert.match(r.self_hash, /^sha256:[0-9a-f]{64}$/);
    assert.equal(r.prev_record_hash, GENESIS_HASH);
    assert.equal(r.policy_hash, hashPolicy(policy));
  });
});

describe("inMemoryChain — verification", () => {
  test("valid chain verifies", () => {
    const chain = inMemoryChain();
    const records = [];
    let prev = GENESIS_HASH;
    for (let i = 0; i < 3; i++) {
      const r = buildAuditRecord({
        policy,
        action,
        decision,
        prev_record_hash: prev,
        obligations_emitted: [],
      });
      chain.append(r);
      records.push(r);
      prev = r.self_hash;
    }
    const v = chain.verify(records);
    assert.equal(v.ok, true);
  });

  test("tampering with action breaks verification", () => {
    const chain = inMemoryChain();
    const records = [];
    let prev = GENESIS_HASH;
    for (let i = 0; i < 3; i++) {
      const r = buildAuditRecord({
        policy,
        action,
        decision,
        prev_record_hash: prev,
        obligations_emitted: [],
      });
      chain.append(r);
      records.push(r);
      prev = r.self_hash;
    }
    // Tamper: change the amount on record 1
    const tampered = records.map((r, i) =>
      i === 1
        ? { ...r, action: { ...r.action, amount: { value: 9999, currency: "USD" } } }
        : r,
    );
    const v = chain.verify(tampered);
    assert.equal(v.ok, false);
    if (!v.ok) {
      assert.equal(v.broken_at, 1);
      assert.match(v.reason, /self_hash mismatch/);
    }
  });

  test("broken prev link detected", () => {
    const chain = inMemoryChain();
    const records = [];
    let prev = GENESIS_HASH;
    for (let i = 0; i < 2; i++) {
      const r = buildAuditRecord({
        policy,
        action,
        decision,
        prev_record_hash: prev,
        obligations_emitted: [],
      });
      chain.append(r);
      records.push(r);
      prev = r.self_hash;
    }
    // Rewrite prev_record_hash on record 1 to a forged value.
    const tampered = [records[0], { ...records[1], prev_record_hash: GENESIS_HASH }];
    const v = chain.verify(tampered);
    assert.equal(v.ok, false);
    if (!v.ok) {
      assert.equal(v.broken_at, 1);
      assert.match(v.reason, /prev_record_hash mismatch/);
    }
  });

  test("last_hash advances with each append", () => {
    const chain = inMemoryChain();
    assert.equal(chain.last_hash(), GENESIS_HASH);
    const r = buildAuditRecord({
      policy,
      action,
      decision,
      prev_record_hash: chain.last_hash(),
      obligations_emitted: [],
    });
    chain.append(r);
    assert.equal(chain.last_hash(), r.self_hash);
  });
});
