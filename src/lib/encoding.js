export function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex) {
  if (!/^[0-9a-fA-F]*$/.test(hex) || hex.length % 2 !== 0) {
    throw new Error("Некорректный hex");
  }

  const clean = hex.toLowerCase();
  const out = new Uint8Array(clean.length / 2);

  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }

  return out;
}

export function utf8ToHex(value) {
  const bytes = new TextEncoder().encode(value);
  return bytesToHex(bytes);
}

export function toLittleEndianHex(value, byteLength) {
  let big = BigInt(value);
  const out = new Uint8Array(byteLength);

  for (let i = 0; i < byteLength; i += 1) {
    out[i] = Number(big & 0xffn);
    big >>= 8n;
  }

  return bytesToHex(out);
}

export function encodeVarInt(value) {
  const v = BigInt(value);

  if (v < 0xfdn) {
    return toLittleEndianHex(v, 1);
  }

  if (v <= 0xffffn) {
    return `fd${toLittleEndianHex(v, 2)}`;
  }

  if (v <= 0xffffffffn) {
    return `fe${toLittleEndianHex(v, 4)}`;
  }

  return `ff${toLittleEndianHex(v, 8)}`;
}
