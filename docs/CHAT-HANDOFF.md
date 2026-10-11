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
