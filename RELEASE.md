# Release Checklist (v1)

## Pre-release
1. Run `npm run check`.
2. Run `npm run test:integration` with local Bitcoin Core RPC env variables.
3. Verify UI smoke scenarios manually:
- form -> hex generation;
- RPC calls (`sendrawtransaction`, `generateblock`);
- address generation/validation;
- signature check;
- script types + export;
- history export/clear.

## Release candidate
1. Update `CHANGELOG.md` version/date.
2. Tag release candidate (for example `v0.1.0-rc.1`).
3. Collect feedback from test users/operators.

## Final release
1. Update changelog to stable `v1.0.0`.
2. Create release tag `v1.0.0`.
3. Publish release notes and known limitations.

## Integration env vars
- `BITCOIN_RPC_URL` (example `http://127.0.0.1:18443`)
- `BITCOIN_RPC_USER`
- `BITCOIN_RPC_PASS`
- `BITCOIN_TEST_ADDRESS` (optional)
