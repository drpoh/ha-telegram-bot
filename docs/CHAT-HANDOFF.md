**Communication rule (2026-10-10):** Owner wants substantially fewer chat messages. Send one short plan, work autonomously through a coherent milestone, then one final summary. No repetitive "running tests / updating docs / committing" updates; interrupt only for substantive blocker, risk or approval. `AGENTS.md` section "Quiet autonomous execution" is binding for future sessions.

# RS Home AI V3 — new-chat handoff

This is the FIRST document to read when resuming this project in another chat.
It is a compact navigation index, not a substitute for live repository checks.

**Pi layout warning (2026-10-10):** `/home/drpoh/ha-telegram-bot` is the v2 system-service working directory; `/home/drpoh/rs-home-ai-v3` is a distinct **older** checkout of the same GitHub remote, directly used by the V3 user service. Never reset/rebase/pull the second copy, or move either directory, on a generic continue request. Read `docs/PI-REPOSITORY-LAYOUT-PLAN.md` and run read-only `node scripts/audit-pi-layout.mjs` to check both.

**NEW canonical development checkout (2026-10-10):** `/home/drpoh/projects/rs-home-ai-dev`, independently cloned from GitHub. ALL future code/docs editing, testing, commits and pushes should happen there. Do not work in runtime `/home/drpoh/ha-telegram-bot` or `/home/drpoh/rs-home-ai-v3` except read-only inspection. See `docs/PI-REPOSITORY-LAYOUT-PLAN.md`.

## Canonical sources, in priority order
1. NEW dev working tree and Git status in `/home/drpoh/projects/rs-home-ai-dev`; separately inspect the two untouched runtime checkouts read-only.
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
cd /home/drpoh/projects/rs-home-ai-dev
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
- Existing `v3-ha-upstream-read-bridge.mjs` now provides `inspectOneShotRegistryConnection` for operator-supplied official `Connection`: bounded acquisition, fixed registry-only reads, best-effort close, never authorizes. Focused 12/12; full test `/tmp/rs-v3-gateb-one-shot-full.log` PASS. Offline only; Gate B OPEN pending authenticated TLS source/operator policy and read-only acceptance.

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

- Independent dev clone npm test 124 files / 498 assertions / zero failures, exit 0.

## Workspace rules and isolated stage fixture — 2026-10-10
- Rules are permanent in repository `AGENTS.md`: edit/push only from `/home/drpoh/projects/rs-home-ai-dev`; inspect runtime v2 `~/ha-telegram-bot` and pilot `~/rs-home-ai-v3` read-only. Never auto-sync the older pilot copy. Project settings/staged permissions remain reviewed separately.
- `config/environments/isolation.example.json` describes nonsecret disjoint dev/loopback-stage/future-prod *planning* only; no real services, credentials or HA writes deployed. `test/environment-manifest-example.test.mjs` checks isolation contract.

- New dev checkout full suite: 125 files / 499 assertions / 0 failures, exit 0.

## 2026-10-10 — ephemeral stage mock
- Canonical workspace `~/projects/rs-home-ai-dev`: added `src/ops/stage-mock-ha.mjs` and `test/stage-mock-ha.test.mjs`. Mock binds only 127.0.0.1, returns synthetic empty registry, denies writes and closes; focused 1/1. Full regression pending `/tmp/rs-v3-stage-loopback-full-20261010.log`. Not a production/stage deployment or real HA source. No runtime changes.

- Full suite PASSED: 126 test files / 500 assertions / 0 failed, exit 0.

## Gate C Stage local I/O integration — 2026-10-10
- Added isolated `test/stage-gate-c-registry-bridge.test.mjs`: six real loopback HTTP fixture reads into existing registry adapter, read-only decision, denied POST; malformed/unreachable cases fail closed. Focused 2/2. Full npm test pending `/tmp/rs-stage-gatec-http-integration-20261010.log`. Not real HA WebSocket and does not close Gate B or C production acceptance.

- Full npm regression PASSED: 127 files / 502 assertions / 0 failures, exit 0.

## 2026-10-10 — Gate C Stage delay/drop faults
- Dev checkout only: `src/ops/stage-mock-ha.mjs` has opt-in bounded test fault modes delaying or dropping second registry response. `test/stage-gate-c-registry-bridge.test.mjs` confirms deadline/drop both fail closed after two calls, no retry. Focused 5/5. Full suite pending `/tmp/rs-v3-stage-faults-20261010.log`. No stage deployment or real HA contact.

- Full npm test PASS: 127 files / 504 assertions / 0 failed, exit 0.

## 2026-10-10 — Gate C confirmation concurrency
- Prior stage delay/drop tests passed 127 files / 504 assertions and are already pushed (`361cc9c`, docs follow-up `b51941b`).
- Four new isolated negative confirmation tests: action replacement during authorization, wrong actor/chat, unknown executor outcome without retry, pre-dispatch cancellation; focused 11/11 exit 0. Consult latest WORKLOG and Git for full suite and commit.
- Next: Stage storage/rollback isolation, stale state and durable execution safeguards, with no runtime changes or HA writes. Gate B OPEN.

- Full isolated `npm test` PASS: 127 test files / 508 assertions / 0 failed, process exit 0, log `/tmp/rs-v3-gatec-races-full-20261010.log`. No runtime systems were touched.

## 2026-10-10 — Gate C state freshness checkpoint
- Pure verification offers optional strict timestamp boundary (`minObservedAtMs`), new focused fixtures 5/5. Existing runtime callers are unchanged and do not enforce this option. Never treat caller-supplied HA timestamps or this test as trusted provenance/production acceptance.
- Continue independent stage storage/rollback and trusted real-MCP readback integration only after gates/approval. Consult latest WORKLOG for full regression and commit.

- Full isolated regression PASS: 128 test files / 513 assertions / 0 failures, process exit 0; `/tmp/rs-v3-gatec-freshness-20261010.log`. No runtime change.

## 2026-10-10 — Gate C durable dispatch claim
- In canonical dev checkout, new OFFLINE-only SQLite execution journal and six tests: a claim is committed before any simulated dispatch; unknown results, errors and restarts never auto-retry. Deliberately not wired to runtime until trusted ingress/policy and operator approved storage. No production credentials, devices, services or runtime directories altered.
- Gate C production **still OPEN**: prove real MCP timeout/cancel, concurrency, durable action identity, HA state evidence, stage rollback and approved live acceptance. See latest TODO/WORKLOG and verify current Git SHA.

