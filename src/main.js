import { buildAddressValidationParams, buildDescriptorFromPubKey, formatDerivedAddressResult, ADDRESS_TYPES } from "./lib/address.js";
import {
  normalizeAddressGenerationInput,
  normalizeAddressValidationInput,
  normalizeGenerateBlockInput,
  normalizeOpReturnInput,
  normalizePubKeyInput,
  normalizeRawTxInput,
  normalizeRpcNodeInput,
  normalizeTxSignatureCheckInput
} from "./lib/normalizers.js";
import {
  buildGenerateBlockParams,
  buildSendRawTransactionParams,
  buildTestMempoolAcceptParams,
  callRpcProxy,
  formatMempoolAcceptResult
} from "./lib/rpc.js";
import { formatScriptTypes, getScriptTypesForPubKey, toScriptTypesJson } from "./lib/script-types.js";
import { buildOpReturnScriptHex, buildUnsignedRawTxHex } from "./lib/tx.js";
import { validateBySchema } from "./lib/validation.js";
import { createHistoryEntry, formatHistory, HISTORY_STORAGE_KEY, parseHistory, pushHistory } from "./lib/history.js";

const RPC_CONFIG_STORAGE_KEY = "bitcoin-adapter:rpc-config";

const modeEl = document.querySelector("#mode");
const rawTxFieldsEl = document.querySelector("#raw-tx-fields");
const opReturnFieldsEl = document.querySelector("#op-return-fields");
const hexFormEl = document.querySelector("#hex-form");
const errorsEl = document.querySelector("#errors");
const hexOutputEl = document.querySelector("#hex-output");
const rpcOutputEl = document.querySelector("#rpc-output");
const copyHexBtn = document.querySelector("#copy-hex");

const pubkeyFormEl = document.querySelector("#pubkey-form");
const pubkeyErrorsEl = document.querySelector("#pubkey-errors");
const scriptTypesOutputEl = document.querySelector("#script-types-output");
const scriptExportJsonBtn = document.querySelector("#script-export-json");
const scriptExportTxtBtn = document.querySelector("#script-export-txt");

const rpcConfigFormEl = document.querySelector("#rpc-config-form");
const rpcConfigErrorsEl = document.querySelector("#rpc-config-errors");
const generateBlockFormEl = document.querySelector("#generateblock-form");
const rpcActionErrorsEl = document.querySelector("#rpc-action-errors");
const rpcActionResultEl = document.querySelector("#rpc-action-result");
const sendRawBtn = document.querySelector("#sendraw-btn");

const addressGenerateFormEl = document.querySelector("#address-generate-form");
const addressGenerateErrorsEl = document.querySelector("#address-generate-errors");
const addressGenerateOutputEl = document.querySelector("#address-generate-output");
const addressValidateFormEl = document.querySelector("#address-validate-form");
const addressValidateErrorsEl = document.querySelector("#address-validate-errors");
const addressValidateOutputEl = document.querySelector("#address-validate-output");
const txSignatureCheckFormEl = document.querySelector("#tx-signature-check-form");
const txSignatureErrorsEl = document.querySelector("#tx-signature-errors");
const txSignatureResultEl = document.querySelector("#tx-signature-result");
const historyOutputEl = document.querySelector("#history-output");
const historyExportJsonBtn = document.querySelector("#history-export-json");
const historyClearBtn = document.querySelector("#history-clear");
let lastScriptTypesResult = [];

function readRawTxInput() {
  return normalizeRawTxInput({
    txid: document.querySelector("#txid").value,
    vout: document.querySelector("#vout").value,
    amountSats: document.querySelector("#amountSats").value,
    scriptPubKey: document.querySelector("#scriptPubKey").value
  });
}

function readRpcNodeInput() {
  return normalizeRpcNodeInput({
    protocol: document.querySelector("#rpc-protocol").value,
    host: document.querySelector("#rpc-host").value,
    port: document.querySelector("#rpc-port").value,
    username: document.querySelector("#rpc-username").value,
    password: document.querySelector("#rpc-password").value,
    wallet: document.querySelector("#rpc-wallet").value
  });
}

