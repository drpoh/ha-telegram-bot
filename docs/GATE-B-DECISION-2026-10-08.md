# Gate B decision — 2026-10-08

**Decision: NOT ACCEPTED for owner-home/production authority. Isolated integration complete for the limited Telegram light.fixture mock path.**

## Evidence
- Joined Telegram fixture → original command/actor binding → token → scope and policy → mock action → readback has a passing end-to-end test.
- Cross-actor confirmation and replay are denied in the same joined test.
- Full isolated suite on Raspberry Pi 3 / Node 20.19.2: 71 test files, 317 passing assertions, zero failed files, exit 0.
- No live HA service call, production reboot, production v3 startup, authorization grant or entity rename.

## Required to close owner-home Gate B
1. **Owner policy approval:** independently review a specific, per-home entity/service list and exact version/digest, then store in protected local configuration with a separate approval record. The existing JSON loader only returns parsed_not_operator_approved.
2. **Authoritative inventory:** obtain and validate complete authenticated read-only HA device/area registry evidence; generic ha_search and satellite capability claims are not sufficient. The local lighting review is pending.
3. **Actual transport boundary:** prove the Telegram adapter only receives Telegraf-delivered authenticated updates. A caller can forge a plain fixture ctx object, so offline fixture authenticity is not established.
4. **Combined policy provenance and joined audit/fault gate:** prove invalidation on policy/registry mutation and complete audit evidence through the exact joined path, including race conditions.

Until these are met: **Gate B OPEN**, no production v3 action. Do not infer approval from 317 passing mock assertions. Gate C/D deployment does not start.

## Owner-home classification review prepared
See `docs/GATE-B-HOME-LIGHTING-REVIEW.md`. The preserved October 8 preliminary data covers three areas but includes unresolved switch/light classifications and is not an authoritative current full registry. Therefore no policy approval, broad light-scene grant or live-control authorization can be inferred.

## Direct HA registry follow-up

Read-only SSH to `homeassistant.local` confirmed readable core device/entity/area registry snapshots, with 293 devices, 2,901 entities and 17 areas. A room-by-room comparison found a previously omitted separate `koridor_1_etazh` area and unclassified light-like switches in sauna, kitchen and corridor. See `docs/GATE-B-HOME-LIGHTING-REVIEW.md` for sanitized entity IDs and owner questions. No live grant or authorization inferred.

## HA-MCP live-state readback checkpoint

A standalone read-only MCP connection checked 17 exact light/switch entities in four areas, with three unavailable entities (`light.sauna_sauna_te_sauna_status_led`, `light.svet`, `light.sonoff_1000d78a79`). See `docs/GATE-B-HOME-LIGHTING-REVIEW.md`. This improves evidence freshness but does not automatically approve whole-room grants or settle the user's intended lighting semantics.

## Owner scope decision
Owner approved interpreting unqualified «Выключи весь свет» as all current members of `light.ves_svet` (14 at review time); `light.ves_svet_2` must not be substituted. This is intent/scope approval only; production write capability and broader Gate B acceptance remain withheld.