- Full isolated `npm test` PASS: 129 test files / 519 assertions / 0 failed / exit 0, `/tmp/rs-v3-gatec-durable-full-20261010.log`.

## 2026-10-10 — Gate C durable joined simulation
- Added complete offline mock chain: admission, SQLite claim, one simulated write, strict fresh result verification, no retry under seven concurrent calls, stale-readback and uncertain MCP-result denial. Focused 3/3 pass; full result and Git SHA in newest WORKLOG/Git. Gate B and real Gate C acceptance remain OPEN.

- Full `npm test` PASS: 130 files / 522 assertions / 0 failures / exit 0; `/tmp/rs-v3-gatec-joined-full-20261010.log`.

## 2026-10-10 — Gate C actual MCP SDK offline fixture
- Added `test/gate-c-mcp-sdk-transport.test.mjs` using installed upstream SDK Client/Server/InMemoryTransport: successful call once and timeout after server sees call with durable no-replay, 2/2 focused exit 0. Does not use HA credentials/network or change live services. In-memory protocol is NOT end-to-end network or operator acceptance. Gate B and operational Gate C remain OPEN.

- Full npm regression PASS: 131 test files / 524 assertions / zero failures / exit code 0; log `/tmp/rs-v3-gatec-sdk-full-20261010.log`.

## 2026-10-10 — Gate C HTTP and rollback findings
- Offline Stage HTTP now exercises real loopback sockets via official MCP SDK, abort and deadline; focused 2/2. SQLite .backup/restore fixture demonstrates rollback replay hole if claim journal is rolled back: restored environments must be quarantined, never resume writes until separate monotonic audit/claim recovery. No installed Stage or live HA modified.
- Gate B trusted HA endpoint + actor + policy review and permission-scoped controlled HA acceptance remain blocked. Stage deployment and any real write require specific owner approval; do not infer consent for arbitrary household device. Latest complete regression in WORKLOG; Git HEAD requires verification.

- Full isolated regression PASS: 133 test files / 527 assertions / 0 failed / shell exit 0; `/tmp/rs-v3-gatec-http-stage-20261010.log`. Network fixture uses 127.0.0.1 only. Stage restore replay hazard remains a BLOCKER, not an accepted rollback.

## 2026-10-10 — Gate C Stage recovery protection
- New offline `gate-c-stage-recovery` refuses rollback recovery if claim DB is missing, invalid or inside rollback directory; 3/3 focused. Separate claim ledger survives Stage-state snapshot restore, including claims after snapshot. No installation or migration. Consult latest WORKLOG for full regression and Git commit. Gate B and real controlled acceptance remain OPEN.

- Full regression PASS: 134 test files / 530 assertions / 0 failures / exit 0; `/tmp/rs-v3-gatec-recovery-full-20261010.log`.

## 2026-10-10 — New overriding V3 MVP priority
- **Owner accepted narrow MVP**: one independently approved light, trusted Telegram actor + confirmation + default-deny V3 policy + MCP + fresh verification + replay defense, unchanged independent HA Green. Read `docs/V3-MVP-RELEASE.md` FIRST for the current release scope; defer voice/multiroom/learning/three persistent environments. A non-authorizing pure release checklist and focused 3/3 tests added, no live wiring. Gate B/real Gate C remain OPEN pending owner-controlled evidence and scoped deployment approval.

- Verified final full isolated `npm test` PASS: 135 test files / 533 assertions / 0 failed / exit 0, `/tmp/rs-v3-mvp-scope-rerun-20261010.log`.

## 2026-10-10 — MVP integrated fixture
- V3 ledger-bound *mock* can now use independent SQLite executionJournal; one focused test covers actor mismatch → scope/policy → single consent → durable no-replay → readback of the kitchen pilot candidate. This is not trusted ingress, an authenticated HA source or authorized pilot deployment. Verify newest Git/test log before continuing.

- Full isolated `npm test`: 136 files / 534 assertions / 0 failures, process exit 0; `/tmp/rs-v3-mvp-joined-full-20261010.log`.

## 2026-10-10 — Telegram MVP chain checkpoint
- Reused existing raw-update Telegram admission and actor-bound intent ledger in one offline fixture; 2/2 focused PASS. Actual trusted Telegraf ingress/HA identity and owner-approved release remain unresolved. No live service changes. See WORKLOG for full regression.

- Final isolated npm regression PASS: 137 files / 536 assertions / 0 failed / exit 0; `/tmp/rs-v3-mvp-telegram-rerun-20261010.log`. No runtime paths or HA touched.

## 2026-10-10 — MVP real pilot found; do not duplicate Telegram bot
- Dev tree already has `src/pilot/telegram-readonly.mjs`: dedicated V3 Telegraf `/confirm` pilot, policy-hash admission and one kitchen-light MCP path. Existing LIVE pilot checkout remains READ-ONLY. Optional durable journal support added to reusable `kitchen-dryrun-consent.mjs`, not wired into live pilot; focused 6/6 passes. Next stage is scoped operator-approved rollout, NOT another bot. See latest TODO/WORKLOG.

- Full isolated npm test PASS: 138 files / 538 assertions / zero failures / exit 0, `/tmp/rs-v3-mvp-pilot-durable-20261010.log`.

## 2026-10-10 — Protected V3 pilot storage preflight
- New offline read-only preflight module and 3/3 tests enforce protected separately located SQLite claim journal before future pilot release; no live migration or service changes. Check latest WORKLOG for full regression and Git SHA. Gate B actual HA origin/policy/actor remain OPEN.

- Full isolated test PASS: 139 files / 541 assertions / zero failures / exit 0; `/tmp/rs-v3-mvp-storage-20261010.log`.

## 2026-10-10 — DEV pilot fail-closed journal integration
- Existing `src/pilot/telegram-readonly.mjs` now references protected, pre-provisioned SQLite claims DB outside runtime checkout; missing/unsafe journal causes denial before physical MCP call and explanatory Telegram response. **DEV CHECKOUT ONLY**. No live unit/repository checkout changed, and no provisioned DB created. Gate B and scoped real acceptance still required. Check latest WORKLOG for final regression/HEAD.

- Full isolated `npm test` PASS: 139 test files / 541 assertions / 0 failed / shell exit 0, log `/tmp/rs-v3-mvp-pilot-wired-20261010.log`.

