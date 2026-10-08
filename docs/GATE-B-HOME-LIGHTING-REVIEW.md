# Gate B — per-home lighting review (NOT APPROVED)

Source: locally saved `data/lighting-inventory-review-2026-10-08.json`, assembled using read-only HA-MCP `ha_list_floors_areas` and `ha_search`. This is a historical partial proposal, **not** a complete device registry, actual current device state or authorization.

**No live grant may be generated from this document.** The operator must explicitly review classifications and later authorize an exact policy file and digest.

## Ванная и сауна / sauna
- Proposed controllable light: `light.wled_gledopto`.
- Proposed light-like switch: `switch.vannaia_svet` (excluded from the current v3 light-only policy).
- Proposed excluded device/status LEDs: `light.louder_esp32_s3_louder_esp32_s3_led`, `light.sauna_m5stack_echo_status_led`, `light.sauna_sauna_te_sauna_status_led`.
- Unresolved: `switch.parilka_potolok` and whether sauna WLED belongs in bathroom-wide, sauna-specific or both commands.
- **Decision: DENY whole-room control until resolved.**

## Кухня / kukhnia
- Proposed controllable: `light.kukhnia_svet_3`, `light.podsvetka_kukhnia`.
- Unresolved: `light.dukhovka_light` (oven), `light.svet` (historically unavailable), `switch.kukhnia_kukhnia_svet` (possibly distinct circuit).
- **Decision: DENY whole-room control until resolved.**

## Коридор / koridor
- Proposed controllable: `light.koridor`, `light.koridor_2`.
- Unresolved: `light.sonoff_1000d78a79` (availability, function).
- **Decision: DENY whole-room control until resolved.**

## Approval checklist
1. Obtain authoritative, current, authenticated, read-only *complete* HA device/entity/area registry (not merely search results); check pagination, device IDs, linked switches and disabled/unavailable entities.
2. For each area, classify **every** relevant entity as controllable, excluded or unsafe/unknown; no unknown item may silently disappear from whole-room action scope.
3. Explicitly resolve whether «ванная» and «сауна» share physical area but require different action scopes.
4. Record owner review with the exact inventory snapshot identity and policy SHA-256; reject changed inventory, changed policy, missing audit or stale approval.
5. Until then, policy remains deny-all for home entities and offline tests use only `light.fixture`.

Status: PENDING OWNER REVIEW and authoritative registry evidence. No production changes performed.

## Current registry cross-check — 2026-10-08 (read-only SSH)

Access method: read-only copy of Home Assistant's `.storage/core.device_registry`, `core.entity_registry` and `core.area_registry` to a private directory on Raspberry Pi. Counted 293 device entries, 2,901 entity entries and 17 areas. Actual registry objects remain private and are not committed. This establishes an authoritative **registry snapshot**, not proof that every physical load/device in the home is functioning, nor live state or entity capability/availability at execution time. Device area is inherited when an entity has no explicit area.

- **Sauna (area `sauna`):** light entries `light.wled_gledopto`, `light.louder_esp32_s3_louder_esp32_s3_led`, `light.sauna_m5stack_echo_status_led`, `light.sauna_sauna_te_sauna_status_led`. Lighting-like switches: `switch.vannaia_svet`, `switch.parilka_potolok`. The remaining WLED/utility switches are not automatically lighting; must be excluded or separately classified. **No grant.**
- **Kitchen (`kukhnia`):** four light entries `light.dukhovka_light`, `light.kukhnia_svet_3`, `light.podsvetka_kukhnia`, `light.svet`; additional lighting-like switch `switch.kukhnia_kukhnia_svet`. Its availability and mapping remain unverified. **No grant.**
- **Corridor (`koridor`):** three light entries `light.koridor`, `light.koridor_2`, `light.sonoff_1000d78a79`; `switch.sonoff_10005c210e` is hidden by integration while two associated utility switches are disabled. **No grant.**
- **First-floor corridor (`koridor_1_etazh`) is a distinct HA area:** `light.koridor_1_etazh`, `light.koridor_1_etazh_2`, `switch.koridor_1_etazh`; there are hidden/disabled Sonoff utility switches. This area was omitted from the earlier 3-area review. Do not collapse it into `koridor` automatically. **No grant.**

Required next: owner decision on lighting switches, status LEDs, oven light, `light.svet`, Sonoff entities, the split between two corridor areas, and bathroom-versus-sauna semantics. Capture fresh HA states as a separate read-only step before any actual rollout. **Gate B owner-home approval pending**.

## Live read-only state cross-check — 2026-10-08 (HA-MCP)

A separate read-only HA-MCP session queried 17 exact entity IDs with `ha_get_state`. These are instantaneous states, **not** evidence of physical function, room-scene membership or owner approval.

- Sauna: `light.wled_gledopto=on`; `switch.parilka_potolok=off`, `switch.vannaia_svet=off`; `light.louder_esp32_s3_louder_esp32_s3_led=off`, `light.sauna_m5stack_echo_status_led=on`, `light.sauna_sauna_te_sauna_status_led=unavailable`.
- Kitchen: `light.dukhovka_light=off`, `light.kukhnia_svet_3=off`, `light.podsvetka_kukhnia=off`, `switch.kukhnia_kukhnia_svet=off`; `light.svet=unavailable`.
- Corridor: `light.koridor=off`, `light.koridor_2=off`; `light.sonoff_1000d78a79=unavailable`.
- First-floor corridor: `light.koridor_1_etazh=off`, `light.koridor_1_etazh_2=off`, `switch.koridor_1_etazh=off`.

Three unavailable entities require independent handling. No states were changed. The audit remains **PENDING OWNER REVIEW** and all whole-room grants remain denied.

## 2026-10-08 — Identity of existing Whole House Light group
Read-only HA registry identifies light.ves_svet as platform group, entry e0715de4e60cf2dee9336666fec1c17b, area dom. The similarly named light.ves_svet_2 belongs to platform yandex_station. Current HA state of light.ves_svet lists 14 members; preserve the group unchanged. Its membership is observational evidence and not a v3 write grant. Owner review of home-wide scope, unavailable members, and change detection is still required. No HA write executed.
