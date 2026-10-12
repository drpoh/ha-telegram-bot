# Corridor/tambour lighting inventory — read-only acceptance

Observed on Pi (2026-10-12): `light.koridor_2`, `light.koridor_1_etazh_2`, `light.koridor_spot_2` returned `unavailable`. Other four scoped light IDs resolved; tamboor was on. Do **not** infer that unavailable entities are unused or that every light is a physical luminaire.

Existing `src/decision/lighting-classification.mjs` already supports reviewed `light_ids`, `switch_light_ids`, `excluded_light_ids`. No replacement architecture.

Next discovery requires **operator-reviewed, read-only HA entity registry evidence**, not guessed suffixes:
- list relevant entities for corridor/tambour including `light.*`, `switch.*`, availability, friendly name, area, device association, and integration;
- classify only confirmed actual lighting endpoints, and separately document helper/indicator entities;
- keep three unavailable IDs unresolved until the actual integration/device role is identified;
- verify whether two entities refer to the same physical circuit before counting; do not double count;
- preserve write scope exactly `light.tambur_svet_l1`; adding a `switch.*` to a read-only classification never grants write permission.

No `ha_call_service`, automatic rename, entity deletion, new Telegram poller, or production promotion. The existing 7-ID overview remains explicitly partial until trusted data is reviewed. Do not claim whole-house coverage.
