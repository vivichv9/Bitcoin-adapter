export const FORM_SCHEMAS = {
  raw_tx: {
    fields: {
      txid: {
        label: "Prev TxID",
        required: true,
        type: "hex",
        exactLength: 64,
        hint: "64 hex-символа (32 байта)"
      },
      vout: {
        label: "Vout",
        required: true,
        type: "integer",
        min: 0,
        hint: "целое число >= 0"
      },
      amountSats: {
        label: "Amount (sats)",
        required: true,
        type: "integer",
        min: 1,
        hint: "целое число > 0"
      },
      scriptPubKey: {
        label: "scriptPubKey",
        required: true,
        type: "hex",
        evenLength: true,
        minLength: 2,
        hint: "hex-скрипт, четное число символов"
      }
    }
  },
  op_return: {
    fields: {
      payloadText: {
        label: "Payload",
        required: true,
        type: "string",
        maxBytesUtf8: 80,
        hint: "до 80 байт в UTF-8"
      }
    }
  },
  pubkey: {
    fields: {
      pubkey: {
        label: "Public key",
        required: true,
        type: "hex",
        custom: "pubkey-format",
        hint: "compressed (02/03 + 64 hex) или uncompressed (04 + 128 hex)"
      }
    }
  },
  rpc_node: {
    fields: {
      protocol: {
        label: "RPC protocol",
        required: true,
        type: "enum",
        options: ["http", "https"]
      },
      host: {
        label: "RPC host",
        required: true,
        type: "string",
        minLength: 1
      },
      port: {
        label: "RPC port",
        required: true,
        type: "integer",
        min: 1,
        max: 65535
      },
      username: {
        label: "RPC username",
        required: true,
        type: "string",
        minLength: 1
      },
      password: {
        label: "RPC password",
        required: true,
        type: "string",
        minLength: 1
      },
      wallet: {
        label: "Wallet path",
        required: false,
        type: "string"
      }
    }
  },
  generate_block: {
    fields: {
      address: {
        label: "Mining/output address",
        required: true,
        type: "string",
        minLength: 10
      }
    }
  },
  address_generation: {
    fields: {
      pubkey: {
        label: "Public key",
        required: true,
        type: "hex",
        custom: "pubkey-format"
      }
    }
  },
  address_validation: {
    fields: {
      address: {
        label: "Bitcoin address",
        required: true,
        type: "string",
        minLength: 14
      }
    }
  },
  tx_signature_check: {
    fields: {
      rawTxHex: {
        label: "Signed raw transaction hex",
        required: true,
        type: "hex",
        evenLength: true,
        minLength: 2
      },
      maxFeeRate: {
        label: "Max fee rate",
        required: false,
        type: "number",
        min: 0
      }
    }
  }
};
