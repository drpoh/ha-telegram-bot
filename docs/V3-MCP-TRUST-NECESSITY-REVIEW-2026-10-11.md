# HA-MCP trust necessity review — 2026-10-11

## Decision: no new infrastructure or redundant registry implementation
The repository already has offline fail-closed registry-source, snapshot-completeness, endpoint provenance, certificate-evidence and capability guards (`src/decision/v3-registry-source-contract.mjs`, `v3-ha-registry-endpoint-policy.mjs`, `v3-registry-capability-guard.mjs`). Stage mock identities never grant production authority. There is no justification for a new registry service, transport stack or decision framework. Reuse Home Assistant's native authoritative registry and its supported integration paths.

## Read-only findings / scope
- Dev checkout `feature/v3-home-agent` at 4f835fe before review; live V3 `ExecStart` remains immutable `rs-home-ai-v3-release-97343fa/src/pilot/telegram-readonly.mjs`, active; V2 system service active.
- Historical HA config-entry inspection attributes TCP 9584 to `ha_mcp_tools`, configured to bind `0.0.0.0`, with authenticated webhook capability. Source-IP restriction and independent negative LAN client test are **not verified**. Current Pi `ss` cannot establish what HA exposes on a different host; do not substitute Pi socket inspection for HA listener validation.
- The mock cannot prove authenticity, freshness or completeness of real registry data. The existing source-contract function deliberately returns `authorization:false` even for complete fixture-shaped snapshots. Pure endpoint syntax/pinning flags are not transport attestation.
- A single-light owner-confirmed production pilot has already passed both on/off; that is NOT evidence for broader device scope or a secure registry transport.

## Needed before expanded live authorization (not a coding gate for dev-only tests)
1. Independently inspect the Home Assistant-supported registry/MCP authentication boundary and the operator-owned HA-MCP access settings without exposing secrets.
2. Use a supported server-side access-control mechanism or independently validated trusted authenticated path; account for Pi and HA being same-L2 peers, where router routing ACLs may not apply. Verify rejection from an unrelated LAN client, without touching live service configuration during this review.
3. Prove authoritative registry identity, full snapshot/pagination, stable device and area IDs, freshness, and error handling using authenticated HA-native metadata, not Stage fixtures or client-declared booleans.
4. Keep per-device operator allowlist, real-state preflight, confirmation, durable one-use claim and readback gates. Release promotion requires separately approved rollback plan and live test.

## Scope of this milestone
Read-only inspection and documentation only; no HA calls/writes, credentials, firewall modifications, service restart, stage installation or permission widening. The source-audit task is closed; actual network hardening and independent negative test remain blocked on separately authorized infrastructure action. Revisit only at promotion time, not before each unrelated dev-only feature.
