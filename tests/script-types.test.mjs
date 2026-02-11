import assert from "node:assert/strict";
import test from "node:test";
import { formatScriptTypes, getScriptTypesForPubKey, toScriptTypesJson } from "../src/lib/script-types.js";

test("getScriptTypesForPubKey builds p2tr descriptor from x-only pubkey", () => {
  const pubkey = "02" + "11".repeat(32);
  const types = getScriptTypesForPubKey(pubkey);
  const taproot = types.find((item) => item.id === "p2tr");

  assert.equal(taproot.descriptor, `tr(${"11".repeat(32)})`);
});

test("formatScriptTypes prints scriptPubKey and address when present", () => {
  const output = formatScriptTypes([
    {
      type: "P2PK",
      descriptor: "pk(abc)",
      scriptTemplate: "<PUSH><PUBKEY>ac",
      scriptPubKey: "21abcac",
      address: "1abc",
      notes: "note"
    }
  ]);

  assert.match(output, /scriptPubKey: 21abcac/);
  assert.match(output, /address: 1abc/);
});

test("toScriptTypesJson serializes result", () => {
  const json = toScriptTypesJson([{ type: "P2PKH" }]);
  assert.equal(json, '[\n  {\n    "type": "P2PKH"\n  }\n]');
});