## 2026-10-10 — Closed dev milestone, next is operational acceptance
- Finalized dev-only protected-journal wiring for dedicated V3 Telegram pilot via fail-closed `prepareV3PilotExecutionJournal`, with 4/4 focused. This closes the **development wiring milestone only**, not MVP release, Gate B or Gate C operator acceptance. Next: review and approve real HA source + exact light/permission, pre-provision separate claim DB, perform controlled acceptance and release after owner authorization. Do not modify runtime checkouts without scope approval.

- Final isolated `npm test` PASS: 140 test files / 543 assertions / zero failures / exit code 0; `/tmp/rs-v3-mvp-milestone-final-20261010.log`.

## 2026-10-10 — Operational preflight read-only NO-GO
- Latest verified dev HEAD `96745bb` before doc commit; live V3 `a7fc446` active/running and live v2 `32b5299` active. Pinned kitchen policy SHA256 matches existing 0600 policy file metadata. Independent rollback-safe claims DB missing at expected `~/.local/state/rs-home-ai-v3/claims.db`; direct operational release blocked. Consult `docs/V3-MVP-OPERATIONAL-ACCEPTANCE.md` for exact scoped release path. Do not change live checkouts/services/HA without operator-controlled acceptance.

## 2026-10-10 — Provisioning helper prepared, NOT executed on pilot
- Added explicit operator-invoked `provisionV3PilotJournal` with exclusive 0600 protected journal creation and no overwrite. Runtime claims DB was missing at inspection and remains untouched. Live HA/source/permissions unverified, Gate D controlled release still NO-GO. See WORKLOG and TODO.

- Full isolated regression PASS: 141 test files / 545 assertions / 0 failures / exit 0. Log: `/tmp/rs-v3-operator-storage-20261010.log`.

## 2026-10-10 — Critical MCP transport trust finding
- Read-only runtime URL classification: V3 pilot uses non-loopback HTTP MCP; hostname allowlist alone is not evidence of HA provenance. Dev now rejects this using `kitchen-mcp-endpoint-policy`, no live deployment. Production release remains NO-GO until verified TLS or operator-approved protected loopback tunnel and HA identity attestation. Check WORKLOG for test and latest commit.

- Full isolated npm regression PASS: 142 files / 547 assertions / 0 failures / exit 0; log `/tmp/rs-v3-mcp-trust-audit-20261010.log`.

## 2026-10-10 — Next operational step: verified SSH tunnel
- Pi read-only topology check: NO listener on 127.0.0.1:9584; no dedicated SSH/MCP tunnel unit, SSH host-key config is `ask` not an owner-reviewed pin. Live V3 remains active with non-loopback HTTP MCP URL. See `docs/V3-MVP-MCP-TRUST-RUNBOOK.md` for explicit trust/transport/HA read-only acceptance requirements. Do not infer trust from mere localhost URL. No live changes.

## 2026-10-10 — SSH and HA registry read-only acceptance advanced
- Strict SSH to HA succeeded with existing known_hosts. Read-only HA entity/device registry confirms single enabled MQTT light.led_kukhnia and expected unique ID/device ID/kitchen area. HA MCP port 9584 listening on 0.0.0.0 (potential LAN exposure). Temporary 127.0.0.1:19584 SSH forwarded TCP PASS and was immediately stopped. Existing keys still need independent owner attestation; production tunnel, MCP tool provenance, protected SQLite journal, release consent all remain NO-GO. See docs/V3-MVP-MCP-TRUST-RUNBOOK.md.

## 2026-10-10 — Disabled systemd SSH forward example
- New `docs/rs-home-ai-v3-mcp-tunnel.service.example`, `systemd-analyze verify` exit 0 using temporary .service copy; not installed/enabled/started. Strict SSH host key must be independently checked before owner-approved activation; HA listener 0.0.0.0:9584 and MCP permissions still need review. Current runtime untouched; consult V3-MVP-MCP-TRUST-RUNBOOK.md.

## 2026-10-10 — IMPORTANT: SSH tunnel candidate NOT usable
- Read-only HA `sshd -T` confirms `allowtcpforwarding no`. Ephemeral SSH local port accepted TCP but actual channel failed `administratively prohibited`; endpoint `/mcp` returns 404 and configured MCP path differs. DO NOT install/start docs/rs-home-ai-v3-mcp-tunnel.service.example. Need owner-approved restricted SSH forwarding or verified TLS and actual path/protocol validation. No live changes. See updated MCP trust runbook.

## 2026-10-10 — HA SSH restricted local forwarding enabled, MCP real read OK
- User authorized SSH forwarding change. HA sshd config backup `/etc/ssh/sshd_config.rs-v3-backup-20261010`; scoped `Match User hassio`, `AllowTcpForwarding local`, `PermitOpen 127.0.0.1:9584`, `GatewayPorts no` with global forwarding still denied. `sshd -t`, reconnect PASS. Ephemeral 127.0.0.1:19584 tunnel supports MCP SDK initialize/listTools (53 including write tool), and one `ha_get_state(light.led_kukhnia)` read success; stopped. No running V3/v2 restarts, no writes, no production URL/journal change. Next: independent host attestation, review privileges, owner-approved persistent tunnel, protected claim ledger and controlled actuation acceptance. NO-GO remains.

## 2026-10-10 — Upstream MCP transport redirect denial
- Effective HA sshd Match User hassio forwarding accepted as previous change, with permitopen only 127.0.0.1:9584; note covers ALL hassio logins. MCP SDK read successfully confirmed at prior commit 8567494. Dev MCP transport now rejects redirects; no deployed tunnel/runtime. See WORKLOG for complete test evidence.

- Full npm test PASS 142 files / 547 assertions / 0 failures (`/tmp/rs-v3-sdk-no-redirect-20261010.log`).

## 2026-10-10 — Release preflight still NO-GO
- Strict existing HA SSH forwarding config remains accepted. Runtime V3 MCP URL is non-loopback HTTP (dev validator rejects), no listener on Pi 19584, claims.db absent, policy SHA matches. Explicit independent SSH key attestation/HA write-tool permission review and controlled persistent tunnel/pilot approval are outstanding. Latest operational plan in docs/V3-MVP-MCP-TRUST-RUNBOOK.md. Do NOT install unit or switch runtime on generic continuation.

