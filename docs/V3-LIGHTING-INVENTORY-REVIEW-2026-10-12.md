# Lighting inventory review — 2026-10-12

Owner clarified that some light-related entities are switches or auxiliary entities, not physical lamps.

## Observed through real HA-MCP
- `light.tambur_svet_l1`: on; exact existing approved pilot.
- `light.koridor`, `light.koridor_1_etazh`, `light.koridor_spot`: reported off in the seven-target overview (individual identities need independent confirmation).
- `light.koridor_2`, `light.koridor_1_etazh_2`, `light.koridor_spot_2`: explicitly `unavailable`.

## Review decision
- **Do not treat unavailable entities as lights that are off.**
- **Do not replace `light.*` with guessed `switch.*` aliases** or silently expand HA-MCP allowlists.
- Reuse existing `src/decision/lighting-classification.mjs`: `light_ids`, `switch_light_ids`, `excluded_light_ids`. Keep unresolved devices unclassified until verified in Home Assistant.
- Before altering the seven-target overview, collect *read-only* registry details (entity_id, friendly_name, platform, device/area, disabled status, domain, current state) through the owner's existing HA tooling. Do not print tokens, coordinates, personal identifiers, or full registry dumps.
- Confirm physical meaning and which switch actually controls which fixture with owner; read-only state alone does not prove a physical relationship.
- Until reviewed, describe `/lights` as **seven selected entities**, not whole-house illumination. Existing V3 production `c6a9812` remains untouched.

## Acceptance
- Reviewed fixture/switch/excluded classification saved in a non-authorizing config.
- Separate tests for switch vs light states and unknown data.
- GitHub CI, Pi STAGE and real HA read-only check; production promotion only after explicit approval.
