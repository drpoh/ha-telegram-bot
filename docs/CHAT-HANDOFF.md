# RS Home AI V3 — new-chat handoff

This is the FIRST document to read when resuming this project in another chat.
It is a compact navigation index, not a substitute for live repository checks.

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
