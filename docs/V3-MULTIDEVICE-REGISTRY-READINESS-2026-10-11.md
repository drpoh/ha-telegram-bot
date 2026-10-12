# Multi-device HA registry inspection readiness — 2026-10-11

## Decision
**Reuse the existing Home Assistant native websocket registry reader** (`v3-ha-upstream-read-bridge` -> `v3-ha-registry-read-adapter` -> `v3-registry-double-read`). Do not create a new registry bridge, background process, stage-to-production relay or custom network protocol. This phase verifies the source-only, non-authorizing data-read contract; it does **not** establish an authenticated live HA registry connection.

## Existing read-only flow
- The injected upstream connection permits only `config/entity_registry/list`, `config/device_registry/list`, `config/area_registry/list` and closes after one-shot inspection. The adapter performs two independent full reads and checks duplicate IDs, snapshot drift, missing device/area references and cyclic device parents.
- Success is intentionally `{ready:false, authorization:false, status:'read_only_review'}` with hashes, **not** a grant or executable list. Actual transport/TLS pinning, source provenance, credentials and operator policy remain separate deployment gates.
- Multi-light contract tests confirm that more than one device can be inspected with only these six read requests. Orphan device references, duplicate entity IDs and second-pass replacement deny the entire inspection. No client is connected to a real HA endpoint in these tests.

## What remains gated
1. Independently prove authenticated origin and completeness of the actual HA registry transport and effective area/device relationships; source-declared metadata alone is not proof.
2. Independently verify HA-MCP listener access restrictions and negative access from an unrelated LAN client before wider production authority.
3. Review immutable owner allowlists, actor provenance, durable one-shot confirmation, per-device revalidation and rollback before a new live release.
4. A safe real read-only acceptance (separately authorized when needed) must not reuse Stage mock credentials or let live data flow into Stage as execution authority.

No HA configuration, token, service or production artifact was changed. This source-readiness review closes the coding evaluation and leaves actual on-host trust verification explicitly OPEN.
