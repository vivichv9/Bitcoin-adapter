function ensureHex(rawHex) {
  return /^[0-9a-fA-F]+$/.test(rawHex) && rawHex.length % 2 === 0;
}

export function buildSendRawTransactionParams(rawTxHex) {
  const value = String(rawTxHex ?? "").trim().toLowerCase();
  if (!ensureHex(value)) {
    throw new Error("sendrawtransaction: требуется валидный hex");
  }
  return [value];
}

export function buildGenerateBlockParams(address, transactions = []) {
  const outputAddress = String(address ?? "").trim();
  if (outputAddress.length < 10) {
    throw new Error("generateblock: требуется корректный адрес");
  }

  const txs = transactions
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);

  return [outputAddress, txs];
}

export function buildTestMempoolAcceptParams(rawTxHex, maxFeeRate = null) {
  const value = String(rawTxHex ?? "").trim().toLowerCase();
  if (!ensureHex(value)) {
    throw new Error("testmempoolaccept: требуется валидный hex");
  }

  const txs = [value];
  if (maxFeeRate === null || maxFeeRate === undefined) {
    return [txs];
  }

  if (typeof maxFeeRate !== "number" || Number.isNaN(maxFeeRate) || maxFeeRate < 0) {
    throw new Error("testmempoolaccept: maxFeeRate должен быть числом >= 0");
  }

  return [txs, maxFeeRate];
}

export function buildRpcEndpoint(nodeConfig) {
  const wallet = nodeConfig.wallet ? `/wallet/${encodeURIComponent(nodeConfig.wallet)}` : "";
  return `${nodeConfig.protocol}://${nodeConfig.host}:${nodeConfig.port}${wallet}`;
}

export async function callRpcProxy(nodeConfig, method, params) {
  const response = await fetch("/api/rpc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      endpoint: buildRpcEndpoint(nodeConfig),
      username: nodeConfig.username,
      password: nodeConfig.password,
      method,
      params
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message ?? "RPC proxy error");
  }

  if (payload.error) {
    throw new Error(formatRpcError(payload.error));
  }

  return payload.result;
}

export function formatRpcError(error) {
  if (!error) {
    return "Неизвестная RPC ошибка";
  }

  const code = error.code !== undefined ? `code=${error.code}` : "code=unknown";
  const message = error.message ?? "RPC error";
  return `${code}: ${message}`;
}

export function formatMempoolAcceptResult(entry) {
  if (!entry || typeof entry !== "object") {
    return { valid: false, reason: "Пустой ответ testmempoolaccept", txid: null, details: null };
  }

  const valid = Boolean(entry.allowed);
  const reason = valid
    ? "Подпись и политика mempool приняты"
    : entry["reject-reason"] ?? "Транзакция отклонена (без причины)";

  return {
    valid,
    reason,
    txid: entry.txid ?? null,
    details: entry
  };
}
