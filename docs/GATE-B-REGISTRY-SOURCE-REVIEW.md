# Gate B: dedicated HA registry source review — 2026-10-09

Status: BLOCKED for production authorization. Review is deliberately read-only.

## Code-level inventory
- `src/mcp/tools.mjs` exposes generic `ha_search` and `ha_get_overview` clients; neither is a documented complete device/entity/area registry snapshot with stable IDs and trusted source guarantees.
- `src/decision/v3-registry-capability-guard.mjs` refers to `ha_device_registry_snapshot` as a proposed capability, not a currently validated adapter.
- `src/decision/v3-registry-source-contract.mjs` validates claimed metadata in offline fixtures only. An AI, request argument, or untrusted transport can forge these flags; no successful contract check grants permission.

## Acceptance prerequisites for a future read-only adapter
1. Inspect the installed HA-MCP server's documented authenticated registry API and service version; if unavailable, build a separately reviewed read-only adapter under dedicated credentials.
2. Retrieve entity, device and area registry snapshots from one trusted authenticated HA source with demonstrably complete, consistent pagination or atomic snapshot semantics; all count and cursor fields must match.
3. Bind origin to a configured endpoint and protected credentials outside model input, with service identity checks and a provenance record. Reject source substitution.
4. Verify freshness, stable entity/device/area IDs, disabled/unavailable members, duplicates and mid-read version drift using offline faults before integrating the shared policy engine.
5. Require explicit operator review and separate signed or permission-protected per-home policy. Registry validity cannot grant actuation.
6. Preserve Home Assistant Green independence; no production HA write, service restart or new credentials without owner approval.

Next: inspect actual installed server capabilities and version using sanitized read-only diagnostics, then implement and test a source-specific adapter. Do not use generic `ha_search` as a substitute.

## Live read-only capability discovery (2026-10-09)
- An independent MCP client connected to the configured HA-MCP transport on Raspberry Pi and called **only** `listTools()` twice; no HA entity reads or write tools invoked. The server advertised **53 tools**.
- `ha_get_device`: supports list pagination (`limit` 1..200, `offset`), optional `detail_level=full`, filtering by area/integration, and single-device lookups. Schema does **not** promise atomic global snapshot or generation/version consistency between pages.
- `ha_get_entity`: resolves exact entity IDs or stable unique IDs; its exposed schema is not an unfiltered complete entity-registry listing API.
- `ha_list_floors_areas`: provides floor/area lists and counts, but does not bind their version atomically to the device and entity pages.
- `ha_search` can enumerate entity-registry matches with pagination, `include_hidden=true`, but is a search surface; its schema does not guarantee all entities, stable membership, or consistency with device lists during concurrent HA mutations.
- No advertised `ha_device_registry_snapshot` tool. A standalone dedicated source is still needed for Gate B evidence, or upstream must offer documented consistent snapshot semantics verified independently.
- Do not interpret `ha_get_device`/`ha_search` pagination support as transactional completeness; mixed-time pages and registry mutation require explicit detection. Also require operator-controlled credentials and trusted endpoint binding.

## Home Assistant native WebSocket alternative (2026-10-09)
- Official Home Assistant Core exposes `config/entity_registry/list`, `config/device_registry/list` and `config/area_registry/list`, which directly list registry records. Unlike `ha_search`, these are not search result pages. See Home Assistant developer WebSocket documentation and current Core registry handlers.
- **Important:** calls are three distinct operations; they do not constitute one atomic read across registries. Consider repeated two-pass read and canonical digest comparison to detect observed drift, but even identical passes do not prove that no mutation occurred between calls.
- The 2026.9 device registry introduces child devices; a collector must retain parent/child relations and effective area semantics, not assume all devices have the same fields.
- A future adapter must authenticate the configured Home Assistant WebSocket endpoint, protect the token outside model context, bound memory/time/record count, verify read-only request allowlist, and reject malformed cross-registry links. Do not expose generic WebSocket commands to AI.
- Added offline-only `v3-registry-double-read.mjs` with two-pass stable digest checks. It never authorizes actions; source authenticity and snapshot atomicity remain unproven.

## Offline bounded native WebSocket request adapter
- Added `src/decision/v3-ha-registry-read-adapter.mjs`, injectable transport only. The only requests it constructs are `config/entity_registry/list`, `config/device_registry/list`, and `config/area_registry/list` (two passes). No URL, token, WebSocket client, AI transport or live HA access is present in the module.
- Each response must be an array with a bounded record count; duplicate/invalid identity, mismatching two-pass hashes, unknown entity device/area, missing child parent and parent cycles fail closed. A global timeout bounds the promise wait, but **does not cancel a request already in progress**; a production transport must enforce cancellation, payload byte size, connection concurrency and TLS/endpoint verification independently.
- Even a stable result returns `ready:false`, `authorization:false` and `read_only_review`. Identical reads are not an atomic HA snapshot and do not prove the authenticated source. All Gate B live authorization and operator policy blockers remain open.
- Focused tests use injected fixtures only, never a real Home Assistant. No running services modified.
