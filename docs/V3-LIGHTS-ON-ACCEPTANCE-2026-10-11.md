# `/lights_on` live acceptance gate — 2026-10-11

The implemented command is source-only in dev. `config/devices.json` lists three lights and a sauna temperature sensor: it is NOT a full-home inventory. The HA-MCP adapter accepts structured data and single JSON text content only when `entity_id` matches the requested light and state is exactly `on` or `off`. Errors, malformed or mismatched responses fail closed.

Before deployment: verify these entity IDs against the live registry, inspect an approved authenticated read-only HA-MCP response safely, review private Telegram access and the existing V2 release/rollback, then validate the command without creating another bot poller. Do NOT change running V2 checkout or production service merely because offline tests pass. No HA control permissions are expanded.

## Updated dev behavior (later 2026-10-11)
The initial three-light adapter described above was superseded in canonical dev by `src/home/discovered-lights-overview.mjs`, which uses one bounded `ha_search` snapshot and refuses incomplete paging, missing provenance fields, duplicate IDs, empty inventory and malformed lights. It reports `on`, `off` and unavailable/unknown separately; an unknown light is never called off. A read-only HA-MCP inspection observed 41 lights at one instant, not a guarantee of current completeness. This command still has **not** been promoted into the running V2 service. Existing live V2/V3 remain untouched.