## 2026-10-10 — Selected MVP route is direct LAN HA-MCP
- User chose direct LAN existing HA-MCP, no SSH tunnel. Pi 192.168.31.124 -> HA 192.168.31.94, MCP 0.0.0.0:9584. Current dev still rejects unencrypted non-loopback MCP HTTP. Do not weaken until LAN source restriction and MCP write rights validated. docs/V3-MVP-LAN-MCP-DECISION.md is new current transport strategy. No service/HA changes; launch NO-GO.

## 2026-10-10 — LAN candidate scope gate (not deployed)
- Direct LAN remains selected. HA-MCP TCP/9584 bound 0.0.0.0, no actual Pi-only filtering verified. New pure dev `src/pilot/kitchen-lan-endpoint-policy.mjs` denies default, requires independent network isolation + credential review before accepting exact 192.168.31.94:9584. Not integrated with live MCP client or service. Next must identify a real HA add-on/router restriction method; do not claim release or weaken normal endpoint validation.

- Full suite PASS: 143 files / 549 assertions / 0 failures.

## 2026-10-10 — HA-MCP listener ownership not yet established
- HA 9584 still on all interfaces; read-only HA app and Docker inventory did not reveal an obvious dedicated MCP container. Do not assume ownership or modify firewall blindly. Direct-LAN path still needs server-side source restriction and credential review; live v2/V3 untouched. See docs/V3-MVP-LAN-MCP-DECISION.md.

## 2026-10-10 — TCP 9584 owner still unproven
- Restricted HA SSH namespace sees socket inode 8244936 on 0.0.0.0:9584 but cannot name owning PID; Docker port inventory not conclusive due to host networking. No configuration changes. Must use supported Supervisor/host metadata or router isolation; do not guess add-on owner. Docs updated.

## 2026-10-10 — Important same-LAN router caveat
- Pi 192.168.31.124/24 and HA 192.168.31.94 directly share eth0 L2 network; default gateway 192.168.31.1 (HTTP+HTTPS admin responds, vendor not established). Generic router routed firewall will not necessarily filter TCP/9584 between LAN peers. Need explicitly supported bridge ACL/client isolation, VLAN separation or server-side HA-MCP access control and independent client negative test. Live unchanged.

## 2026-10-10 — RESOLVED: MCP 9584 belongs to HA custom component
- HA config entry `ha_mcp_tools` HA-MCP Server: bind_host 0.0.0.0, server_port 9584, enable_webhook true, webhook_auth ha_auth. `hass_codex_tunnel_mcp` is separate. A supported HA integration option can bind to 127.0.0.1 and leave authenticated webhook through 8123, but changing now would break direct LAN V3. Migrate and independently verify authorized webhook client, inventory other MCP consumers before touching bind. Never expose webhook IDs/secrets. Read docs/V3-MVP-LAN-MCP-DECISION.md.

## 2026-10-10 — Journal block CLOSED, remaining NOT released
- Operator requested MVP completion. External SQLite claims.db was created and inspected successfully under /home/drpoh/.local/state/rs-home-ai-v3 (0600, drpoh), outside rollback. Do not reset. Live V3 a7fc446 differs from dev 1528e86; existing v2 32b5299 active. Remaining gate: secure/authenticated MCP network and tool permissions, reviewed deployment, real Telegram one-light acceptance. No physical HA write conducted. See V3-MVP-OPERATIONAL-ACCEPTANCE.md.

## 2026-10-10 — Pilot deployment delta reviewed
- Dev 490b31d vs live V3 a7fc446 is 67 files / 2988 additions / 27 deletions. Targeted LAN endpoint tests 4/4 PASS, services V2/V3 active. Do not hot-pull dev into production; current LAN MCP exception denies absent verified network+credential policy. Need isolated candidate, signoff and controlled Telegram /confirm test. Claims DB 0600 provisioned.

## 2026-10-10 — Candidate release filesystem prepared
- /home/drpoh/projects/rs-home-ai-v3-candidate is protected 0700 static git-archive of 0deece0 with RELEASE-COMMIT 0600. Pilot/client syntax and focused LAN rules 4/4 PASS. No node_modules and no process started. Live V2/V3 unchanged. Next install isolated deps and validate fully, but DO NOT run a parallel Telegram poller using current V3 token.

## 2026-10-10 — Candidate ready for review, no deployment
- Isolated candidate pinned 0deece0 in /home/drpoh/projects/rs-home-ai-v3-candidate has installed 149 packages via npm ci --ignore-scripts and full npm test PASS (143 files, 549 assertions, 0 failures, exit 0). Live services untouched. Current dev docs HEAD will be ahead of candidate. Only pending operator-approved network/write-trust acceptance and controlled unique-poller V3 cutover remain; SQLite journal already exists (0600). Do not claim MVP released.

## 2026-10-10 — Dev hardening newer than candidate
- New a07d264 fixes fail-closed replay claim throws, regression PASS. Static release candidate pinned 0deece0 now stale relative to bugfix; rebuild before promotion. Protected SQLite claims.db exists, no live Telegram polling or HA actuation executed. MCP permissions and user-generated Telegram /confirm still needed before MVP GO.

## 2026-10-10 — Final test checkpoint
- Current isolated candidate-v2 is pinned 72616d07f1a2850bc977a16d301034aafe5671c2; SQLite ledger preflight PASS; both services active. Full candidate-v2 npm test launched; check /tmp/rs-v3-candidate-v2-full.log and process before recording success. No live V3 promotion or HA light write. Remaining acceptance: MCP scope and owner-generated Telegram /confirm.

## 2026-10-10 — Candidate-v2 passed full regression
- `/home/drpoh/projects/rs-home-ai-v3-candidate-v2` pinned 72616d0; `npm test` PASS 144 files, 550 assertions, zero failed files, exit 0. External claims.db readiness PASS, V2/V3 still active and unchanged. Deployment and real one-light acceptance remain pending independently verified MCP trust and operator action. Evidence: `/tmp/rs-v3-candidate-v2-full.log`.

## 2026-10-10 — Real rollout preflight blocked, do not claim completion
- Owner requested permission verification, live V3 rollout+rollback and real Telegram light test. Actual endpoint: dev secure validator rejects it; LAN validator returns lan_acceptance_missing. HA-MCP has wide tools, no reviewed scoped credential. Candidate 72616d0 (144/550 PASS) stays isolated; live V3 a7fc446 stays active, no HA write or `/confirm` spoofing. Need actual approved network/credential boundary then one-poller cutover and authentic owner Telegram request/confirm. See docs/V3-MVP-OPERATIONAL-ACCEPTANCE.md.

