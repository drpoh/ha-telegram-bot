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
