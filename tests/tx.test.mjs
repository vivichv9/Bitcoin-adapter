import test from "node:test";
import assert from "node:assert/strict";
import { buildOpReturnScriptHex, buildUnsignedRawTxHex } from "../src/lib/tx.js";

test("buildUnsignedRawTxHex creates deterministic unsigned transaction", () => {
  const hex = buildUnsignedRawTxHex({
    txid: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
    vout: 1,
    amountSats: 5000,
    scriptPubKey: "76a914000000000000000000000000000000000000000088ac"
  });

  assert.equal(
    hex,
    "0200000001ffeeddccbbaa99887766554433221100ffeeddccbbaa998877665544332211000100000000ffffffff0188130000000000001976a914000000000000000000000000000000000000000088ac00000000"
  );
});

test("buildOpReturnScriptHex encodes UTF-8 payload", () => {
  const hex = buildOpReturnScriptHex("abc");
  assert.equal(hex, "6a03616263");
});

test("buildOpReturnScriptHex rejects payload larger than 80 bytes", () => {
  const oversized = "x".repeat(81);
  assert.throws(() => buildOpReturnScriptHex(oversized), /<= 80 байт/);
});

test("buildUnsignedRawTxHex rejects invalid vout", () => {
  assert.throws(
    () =>
      buildUnsignedRawTxHex({
        txid: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
        vout: -1,
        amountSats: 5000,
        scriptPubKey: "76a914000000000000000000000000000000000000000088ac"
      }),
    /vout/
  );
});

test("buildUnsignedRawTxHex rejects malformed scriptPubKey", () => {
  assert.throws(
    () =>
      buildUnsignedRawTxHex({
        txid: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
        vout: 1,
        amountSats: 5000,
        scriptPubKey: "zz"
      }),
    /scriptPubKey/
  );
});