## 2026-10-10 — V3 pilot LIVE DEPLOYED, acceptance NOT done
- LIVE separate user service now runs pinned release 7d9bab5 at `/home/drpoh/projects/rs-home-ai-v3-release-7d9bab5`, active PID 18430, no restarts. Prior unit backup `/home/drpoh/.config/systemd/user/rs-home-ai-v3.service.before-7d9bab5` and old checkout `/home/drpoh/rs-home-ai-v3` retained. V2 active. Claims DB valid. Deployed release MCP SDK `ha_get_state(light.led_kukhnia)` returned structured OK. User must manually send real V3 Telegram kitchen-light request and `/confirm` within 60s; no actuation performed in this turn. See WORKLOG for rollback commands.

## 2026-10-10 — REAL Telegram test result: fail-closed due to unavailable Zigbee target
- Owner's real /confirm returned preflight_state_unverified. Deployed release MCP read-only check shows light.led_kukhnia has proper structuredContent.data keys but state `unavailable` twice, no MCP error. HA registry still maps to expected mqtt device and unique_id. Do not edit state parser or allow writes while unavailable. Check device power/Zigbee2MQTT link, then fresh Telegram intent and /confirm. No physical HA write occurred.

## 2026-10-10 — V3 now live at release 920585d
- Owner's previous /confirm returned state_pending and actual HA light was off. Dev fix adds up to 3 delayed read-only state checks after service success, no write retry. 5 focused tests PASS; GitHub 920585d. Live V3 user service now working from `/home/drpoh/projects/rs-home-ai-v3-release-920585d` (active PID 19169, restarts 0); old unit backed up at `/home/drpoh/.config/systemd/user/rs-home-ai-v3.service.before-920585d`. Telegram v2 unaffected. Owner needs fresh request+/confirm. Readback is not yet physically accepted; if it stays off investigate Zigbee2MQTT, not the readback parser.

## 2026-10-10 — ROOT CAUSE: Zigbee delivery failure, not V3
- Owner reported state_pending again; Zigbee2MQTT logs at 18:38:23 explicitly show `genOnOff.on` to 0x2c1165fffeb1e848 / "Led кухня" **Delivery failed for '31135'**. HA entity remains off, last_updated 18:20:38. Existing V3 controls and single-write policy behaved correctly. Fix light power/zigbee mesh; do not keep patching readback or changing target. Fresh Telegram confirmation only once transport is restored.

## 2026-10-10 — IKEA target device truly offline
- Zigbee2MQTT and Mosquitto running healthy, V3 active. Read-only inspection of Zigbee2MQTT DB identifies light.led_kukhnia as IKEA TRADFRI Driver 30W router (IEEE 0x2c1165fffeb1e848), successful historic interview but lastSeen 2026-10-09 13:56 EEST. Zigbee commands on/off/brightness fail delivery. Need restore electrical power to driver or Zigbee connectivity, not MCP/AI changes.

## 2026-10-11 — Owner switched pilot target to light.tambur_svet_l1
- Real HA MCP returns on for new target. Registry unique_id `0xa4c13898b491c3ca_light_l1_zigbee2mqtt`, device `4cbaab0f1663e40a638b7636f938a7e7`, area `koridor_1_etazh`; live admission valid=true with updated hash. Owner Telegram prompts are «Выключи свет в тамбуре» then /confirm (current state on), or «Включи свет в тамбуре» then /confirm. No physical write performed in validation. Old policy backed up at `~/.config/rs-home-ai-v3/kitchen-operator-policy.json.before-tambur`.

## 2026-10-11 — FIRST V3 LIVE PASS
- User's private Telegram confirmed V3 /confirm for turn_off of `light.tambur_svet_l1`. Bot confirmed; independently read HA-MCP on release 97343fa gives state `off` and last_updated 2026-10-11T12:46:38+03. V3 active, zero restarts; V2 active. Need one turn_on with fresh intent and /confirm for bidirectional MVP acceptance. Preserve all rollback and SQLite claims.

## 2026-10-11 — MILESTONE: V3 one-light bidirectional MVP completed
- Both real Telegram /confirm paths succeeded on `light.tambur_svet_l1`. Independent real MCP readback off at 12:46:38 and on at 12:48:25 (2026-10-11, EEST). V3 release 97343fa active with zero restarts; existing V2 active. Keep capability restricted to exactly one target and turn_on/off confirmation; never infer whole-home readiness. Next: controlled dev/stage/prod expansion and additional fail-closed cases.

## 2026-10-11 — Stage 2 begun (NO live changes)
- User authorized next stage following real bidirectional one-light MVP. Dev remains canonical feature/v3-home-agent; prod V3 stays release 97343fa and one-light policy, V2 untouched. New stage HTTP loopback mock tests deny HA writes and simulate registry transport fault: 12 focused tests passed. See `docs/V3-NEXT-STAGE-DEV-STAGE-PROD.md`. Actual stage service and credentials NOT provisioned; multi-device scope not granted. Run full regression and commit docs/tests, then proceed offline multi-entity admission planning.
- Full Pi regression now PASS: 146 files / 553 assertions / 0 failures, exit 0. Stage 2 baseline ready in dev, with no actual stage deployment or new permissions.
- New Stage 2 dev-only `src/decision/v3-stage-target-resolution.mjs`: exact registry light/area identity, freshness/completeness, ambiguity and availability checks; returns a NON-AUTHORIZING candidate. 7/7 focused tests pass; no live V3 changes. Next connect to simulated stage registry and test fault chains.
- `stage-mock-ha` now serves mock registry snapshots; `src/ops/stage-target-read.mjs` accepts only loopback HTTP with explicit mock identity, never returns authorization; forged grants, duplicate names and registry drop deny. All 14 related focused tests pass. No live V3 modifications. Next: stage-only failure injectors with deterministic replay and explicit trusted registry adapter; keep stage mock unprivileged.

