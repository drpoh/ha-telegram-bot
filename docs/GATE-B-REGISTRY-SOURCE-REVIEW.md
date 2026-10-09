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
