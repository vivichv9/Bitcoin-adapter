import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeAddressGenerationInput,
  normalizeAddressValidationInput,
  normalizeOpReturnInput,
  normalizePubKeyInput,
  normalizeRawTxInput,
  normalizeTxSignatureCheckInput
} from "../src/lib/normalizers.js";

test("normalizeRawTxInput canonicalizes string fields and parses integers", () => {
  const result = normalizeRawTxInput({
    txid: "  AABB  ",
    vout: " 7 ",
    amountSats: "1500",
    scriptPubKey: "  76AA  "
  });

  assert.deepEqual(result, {
    txid: "aabb",
    vout: 7,
    amountSats: 1500,
    scriptPubKey: "76aa"
  });
});

test("normalizeRawTxInput sets NaN for non-integer numeric fields", () => {
  const result = normalizeRawTxInput({
    txid: "00",
    vout: "1.5",
    amountSats: "abc",
    scriptPubKey: "aa"
  });

  assert.equal(Number.isNaN(result.vout), true);
  assert.equal(Number.isNaN(result.amountSats), true);
});

test("normalizePubKeyInput trims and lowercases pubkey", () => {
  const result = normalizePubKeyInput({
    pubkey: "  02ABCDEF  "
  });

  assert.deepEqual(result, { pubkey: "02abcdef" });
});

test("normalizeOpReturnInput preserves payload string", () => {
  const result = normalizeOpReturnInput({
    payloadText: "  hello  "
  });

  assert.deepEqual(result, { payloadText: "  hello  " });
});

test("normalizeAddressGenerationInput canonicalizes pubkey", () => {
  const result = normalizeAddressGenerationInput({
    pubkey: "  02AABB  "
  });

  assert.deepEqual(result, { pubkey: "02aabb" });
});

test("normalizeAddressValidationInput trims address", () => {
  const result = normalizeAddressValidationInput({
    address: "  bc1qexampleaddress  "
  });

  assert.deepEqual(result, { address: "bc1qexampleaddress" });
});

test("normalizeTxSignatureCheckInput canonicalizes hex and parses optional maxFeeRate", () => {
  const withValue = normalizeTxSignatureCheckInput({
    rawTxHex: "  AABB  ",
    maxFeeRate: "0.25"
  });

  assert.deepEqual(withValue, { rawTxHex: "aabb", maxFeeRate: 0.25 });

  const withoutValue = normalizeTxSignatureCheckInput({
    rawTxHex: "aa",
    maxFeeRate: ""
  });

  assert.deepEqual(withoutValue, { rawTxHex: "aa", maxFeeRate: null });
});