## 2026-10-11 — Branch and file consistency audit + Stage concurrency
- GitHub branch feature/v3-home-agent synchronized with canonical dev checkout after git fetch; remote also has main, refactor/v2 and review/gate-e-target-snapshot-hardening-20261009. All required docs exist. Live runtime uses pinned V3 97343fa, while V2 checkout 32b5299 and preserved V3 checkout a7fc446 are intentionally different; both services active. Do NOT bulk update those folders.
- New offline `src/decision/v3-stage-target-revalidation.mjs`: compare trusted target across fresh initial and current registry snapshots, deny on device replacement, missing/unavailable/disabled, ambiguity or stale data; never authorize write. Stress tests prove one-time token consumption under 20 concurrent claims and old-token invalidation. 6/6 tests passed. Next: connect review-only mock revalidation to staged consent simulation; no prod grant.

## 2026-10-11 — Structure review and simulated Stage confirmations
- New `docs/PROJECT-MAP.md` is the canonical navigation entry. README and AGENTS link there. Preserve live v2 checkout, old V3 checkout and immutable release separately; root legacy scripts and `kitchen-*` modules are known technical debt, not safe to mass-rename.
- Stage-only `src/ops/stage-consent-simulation.mjs` now ties one-shot 60s intent to current exact registry/device check and **never** authorizes real dispatch. Focused tests 9/9 pass, including 24 competing confirmations, replaced/disappeared/unavailable device, stale registry, expired and cross-actor attempts. Production V3 release 97343fa, v2 and HA unchanged.

## 2026-10-11 — Repository hygiene audit
- See `docs/PROJECT-AUDIT-2026-10-11.md`: active V3 uses immutable release 97343fa, source dev independent; deploy/rs-home-ai-v3.service is stale and now labeled historical; review Gate E branch is fully behind dev (113 commits, zero ahead) but was NOT deleted. Root experimental scripts are possible archive candidates (no tracked basename references), not proven unused by cron/manual; historic kitchen policy fixtures ARE referenced by a test. No files or Git branches were removed.

## 2026-10-11 — Reversible root cleanup
- Six root model experiments now under `scripts/legacy/` via git mv with explanation README. No runtime service points there according to checked systemd/current user's crontab; external manual aliases not fully proven. Root `bot.mjs`, live-capable `smoke-auto-safe.mjs`, pilot fixtures, all release/checkouts and all Git branches deliberately preserved. Run regression, push and inspect Git status. Avoid deleting remote review branch until PR/protection review.
- Cleanup full regression DONE: 150 files / 574 assertions / zero failed, exit 0. Fixed outdated Stage fixture compatibility (two failures caught on first full run). Six experiments archived via git mv, not deleted; no branches or active services changed.

## 2026-10-11 — Short authoritative TODO plus archived history
- New `docs/TODO.md` is the prioritized active queue (P0/P1/P2). Historical 389-line TODO retained by Git rename at `docs/archive/TODO-history-through-2026-10-11.md` so earlier evidence is not erased. GitHub review Gate E branch is 115 commits behind active V3, 0 ahead, and no associated/open PR was returned; DO NOT delete until branch protection and retention decision are confirmed. No live service/HA changes.

## 2026-10-11 — Stage batch consent resumed
- Existing previously uncommitted `src/ops/stage-batch-consent.mjs` and tests verified 13/13 focused checks. Batch is dev/mock-only and never authorizes HA writes. Next connect independent Stage HTTP registry reads and test transport failures, before any broader live capability.
- Added dev-only `stage-batch-http-simulation.mjs`, 3/3 HTTP tests pass. Uses separate mock snapshots for issue and confirm; no real HA endpoint accepted or actuation. Further Stage race/timeout tests and full regression needed before candidate release. Active V3 still pinned at 97343fa.

## 2026-10-11 — Stage 2 mock HTTP closure and next phase
- Expanded `stage-batch-http-simulation.test.mjs` to expiration and actor mismatch; six HTTP-focused tests pass. Next phase design `deploy/stage/README.md` recommends Node.js built-in HTTP and a separately approved systemd user service; no daemon installed, no extra Telegram poller, no real HA credentials or prod code touched. Run full regression and commit/push before calling Stage 2 offline milestone closed.
- Stage 2 offline full regression PASS: 152 files / 584 assertions / zero failed, exit 0. No live deployment or broader HA permissions. Next stage: implement isolated standalone mock process and review its runtime boundaries before separately authorized systemd installation.

## 2026-10-11 — New phase: source-only Stage process
- Implemented and tested `scripts/stage/mock-server.mjs` for loopback-only empty Stage HTTP mock, no real HA or Telegram. Two subprocess tests pass; `deploy/stage/README.md` documents launch/isolation limitations. No live service deployment, credentials, runtime path or policy changes. Next: further hostile environment/port tests, separately authorized stage systemd rollout and full regression before any production promotion.

## 2026-10-11 — Stage 3 source-only readiness
- `test/stage-process-entry.test.mjs` now exercises valid ephemeral loopback lifecycle, SIGTERM and two classes of denied configuration (port and sensitive env), 4/4 PASS. `deploy/stage/stage-unit.review.txt` is review-only, NOT a `.service` file. Full suite must pass before source-only Stage 3 closure; actual persistent stage requires separate permission and identity/sandbox verification.
- Full Pi regression Stage 3 source-only readiness: PASS 153 test files / 588 assertions / zero failures, exit 0. Source-only scope closed; no Stage unit actually installed, no permission to expand prod. Next: independently reviewed immutable Stage artifact + systemd user-service provisioning, require explicit approval and sandbox isolation test first.

## 2026-10-11 — Stage deployment template source review
- Canonical dev Stage template `deploy/stage/rs-home-ai-stage.service.template` is inert until explicit path replacement and separately approved install. Source tests 2/2, temporary rendered systemd-analyze verification no errors. No systemd registration/start/production update. Next deployment gate requires immutable stage artifact, actual sandbox/network denial evidence and owner approval.
- Stage deployment template checkpoint full npm test PASS 154 files / 590 assertions / 0 failed. Only source template validated, no actual service installed, no real IP isolation tested. Next gate is explicitly authorized immutable Stage provisioning and live sandbox verification; never deploy automatically from dev.

## 2026-10-11 — Reuse-first decision
- Owner selected existing HA/Assist/ESPHome/HA-MCP/systemd and maintained libraries; create only shared decision/policy adapters. Decision formally recorded at `docs/ADR-REUSE-FIRST-2026-10-11.md`, linked from PROJECT-MAP, active TODO updated. Do not expand Stage mock into a substitute for Home Assistant; review duplicate policy modules before next code addition. No production modifications authorized.

