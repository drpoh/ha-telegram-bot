# HA registry zones and labels — authoritative metadata, not authorization

Home Assistant is the authoritative inventory for areas, labels and device/entity relationships. Do not invent room identity from entity_id prefixes, friendly_name, manually maintained candidate rows, or a label used for classification.

## Read-only snapshot source

Use supported Home Assistant WebSocket requests with read-only privileges, or equivalent HA-MCP registry enumeration if the deployed MCP server exposes it:

- `config/area_registry/list`: area IDs, names, aliases.
- `config/device_registry/list`: device IDs, direct areas and labels.
- `config/entity_registry/list` or `config/entity_registry/list_for_display`: entity IDs, per-entity area override, device ID, labels, hidden/disabled metadata. The latter emits short field names like `ei`, `ai`, `di` and `lb`; note disabled entries may not appear at all.
- `config/label_registry/list`: label ID to human-readable name, subject to availability/permissions.

Read registries with the existing HA integration/HA-MCP wherever possible; do not introduce a new privileged HA token for this task. Never write to registries to “fix” metadata automatically.

## Policy and meaning

Entity area overrides device area; only fall back to device area when absent. Labels can come from the entity or device. Map only explicitly recognized labels *Освещение*, *Управление* and *Системный*, including documented localized aliases. HA label IDs are not the visible name and must be resolved. Conflicting labels are ambiguous and require review. Entities with no known room or relevant label remain unclassified.

Use room and label metadata for *finding and proposing* candidates, not expanding the transport's allowed entity IDs. A metadata change can alter the user-facing lookup, but **must never authorize a new `ha_get_state` target or any HA service call** without separate static read admission and policy checks. New physical control always needs explicit validation and permission. Exclude `light.browser_mod*`, hidden/disabled entries, system diagnostic data from ordinary lighting search. Do not equate unavailable with off. Do not claim a room's physical inventory is complete based on registry alone.

A reusable pure adapter `src/home/ha-registry-metadata-index.mjs` consumes mocked/offline snapshots and returns constrained candidates. This implementation deliberately has no network client, persistent credentials, writes, live runtime hook, or automatic cache refresh. Review owner registry evidence before introducing live read-only synchronization and test a pinned release separately; production is currently `93f11cd`.

References: [HA WebSocket API](https://developers.home-assistant.io/docs/api/websocket/) and [HA area registry](https://developers.home-assistant.io/docs/area_registry_index/).

## Verified source-only next step: capability audit (2026-10-14)

Before trying a live registry snapshot, run `node scripts/manual/v3-ha-registry-capability-audit.mjs` **from the canonical DEV checkout** on Raspberry Pi after updating its source. This script connects only to the already-configured trusted HA-MCP URL, calls MCP `listTools()` once and closes the connection. It never calls any discovered HA-MCP tool, reads HA entities, writes HA or starts Telegram polling; it outputs only registry-tool names and a coarse status, not private endpoint credentials. It does not need a new Home Assistant token. Offline checks are in `test/v3-ha-registry-mcp-capabilities.test.mjs`.

If the deployed HA-MCP server exposes only `ha_get_overview`, `ha_search`, `ha_config_get_label` or `ha_config_get_category`, do **not** treat these as a complete registry snapshot. They lack proof of a complete area/device/entity/label join. Do not automatically fall back to an HA WebSocket privileged token. Instead review the tool manifest and choose an existing supported read-only registry capability if available, or plan a separately authorized read-only snapshot import. A `listTools` name is merely a candidate: its arguments and behaviors must be checked before any invocation. Production remains pinned `93f11cd`.

## Actual owner HA-MCP capability result (2026-10-14)

The Raspberry Pi DEV script `v3-ha-registry-capability-audit.mjs` listed **53 MCP tools** but no exposed explicit area/device/entity/label registry list methods. It DID expose `ha_list_floors_areas`, `ha_get_entity`, `ha_get_device`, `ha_search`, `ha_config_get_label`, `ha_config_get_category`, `ha_get_overview`, and `ha_get_zone`. Listing names cannot prove completeness or the safety/shape of calls. The first audit invoked no HA tool and changed no production component.

Instead of introducing a separate privileged WebSocket client prematurely, use the existing MCP SDK and the existing LAN endpoint to run the **schema-only** follow-up:

```bash
cd /home/drpoh/projects/rs-home-ai-dev
node scripts/manual/v3-ha-mcp-schema-audit.mjs
```

It only calls MCP `listTools` and reports a fixed allowlisted set of tool names with sanitized top-level input property names/types. No tool is invoked, and no tokens or endpoints are logged. When the real descriptions/schemas are reviewed, determine whether these existing operations support area/entity/label joins; if not, plan an operator-reviewed read-only snapshot through a supported HA interface. Until then, use the pure metadata index only with offline fixture snapshots. In particular, **no inference of physical controls or full-registry coverage**, no new service-call permissions, and **production remains `93f11cd`**.
