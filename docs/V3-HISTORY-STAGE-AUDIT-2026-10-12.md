# RS Home AI V3 — history / stage reconciliation (2026-10-12)

This is a **documentation evidence audit**, not a new engineering gate and not live Pi inspection. It reconciles owner-provided Pi outputs, merged source history and project instructions. Latest evidence wins over stale headings in older documents.

## Correct active phase
**Limited Telegram MVP hardening / trustworthy home-state inventory, followed by an owner-approved immutable release.** Prioritize value-first read-only natural Russian queries and verified HA areas before broadening any writes. Reuse HA Assist, ESPHome, HA-MCP, systemd and existing lighting-classification module. Gate B wider actor/scope/authorization chain remains OPEN, despite extensive isolated tests. No autonomous room-wide actions or voice identity authorization.

## Evidence matrix

| Layer | Confirmed | Not demonstrated |
| --- | --- | --- |
| GitHub source | Natural Russian read-only routing PR #37 merged; import fix PR #39; bounded live diagnostics PR #40; additional scoped inventory review already in canonical branch; existing classification loader supports fixture/switch/exclusion categories | Classification of physical corridor devices and production rollout of latest source |
| Offline CI | PR #39: 172 test files / 660 assertions / 0 failed; earlier PR #37: 171 / 659; later CI jobs require their own run evidence | Pi security suite passing inside namespaced systemd sandbox |
| Pi DEV | Owner fast-forwarded DEV to `259a2b5`, subsequently ran corrected import and diagnostics. Pi reported `SAUNA complete`, `TAMBOUR complete`, `LIGHTS partial` | Current Pi HEAD, cleanliness, latest unattended DEV-timer result |
| Offline STAGE | Owner-confirmed exact-SHA STAGE_PASS at `46ce492` and at `ed27051`, loopback mock tests identity/health/registry/deny, no deployment | Isolated physical stage environment with separate credentials and Telegram bot |
| Live HA-MCP (read only) | 2026-10-12: sauna 27.125 °C, not ready at 85 °C; tamboor on; seven chosen `light.*` reads: one on, three off, three `unavailable` (`light.koridor_2`, `light.koridor_1_etazh_2`, `light.koridor_spot_2`) | Physical identity/type/area of all seven; status of switch/helper equivalents; completeness of all household lights |
| Production | Last owner-verified V3 release `c6a9812`, live sauna/natural language tested and pending → cancel → confirm denied. Previous release `97343fa` kept for rollback; Home Assistant Green independent by design | Latest read-only service/rollback health checks; full V2 and Gate D last-execution status; any promotion of current GitHub HEAD |
| Access | Narrow on/off permission applies **only** to `light.tambur_svet_l1` through existing pilot confirmation guard | Wider room write authority or live Gate B/C/E acceptance |

## Correct order (next actions)
1. **Inventory-only:** identify intended physical fixtures, helper entities and `switch.*` domains for corridor and tamboor via owner-approved read-only HA metadata, without guessed IDs, broad service-call access or secrets. Map reviewed real fixtures/switches/exclusions using `src/decision/lighting-classification.mjs`. Keep `unavailable` explicit and do not report seven selected entities as all home lights.
2. **User value:** integrate reviewed classification into bounded light status responses; preserve existing permissions and fail closed. Test unknown, stale, disabled, mixed-domain and duplicate entries. Verify Russian natural question routing with real HA read-only on Pi.
3. **Release gate:** current HEAD and clean DEV, exact-SHA CI candidate and mock STAGE, independent ARMv7 runtime checks, production/V2/Gate D checks, no second poller, known rollback and owner **explicit consent** to switch; never automatic promotion.
4. **Then** widen supported rooms only after authoritative registry/provenance policy Gate B and real controlled Gate C acceptance. Gate D resilience/fault and Gate E voice reuse remain open.

## Important reconciliation / avoided mistakes
- Earlier `docs/V3-NEXT-STAGE-DEV-STAGE-PROD.md` says active prod `97343fa`; superseded by owner-verified `c6a9812`. Its mock-only description remains valid.
- Earlier TODO sections saying offline STAGE not yet tested or seven-light real check pending are historical; this page and latest appended checkpoints supersede them. Do not rewrite historical evidence out of Git history.
- PR #42 duplicated the narrower scoped inventory review already present in canonical branch. Supersede rather than maintain parallel competing instructions.
- `/lights_on` may belong to the separate older V2 workflow; **do not conflate** it with narrow V3 `/lights` or assume one is deployed because another passed CI.
- Read-only client access to exactly seven IDs does not prove actual hardware type or room membership. Classification data itself cannot grant policy authorization.
- Home Assistant must keep working when the Pi agent fails or is stopped. Do not relocate V2 or historical Gate D checkout while auditing directories.

Next audit should attach **actual** Pi output rather than silently upgrading evidence from source tests to live acceptance.
