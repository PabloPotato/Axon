// Parser tests — syntax edge cases and error messages.
// Run with: npm test

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { parse } from "../src/parser.js";

describe("parser — minimal valid policy", () => {
  test("parses a policy with only required fields", () => {
    const src = `
      policy "minimal" {
        operator = "org:a"
        agent    = "bot"
        scope { rails = ["x402"] }
        limit { per_transaction = 100 USD }
        obligation { log_to = "solana:mainnet" }
      }
    `;
    const p = parse(src);
    assert.equal(p.id, "minimal");
    assert.equal(p.operator, "org:a");
    assert.equal(p.agent, "bot");
    assert.deepEqual(p.scope.rails, ["x402"]);
    assert.deepEqual(p.limit.per_transaction, { value: 100, currency: "USD" });
    assert.equal(p.obligation.log_to, "solana:mainnet");
  });
});

describe("parser — amounts, durations, lists", () => {
  test("parses amount literals", () => {
    const p = parse(`
      policy "x" {
        operator = "o" agent = "a"
        scope {}
        limit { per_day = 2000 EUR }
        obligation { log_to = "solana:mainnet" }
      }
    `);
    assert.deepEqual(p.limit.per_day, { value: 2000, currency: "EUR" });
  });

  test("parses nested lists", () => {
    const p = parse(`
      policy "x" {
        operator = "o" agent = "a"
        scope { rails = ["x402", "mpp"] endpoints = ["a.com/*", "b.com/*"] }
        limit {}
        obligation { log_to = "solana:mainnet" }
      }
    `);
    assert.deepEqual(p.scope.rails, ["x402", "mpp"]);
    assert.deepEqual(p.scope.endpoints, ["a.com/*", "b.com/*"]);
  });

  test("ignores # comments", () => {
    const p = parse(`
      # top comment
      policy "x" {
        operator = "o" # inline
        agent    = "a"
        scope {}
        limit {}
        obligation { log_to = "solana:mainnet" }
      }
    `);
    assert.equal(p.id, "x");
  });
});

describe("parser — errors", () => {
  test("missing operator fails validation", () => {
    assert.throws(
      () =>
        parse(`
          policy "x" {
            agent = "a"
            scope {} limit {} obligation { log_to = "solana:mainnet" }
          }
        `),
      /operator/i,
    );
  });

  test("missing agent fails validation", () => {
    assert.throws(
      () =>
        parse(`
          policy "x" {
            operator = "o"
            scope {} limit {} obligation { log_to = "solana:mainnet" }
          }
        `),
      /agent/i,
    );
  });

  test("truncated input throws", () => {
    assert.throws(() => parse(`policy "x"`), /unexpected end of input/i);
  });

  test("unexpected character throws", () => {
    assert.throws(() => parse(`policy @bad`), /unexpected character/i);
  });
});