function applyRpcNodeInput(config) {
  document.querySelector("#rpc-protocol").value = config.protocol;
  document.querySelector("#rpc-host").value = config.host;
  document.querySelector("#rpc-port").value = String(config.port);
  document.querySelector("#rpc-username").value = config.username;
  document.querySelector("#rpc-password").value = config.password;
  document.querySelector("#rpc-wallet").value = config.wallet;
}

function restoreRpcConfig() {
  const raw = localStorage.getItem(RPC_CONFIG_STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    const config = normalizeRpcNodeInput(parsed);
    const hasRequiredShape =
      (config.protocol === "http" || config.protocol === "https") &&
      typeof config.host === "string" &&
      config.host.length > 0 &&
      Number.isInteger(config.port) &&
      config.port >= 1 &&
      config.port <= 65535 &&
      typeof config.username === "string";

    if (hasRequiredShape) {
      applyRpcNodeInput(config);
    }
  } catch {
    // Ignore broken local storage state.
  }
}

function saveRpcConfig(config) {
  localStorage.setItem(
    RPC_CONFIG_STORAGE_KEY,
    JSON.stringify({
      ...config,
      password: ""
    })
  );
}

function resetHexOutputs() {
  errorsEl.textContent = "";
  hexOutputEl.value = "";
  rpcOutputEl.textContent = "";
}

function clearRpcActionState() {
  rpcActionErrorsEl.textContent = "";
  rpcActionResultEl.textContent = "";
}

function clearAddressGenerationState() {
  addressGenerateErrorsEl.textContent = "";
  addressGenerateOutputEl.textContent = "";
}

function clearAddressValidationState() {
  addressValidateErrorsEl.textContent = "";
  addressValidateOutputEl.textContent = "";
}

function clearTxSignatureState() {
  txSignatureErrorsEl.textContent = "";
  txSignatureResultEl.textContent = "";
}

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

function validateRpcConfigOrShow(targetEl) {
  const config = readRpcNodeInput();
  const errors = validateBySchema("rpc_node", config);
  if (errors.length > 0) {
    targetEl.textContent = errors.join("\n");
    return null;
  }
  return config;
}

function maybeGetValidRpcConfig() {
  const config = readRpcNodeInput();
  const errors = validateBySchema("rpc_node", config);
  if (errors.length > 0) {
    return null;
  }
  return config;
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getHistoryEntries() {
  return parseHistory(localStorage.getItem(HISTORY_STORAGE_KEY));
}

function renderHistory() {
  historyOutputEl.textContent = formatHistory(getHistoryEntries());
}

function addHistory(action, payload) {
  const current = getHistoryEntries();
  const entry = createHistoryEntry(action, payload);
  const next = pushHistory(current, entry);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
  renderHistory();
}

modeEl.addEventListener("change", () => {
  const rawMode = modeEl.value === "raw_tx";
  rawTxFieldsEl.classList.toggle("hidden", !rawMode);
  opReturnFieldsEl.classList.toggle("hidden", rawMode);
  resetHexOutputs();
});

hexFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  errorsEl.textContent = "";

  try {
    if (modeEl.value === "raw_tx") {
      const input = readRawTxInput();
      const errors = validateBySchema("raw_tx", input);

      if (errors.length > 0) {
        errorsEl.textContent = errors.join("\n");
        return;
      }

      const hex = buildUnsignedRawTxHex(input);
      hexOutputEl.value = hex;
      rpcOutputEl.textContent = `# Отправка подписанной tx\nbitcoin-cli sendrawtransaction "${hex}"`;
      addHistory("hex:raw_tx_generated", { input, hex });
      return;
    }

    const input = normalizeOpReturnInput({
      payloadText: document.querySelector("#payloadText").value
    });
    const errors = validateBySchema("op_return", input);

    if (errors.length > 0) {
      errorsEl.textContent = errors.join("\n");
      return;
    }

    const scriptHex = buildOpReturnScriptHex(input.payloadText);
    hexOutputEl.value = scriptHex;
    rpcOutputEl.textContent = `# Пример payload для coinbase/данных\nbitcoin-cli generateblock <address> '["${scriptHex}"]'`;
    addHistory("hex:op_return_generated", { input, scriptHex });
  } catch (error) {
    errorsEl.textContent = error.message;
  }
});

