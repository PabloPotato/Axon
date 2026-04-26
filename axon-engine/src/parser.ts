// axon-engine — parser.ts
// Minimal APL v0.1 parser. Recursive-descent, indentation-insensitive, single-pass.
//
// Grammar (informal):
//   policy   := "policy" string "{" body "}"
//   body     := (field | block)*
//   field    := identifier "=" value
//   block    := identifier "{" (field | block)* "}"
//   value    := string | number currency? | boolean | list | duration | identifier
//   list     := "[" (value ("," value)*)? "]"
//
// This parser is intentionally ~200 lines. A full PEG grammar lives at apl/grammar.peg.

import type { Policy, Scope, Limit, Require, Deny, Obligation, Approval, Amount } from "./types.js";

type Token =
  | { kind: "ident"; value: string; line: number }
  | { kind: "string"; value: string; line: number }
  | { kind: "number"; value: number; line: number }
  | { kind: "symbol"; value: string; line: number }
  | { kind: "bool"; value: boolean; line: number };

function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  while (i < src.length) {
    const c = src[i]!;
    if (c === "#") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (c === "\n") {
      line++;
      i++;
      continue;
    }
    if (c === " " || c === "\t" || c === "\r") {
      i++;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      while (j < src.length && src[j]! !== '"') {
        if (src[j]! === "\\" && j + 1 < src.length) j += 2;
        else j++;
      }
      tokens.push({ kind: "string", value: src.slice(i + 1, j), line });
      i = j + 1;
      continue;
    }
    if (c === "/" && src[i + 1]! === "/") {
      // inline regex literal — wrapped in //
      let j = i + 2;
      while (j < src.length && !(src[j]! === "/" && src[j - 1]! !== "\\")) j++;
      tokens.push({ kind: "string", value: src.slice(i + 2, j), line });
      i = j + 1;
      continue;
    }
    if ("{}[]=,".includes(c)) {
      tokens.push({ kind: "symbol", value: c, line });
      i++;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "-" && /[0-9]/.test(src[i + 1] ?? ""))) {
      let j = i;
      if (src[j]! === "-") j++;
      while (j < src.length && /[0-9.]/.test(src[j]!)) j++;
      tokens.push({ kind: "number", value: parseFloat(src.slice(i, j)), line });
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_.:\-]/.test(src[j]!)) j++;
      const ident = src.slice(i, j);
      if (ident === "true") tokens.push({ kind: "bool", value: true, line });
      else if (ident === "false") tokens.push({ kind: "bool", value: false, line });
      else tokens.push({ kind: "ident", value: ident, line });
      i = j;
      continue;
    }
    throw new Error(`APL parse error: unexpected character '${c}' on line ${line}`);
  }
  return tokens;
}

export function parse(src: string): Policy {
  const tokens = tokenize(src);
  let pos = 0;

  const peek = (): Token | undefined => tokens[pos];
  const eat = (): Token => {
    const t = tokens[pos++];
    if (!t) throw new Error("APL parse error: unexpected end of input");
    return t;
  };
  function expect<K extends Token["kind"]>(
    kind: K,
    value?: string,
  ): Extract<Token, { kind: K }> {
    const t = eat();
    if (t.kind !== kind || (value !== undefined && t.value !== value)) {
      throw new Error(
        `APL parse error at line ${t.line}: expected ${kind}${value ? ` '${value}'` : ""}, got ${t.kind} '${t.value}'`,
      );
    }
    return t as Extract<Token, { kind: K }>;
  }

  const parseValue = (): unknown => {
    const t = peek();
    if (!t) throw new Error("APL parse error: unexpected end of input in value");
    if (t.kind === "string") {
      eat();
      return t.value;
    }
    if (t.kind === "number") {
      eat();
      const next = peek();
      // number + currency literal (e.g., "500 USD") or number + unit (e.g., "7 y")
      if (next && next.kind === "ident" && /^[A-Z]{3,6}$/.test(next.value)) {
        eat();
        return { value: t.value, currency: next.value } satisfies Amount;
      }
      if (next && next.kind === "ident" && ["s", "m", "h", "d", "y"].includes(next.value)) {
        eat();
        return `${t.value}${next.value}`;
      }
      if (next && next.kind === "ident" && next.value === "per") {
        eat();
        const windowTok = expect("ident");
        return { count: t.value, window: windowTok.value };
      }
      return t.value;
    }
    if (t.kind === "bool") {
      eat();
      return t.value;
    }
    if (t.kind === "ident") {
      eat();
      return t.value;
    }
    if (t.kind === "symbol" && t.value === "[") {
      eat();
      const arr: unknown[] = [];
      while (peek() && !(peek()!.kind === "symbol" && peek()!.value === "]")) {
        arr.push(parseValue());
        const maybeComma = peek();
        if (maybeComma && maybeComma.kind === "symbol" && maybeComma.value === ",") eat();
      }
      expect("symbol", "]");
      return arr;
    }
    throw new Error(`APL parse error at line ${t.line}: invalid value ${t.kind} '${t.value}'`);
  };

  const parseBody = (): Record<string, unknown> => {
    const obj: Record<string, unknown> = {};
    while (peek() && !(peek()!.kind === "symbol" && peek()!.value === "}")) {
      const ident = expect("ident").value;
      const next = peek();
      if (next && next.kind === "symbol" && next.value === "=") {
        eat();
        obj[ident] = parseValue();
      } else if (next && next.kind === "symbol" && next.value === "{") {
        eat();
        obj[ident] = parseBody();
        expect("symbol", "}");
      } else {
        throw new Error(`APL parse error at line ${next?.line}: expected '=' or '{' after '${ident}'`);
      }
    }
    return obj;
  };

  expect("ident", "policy");
  const id = expect("string").value;
  expect("symbol", "{");
  const body = parseBody();
  expect("symbol", "}");

  const asBlock = <T>(key: keyof Policy): T => (body[key as string] ?? undefined) as T;

  const policy: Policy = {
    id,
    version: (body["version"] as string) ?? "0.0.0",
    description: body["description"] as string | undefined,
    operator: (body["operator"] as string) ?? "",
    agent: (body["agent"] as string) ?? "",
    identity: body["identity"] as string | undefined,
    inherit_from: body["inherit_from"] as string | undefined,

    scope: (body["scope"] as Scope) ?? {},
    limit: (body["limit"] as Limit) ?? {},
    require: asBlock<Require>("require"),
    deny: asBlock<Deny>("deny"),
    obligation: (body["obligation"] as Obligation) ?? ({ log_to: "solana:mainnet" } as Obligation),
    approval: asBlock<Approval>("approval"),
  };

  if (!policy.operator) throw new Error(`APL parse error: policy '${id}' is missing required field 'operator'`);
  if (!policy.agent) throw new Error(`APL parse error: policy '${id}' is missing required field 'agent'`);

  return policy;
}
