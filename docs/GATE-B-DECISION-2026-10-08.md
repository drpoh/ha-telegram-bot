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
