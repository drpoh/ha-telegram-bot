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

## Next scoped evidence collection
- Manual live read-only preflight now prints `LIGHT_IDENTITY <entity_id> state=<state> friendly_name=<sanitized label>` for the **same fixed seven** IDs, using existing ha_get_state results; no registry scan, HA writes, or wider MCP permissions. Name is capped at 80 characters and cannot prove physical type/room. Ask the owner to corroborate switches, fixtures, helpers and actual HA area from HA UI or separately approved scoped registry evidence before adjusting /lights.

## Owner read-only result: explicit friendly names and states (2026-10-12)

| Entity ID | HA state | HA friendly_name | Interpretation |
| --- | --- | --- | --- |
| `light.tambur_svet_l1` | on | Тамбур свет L1 | scoped pilot light; physical role previously reviewed |
| `light.koridor` | off | Коридор | physically unclassified |
| `light.koridor_2` | unavailable | Коридор | physically unclassified, possible overlapping display label, **not a proven duplicate** |
| `light.koridor_1_etazh` | off | Коридор 1 этаж | physically unclassified |
| `light.koridor_1_etazh_2` | unavailable | Коридор 1 этаж | physically unclassified, possible overlapping label, **not a proven duplicate** |
| `light.koridor_spot` | off | Спот | physically unclassified |
| `light.koridor_spot_2` | unavailable | Свет | physically unclassified; overly generic name |

Sauna was 28 °C and not ready; all reads were `ha_get_state`. The `/lights` source-only response now explicitly says it counts **seven selected HA entities, not physical lamps**, and lists unavailable **entity IDs** so duplicates are not guessed from labels. The existing read whitelist remains unchanged.

**Still needed to conclude hardware identity:** use HA Settings → Devices & services → Entities to inspect integration/platform, actual device, assigned area and whether it is a helper, then record the switch that physically controls each lighting circuit. This is a read-only manual review, not approval to modify HA or expand dispatch. Keep any mapping tentative until verified by the owner.

## Owner cleanup completed (2026-10-12)
The owner deleted **three** unavailable HA entity-registry records after reviewing their status in HA: `light.koridor_2`, `light.koridor_1_etazh_2`, and `light.koridor_spot_2`. The first showed a clear orphan warning from the `yandex_station` integration; the other two were owner-reported deleted, but their integration/platform was not independently recorded. These records must no longer be queried by the V3 read-only light overview. They are preserved in this audit **only as historical deleted IDs**, not candidates for re-creation or current HA entities.

The narrow pilot now reads **four** retained HA light-domain entities: `light.tambur_svet_l1`, `light.koridor`, `light.koridor_1_etazh`, `light.koridor_spot`. This still does **not** prove four distinct physical luminaires or whole-house coverage. The existing tamboor-only physical write policy is unchanged. Run the updated preflight on Pi before claiming complete real-HA acceptance.
