# Home Assistant registry catalog — external research notes (2026-10-14)

**Status: external Perplexity research provided by owner, NOT independently verified implementation guidance.** Preserve links and decisions; confirm specifics against installed HA Core/HA-MCP versions and actual protocol before relying on them. This is a research artifact, not permission to connect, mint tokens, change credentials, deploy or perform HA writes.

## Why this research matters

Owner-observed HA-MCP facts on Raspberry Pi:
- Native `ha_list_floors_areas`: **17 areas**, **2 floors** (5+7), **5 areas not assigned to a floor**.
- Scoped `ha_get_device({area_id,limit,offset})` sweep: **100 device records assigned to the 17 areas**, 17 read requests, complete for those areas **only** (not entire HA device registry; unassigned devices not counted).
- `ha_config_get_label({label_id:null})`: **15 labels**; exact-name category totals one `Освещение`, one `Управление`, one `Системный`, 12 other.
- `ha_get_entity({entity_id})` yielded `entity_entry` with `area`, `device_id`, `label_names` while `area_id` was null and `labels` was empty for tested entry.
- `ha_get_entity({domain:'light'})` returned `unavailable` to local audit. External report says domain-only enumeration is unsupported; verify against installed tool source. **Do not conclude the entire MCP is broken**.

## Recommended architecture to evaluate (NOT approved for live deployment)

**Reuse First: native Home Assistant WebSocket API for registry snapshot; existing HA-MCP for scoped conversational lookups/control.** Compare this against any truly complete built-in HA-MCP registry export before introducing a new connector.

Suggested native read-only WebSocket commands (verify each for actual installed Home Assistant version and permission model):
- `config/floor_registry/list`
- `config/area_registry/list`
- `config/device_registry/list`
- `config/entity_registry/list`
- `config/label_registry/list`

`config/entity_registry/list_for_display` is a compact alternative: abbreviated `ei` entity ID, `ai` area ID, `di` device ID, `lb` label IDs, `hb` hidden flag; research says disabled entities are excluded, so **never call that a complete registry** without comparing. Full `entity_registry/list` is preferred for auditing disabled/hidden records.

Join precedence: explicit `entity.area_id` > `device.area_id` > **unassigned**; `area.floor_id` determines floor. Entity without device and device without area are valid; don't infer missing relationships from names. Keep area/device/entity label sources **separate**; if displaying effective labels, provenance must remain visible. Never turn labels/categories into permission for new reads/writes. Also distinguish registry device records from physical devices (device registry evolution/child devices).

Candidate synchronization: first complete snapshot, then registry change events to invalidate relevant section and refetch on bounded debounce. Always resnapshot on reconnect, failed/dropped event, stale version or unverified coverage. Do not add autonomous HA polling/service in current production.

## Ready-made references to verify

