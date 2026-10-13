# RS Home AI V3 — agent handoff checkpoint (2026-10-12)

**This short checkpoint overrides older dated claims in long journals; no older history is deleted.** Read together with `AGENTS.md`, `docs/CURRENT-STATE.md`, `docs/TODO.md`, `docs/CHAT-HANDOFF.md`, and `docs/WORKLOG.md`.

## Owner-confirmed scope
- Develop **new `light.*` lighting only**, excluding **all** `light.browser_mod*` without exceptions. Sensors and `switch.*` deferred. No automatic changes to HA area/entity/device registries.
- Existing Home Assistant must continue working with V3 stopped; **no new physical write targets** without explicit owner authorization.
- Canonical DEV Git branch `feature/v3-home-agent`; Raspberry Pi checkout `/home/drpoh/projects/rs-home-ai-dev`. Active production remains immutable `9dd5964`; previous rollback `c6a9812` retained. No promotion or changes to system services.
- Reuse official HA/HA-MCP, ESPHome and systemd. Free-only agent collaboration (Jules); maintain small PRs based on **DEV**, never stale `main`.

## Verified evidence
- HA Template export contained 38 `light.*`, from which 19 additional candidates were recorded in `src/home/new-light-candidates.mjs`. Four earlier `light.*` were already pilot read targets.
- The owner ran two live Pi DEV manual HA-MCP read-only diagnostics. The second run (after fixing transient connection failure) returned **ON 2, OFF 7, unavailable 10**, all 19 exact IDs read, no service calls. Ten specific unavailable IDs are documented in `docs/V3-NEW-LIGHTS-REAL-READ-2026-10-12.md`. Cause of an earlier connection failure is *unproven*; a HA reboot is plausible, not confirmed.
- PRs #63, #64, #66, #67, #68, #70, #71 have passed their exact-head CI and merged. PR #73 (offline room view, **not** Telegram/live read permission) passed exact-head CI and merged as `e11b0bef9ef50b1bc25b2c08ec28dd1cefd20e5d`.
- `src/home/new-light-area-summary.mjs` only presents **fresh results passed into it** and explicitly labels coverage as 19 selected HA entities, not the whole home or fixture count.
- Jules issue #72 was acknowledged by the bot but no completion PR was linked in its comments as of this review. Older Jules PRs #56, #65, #69 target stale `main` with ~439 files; **do not merge**. Reuse any useful test changes only as a separately reviewed tiny DEV PR.

## Next concrete tasks
1. Obtain the narrowed Jules tests-only PR based on `feature/v3-home-agent` or cherry-pick only the tested minimal subset manually. CI for exact PR HEAD mandatory.
2. Diagnose ten `unavailable` lights by **native HA read-only entity/device registry** (and integration status) before labeling them stale, duplicate or physically dead. Do not delete or repair HA records without a separate decision.
3. Verify available nine new lighting entries, their actual physical circuits and potentially duplicate `light.*` aliases. Record per-ID evidence and HA areas. Do not silently broaden MCP live read allowlist.
4. Once reviewed, integrate bounded fresh per-room status into DEV read-only command behind tested per-entity allowlist. Physical writes remain restricted to existing tamboor flow.
5. Keep `docs/TODO.md` + handoff updated after each verified merged milestone. Avoid chronological bloat in short agent instructions; leave full history in WORKLOG/archive.

## Repo hygiene
- **Do not force push or prune unknown/working branches**. Before deleting any branch, verify no open PR uses it, commits are merged/reachable, and user has not designated it historical. GitHub branch cleanup is independent from deleting files on Raspberry Pi.
- No duplication of historical HA snapshots into runtime caches. Never commit credentials or full private entity export.
- GitHub Actions CI alone does not prove Pi ARMv7 or HA availability; only owner-provided runtime evidence does.

## Later checkpoint — room diagnostic
- PR #75 passed exact-head GitHub Node offline CI for `0b97379dbfcd0af4c7a07e3391ca678b0e424a9d` and merged DEV `b56b8cdf5c81baf5ab6c2cabaffd22a07f77c626`. The operator-only `scripts/manual/v3-new-lights-readonly-preflight.mjs` now prints `NEW_LIGHT_AREA` per-area ON/OFF/unknown totals based solely on the just-completed 19-entity `ha_get_state` results. It does not activate a Telegram handler, change existing six read permissions or grant physical writes. Pi has not yet run this updated code. Jules issue #72 remains acknowledged but has no confirmed ready PR linked as of this checkpoint. No branch deletions.

## Later Pi acceptance — manual room counts confirmed
- Owner ran the 19-light manual HA-MCP read with PR #75 code: 1 on, 8 off, 10 exact HA `unavailable` states. Room counts: Kitchen 0/3/4; Living room 1/2/3; Bedroom 0/0/1; Corridor 0/0/1; Sauna 0/2/0; first-floor corridor 0/1/1 (on/off/unknown). This is a single observation, no runtime expansion.
- Next read-only evidence: `docs/V3-UNAVAILABLE-LIGHT-HA-REGISTRY-CHECK-2026-10-12.md`, a built-in HA Template for only the 10 unavailable lights. No installation or registry mutation. Jules issue #72 still no confirmed ready PR at this check; no wrong-base merges.

