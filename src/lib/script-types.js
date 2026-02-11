function toXOnlyPubKey(pubkeyHex) {
  if (pubkeyHex.length === 66 && (pubkeyHex.startsWith("02") || pubkeyHex.startsWith("03"))) {
    return pubkeyHex.slice(2);
  }

  if (pubkeyHex.length === 130 && pubkeyHex.startsWith("04")) {
    return pubkeyHex.slice(2, 66);
  }

  return null;
}

function buildP2pkScriptPubKey(pubkeyHex) {
  const pushLength = (pubkeyHex.length / 2).toString(16).padStart(2, "0");
  return `${pushLength}${pubkeyHex}ac`;
}

export function getScriptTypesForPubKey(pubkeyHex) {
  const key = pubkeyHex.toLowerCase();
  const xOnly = toXOnlyPubKey(key);

  return [
    {
      id: "p2pk",
      type: "P2PK",
      descriptor: `pk(${key})`,
      scriptTemplate: "<PUSH_PUBKEY><PUBKEY>ac",
      notes: "Классический pay-to-pubkey, напрямую тратится подписью по ключу",
      localScriptPubKey: buildP2pkScriptPubKey(key)
    },
    {
      id: "p2pkh",
      type: "P2PKH",
      descriptor: `pkh(${key})`,
      scriptTemplate: "76a914<HASH160(PUBKEY)>88ac",
      notes: "Наиболее распространенный legacy-тип"
    },
    {
      id: "p2wpkh",
      type: "P2WPKH",
      descriptor: `wpkh(${key})`,
      scriptTemplate: "0014<HASH160(PUBKEY)>",
      notes: "SegWit v0, дешевле по fee за счет witness"
    },
    {
      id: "p2sh-p2wpkh",
      type: "P2SH-P2WPKH",
      descriptor: `sh(wpkh(${key}))`,
      scriptTemplate: "a914<HASH160(REDEEM_SCRIPT)>87",
      notes: "Совместимость SegWit через P2SH"
    },
    {
      id: "p2tr",
      type: "Taproot key-path (P2TR)",
      descriptor: xOnly ? `tr(${xOnly})` : "tr(<xonly_pubkey>)",
      scriptTemplate: "5120<XONLY_PUBKEY>",
      notes: "SegWit v1, требует x-only pubkey и правила BIP341"
    }
  ];
}

export function formatScriptTypes(types) {
  return types
    .map(
      (item) =>
        [
          item.type,
          `  descriptor: ${item.descriptor}`,
          `  scriptTemplate: ${item.scriptTemplate}`,
          `  scriptPubKey: ${item.scriptPubKey ?? item.localScriptPubKey ?? "n/a"}`,
          `  address: ${item.address ?? "n/a"}`,
          `  note: ${item.notes}`,
          item.rpcError ? `  rpcError: ${item.rpcError}` : null
        ]
          .filter(Boolean)
          .join("\n")
    )
    .join("\n\n");
}

export function toScriptTypesJson(types) {
  return JSON.stringify(types, null, 2);
}
