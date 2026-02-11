import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const dist = path.join(projectRoot, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "src", "lib"), { recursive: true });

const files = [
  "index.html",
  "styles.css",
  "src/main.js",
  "src/lib/address.js",
  "src/lib/encoding.js",
  "src/lib/form-schemas.js",
  "src/lib/history.js",
  "src/lib/normalizers.js",
  "src/lib/rpc.js",
  "src/lib/tx.js",
  "src/lib/validation.js",
  "src/lib/script-types.js"
];

for (const file of files) {
  const src = path.join(projectRoot, file);
  const target = path.join(dist, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(src, target);
}

const checks = [
  "src/main.js",
  "src/lib/address.js",
  "src/lib/encoding.js",
  "src/lib/form-schemas.js",
  "src/lib/history.js",
  "src/lib/normalizers.js",
  "src/lib/rpc.js",
  "src/lib/tx.js",
  "src/lib/validation.js",
  "src/lib/script-types.js"
];

for (const file of checks) {
  const result = spawnSync("node", ["--check", path.join(projectRoot, file)], { stdio: "inherit" });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Build complete: dist/");
