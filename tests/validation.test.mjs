import test from "node:test";
import assert from "node:assert/strict";
import { validateBySchema } from "../src/lib/validation.js";

test("raw_tx schema accepts valid input", () => {
  const errors = validateBySchema("raw_tx", {
    txid: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
    vout: 0,
    amountSats: 1000,
    scriptPubKey: "76a914000000000000000000000000000000000000000088ac"
  });

  assert.deepEqual(errors, []);
});

test("raw_tx schema rejects invalid txid and amount", () => {
  const errors = validateBySchema("raw_tx", {
    txid: "xyz",
    vout: 0,
    amountSats: 0,
    scriptPubKey: "76a914000000000000000000000000000000000000000088ac"
  });

  assert.equal(errors.length, 2);
});

test("op_return schema enforces utf8 byte limit", () => {
  const errors = validateBySchema("op_return", {
    payloadText: "x".repeat(81)
  });

  assert.equal(errors.length, 1);
  assert.match(errors[0], /<= 80 байт/);
});

test("pubkey schema validates format", () => {
  const errors = validateBySchema("pubkey", {
    pubkey: "02" + "11".repeat(32)
  });

  assert.deepEqual(errors, []);
});

test("rpc_node schema validates required fields", () => {
  const errors = validateBySchema("rpc_node", {
    protocol: "http",
    host: "127.0.0.1",
    port: 18443,
    username: "bitcoinrpc",
    password: "secret",
    wallet: ""
  });

  assert.deepEqual(errors, []);
});

test("generate_block schema requires address", () => {
  const errors = validateBySchema("generate_block", {
    address: "abc"
  });

  assert.equal(errors.length, 1);
  assert.match(errors[0], /длина должна быть >= 10/);
});

test("address_generation schema validates pubkey", () => {
  const errors = validateBySchema("address_generation", {
    pubkey: "02" + "aa".repeat(32)
  });

  assert.deepEqual(errors, []);
});

test("address_validation schema validates length", () => {
  const errors = validateBySchema("address_validation", {
    address: "12345678901234"
  });

  assert.deepEqual(errors, []);
});

test("tx_signature_check schema validates signed hex with optional maxFeeRate", () => {
  const valid = validateBySchema("tx_signature_check", {
    rawTxHex: "aabb",
    maxFeeRate: null
  });
  assert.deepEqual(valid, []);

  const invalid = validateBySchema("tx_signature_check", {
    rawTxHex: "zz",
    maxFeeRate: -1
  });
  assert.equal(invalid.length, 2);
});
