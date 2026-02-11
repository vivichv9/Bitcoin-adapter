import { encodeVarInt, toLittleEndianHex } from "./encoding.js";

function reverseHexBytes(hex) {
  return hex.match(/../g).reverse().join("");
}

function isHex(value) {
  return typeof value === "string" && /^[0-9a-f]+$/i.test(value);
}

function assertUnsignedRawTxInput(input) {
  if (!isHex(input.txid) || input.txid.length !== 64) {
    throw new Error("Некорректный txid: ожидается hex длиной 64");
  }

  if (!Number.isInteger(input.vout) || input.vout < 0 || input.vout > 0xffffffff) {
    throw new Error("Некорректный vout: ожидается целое число в диапазоне uint32");
  }

  if (!Number.isInteger(input.amountSats) || input.amountSats <= 0 || input.amountSats > Number.MAX_SAFE_INTEGER) {
    throw new Error("Некорректный amountSats: ожидается целое число > 0 и <= Number.MAX_SAFE_INTEGER");
  }

  if (!isHex(input.scriptPubKey) || input.scriptPubKey.length % 2 !== 0) {
    throw new Error("Некорректный scriptPubKey: ожидается hex с четной длиной");
  }
}

export function buildUnsignedRawTxHex(input) {
  assertUnsignedRawTxInput(input);

  const version = toLittleEndianHex(2, 4);
  const inputCount = encodeVarInt(1);
  const txidLE = reverseHexBytes(input.txid.toLowerCase());
  const vout = toLittleEndianHex(input.vout, 4);
  const scriptSigSize = "00";
  const sequence = "ffffffff";
  const outputCount = encodeVarInt(1);
  const value = toLittleEndianHex(input.amountSats, 8);
  const scriptPubKey = input.scriptPubKey.toLowerCase();
  const scriptPubKeySize = encodeVarInt(scriptPubKey.length / 2);
  const locktime = "00000000";

  return [
    version,
    inputCount,
    txidLE,
    vout,
    scriptSigSize,
    sequence,
    outputCount,
    value,
    scriptPubKeySize,
    scriptPubKey,
    locktime
  ].join("");
}

export function buildOpReturnScriptHex(text) {
  if (typeof text !== "string") {
    throw new Error("OP_RETURN payload должен быть строкой");
  }

  const payload = new TextEncoder().encode(text);

  if (payload.length > 80) {
    throw new Error("OP_RETURN payload должен быть <= 80 байт");
  }

  const pushOpcode = payload.length.toString(16).padStart(2, "0");
  const payloadHex = [...payload].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `6a${pushOpcode}${payloadHex}`;
}
