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
