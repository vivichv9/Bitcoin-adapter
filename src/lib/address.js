function isCompressedPubKey(pubkeyHex) {
  return pubkeyHex.length === 66 && (pubkeyHex.startsWith("02") || pubkeyHex.startsWith("03"));
}

function isUncompressedPubKey(pubkeyHex) {
  return pubkeyHex.length === 130 && pubkeyHex.startsWith("04");
}

function toXOnlyPubKey(pubkeyHex) {
  if (isCompressedPubKey(pubkeyHex)) {
    return pubkeyHex.slice(2);
  }

  if (isUncompressedPubKey(pubkeyHex)) {
    return pubkeyHex.slice(2, 66);
  }

  throw new Error("Невозможно получить x-only pubkey: формат ключа не поддерживается");
}

export const ADDRESS_TYPES = ["p2pkh", "p2wpkh", "p2sh-p2wpkh", "p2pk", "p2tr"];

export function buildDescriptorFromPubKey(pubkeyHex, type) {
  const key = String(pubkeyHex ?? "").trim().toLowerCase();

  switch (type) {
    case "p2pkh":
      return `pkh(${key})`;
    case "p2wpkh":
      if (!isCompressedPubKey(key)) {
        throw new Error("P2WPKH поддерживает только compressed pubkey");
      }
      return `wpkh(${key})`;
    case "p2sh-p2wpkh":
      if (!isCompressedPubKey(key)) {
        throw new Error("P2SH-P2WPKH поддерживает только compressed pubkey");
      }
      return `sh(wpkh(${key}))`;
    case "p2pk":
      return `pk(${key})`;
    case "p2tr":
      return `tr(${toXOnlyPubKey(key)})`;
    default:
      throw new Error(`Неподдерживаемый тип адреса: ${type}`);
  }
}

export function buildAddressValidationParams(address) {
  const value = String(address ?? "").trim();
  if (value.length < 14) {
    throw new Error("validateaddress: адрес слишком короткий");
  }
  return [value];
}

export function formatDerivedAddressResult(items) {
  return items
    .map((item) => `${item.type}: ${item.address}`)
    .join("\n");
}
