import assert from "node:assert/strict";
import test from "node:test";
import {
  ADDRESS_TYPES,
  buildAddressValidationParams,
  buildDescriptorFromPubKey,
  formatDerivedAddressResult
} from "../src/lib/address.js";

test("buildDescriptorFromPubKey returns descriptor for each supported type", () => {
  const pubkey = "02" + "11".repeat(32);
  const descriptors = ADDRESS_TYPES.map((type) => buildDescriptorFromPubKey(pubkey, type));

  assert.deepEqual(descriptors, [
    `pkh(${pubkey})`,
    `wpkh(${pubkey})`,
    `sh(wpkh(${pubkey}))`,
    `pk(${pubkey})`,
    `tr(${"11".repeat(32)})`
  ]);
});

test("buildDescriptorFromPubKey rejects p2wpkh for uncompressed pubkey", () => {
  const pubkey = "04" + "22".repeat(64);
  assert.throws(() => buildDescriptorFromPubKey(pubkey, "p2wpkh"), /compressed pubkey/);
});

test("buildAddressValidationParams validates minimum length", () => {
  assert.throws(() => buildAddressValidationParams("bc1q"), /слишком короткий/);
  assert.deepEqual(buildAddressValidationParams("bc1qexampleaddress"), ["bc1qexampleaddress"]);
});

test("formatDerivedAddressResult formats list", () => {
  const value = formatDerivedAddressResult([
    { type: "p2pkh", address: "1abc" },
    { type: "p2wpkh", address: "bc1abc" }
  ]);

  assert.equal(value, "p2pkh: 1abc\np2wpkh: bc1abc");
});