## 2026-10-11 — Reuse-first Stage simplification
- Both `stage-consent-simulation.mjs` and `stage-batch-consent.mjs` now reuse the single `resolveStageLight()` policy on each independently supplied snapshot, rather than same-snapshot two-pass revalidation. Separate HTTP reads, device identity comparison and token consumption remain unchanged; 13 focused tests passed. Full regression before promotion required. Never modify pinned live V3 release for this mock refactor.
- Shared selector simplification full `npm test` passed: 154 test files/590 assertions/zero failures. No policy grant widened and no service deployed. Next: inspect actual production policy for opportunities to reuse shared deterministic interfaces, without live wiring.

## 2026-10-11 — Shared decision audit checkpoint
- Audited source separation and documented in `docs/V3-SHARED-DECISION-AUDIT-2026-10-11.md`: live pilot imports reviewed MCP dispatcher/journal; Stage simulation imports pure selector/ledger only; offline confirmed gate is not live pilot. Import-boundary tests 9/9 pass. Do not unify trusted ingress or route mock candidates into live execution without source-policy audit and owner release gate.
- Full regression PASS 155 files / 592 assertions / 0 failed. Finish this audit without touching the pinned live pilot or adding new execution grants.

## 2026-10-11 — Cross-path contract decision
- Actor/action/replay comparison added to `docs/V3-SHARED-DECISION-AUDIT-2026-10-11.md`; reusing ledger is correct, but live trusted ingress + durable claim cannot be replaced by Stage fixtures. No new framework, no production changes. Next: test cross-path invariants and retain single-light scope.

## 2026-10-11 — Cross-path contract checks, source-only
- Added executable trust/scope/replay comparison `test/v3-cross-path-trust-contract.test.mjs`; 6 focused checks PASS including import boundaries. Joined policy denial retains an intent whereas pilot dispatch failures consume one; preserve separate contracts and review explicitly before consolidation. No V2, V3 or HA operations altered.
- Full regression: `/tmp/rs-cross-path-contract-full-20261011.log` (PASS, see WORKLOG). Next P0: authoritative HA registry provenance and LAN MCP transport trust, read-only evidence first.

## 2026-10-11 — MCP trust work rationalized
- Reviewed need for separate infrastructure: NOT needed. Existing offline registry provenance/endpoint/capability guards are present and deliberately non-authorizing. Historical `ha_mcp_tools` exposure on 0.0.0.0:9584 still lacks independently verified source access control and negative LAN-client test; this requires separately authorized HA/network changes prior to wider production promotion. See `docs/V3-MCP-TRUST-NECESSITY-REVIEW-2026-10-11.md`.
- No active service, HA or secret changes. Continue offline scope/actor failure testing; do not treat the environment as ready for production expansion.

## 2026-10-11 — Structure/cleanup checkpoint
- `docs/STRUCTURE-INDEX.md` maps V2, pinned V3, stage mock, decision clusters, operational scripts and historical documents without relocating code. README and PROJECT-MAP link to it. Root legacy monolith/manual smoke, historic branch and pinned releases remain preserved pending separate external consumer/rollback audit. Runtime untouched.

## 2026-10-11 — Decision dependency graph audited
- One-time offline static graph: 317 source/test/script `.mjs` files, 415 edges, 77/77 decision modules statically referenced, 76/77 directly tested, no matched unresolved imports. V2 source reaches 16, V3 source reaches 5 decision modules; these do not imply which modules are loaded by pinned runtime artifacts. No safe deletion candidate identified. See `docs/V3-DECISION-DEPENDENCY-AUDIT-2026-10-11.md`.
- Physical relocation and deletion deferred; next focus returns to dev-only permission/identity contracts and required production trust gates.

## 2026-10-11 — Stage batch transport-failure replay hardening
- Source-only Stage batch now consumes matching pending confirmation if confirmation-time mock HTTP registry read fails, blocking delayed retry after recovery. Uses existing intent ledger, no new infrastructure. Actor/token mismatches do not cancel legitimate pending intent. Focused 15/15 tests PASS; full log `/tmp/rs-stage-batch-revoke-full-20261011.log` (PASS).
- Next: dev-only multi-device scope policy/identity tests; no live promotion or HA changes.

## 2026-10-11 — Multi-device offline Stage scope hardening
- Stage mock batch now requires explicit schema-validated deny-default fixture scope per light, using existing operator-policy validator, and matches display names on second registry read alongside entity/device/area identity. This does not establish genuine operator policy provenance and cannot grant live execution.
- Focused 14/14 batch HTTP and direct checks pass; full `/tmp/rs-multidevice-scope-full-20261011.log` PASS verified. Live V3 97343fa/V2 unchanged.

## 2026-10-11 — HA-native multi-light registry read-only review
- Existing official-connection injected bridge plus two-pass complete HA registry inspection suffices for source-only data-read review; no new infrastructure justified. Added negative tests for multiple lights, orphan/duplicate data and drift; all read paths remain `authorization:false`. See `docs/V3-MULTIDEVICE-REGISTRY-READINESS-2026-10-11.md`.
- No real HA read performed. Actual authenticated source/TLS boundary and LAN 9584 negative-client test remain separately gated; full regression `/tmp/rs-ha-multilight-readonly-full-20261011.log` PASS verified.

## 2026-10-11 — Upstream native HA read lifecycle closeout
- Added offline one-shot lifecycle tests: late connected fixture after deadline is closed without reads; disconnected fixture also closed without registry requests. Focused 14/14 tests PASS, no executable module changes or real HA reads. Full regression `/tmp/rs-upstream-lifecycle-full-20261011.log` PASS. Next real transport/registry attestation and production permission expansion require separate approval; source-only scope completed.

## 2026-10-11 — Practical-MVP direction
- `test/v3-policy-denial-retention-contract.test.mjs` synced from GitHub and focused 5/5 PASS with cross-path test. Policy-denied pending in isolated mock differs intentionally from consume-before-dispatch in the live one-light pilot; do not merge without stronger evidence. Prioritize reuse of running V2 and bounded read-only user features. Details in `docs/V3-PRACTICAL-MVP-PRIORITIES-2026-10-11.md`.
- No production deployment. Full regression needed for checkpoint.

