import { spawnSync } from "node:child_process";

const targets = [
  "scripts/dev-server.mjs",
  "scripts/build.mjs",
  "scripts/lint.mjs",
  "scripts/regression.mjs",
  "src/main.js",
  "src/lib/address.js",
  "src/lib/encoding.js",
  "src/lib/form-schemas.js",
  "src/lib/history.js",
  "src/lib/normalizers.js",
  "src/lib/rpc.js",
  "src/lib/tx.js",
  "src/lib/validation.js",
  "src/lib/script-types.js",
  "tests/tx.test.mjs",
  "tests/validation.test.mjs",
  "tests/normalizers.test.mjs",
  "tests/rpc.test.mjs",
  "tests/address.test.mjs",
  "tests/script-types.test.mjs",
  "tests/history.test.mjs",
  "tests/integration/bitcoin-core.integration.test.mjs"
];

for (const file of targets) {
  const result = spawnSync("node", ["--check", file], { stdio: "inherit" });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Lint complete: syntax checks passed");
