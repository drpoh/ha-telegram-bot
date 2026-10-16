## CURRENT PRIORITY — 2026-10-16 (V2.1 DEV, overrides historical V3 notes below)

Concise current status: [V2.1-STATUS.md](V2.1-STATUS.md). Use that document and the current TODO before older V3 checkpoints.

- Current isolated DEV on Pi: /home/drpoh/projects/rs-home-ai-scene-test, systemd --user rs-home-ai-rc3.service; verified commit 2fa0f11, 135 isolated files / 541 assertions, no failures; service active and zero restarts at test.
- Telegram DEV demonstrated conversational follow-ups across corridor battery sensors (83% and 100%), kitchen (97%), and living-room question. Claims of no devices in an area still need exhaustive registry validation.
- Production V2: /home/drpoh/ha-telegram-bot and its service/DB must NEVER be edited, restarted or used for Git fetch/merge. DEV remote name github, NOT origin (origin points to production checkout).
- Source branch: feat/v2-safe-ai-scene-authorization-20261015. Latest GitHub changes after Pi verified state require a new combined test before release.
- Branch cleanup: verified archive/branch-history-20261016 preserves 65 source tips; 47 legacy branches deleted, 22 GitHub branches remain. Open PR heads and operational branches retained. Read docs/BRANCH-CLEANUP-2026-10-16.md.
- Current conversation issues: exact area membership and absent-device claims; no hallucinated complete inventory. Avoid unnecessary intermediate Raspberry Pi tests; batch changes.
- Prior V3 guidance below is historical and must not supersede active V2.1 development priorities.

# RS Home AI V3 — new-chat handoff

This is the FIRST document to read when resuming this project in another chat.
It is a compact navigation index, not a substitute for live repository checks.

**Pi layout warning (2026-10-10):** `/home/drpoh/ha-telegram-bot` is the v2 system-service working directory; `/home/drpoh/rs-home-ai-v3` is a distinct **older** checkout of the same GitHub remote, directly used by the V3 user service. Never reset/rebase/pull the second copy, or move either directory, on a generic continue request. Read `docs/PI-REPOSITORY-LAYOUT-PLAN.md` and run read-only `node scripts/audit-pi-layout.mjs` to check both.

## Canonical sources, in priority order
1. Live Pi working tree and Git status in `/home/drpoh/ha-telegram-bot`.
2. `AGENTS.md` and `docs/home-agent-v3-strategy.md`: mission and non-negotiable safety invariants.
3. `docs/TODO.md` and last dated entries of `docs/WORKLOG.md`: open work and evidence.
4. `docs/REVIEW-2026-10-09.md` and `docs/PROGRESS.md`: broader gate status (historical totals are not present-day acceptance).
5. GitHub `drpoh/ha-telegram-bot`, branch `feature/v3-home-agent`: pushed source of truth; inspect PRs and compare with live Pi before edits.

## Current verified checkpoint (2026-10-09)
- Pi working branch: `feature/v3-home-agent`; verify live HEAD and cleanliness using `git status -sb` on every new chat; dated commit IDs below are historical.
- Latest verified full isolated regression for Gate B entity identity hardening: **109 test files / 443 assertions passed / zero failures**, npm exit 0 (see latest WORKLOG entry).
- Gate B remains **OPEN** for general/home-wide actions: missing authoritative complete live HA registry, approved per-home policy, trusted end-to-end identity/action authorization, and production acceptance.
- Gate D reboot recovery and owner-received Telegram test alert passed; incident alert and tested off-device recovery remain open.
- Gate E only offline/read-only planning; no live voice authorization.
- dev/stage/prod separation has an ADR and offline tests, but is **not deployed**.
- Existing v2 and limited v3 pilots must not be restarted, reconfigured, expanded or used for real HA actuation without explicit authorization. Home Assistant Green must remain independent.
- Gate E PR #1 snapshot validation hardening **MERGED** as `8eab92b` after focused 11/11 and full isolated 109 files / 442 assertions passed. Offline only; no Assist live authorization: https://github.com/drpoh/ha-telegram-bot/pull/1