## 2026-10-11 — Practical light overview dev prototype
- `src/home/on-lights-summary.mjs` provides bounded, non-authorizing read-only overview via injected readState and exact scoped light IDs, with zero-write and incomplete-result refusal tests. Four focused tests PASS. It is NOT connected to deployed Telegram or live HA and does not claim a complete house inventory. Full regression `/tmp/rs-lights-overview-full-20261011.log` PASS.

## 2026-10-11 — `/lights_on` dev integration
- V2 source-only private Telegram command `/lights_on` reads up to 20 known configured lights using existing HA-MCP `ha_get_state`, with explicit partial-coverage notice and strict fail-closed response. Seven focused tests PASS. This does not affect the running `/home/drpoh/ha-telegram-bot` V2 executable until a separately reviewed deployment. No V3 or HA change. Full regression log `/tmp/rs-lights-telegram-integration-20261011.log` PASS.

## 2026-10-11 — `/lights_on` response shape checkpoint
- Dev adapter supports strict matching-identity structured or JSON text MCP state. Four focused adapter tests PASS. Real HA response shape and V2 production rollout NOT verified. Inventory is three known lights, not whole house. See `docs/V3-LIGHTS-ON-ACCEPTANCE-2026-10-11.md`.

## 2026-10-11 — Whole-home light status, real read-only evidence
- Existing HA-MCP live read-only `ha_search` returned full 41-light subset (6 on, 14 off, 21 unavailable/unknown) at inspection; no device writes. Dev `/lights_on` now summarizes explicit unknowns, rejects incomplete/ambiguous inventory; three focused tests PASS. Running V2/V3 unchanged; full regression and deployment review still required.

## 2026-10-11 — Read-only lights discovery safety extension
- Full latest dev regression PASS 160 files / 618 assertions / zero failed. Enhanced `test/discovered-lights-overview.test.mjs` denial assertions for incomplete inventory, empty data and identity ambiguity; updated acceptance documentation superseding earlier 3-light adapter design. Real bot V2/V3 remain separate and not deployed from this change. Next meaningful gate is owner-reviewed `/lights_on` deployment and read-only user acceptance, or independent trusted HA registry boundary work.

## 2026-10-11 — Current head and light discovery tests
- Checked canonical dev head `4425b18` (upstream work advanced beyond earlier shared-decision audit), clean before tests. Earlier unfinished audit log `/tmp/rs-shared-decision-audit-full.log` contains PASS 155/592/0; later HEAD documents full PASS 160/618/0. Added two negative light discovery tests for bounded inventory and unknown states. Dev-only, `/lights_on` remains unpromoted to running Telegram V2; full regression not repeated for test-only extension.

## 2026-10-11 — New bounded read-only MCP inventory deadline
- Latest dev-only `src/home/discovered-lights-overview.mjs` adds 5s default caller deadline and 9/9 focused regression, denied after late response; no actual request abort guarantee. Running Telegram V2/V3 remain untouched. Full regression PASS: 160 files, 622 assertions, zero failures. Production remains unchanged.

## 2026-10-11 — Gate C GitHub PR for cooperative read-only cancellation
- Proposed opt-in abort signaling for timeout of dev-only `/lights_on` HA-MCP inventory. Zero HA write paths. Test CI and PR merge status still to verify. Real socket-level cancellation is NOT proven. Raspberry Pi runtime copies remain unchanged.

## 2026-10-11 — Gate C pending-dispatch guard proposal
- Proposed source-only in-flight actor guard and tests for unknown MCP outcome, competing /confirm and journal mark errors; GitHub PR CI pending. No production deployment. Existing durable journal remains separate; do not infer cross-process protection from an in-memory lock.

## 2026-10-11 — Verified GitHub-first checkpoint (supersedes PR pending notes above)
- PR #2 `a4a07ae`: merged, GitHub CI run `38151447467` PASS 160 files / 622 assertions / 0 failed.
- PR #3 `142dfec`: merged, run `38151750491` PASS 160 / 625 / 0; AbortSignal is cooperative only, live HA-MCP network cancellation unverified.
- PR #4 `a1ee64c`: merged, run `38152097367` PASS 161 / 628 / 0; pilot in-flight actor lock is in-memory, not durable across processes/restarts.
- Last owner-verified Pi DEV: `2a71552` clean, GitHub ahead 3 commits as of audit; do not assume current Pi status. Verify and fast-forward **DEV only** when possible. Active V3 immutable release previously `97343fa`, production remains untouched, confirm current ExecStart before any change.
- Next: durable replay/unknown-outcome acceptance review, Stage isolation and authorized release boundaries. Gate B stays open; no broad live HA permissions.

## 2026-10-11 — Offline SQLite cross-process replay test PR
- Added three tests of existing durable Gate C journal across Node subprocess crashes/races; GitHub CI not yet verified. Tests are offline, use temporary SQLite databases and fake identities. No production change or proof of live end-to-end identity admission.

## 2026-10-11 — Joined-chain / Stage handoff PR
- Source-only joined Gate C actor → consent → durable journal → unknown MCP fixture tests added. CI result and merge must be inspected. Corrected confusing SQLite journal comment: journal is used by pinned pilot through an adapter but does not authorize actions by itself.
- Gate C offline requirements may be accepted when CI passes; Gate C **real system** remains unapproved. Next Stage work is isolated source-only fault readiness, not installation.

## 2026-10-11 — Stage source-only milestone started
- New isolated negative-route HTTP tests for `src/ops/stage-mock-ha.mjs`; assert loopback-only bind and denial of HA-like write requests. Await CI. Stage is not deployed; actual systemd/network isolation not verified.

## 2026-10-11 — Repository Maintenance branch audit
- GitHub read-only inventory: 11 branches prior to maintenance PR. Seven are historical heads of squash-merged PRs #2–#8. Do not confuse their diverged Git ancestry with unique unmerged content. `docs/REPOSITORY-MAINTENANCE-2026-10-11.md` records explicit keep/delete candidates and prerequisites.
- Gate E historical review branch is ancestor of current feature V3 in GitHub comparison (0 behind), but is preserved pending external use review. No remote branches, local Pi files or active services deleted.

## 2026-10-11 — Gate C mark-status correctness hardening
- Found and fixed dev-source journal completion false-return being incorrectly treated as successful verification. Negative tests cover missing, thrown and false mark operation. GitHub CI pending; real release not changed. Resume branch status via GitHub PR and CI.