- [Home Assistant WebSocket API](https://developers.home-assistant.io/docs/api/websocket/)
- [2026.8 device registry config-entry migration](https://developers.home-assistant.io/blog/2026/07/21/device-registry-single-config-entry/)
- [Device registry WebSocket API changes](https://developers.home-assistant.io/blog/2026/08/19/device-registry-websocket-api-changes/)
- [Device registry follow-up changes](https://developers.home-assistant.io/blog/2026/08/24/device-registry-follow-up-changes/)
- [HA-MCP source](https://github.com/homeassistant-ai/ha-mcp)
- [HA-MCP tools reference](https://homeassistant-ai.github.io/ha-mcp/tools/)
- [HA-MCP get_entity](https://glama.ai/mcp/servers/homeassistant-ai/ha-mcp/tools/ha_get_entity)
- [HA-MCP search](https://glama.ai/mcp/servers/homeassistant-ai/ha-mcp/tools/ha_search)
- [Home Assistant JS WebSocket client](https://github.com/home-assistant/home-assistant-js-websocket)
- [ws library](https://github.com/websockets/ws)

## Cautions about the external report

1. The report describes its long Node.js example as working, but its `createConnection`, `subscribeMessage` and `msgId()` usage is **not validated here**. Do not copy it to production without official client API verification and tests.
2. "New HA long-lived token is read-only" is **NOT true by default**: token scopes are tied to user permissions; simply using read-only commands does not make credentials read-only. Separate catalog credentials are only a **proposal** requiring owner approval and least-privilege review.
3. Research claims about automatic completeness, specific 2026.8/2026.9 registry transitions, subscription event names and authorization requirements still need version-specific verification.
4. `ha_search` can return partial results; `ha_get_entity` and `ha_get_device` are point/scoped queries. A 100-record area census does not verify the full entity/device registry.
5. Avoid building a standalone service, new token, or persistent cache before evidence that existing MCP cannot deliver full, validated registry data. Prefer a small adapter inside existing DEV architecture.

## Decision gate / implementation checklist

- [ ] Verify installed HA-MCP version matches referenced source and exact supported list/search arguments.
- [ ] Verify native HA WebSocket registry read operations against installed HA Core and existing least-privilege access; no new credentials or network connection without explicit review.
- [ ] Build offline fixture-driven normalizer for floors/areas/devices/entities/labels using real (redacted) shapes, covering hidden/disabled, empty/null relationships, child devices and label provenance.
- [ ] Validate full/partial coverage and counts, reconnect and cache invalidation; never confuse active subset with all records.
- [ ] Build a bounded read-only DEV catalog summary adapter reusing HA-MCP, and test memory/resource footprint on Pi3.
- [ ] Stage and acceptance gates before any production activation; pinned V3 `93f11cd` and V2 unchanged.

**Source:** owner-provided Perplexity export (`export_4222467098315290382.md`, received 2026-10-14). This note preserves the actionable findings and original URLs; consult owner's original export for broader comparisons and code snippets. Research conclusions are not independently audited.

## Verified against official sources and offline implementation, 2026-10-14

Official [HA WebSocket API](https://developers.home-assistant.io/docs/api/websocket/) confirms `config/entity_registry/list_for_display` is for **enabled only**. Official [home-assistant-js-websocket README](https://github.com/home-assistant/home-assistant-js-websocket) documents `createLongLivedTokenAuth`, `createConnection`, `connection.sendMessagePromise({type})`, `subscribeEvents`, and auto reconnect. The Perplexity code sample's `connection.msgId()` / custom subscribeMessage request flow must not be copied. For Node, the upstream README notes `ws` polyfill. These are **source verifications**, not evidence of authorization on the owner's HA instance.

Implemented source-only pure `src/home/ha-ws-registry-snapshot.mjs` using exact five command identifiers and deterministic joins; tests use offline fake WebSocket list replies, no tokens or live connections. It keeps area/device/entity label provenance independent; explicit entity area overrides device area; disabled and hidden remain represented separately; dangling references reject completeness. **Do not supply a list_for_display payload as a full entity list.** Next live validation must be separately scoped and owner-approved; no new token should be generated implicitly.

## Native loader and freshness controller — DEV 2026-10-14

The official [home-assistant-js-websocket](https://github.com/home-assistant/home-assistant-js-websocket) documents `connection.sendMessagePromise({type:'config/.../list'})`, returning the **result payload**, not a raw `{success,result}` envelope. DEV `src/home/ha-ws-registry-loader.mjs` now takes an injected *already authenticated* connection, makes exactly five sequential explicit native registry reads with a bounded timeout, validates all five lists using the existing fail-closed normalizer, and returns a shape/count-only report when requested. It cannot create sockets, credentials, or issue HA write calls. `src/home/ha-ws-registry-freshness.mjs` is a pure state tracker: dirty registry events or disconnections prevent reporting a fresh catalog until a full resnapshot succeeds. **Neither module is connected to production or performs any live read.** Real permission testing, child-device variations, event payloads, reconnect hooks, and Pi resource limits still require acceptance evidence.