## Start-of-chat read-only checks
Run with Desktop Commander on the authorized Pi, when connected:
```
cd /home/drpoh/ha-telegram-bot
git status -sb
git log -5 --oneline
git branch -vv
sed -n '1,180p' docs/CHAT-HANDOFF.md
tail -90 docs/WORKLOG.md
sed -n '1,150p' docs/TODO.md
```
Confirm the current GitHub branch/PRs; never assume this dated checkpoint is still the latest.
Never print `.env`, access tokens, private HA URLs, DB contents or raw personal logs into chat.

## Operating protocol
- Select the next item from confirmed blockers in TODO, not conversational progress claims.
- Inspect changed files, run focused checks, then full isolated regression where appropriate.
- Log commands, counts, exit codes, branch/commit/push status and remaining caveats in WORKLOG; adjust TODO and this handoff with every stable milestone.
- Push reviewed tested changes; preserve dirty worktrees and avoid overwriting work done in another chat/session.
- Distinguish offline test passes, Gate evidence, and operator-authorized live acceptance.
- If Pi is offline, GitHub is a fallback; state that live runtime and local unpushed changes are unverified.

## Resume priority
1. Continue Gate B trusted actor/action/policy and authoritative read-only registry provenance (PR #1 has been merged; no need to redo it).
2. Continue Gate B trusted evidence and operator-policy provenance work without live HA control.
3. Complete Gate D incident evidence/backup design and Gate E authenticated read-only route only after their specific prerequisites.

## Additional offline Gate B checkpoint — 2026-10-09
- New dedicated registry source contract and three passing focused tests, **not production integrated**. Claims are not credentials or proof of transport authentication.
- Full suite most recently recorded before this new module: 109 files / 443 assertions, zero failures. Do not claim the new module passed full regression until rerun.
- Next: authoritative HA registry transport/source verification, protected owner approval, and independent actor-to-action binding. No real HA control.

## Gate B source audit checkpoint — 2026-10-09
- See `docs/GATE-B-REGISTRY-SOURCE-REVIEW.md`. Generic `ha_search` and `ha_get_overview` are insufficient as complete authoritative registry sources. No production transport source is accepted.
- Focused source contract tests: 4/4 pass; full suite after this test-only documentation change remains not rerun. Gate B OPEN.

## Installed HA-MCP verification — 2026-10-09
- On Pi, authenticated connection to the configured HA-MCP succeeded with **53 advertised tools**. Schema read-only discovery verified `ha_get_device` paginated list, `ha_get_entity` single/batch resolution, `ha_list_floors_areas`, and paginated `ha_search` — but **no dedicated atomic registry snapshot tool**. See `docs/GATE-B-REGISTRY-SOURCE-REVIEW.md`.
- Live registry completeness and consistent origin remain UNPROVEN. Never treat generic pagination as authorization; Gate B remains OPEN.

## Gate B offline page consistency checkpoint — 2026-10-09
- Added `v3-registry-page-consistency.mjs` plus two focused passing tests; this is not an authenticated live collector and cannot authorize anything.
- Installed HA-MCP lacks a demonstrated shared generation token for all registry pages; this remains the deployment blocker. See WORKLOG for detail.

## Native HA WebSocket investigation — 2026-10-09
- Upstream has direct registry list WebSocket commands for entities, devices and areas. Their separate calls are not an atomic cross-registry snapshot. See `docs/GATE-B-REGISTRY-SOURCE-REVIEW.md`.
- Offline two-pass digest module passes 2/2 focused tests but is NOT transport authentication or HA authorization; full regression pending.

## Bounded offline HA WebSocket read adapter — 2026-10-09
- `src/decision/v3-ha-registry-read-adapter.mjs` constructs only the three native registry list commands, injectable fixture transport; verifies two passes and child/area links; **5/5 focused tests passed**. Full regression **113 files / 454 assertions passed / zero failed files**, npm exit 0; log `/tmp/rs-v3-registry-read-adapter-full.log`.
- No live connector is wired or approved, `authorization:false` always. Gate B OPEN; full test outcome must be recorded before considering this milestone stable.

## Offline HA WebSocket endpoint policy — 2026-10-09
- `src/decision/v3-ha-registry-endpoint-policy.mjs`: pure preflight, 2/2 focused passing; **does not connect or verify TLS**. Protected source claims remain untrusted. Full suite last passed 113 files / 454 assertions *before* this module; Gate B OPEN.

## Gate B offline WebSocket frame guard — 2026-10-09
- A fixed-read-command WebSocket protocol fixture was added; focused 2/2 tests passed. It has no network socket, TLS or token verification; `authorization:false` is unconditional. Gate B remains OPEN. See latest WORKLOG.

## Gate B offline injected WebSocket client — 2026-10-09
- `v3-ha-registry-ws-client.mjs` exists with mock-only transport tests: 4/4 focused pass. Full regression **116 files / 460 assertions passed / 0 failures**, exit **0**, log `/tmp/rs-v3-ws-client-full-20261009.log`.
- Security limit: no real TLS/host or credentials provenance checks, socket supplied externally, authorization always false. Not live-deployed; Gate B OPEN.

## Gate B injected secret fixture — 2026-10-09
- Pure fixture `v3-ha-registry-secret-boundary.mjs` tests secret validation/closure, 2/2 focused passed, but NOT production authentication or protection against malicious injected callbacks. No real secrets used. Full regression pending. Gate B OPEN.

## Gate B secret-file guard — 2026-10-09
- Added `v3-ha-registry-secret-file.mjs` permission/symlink/owner checks with 2/2 focused tests on temp fixtures. Not connected to live secrets; parent-directory security not audited. Full npm test not yet rerun. Gate B OPEN.

## Gate B secret ancestry fixture — 2026-10-09
- `v3-ha-registry-secret-file.mjs` now checks ancestor directory ownership/symlinks/unsafe writable modes; focused 3/3 pass. Full suite **118 files / 465 assertions passed / 0 failures**, exit **0**, log `/tmp/rs-v3-secret-ancestor-full.log`. No real secrets accessed and production remains untouched. Gate B OPEN.

## Gate B offline TLS peer evidence — 2026-10-09
- New `v3-ha-registry-tls-evidence.mjs` and 2/2 passing focused fixtures check hostname and certificate fingerprint; no actual network TLS handshake, peer data is caller supplied. Full suite **119 files / 467 assertions passed / 0 failures**, exit 0, log `/tmp/rs-v3-tls-fixture-full.log`. Gate B OPEN.

## Gate B cooperative mock WebSocket cancellation — 2026-10-09
- Latest offline change passes `AbortSignal` to injected `socket.exchange` and aborts on timeout; focused regression 3/3. Full suite **119 files / 468 assertions passed / 0 failures**, exit 0; log `/tmp/rs-v3-ws-abort-full-20261009.log`.
- Mock socket can ignore abort and `close()` can hang; this does NOT supply real transport-layer I/O enforcement, TLS peer identity or production authorization. Gate B OPEN.

## Gate B offline bounded WebSocket close — 2026-10-09
- Added a bounded `closeTimeoutMs` to the injected mock transport and adversarial tests for hanging close, ignored abort and thrown close; focused 5/5 pass. Full regression **119 files / 471 assertions passed / 0 failed**, exit 0; `/tmp/rs-v3-bounded-close-full-20261009.log`.
- Not a real transport kill switch, TLS provenance or authorization. Gate B still OPEN; do not deploy.

## Gate B accelerated delivery switch — 2026-10-09
- Owner approved faster vertical-slice development, use of maintained HA/MCP libraries and tiered tests. `AGENTS.md` and `docs/ADR-GATE-B-ACCELERATION.md` specify boundaries. No production integration, permissions or credentials changed.
- NEXT: official client compatibility evaluation, then combined *isolated* intent/actor/action/policy/scope/confirmation chain. Avoid more standalone mock transport features unless required for safety. Gate B OPEN.

## Official client selection metadata — 2026-10-09
- Read-only npm metadata on Pi: home-assistant-js-websocket 9.7.1 Apache-2.0, ws 8.22.0 requiring Node >=10; current Node 20.19.2. Neither installed as a direct dependency. API/TLS/ARMv7 validation remains OPEN. See acceleration ADR.

## Gate B combined offline vertical-slice fixture — 2026-10-09
- New `test/v3-gate-b-vertical-slice.test.mjs` reuses existing ledger, mock dispatcher and read-only scope gates; 2/2 focused pass for actor/chat mismatch, forged/replayed token, tool substitution, scope drift and cancellation. Full regression **120 files / 473 assertions passed / zero failures**, exit 0; `/tmp/rs-v3-gate-b-vertical-full-20261009.log`. No live authorization; Gate B OPEN.

## Offline channel provenance vertical-slice — 2026-10-09
- New tests for channel ledger + command envelope + tool boundary, 2/2 focused passed, full regression **121 files / 475 assertions passed / zero failures**, exit 0, `/tmp/rs-v3-channel-slice-full-20261009.log`. This proves mock rules only; next blocker is trusted ingress outside caller/LLM input. Gate B OPEN.

## Gate B joined strict-denial checkpoint — 2026-10-09
- Existing Telegram joined adapter extended with strict registry/approval evidence fault matrix: focused 3/3 pass; no simulated write when either attestation missing or rejected. Full suite **121 files / 476 assertions passed / 0 failures**, exit 0; `/tmp/rs-v3-strict-evidence-full-20261009.log`. Still offline; Gate B OPEN.

## Official library verified on Pi — 2026-10-09
- `home-assistant-js-websocket@9.7.1` and `ws@8.22.0` installed **only** in `/tmp/rs-ha-upstream-probe-20261009` using no scripts, Node 20.19.2. ESM export smoke test succeeded (exit 0). No project dependency, real socket, token or service change. Favor official client for future reviewed read-only connection; Gate B OPEN. See acceleration ADR.

## Gate B official upstream Connection bridge — 2026-10-09
- `v3-ha-upstream-read-bridge.mjs` composes an injected official-client-shaped `sendMessagePromise` with existing two-pass registry checker. 2/2 focused pass, full npm regression **122 files / 478 assertions passed / 0 failures**, exit 0, `/tmp/rs-v3-official-bridge-full-20261009.log`. No network or privileges; Gate B OPEN.

## Official client reconnect isolation — 2026-10-09
- `v3-ha-upstream-read-bridge.mjs` now denies disconnected/closing connections and rejects a socket change during registry read. Focused **4/4** passed; full regression **122 files / 480 assertions passed / 0 failures**, exit 0, `/tmp/rs-v3-upstream-reconnect-guard-full-20261009.log`. No HA reads, credentials or deployment; Gate B OPEN.

## Gate B local TLS fixture -> reviewed policy stage — 2026-10-09
- Real Node TLS loopback handshake fixture passed untrusted CA rejection, trusted CA acceptance and hostname rejection, no HA contact; NOT an upstream HA connection acceptance.
- Started owner-policy origin stage, reusing `v3-trusted-policy-source.mjs` with new joined-chain denial fixture, focused 1/1 passed: default-deny v3 prevents execution even with simulated positive registry/approval callbacks. Full suite **123 files / 481 assertions / 0 failures**, exit 0, `/tmp/rs-v3-gateb-tls-policy-full-20261009.log`. Gate B OPEN.

## Faster regression script — 2026-10-09
- Optimized `package.json` check with `find ... -print0 | xargs -0 -P 3 -n 1 node --check`, same 256 files and same Node checker, no new dependency. Standalone syntax probe 69.47s/exit 0; `npm run check` 73.69s/exit 0. Full `npm test` **123 files / 481 assertions / 0 failures**, exit 0, **220.98s**, `/tmp/rs-v3-accelerated-test-20261009.log`. Gate B OPEN; no live HA change.

## Gate B composed registry + reviewed-policy fixture — 2026-10-09
- New `test/v3-gate-b-registry-policy-composition.test.mjs` composes existing official-client-shaped read-only bridge, Telegram joined chain and V3 default-deny policy. Focused 1/1 pass; 6 fixed registry reads, zero simulated writes. Full `npm test` **124 files / 482 assertions / 0 failures**, exit 0, 219.32s. Offline-only. Gate B OPEN.

## Upstream read timeout regression — 2026-10-09
- New hung-response test in `v3-ha-upstream-read-bridge.test.mjs`; focused 5/5, full `npm test` 124 files / 483 assertions / 0 failures, exit 0, 217.65s. Timeout fails closed and prevents next read, but does not kill the underlying pending socket. Gate B OPEN; no HA connection or service changes.

## Offline registry response size check — 2026-10-09
- Existing upstream read bridge now enforces a post-receive JSON-size limit, with oversized registry denial and no later read; focused 6/6 passed. Full suite **124 files / 484 assertions / 0 failures**, exit 0, 218.87s. Transport-level `maxPayload`, real TLS and operator policy still outstanding. Gate B OPEN.

## WSS loopback transport acceptance — 2026-10-09
- On Pi, actual `ws@8.22.0` WSS loopback test with self-signed SAN localhost (temporary cert) passed untrusted rejection, explicit CA acceptance, wrong hostname rejection, `maxPayload` 4096-byte rejection, and `terminate()` (5/5). No HA or production contact. Full caveats and live prerequisites: `docs/GATE-B-WSS-ACCEPTANCE.md`. Real endpoint credentials/operator approval absent, Gate B OPEN.

## Gate B timeout race checkpoint — 2026-10-09
- Found and fixed late-result continuation after registry timeout; 11 focused tests pass. Full regression log: /tmp/rs-v3-gateb-late-read-full.log. Transport cancellation still required. Gate B OPEN.

- Full isolated regression verified: 124 files / 486 passing assertions / 0 failures, exit 0.

## Gate B denial regression — 2026-10-09
- Added two upstream failure tests for rejected middle-page and close during later pass; focused bridge 10/10 passed. Full regression pending. No production or HA control.

- Full suite passed: 124 files, 488 assertions, 0 failures, exit 0.

## Gate B simplification decision — 2026-10-09
- Read `docs/ADR-GATE-B-MINIMAL-CLOSURE.md`: stop redundant custom socket micro-fixtures; prefer official `home-assistant-js-websocket`/`ws`, narrow registry bridge and one strict joined authorization chain. Focused 20/20 passed. No runtime change. Gate B OPEN until independently proven actual HA source + operator-reviewed V3 policy and authenticated ingress.

## Gate B joined policy denial tests — 2026-10-09
- Added two offline integration tests to v3-gate-b-registry-policy-composition: positive mock attestations cannot override default-deny policy and missing approval source denies. Focused 3/3 passed. Full regression pending. Gate B remains OPEN.

- Full npm test PASS 124 files / 490 assertions / 0 failed.

## Gate B Telegram update consistency — 2026-10-09
- Added matching checks between raw Telegram update and Telegraf fields when both supplied. Focused 7/7 pass; full npm test pending. These checks do not prove that a caller-supplied context is genuine. Gate B OPEN.

- Full npm test: 124 files / 491 passing assertions / zero failures.

## Gate B Telegram update type — 2026-10-09
- Isolated transport admission rejects non-message Telegram update types mixed with synthetic ctx.message. Focused transport/adapter tests 11/11 pass. Full regression pending. Gate B OPEN pending trusted handler, HA origin and reviewed policy.

- Full regression passed: 124 files / 492 assertions / 0 failures, exit 0.

## Strict raw Telegram update preflight — 2026-10-09
- Optional `requireRawMessage:true` on `createTelegramTransportAdmission` rejects contexts lacking original `update.message` and mismatched fields. Focused tests 9/9 passed; full test result pending in `/tmp/rs-v3-gateb-strict-admission.log`. Not production-wired; does not authenticate arbitrary input. Gate B OPEN.

- Full regression PASSED 124 files / 493 assertions / 0 failures, exit 0.

## Gate B isolated complete vertical slice — 2026-10-09
- `createV3TelegramJoinedAdapter` supports optional `requireRawMessage` and `durableReplay` forwarded to transport admission. Full offline joined test includes strict raw message, actor mismatch, area/light inventory, mock review assertions, confirmation, single mock actuation and verified mock state, replay denied; focused 4/4 pass. Full suite pending `/tmp/rs-v3-gateb-vertical-full.log`. Gate B NOT accepted for live use.

- Full suite PASS: 124 test files / 494 assertions / 0 failures, exit 0.

## Gate B durable Telegram replay across adapter recreation — 2026-10-09
- New focused `v3-telegram-joined-adapter.test.mjs` fixture exercises strict ingress plus durable replay with a different update ID after chain recreation; 5/5 focused passed. Full regression pending `/tmp/rs-v3-gateb-durable-replay-full.log`. Does not wire production; Gate B OPEN.

- Full npm regression 124 files / 495 passing assertions / 0 failures, exit 0.

## Gate B one-shot read bridge — 2026-10-10
- Existing `v3-ha-upstream-read-bridge.mjs` now provides `inspectOneShotRegistryConnection` for operator-supplied official `Connection`: bounded acquisition, fixed registry-only reads, best-effort close, never authorizes. Focused 12/12; full test `/tmp/rs-v3-gateb-one-shot-full.log` pending. Offline only; Gate B OPEN pending authenticated TLS source/operator policy and read-only acceptance.

- Full isolated regression: 124 files / 497 passed assertions / 0 failures, exit 0.

## Actual upstream HA client WSS loopback — 2026-10-10
- Confirmed real upstream `createConnection`/`createLongLivedTokenAuth` + ws using local TLS fixture: 6 registry-only reads / 1 connection / authorization false. Removing CA blocks handshake: 0 WebSocket connections and reads. Both tests exit 0. See docs/GATE-B-WSS-ACCEPTANCE.md. No production wiring. Gate B OPEN.

## 2026-10-10 — Gate B transport fault and Gate C kickoff
- Real official HA client loopback disconnect on 2nd registry call fails closed: exactly 2 reads, authorization false; see GATE-B-WSS-ACCEPTANCE. Gate B still OPEN for actual authenticated HA origin/operator-reviewed V3 policy and explicitly approved live acceptance.
- Gate C isolated late authorization test added, focused 7/7 passed; full npm test pending `/tmp/rs-v3-gatec-timeout-full.log`. Never replay a write after delayed confirmation.

- Full regression PASS: 124 files / 498 assertions / 0 failures, exit 0.

## Project strategy, repository and branches audit — 2026-10-10
- New current-status source `docs/REVIEW-2026-10-10.md`. Remote feature branch matched local at audit start `8093db0`. Remote main `3bfa386` vs local main `76f6508` (behind 1); refactor/v2 separate; review Gate E branch and PR #1 unmerged/not acceptance evidence. No merges or deletions. README/TODO/PROGRESS top pointers updated.
- Last full confirmed npm regression: 124 test files / 498 assertions / zero failed, exit 0. Review itself did not rerun full npm test. Gate B OPEN, Gate C isolated, Gate D partial, Gate E offline.