## Latest DEV progress — 2026-10-12
- PR #76 (built-in HA Template for 10 persistent unavailable light IDs) passed exact-head CI and merged `c2e0e034860962000085170ba6a44ee1ffcc8e5e`.
- PR #77 (bounded room-specific light question formatter with exact trusted aliases, offline tests) passed exact-head CI and merged DEV `8e380347cc727b5e1e97b7e0593f597c62bbed25`. The new formatter does **not** extend the live MCP allowlist, does not hook Telegram yet and never authorizes writes. Tests do not establish physical fixture identity.
- Owner HA Template registry output for the 10 unavailable candidates is not yet received. This evidence is required before selecting reliable physical lighting targets. Jules issue #72 acknowledged without confirmed completion PR as of check. All `light.browser_mod*`, sensor and switch additions remain excluded; no production promotion.

## Manual light selection gate
- Owner proposed manual light addition. PR #78 added strict source-only `selectManualLights(ids)` review selector from existing 19 candidate IDs. Exact-head offline CI success and squash merge DEV `1b98ad46fb86366c2ba900ff5d755c38eab26170`. Selection cannot grant HA live read or physical write authority; Browser Mod, unknown IDs, duplicates and switch IDs rejected.
- User intent could include *manual controls* rather than manual inventory selection: confirm whether only read-only status is desired or enabling new physical turn-on/off with per-action explicit `/confirm`. Any new write scope needs exact fixture/entity owner confirmation, independent safety review and separate approval. Until then, do not change live write policy.

## Batch visible light request
- Owner requested acceleration and batch adding every light visible in last Pi read. Exactly nine new IDs were ON/OFF and ten explicitly `unavailable`. The nine are collected in `src/home/responding-new-light-batch.mjs` for one-pass DEV identity review, without granting physical action authority or adding Telegram controls. Owner's general intention is switches via `/confirm`, but actual per-target physical mapping and separate live authorization are not yet established. Existing V3 prod write scope remains single tamboor L1. No `light.browser_mod*`, switches or sensors.

## Telegram source routing added — PR #85
- PR #82 gated HA-MCP physical light dispatcher CI-pass merged `f2c2d2c`, #83 consent adapter merged `e787a99`, #84 offline end-to-end composed tests merged `c7dc80f`, and #85 DEV Telegram `/newlight <light.entity_id> on|off` + shared `/confirm` and `/cancel` routing CI-pass merged `64e017b2bb9f1568a1461b8f447a4b116e70fee5`.
- CRITICAL: #85 has `createNewLightDispatch({releaseEnabled:false,approvedIds:[]})` **hard disabled** and requires manually approved physical identity and trusted production release procedure before any new HA call. This is NOT a live activation or a real Pi test. The running V3 release is still immutable `9dd5964`. Legacy tamboor-only controls preserved. Never silently change that flag or extend the kitchen MCP client allowlist.
- Next single bottleneck: verify physical mapping of responding light IDs, inspect trusted HA-MCP access boundary, and get explicit operator approval for production change; then carry out reviewed deployment and on-device one-target physical verification. All `light.browser_mod*`, sensor and switch additions remain excluded.

## 2026-10-13 — Jules incorporated, Telegram DEV wired
- Owner asked to use Jules completed work. Jules task `14844753559500545287` generated PR #86 against stale `main` (452-file diff). Reviewed and copied **only Jules's three appended tests**, unchanged, from `test/v3-new-light-review.test.mjs` and `test/v3-new-light-candidates.test.mjs` onto canonical DEV via PR #87. Exact-head offline CI PASS; squash commit `9a545091a278a0d29b876fb3582fb2ee56d7dd29`. PR #86 closed superseded with explanatory comment; original branch and history retained.
- PR #85 (DEV Telegram `/newlight <entity_id> on|off` routing with `/confirm` and `/cancel`) is **already merged** at `64e017b2bb9f1568a1461b8f447a4b116e70fee5`. `newLightDispatch` remains explicitly `releaseEnabled:false` and `approvedIds:[]` inside the handler. Thus *no physical new-light control is active*, and it is **not** deployed to immutable production `9dd5964`. New-light command is source-ready but requires exact physical identity evidence, separate admission/approval and operational acceptance. Never advertise physical execution as already live.
- Desktop Commander remote connection quota was checked and remains exhausted (`remote_calls_left_pct:0`), so this chat cannot inspect/sync/restart the Pi directly. Do not infer runtime state from GitHub merge. Need owner-supervised Pi DEV sync/testing and a separate production gate before activation.
