# ADR: Minimal Gate B closure path (2026-10-09)

Status: proposed for operator review. No production authorization.

## Decision
Stop expanding custom WebSocket and policy micro-fixtures. Reuse the maintained Home Assistant `home-assistant-js-websocket` client with `ws`, using a separately operator-owned, authenticated and bounded read-only connection for three native entity/device/area registry list commands. HA-MCP remains the action interface. Do not copy or transplant the old v2 allowlist.

The existing `v3-ha-upstream-read-bridge.mjs` and `v3-ha-registry-read-adapter.mjs` are the intended narrow evidence readers; `v3-isolated-joined-chain.mjs`, channel-neutral intent ledger, tool boundary and operator policy loader are the intended single decision/confirmation path. Keep the standalone frame/endpoint/TLS-claim prototypes out of production: client-provided claims cannot establish TLS, source, actor or policy authority.

## Minimum vertical acceptance slice
1. An operator-managed connection endpoint and credential, separately reviewed from v2, establishes server identity through Node TLS validation and `ws` transport with `maxPayload`, handshake timeout, forced teardown and no silent reconnect/replay of actions. A verified transport owner passes only an authenticated `Connection` to the registry bridge. No model-facing callback or boolean can self-attest trust.
2. Enumerate all three registries with bounded six-list double reads. Detect drift, invalid references, duplicates, entity renames, disabled/unavailable members and child-device parent/area inheritance. Treat agreement as observed consistency, not transactional snapshot certainty; validate freshness again immediately before any approved action.
3. The operator reviews a separate default-deny V3 policy and local room-light/switch classification. Accept only exact approved entity IDs, service, action, original request, transport-attested actor and immutable confirmation. Never import `src/policy/config.mjs` grants automatically.
4. Exercise one complete isolated command through ingress -> intent -> trusted scope -> reviewed policy -> confirmation -> replay/expiry/cancel guard -> mock dispatch -> verification/audit. Test actor/chat mismatch, tool substitution, changing registry, stale callbacks, dropped transport and absence of review. Do not enable live writes as a test.
5. Record tests and sanitized evidence, stage/rollback plan, then request owner approval for a **separate live read-only acceptance session**. Live control remains a separate subsequent Gate C/D approval.

## Simplifications accepted now
- One official upstream WebSocket client, not multiple hand-built wire implementations.
- One joined policy/confirmation engine shared by Telegram and future Assist; voice satellite identity is not speaker identity.
- Keep full suite at milestone boundaries and focused tests while editing. No new database, bus, scheduler, cloud service, LLM or background polling for Gate B.
- Reuse HA's current entity/device/area registries; avoid guessing device area by friendly names.

## Current verifiable status and hard blockers
- Existing offline bridge, registry drift checks, joined chain and policy deny fixtures are implemented and tested, but they are not connected to a production TLS-verified HA source.
- `getV3ReviewedPolicy()` still returns empty default-deny; operator-approved V3 action grants and lighting classification do not exist. That is correct for production safety.
- An authenticated real Telegram/Assist ingress -> complete trusted source -> reviewed policy -> protected confirmation -> live HA actor/action-bound authorization is **not verified**.
- No operator-approved dedicated HA read credential, endpoint/TLS trust material or deployment change has been provided. Cannot mark Gate B fully complete from simulated tests alone.

## Release boundary
Gate B remains OPEN. The offline development component may be called complete only after isolated end-to-end evidence; live-source/identity/policy acceptance cannot be waived. Do not change active v2/V3 units, HA Green, real automation permissions or real credentials on a generic 'continue'. Keep HA Green operable if AI/Pi stops.

## References
- https://github.com/home-assistant/home-assistant-js-websocket (maintained upstream; Apache-2.0, candidate already reviewed in ADR-GATE-B-ACCELERATION)
- https://developers.home-assistant.io/docs/api/websocket/
- https://developers.home-assistant.io/blog/2026/08/19/device-registry-websocket-api-changes/
- `docs/ADR-GATE-B-ACCELERATION.md`, `docs/GATE-B-WSS-ACCEPTANCE.md`, `docs/home-agent-v3-strategy.md`
