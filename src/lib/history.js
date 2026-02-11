export const HISTORY_STORAGE_KEY = "bitcoin-adapter:history";
const MAX_HISTORY_ITEMS = 40;

function maskHex(value) {
  if (typeof value !== "string") {
    return value;
  }

  if (value.length <= 20) {
    return value;
  }

  return `${value.slice(0, 10)}...${value.slice(-8)}`;
}

function sanitize(value, key = "") {
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  if (value && typeof value === "object") {
    const out = {};
    for (const [innerKey, innerValue] of Object.entries(value)) {
      const lower = innerKey.toLowerCase();
      if (lower.includes("password") || lower.includes("secret") || lower.includes("token")) {
        out[innerKey] = "<redacted>";
        continue;
      }
      out[innerKey] = sanitize(innerValue, innerKey);
    }
    return out;
  }

  if (typeof value === "string") {
    const lowerKey = key.toLowerCase();
    const looksLikeLongHex = value.length > 20 && /^[0-9a-fA-F]+$/.test(value) && value.length % 2 === 0;
    if (lowerKey.includes("hex") || lowerKey.includes("rawtx") || looksLikeLongHex) {
      return maskHex(value);
    }
  }

  return value;
}

export function createHistoryEntry(action, payload) {
  return {
    at: new Date().toISOString(),
    action,
    payload: sanitize(payload)
  };
}

export function parseHistory(rawValue) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushHistory(entries, entry) {
  const updated = [entry, ...entries];
  return updated.slice(0, MAX_HISTORY_ITEMS);
}

export function formatHistory(entries) {
  if (entries.length === 0) {
    return "История пуста";
  }

  return entries
    .map((entry) => `${entry.at} | ${entry.action}\n${JSON.stringify(entry.payload, null, 2)}`)
    .join("\n\n");
}
