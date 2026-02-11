import assert from "node:assert/strict";
import test from "node:test";

const rpcUrl = process.env.BITCOIN_RPC_URL;
const rpcUser = process.env.BITCOIN_RPC_USER;
const rpcPass = process.env.BITCOIN_RPC_PASS;

const hasRpcEnv = Boolean(rpcUrl && rpcUser && rpcPass);

async function rpcCall(method, params = []) {
  const auth = Buffer.from(`${rpcUser}:${rpcPass}`).toString("base64");
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`
    },
    body: JSON.stringify({
      jsonrpc: "1.0",
      id: "bitcoin-adapter-integration",
      method,
      params
    })
  });

  assert.equal(response.ok, true, `HTTP status ${response.status}`);
  const payload = await response.json();
  assert.equal(payload.error, null, payload.error ? payload.error.message : "RPC error");
  return payload.result;
}

test("integration: getblockchaininfo is available", { skip: !hasRpcEnv }, async () => {
  const result = await rpcCall("getblockchaininfo");
  assert.equal(typeof result.chain, "string");
  assert.equal(typeof result.blocks, "number");
});

test("integration: getnetworkinfo is available", { skip: !hasRpcEnv }, async () => {
  const result = await rpcCall("getnetworkinfo");
  assert.equal(typeof result.version, "number");
  assert.equal(typeof result.subversion, "string");
});

test("integration: validateaddress works for configured chain", { skip: !hasRpcEnv }, async () => {
  const candidate = process.env.BITCOIN_TEST_ADDRESS ?? "bcrt1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp3s7t7";
  const result = await rpcCall("validateaddress", [candidate]);
  assert.equal(typeof result.isvalid, "boolean");
});
