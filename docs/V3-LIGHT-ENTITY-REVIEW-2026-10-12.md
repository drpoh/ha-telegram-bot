# Scoped lighting review — no automatic authorization

Owner has confirmed that some apparent lamps are switches or auxiliary entities. **Do not infer the physical type from an entity ID or count these seven entries as all household lamps.** Actual Pi HA-MCP readings have verified the following:

| Entity ID | Observed state (2026-10-12) | Classification decision |
| --- | --- | --- |
| `light.tambur_svet_l1` | on | Pilot light, read-only overview; existing separately reviewed physical action scope remains unchanged |
| `light.koridor` | on/off observed but individual reading not captured | Unreviewed type |
| `light.koridor_2` | unavailable | Exclude from reliable active-light count until reviewed |
| `light.koridor_1_etazh` | on/off observed but individual reading not captured | Unreviewed type |
| `light.koridor_1_etazh_2` | unavailable | Exclude from reliable active-light count until reviewed |
| `light.koridor_spot` | on/off observed but individual reading not captured | Unreviewed type |
| `light.koridor_spot_2` | unavailable | Exclude from reliable active-light count until reviewed |

The existing `src/decision/lighting-classification.mjs` supports exactly `light_ids`, `switch_light_ids` and `excluded_light_ids`. No new schema is needed. A light-like switch must have an independently verified `switch.*` entity ID; do not fabricate one from a `light.*` suffix. Classifications are local, reviewed data — they do not confer write authority. In particular, do not modify `src/pilot/kitchen-mcp-client.mjs` action scope as part of inventory work.

**Read-only inventory:** `scripts/manual/v3-live-readonly-preflight.mjs` prints `LIGHT_INVENTORY <id> <state>` for each of the **seven** scoped IDs (including successful reads). It does not perform `ha_search`, whole-house registry enumeration, or scan switch entities. Entity type, physical purpose, HA area and aliases cannot be inferred from these state reads alone.

**Next review:** identify each real physical light and its corresponding HA entity/domain/area from Home Assistant's UI or a separately approved *read-only* registry query. Then prepare the local classification document and an owner-review diff; no HA renaming, deletion, or write-control changes. Leave unknown IDs unresolved.
