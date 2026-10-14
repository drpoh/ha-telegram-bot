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

## Owner-verified floor/area shape — 2026-10-14

HA-MCP `ha_list_floors_areas` live read returned `success=true`: two floors with 5 and 7 area records, five unassigned areas, zero orphaned, **17 total**. Nested floor.area objects expose `area_id`, `name`, `aliases`, `labels`, `floor_id`, temperature/humidity entity references, and timestamps. This confirms **area metadata**, not a complete device/entity/label registry or actual room-state inventory. The pure `src/home/ha-native-area-catalog.mjs` turns this verified nested response into a validated 17-area candidate catalog, rejecting mismatched counts, duplicate area IDs and contradictory floor assignments, and passes it to the existing metadata index only as `areas`. Crucially, `area.labels` are labels of the *area*, **not automatically labels of every entity in the area**. The operator-only `scripts/manual/v3-ha-native-area-catalog.mjs` performs one fixed MCP area read and reports only totals and structure. No source-only feature automatically widens read or write permissions. Production stays on owner-accepted `93f11cd`.

## Verified per-area device MCP response (2026-10-14)

The user ran the fixed `ha_get_device({area_id})` read for one validated area, returning 11 devices. The structured reply includes `success`, `total_count`, `count`, `offset`, `limit`, `has_more`, `next_offset`, `total_devices`, `devices`, `area_filter`, `filters`, and `detail_level`. Each device entry includes `device_id`, `area_id`, `integration_sources`, `integration_type`, `manufacturer`, `model`, `name`, `sw_version`, `via_device_id`. This is evidence for native per-area devices and pagination, **not** a complete entity or label registry. No entity state or HA write was performed.

The DEV-only `src/home/ha-all-area-device-census.mjs` and operator script `scripts/manual/v3-ha-all-area-device-census.mjs` reuse the same MCP client, require schema admission for fixed `area_id`, `limit`, `offset`, validate the native area catalog, and traverse up to 25 known areas with up to eight pages each (50 records/page, at most 201 calls). They fail closed for missing, contradictory, duplicate or moving results and emit only counts by ordinal area, never device identifiers or names. A success means **only area-scoped device pagination under these assumptions**, not 293 registry devices or full household entity/label coverage. This is not a background worker, not a periodic HA task, and never widens HA write permissions. Current production remains pinned `93f11cd`.

## 2026-10-14 owner-verified area device census

Owner ran the bounded HA-MCP `ha_get_device` sweep for all 17 native areas: `AREA_DEVICE_CENSUS=area_device_census_complete`, 100 area-scoped device records, 17 device list calls, all 17 areas one page each (including three empty areas), no HA state or write calls. **This is not 100 unique devices in the entire HA registry**: devices assigned to no area or represented elsewhere are not included, and neither entity mappings nor label records were fetched.

The next operator-only `scripts/manual/v3-ha-entity-label-shape.mjs` validates actual advertised tool schemas before calling exact `ha_get_entity` for already reviewed `light.tambur_svet_l1` and `ha_config_get_label` with null only when null is explicitly admitted by the tool schema. It prints structural field names/types/counts only, never raw device/room/entity names or token contents. A failure is not treated as a registry snapshot. No physical action permission is added; active production remains `93f11cd`.

## Entity entry and label-list evidence (2026-10-14)

Owner's live HA-MCP audit succeeded: `ha_get_entity` returns `success`, `entity_id` and one nested `entity_entry`; `ha_config_get_label` with null label ID returns a list of **15** label records with IDs, names and metadata. The response does **not** by itself prove a complete entity registry, or which of those 15 labels are attached to any given entity. Operator script `scripts/manual/v3-ha-entry-label-structure.mjs` now reports only inner `entity_entry` field names/types and grouped label *counts*; it uses the two previously reviewed fixed read-only MCP calls, never prints entity or label values, and never grants new reads or writes. No production change. The next integration should map verified label IDs to names and known entities only after examining the nested entry shape. Do not assume area labels propagate to devices or entities.
