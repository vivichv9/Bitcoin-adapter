import assert from "node:assert/strict";
import test from "node:test";
import { createHistoryEntry, formatHistory, parseHistory, pushHistory } from "../src/lib/history.js";

test("createHistoryEntry redacts password and masks long hex", () => {
  const entry = createHistoryEntry("rpc:test", {
    password: "secret",
    rawTxHex: "aa".repeat(20)
  });

  assert.equal(entry.payload.password, "<redacted>");
  assert.match(entry.payload.rawTxHex, /\.\.\./);
});

test("pushHistory keeps newest entries with bounded size", () => {
  let entries = [];
  for (let i = 0; i < 45; i += 1) {
    entries = pushHistory(entries, { at: String(i), action: "a", payload: i });
  }

  assert.equal(entries.length, 40);
  assert.equal(entries[0].payload, 44);
});

test("parseHistory and formatHistory behave for empty values", () => {
  assert.deepEqual(parseHistory("not-json"), []);
  assert.equal(formatHistory([]), "История пуста");
});