copyHexBtn.addEventListener("click", async () => {
  if (!hexOutputEl.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(hexOutputEl.value);
    copyHexBtn.textContent = "Скопировано";
    setTimeout(() => {
      copyHexBtn.textContent = "Копировать";
    }, 1000);
  } catch {
    errorsEl.textContent = "Не удалось скопировать hex в буфер";
  }
});

pubkeyFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  pubkeyErrorsEl.textContent = "";
  scriptTypesOutputEl.textContent = "";

  const input = normalizePubKeyInput({
    pubkey: document.querySelector("#pubkey").value
  });
  const errors = validateBySchema("pubkey", input);

  if (errors.length > 0) {
    pubkeyErrorsEl.textContent = errors.join("\n");
    scriptTypesOutputEl.textContent = "";
    return;
  }

  const types = getScriptTypesForPubKey(input.pubkey).map((item) => ({
    ...item,
    address: null,
    scriptPubKey: item.localScriptPubKey ?? null,
    rpcError: null
  }));

  const rpcConfig = maybeGetValidRpcConfig();
  if (rpcConfig) {
    for (const item of types) {
      if (item.id === "p2pk") {
        continue;
      }

      try {
        const addresses = await callRpcProxy(rpcConfig, "deriveaddresses", [item.descriptor]);
        const address = Array.isArray(addresses) && addresses.length > 0 ? addresses[0] : null;
        item.address = address;

        if (address) {
          const validation = await callRpcProxy(rpcConfig, "validateaddress", [address]);
          item.scriptPubKey = validation?.scriptPubKey ?? item.scriptPubKey;
        }
      } catch (error) {
        item.rpcError = error.message;
      }
    }
  }

  lastScriptTypesResult = types;
  scriptTypesOutputEl.textContent = formatScriptTypes(types);
  addHistory("script_types:generated", {
    pubkey: input.pubkey,
    count: types.length
  });
});

scriptExportJsonBtn.addEventListener("click", () => {
  if (lastScriptTypesResult.length === 0) {
    pubkeyErrorsEl.textContent = "Сначала сформируйте типы скриптов по публичному ключу";
    return;
  }

  downloadTextFile("script-types.json", toScriptTypesJson(lastScriptTypesResult), "application/json");
  addHistory("script_types:export_json", { count: lastScriptTypesResult.length });
});

scriptExportTxtBtn.addEventListener("click", () => {
  if (lastScriptTypesResult.length === 0) {
    pubkeyErrorsEl.textContent = "Сначала сформируйте типы скриптов по публичному ключу";
    return;
  }

  downloadTextFile("script-types.txt", formatScriptTypes(lastScriptTypesResult), "text/plain");
  addHistory("script_types:export_txt", { count: lastScriptTypesResult.length });
});

rpcConfigFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  rpcConfigErrorsEl.textContent = "";

  const config = readRpcNodeInput();
  const errors = validateBySchema("rpc_node", config);

  if (errors.length > 0) {
    rpcConfigErrorsEl.textContent = errors.join("\n");
    return;
  }

  saveRpcConfig(config);
  rpcConfigErrorsEl.textContent = "RPC конфиг сохранен локально";
  addHistory("rpc:config_saved", {
    protocol: config.protocol,
    host: config.host,
    port: config.port,
    username: config.username,
    wallet: config.wallet
  });
});

sendRawBtn.addEventListener("click", async () => {
  clearRpcActionState();

  try {
    const config = validateRpcConfigOrShow(rpcActionErrorsEl);
    if (!config) {
      return;
    }

    const params = buildSendRawTransactionParams(hexOutputEl.value);
    const result = await callRpcProxy(config, "sendrawtransaction", params);
    rpcActionResultEl.textContent = formatJson({ method: "sendrawtransaction", result });
    addHistory("rpc:sendrawtransaction", { params, result });
  } catch (error) {
    rpcActionErrorsEl.textContent = error.message;
  }
});

generateBlockFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearRpcActionState();

  try {
    const config = validateRpcConfigOrShow(rpcActionErrorsEl);
    if (!config) {
      return;
    }

    const blockInput = normalizeGenerateBlockInput({
      address: document.querySelector("#generateblock-address").value
    });
    const blockErrors = validateBySchema("generate_block", blockInput);
    if (blockErrors.length > 0) {
      rpcActionErrorsEl.textContent = blockErrors.join("\n");
      return;
    }

    const transactions = hexOutputEl.value ? [hexOutputEl.value] : [];
    const params = buildGenerateBlockParams(blockInput.address, transactions);
    const result = await callRpcProxy(config, "generateblock", params);
    rpcActionResultEl.textContent = formatJson({ method: "generateblock", result });
    addHistory("rpc:generateblock", { params, result });
  } catch (error) {
    rpcActionErrorsEl.textContent = error.message;
  }
});

addressGenerateFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAddressGenerationState();

  try {
    const config = validateRpcConfigOrShow(addressGenerateErrorsEl);
    if (!config) {
      return;
    }

    const input = normalizeAddressGenerationInput({
      pubkey: document.querySelector("#address-pubkey").value
    });

    const errors = validateBySchema("address_generation", input);
    if (errors.length > 0) {
      addressGenerateErrorsEl.textContent = errors.join("\n");
      return;
    }

    const results = [];
    for (const type of ADDRESS_TYPES) {
      try {
        const descriptor = buildDescriptorFromPubKey(input.pubkey, type);
        const addresses = await callRpcProxy(config, "deriveaddresses", [descriptor]);
        const address = Array.isArray(addresses) && addresses.length > 0 ? addresses[0] : "<empty>";
        results.push({ type, descriptor, address });
      } catch (error) {
        results.push({ type, descriptor: "n/a", address: `ERROR: ${error.message}` });
      }
    }

    addressGenerateOutputEl.textContent = `${formatDerivedAddressResult(results)}\n\n${formatJson(results)}`;
    addHistory("address:generated", { pubkey: input.pubkey, results });
  } catch (error) {
    addressGenerateErrorsEl.textContent = error.message;
  }
});

addressValidateFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearAddressValidationState();

  try {
    const config = validateRpcConfigOrShow(addressValidateErrorsEl);
    if (!config) {
      return;
    }

    const input = normalizeAddressValidationInput({
      address: document.querySelector("#address-to-validate").value
    });

    const errors = validateBySchema("address_validation", input);
    if (errors.length > 0) {
      addressValidateErrorsEl.textContent = errors.join("\n");
      return;
    }

    const params = buildAddressValidationParams(input.address);
    const result = await callRpcProxy(config, "validateaddress", params);
    addressValidateOutputEl.textContent = formatJson(result);
    addHistory("address:validated", { address: input.address, result });
  } catch (error) {
    addressValidateErrorsEl.textContent = error.message;
  }
});

txSignatureCheckFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearTxSignatureState();

  try {
    const config = validateRpcConfigOrShow(txSignatureErrorsEl);
    if (!config) {
      return;
    }

    const input = normalizeTxSignatureCheckInput({
      rawTxHex: document.querySelector("#signed-rawtx-hex").value,
      maxFeeRate: document.querySelector("#signature-maxfeerate").value
    });

    const errors = validateBySchema("tx_signature_check", input);
    if (errors.length > 0) {
      txSignatureErrorsEl.textContent = errors.join("\n");
      return;
    }

    const params = buildTestMempoolAcceptParams(input.rawTxHex, input.maxFeeRate);
    const result = await callRpcProxy(config, "testmempoolaccept", params);
    const entry = Array.isArray(result) ? result[0] : null;
    const verdict = formatMempoolAcceptResult(entry);

    txSignatureResultEl.textContent = formatJson(verdict);
    addHistory("tx:signature_checked", { params, verdict });
  } catch (error) {
    txSignatureErrorsEl.textContent = error.message;
  }
});

historyExportJsonBtn.addEventListener("click", () => {
  const entries = getHistoryEntries();
  downloadTextFile("operation-history.json", JSON.stringify(entries, null, 2), "application/json");
});

historyClearBtn.addEventListener("click", () => {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
  renderHistory();
});

restoreRpcConfig();
renderHistory();
