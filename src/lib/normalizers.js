function parseStrictInteger(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) ? value : Number.NaN;
  }

  if (typeof value !== "string") {
    return Number.NaN;
  }

  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) {
    return Number.NaN;
  }

  return Number.parseInt(trimmed, 10);
}

function parseStrictNumberOrNull(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const stringValue = String(value).trim();
  if (stringValue.length === 0) {
    return null;
  }

  if (!/^-?\d+(\.\d+)?$/.test(stringValue)) {
    return Number.NaN;
  }

  return Number.parseFloat(stringValue);
}

export function normalizeRawTxInput(rawInput) {
  return {
    txid: String(rawInput.txid ?? "").trim().toLowerCase(),
    vout: parseStrictInteger(rawInput.vout),
    amountSats: parseStrictInteger(rawInput.amountSats),
    scriptPubKey: String(rawInput.scriptPubKey ?? "").trim().toLowerCase()
  };
}

export function normalizeOpReturnInput(rawInput) {
  return {
    payloadText: String(rawInput.payloadText ?? "")
  };
}

export function normalizePubKeyInput(rawInput) {
  return {
    pubkey: String(rawInput.pubkey ?? "").trim().toLowerCase()
  };
}

export function normalizeRpcNodeInput(rawInput) {
  return {
    protocol: String(rawInput.protocol ?? "http").trim().toLowerCase(),
    host: String(rawInput.host ?? "").trim(),
    port: parseStrictInteger(rawInput.port),
    username: String(rawInput.username ?? "").trim(),
    password: String(rawInput.password ?? "").trim(),
    wallet: String(rawInput.wallet ?? "").trim()
  };
}

export function normalizeGenerateBlockInput(rawInput) {
  return {
    address: String(rawInput.address ?? "").trim()
  };
}

export function normalizeAddressGenerationInput(rawInput) {
  return {
    pubkey: String(rawInput.pubkey ?? "").trim().toLowerCase()
  };
}

export function normalizeAddressValidationInput(rawInput) {
  return {
    address: String(rawInput.address ?? "").trim()
  };
}

export function normalizeTxSignatureCheckInput(rawInput) {
  return {
    rawTxHex: String(rawInput.rawTxHex ?? "").trim().toLowerCase(),
    maxFeeRate: parseStrictNumberOrNull(rawInput.maxFeeRate)
  };
}
