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
