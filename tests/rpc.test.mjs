import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGenerateBlockParams,
  buildRpcEndpoint,
  buildSendRawTransactionParams,
  buildTestMempoolAcceptParams,
  formatMempoolAcceptResult,
  formatRpcError
} from "../src/lib/rpc.js";

test("buildSendRawTransactionParams accepts valid hex", () => {
  const params = buildSendRawTransactionParams("aabbcc");
  assert.deepEqual(params, ["aabbcc"]);
});

test("buildSendRawTransactionParams rejects invalid hex", () => {
  assert.throws(() => buildSendRawTransactionParams("zz"), /валидный hex/);
});

test("buildGenerateBlockParams composes params", () => {
  const params = buildGenerateBlockParams("bcrt1qexampleaddress", ["aa", " ", "bb"]);
  assert.deepEqual(params, ["bcrt1qexampleaddress", ["aa", "bb"]]);
});

test("buildRpcEndpoint supports wallet path", () => {
  const endpoint = buildRpcEndpoint({
    protocol: "http",
    host: "127.0.0.1",
    port: 18443,
    wallet: "test-wallet"
  });
  assert.equal(endpoint, "http://127.0.0.1:18443/wallet/test-wallet");
});

test("formatRpcError formats code and message", () => {
  const message = formatRpcError({ code: -26, message: "non-mandatory-script-verify-flag" });
  assert.equal(message, "code=-26: non-mandatory-script-verify-flag");
});

test("buildTestMempoolAcceptParams composes rpc params", () => {
  const withoutFee = buildTestMempoolAcceptParams("aabb");
  assert.deepEqual(withoutFee, [["aabb"]]);

  const withFee = buildTestMempoolAcceptParams("aabb", 0.1);
  assert.deepEqual(withFee, [["aabb"], 0.1]);
});

test("formatMempoolAcceptResult formats verdict and reason", () => {
  const accepted = formatMempoolAcceptResult({ allowed: true, txid: "abc" });
  assert.equal(accepted.valid, true);
  assert.match(accepted.reason, /приняты/);

  const rejected = formatMempoolAcceptResult({ allowed: false, "reject-reason": "mandatory-script-verify-flag-failed" });
  assert.equal(rejected.valid, false);
  assert.equal(rejected.reason, "mandatory-script-verify-flag-failed");
});
