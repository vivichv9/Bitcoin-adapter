# Changelog

## v0.1.0-rc.1 - 2026-02-11
### Added
- Web UI for manual form-to-hex conversion (raw tx and OP_RETURN).
- RPC integration for `sendrawtransaction`, `generateblock`, `deriveaddresses`, `validateaddress`, and `testmempoolaccept`.
- Address generation/validation flows and script-type analysis by public key.
- Script-type export in JSON/TXT.
- Local operation history with masking of sensitive data.
- Unit tests and optional integration tests for Bitcoin Core RPC.

### Changed
- Validation and normalization pipelines were centralized around schemas.
- Dev server now includes local RPC proxy endpoint `/api/rpc`.

### Security
- RPC password is not persisted in browser local storage.
- Sensitive fields are redacted in operation history.
