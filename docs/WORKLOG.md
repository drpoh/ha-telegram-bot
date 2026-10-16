## 2026-10-16 — Git branch cleanup and V2.1 documentation
- 65 original branch tips preserved in verified GitHub archive/branch-history-20261016; local git bundle validated.
- 3 + 44 old branches deleted with PR-head protection and expected-SHA leases. GitHub independently confirmed 22 branches remain.
- Updated AGENTS.md and current V2.1 docs; historical V3 gate logs retained as historical evidence rather than rewriting history.
- Last runtime-verified DEV SHA remains 2fa0f11, with 135/135 test files and 541 assertions. Newer code/docs require one combined DEV regression.
- Production V2 unchanged.

## 2026-10-16 — V2.1 conversation and branch inventory
- DEV verified: 135 test files / 541 assertions, service active; commit 2fa0f11.
- Multi-turn conversation passed corridor and kitchen battery tests; living-room device absence was not exhaustively supported.
- At least 68 branch names inventoried; no branch deleted pending dependency checks.
- Updated handoff, cleanup plan, missing-device prompt and regression test; Pi acceptance pending.
- Production V2 unchanged.

# WORKLOG — Development checkpoint journal

## 2026-10-09 — project and file review

See `docs/REVIEW-2026-10-09.md` for the reviewed file inventory, operational evidence, current gate boundaries and next priority tasks. Earlier counters/checkpoints below are historical, not present-day production acceptance. General Gate B and voice Gate E remain open; Gate D reboot and Telegram receipt passed but real-alert and disaster-recovery acceptance remains incomplete.

Purpose: durable chronological handoff between ChatGPT sessions and devices. Current tasks live in `docs/TODO.md`; safety gates in `docs/home-agent-v3-strategy.md`. Broader historical progress is in `docs/PROGRESS.md`.

## 2026-10-08 — first guarded Agent area integration

- Added `src/decision/agent-area-guard.mjs`; `src/ai/agent.mjs` now runs an independent scope check for explicit «весь свет в ...» requests before granting authorization or creating a pending confirmation.
- Guard chains authoritative room identification, local reviewed classification, read-only inventory and exact proposed targets. Missing local config fails closed; it does **not** grant policy authorization.
- Existing non-room requests, other phrasing and scene commands remain unchanged. Group-command intent coverage is incomplete and must not be presented as production-ready.
- Five isolated gate tests passed; full regression **228/228 passed**. No HA actions, no bot restart. Next: full regression, then broaden and harden scope coverage before deployment.

## 2026-10-08 — read-only chained area lighting validation

- Added `src/decision/live-area-lighting.mjs`: exact live HA area registry → local reviewed classification → complete HA discovery/state validation.
- A new or unclassified light, unavailable member, missing reviewed configuration, partial inventory or ambiguous area stops discovery fail-closed.
- Six focused tests passed; full `npm test`: **223/223 passed**, no `ha_call_service` calls, no production wiring or service restart.
- Still blocked: real on-site lighting classification is pending operator review; do not use this result as permission to switch lights.
- Next: design safe agent-side scope integration; retain all independent policy/precondition/budget gates.

## 2026-10-08 — strict live HA area lookup

- Added `src/home/live-strict-area.mjs`: read-only `ha_list_floors_areas` lookup with fail-closed registry validation and exact/explicit-reviewed-alias matching.
- Live HA-MCP checks resolved `Ванная и Сауна` → `sauna`, `Кухня` → `kukhnia`, `Коридор` → `koridor`, `коридор 1 этаж` → `koridor_1_etazh`. `Ванная` and `Сауна` independently rejected without reviewed aliases.
- Full suite: 217/217 passed. No control calls. Existing scene resolution and agent command execution remain unchanged.
- Next: connect trusted classification read-only; do not expose arbitrary LLM-provided area aliases or widen scope.

## 2026-10-08 — strict area identity boundary

- Added isolated `src/home/strict-area-resolver.mjs`: exact HA area ID/name, optional explicitly reviewed alias; rejects loose sentence matching, duplicate area IDs and absent alias targets.
- Cases: `Ванная`/`Сауна` cannot be auto-expanded to the shared `sauna` area; two corridors stay separate.
- Existing `src/home/area-resolver.mjs` scene behavior remains unchanged pending migration review. Full test suite: 210/210 passed. No runtime wiring or HA service calls.
- Next: connect strict resolution to actual authoritative HA area retrieval and determine safe sub-room lighting scopes.

## 2026-10-08 — live HA inventory, classification pending review

- Called `ha_list_floors_areas` through HA-MCP: verified IDs `sauna` (Ванная и Сауна), `kukhnia` (Кухня), `koridor` (Коридор).
- Read `ha_search` `light` and `switch` inventories: sauna 4 lights + 16 switches; kitchen 4 lights + 4 switches; corridor 3 lights + 1 switch; complete, non-paginated results.
- Stored **unapproved** local candidate classification at ignored `data/lighting-inventory-review-2026-10-08.json`. The approved `config/lighting-classification.local.json` is intentionally NOT generated.
- Open issues: kitchen `light.svet` unavailable, corridor `light.sonoff_1000d78a79` unavailable; oven light, kitchen switch, sauna ceiling switch and room-wide boundaries need review.
- No HA service calls, no runtime restart, and no autonomy permission expansion. Next: review ambiguous target classifications and validate area resolver before wiring to agent.

## 2026-10-08 — private reviewed classification loader

- Added `src/decision/lighting-classification.mjs`: validates local versioned JSON with exact HA area ID/name, classified lighting, excluded indicator LEDs and explicitly designated switch-based lights.
- Added `config/lighting-classification.example.json`; actual site-specific `config/lighting-classification.local.json` is ignored by Git.
- Tests cover missing configuration, exact-name resolution, duplicates, overlap and wrong domains. Full suite: 203/203 passed (2026-10-08).
- Loader remains separate from AI Agent and does not authorize or actuate devices.
- Next: review actual device-to-room mapping from HA reads and wire the verified configuration into discovery. No live control.

## 2026-10-08 — generic light classification safety

- Changed `src/decision/area-target-discovery.mjs`: `lightIds` and `excludedLightIds` must form an explicit, disjoint and complete partition of discovered `light.*` entities. All unclassified IDs fail closed, and excluded indicators never enter selected targets.
- Added tests for unclassified lights, excluded status LEDs, and overlapping classification.
- Remaining: supply a trusted per-installation classification map; do not accept arbitrary classifications from AI.
- No Home Assistant service calls and no production restart. Full suite: 198/198 passed, 0 failed. Commit: see latest Git log.

## 2026-10-08 — repository hygiene checkpoint

- Preserved both potentially actuating living-room smoke scripts under `scripts/manual/`; imports adjusted, and two explicit opt-in checks added. Syntax checked. **Not executed**.
- Archived accidental `tatus --short` ANSI git-diff output to ignored `data/local-archive/accidental-git-diff-output.txt`. No data destroyed.
- Reviewed syntax of existing standalone audit modules; no audit collection was executed.
- Linked README to task register, project log, safety strategy and manual scripts.
- Next: resolve exact room identity and lighting classification before wiring generalized area operations into the live AI agent.

## 2026-10-08 — v3 area safety and project continuity

Repository: `drpoh/ha-telegram-bot`; branch: `feature/v3-home-agent`.

Confirmed pushed commits:
- `b3f1358` — read-only exact switch membership validation.
- `fcef066` — bathroom light guard added to AI Agent.
- `011160f` — strategy and generic read-only room inventory.
- `29e510f` — optional verified-area scope in pure Decision Engine.

Verification: most recent full `npm test` after `29e510f`: **195 passed, 0 failed**. These are tests of the development tree, not proof that the running bot has loaded it.

Known limitation: `areaEvidence` is not yet passed from the real AI Agent into the Decision Engine. Area discovery does not authorize execution. Dedicated bathroom check is narrow, not a general room action solution. Generic inventory presently selects all HA `light` entities, including possible status LEDs; this must be fixed before room-wide execution.

Runtime: v2 process was observed running from `src/index.mjs` at the previous inspection; no restart or actuation performed during these changes. Re-check process state before any deployment.

Untracked files observed and intentionally preserved: `smoke-living-room-auto-safe.mjs`, `smoke-living-room-isolation.mjs`, `src/audit/`, `tatus --short`. Ownership/purpose not yet audited.

Next exact step: review room-name resolution and explicit light classification, then wire trusted area evidence into the real agent with tests **without deployment**.

## Procedure for future updates
Append dated entries describing: scope, changed files, tests actually run, outcomes, commit hash, GitHub push status, blockers, untouched files, and next step. If a command fails or output is incomplete, record that instead of reporting completion.

## 2026-10-08 — Room-wide phrasing fail-closed hardening
Expanded explicit room-wide parser to recognize «все лампы» and «все светильники» alongside «весь свет». For unparsed group-light intents (e.g. «весь свет на кухне», «погаси весь свет в гостиной»), the agent-area guard now refuses a state-changing service proposal instead of silently returning not_applicable. The supported area path still requires trusted identity, reviewed classification, and live evidence; no runtime deployment or HA actuation was performed. Added two focused tests. Full npm test: 230/230 pass. Files: src/decision/agent-area-guard.mjs, test/agent-area-guard.test.mjs. Next: test additional paraphrases and mixed-domain group intents; obtain approved lighting classification before staged deployment.

## 2026-10-08 — Additional plural and mixed-domain guard regression

- Extended `src/decision/agent-area-guard.mjs` to fail closed on unresolved plural-light phrases (e.g. «Погаси лампы на кухне») and coordinated light/other-device intents («Выключи свет и розетки»). No permissive room action was added.
- Regression includes seven newly checked phrases in one isolated test; focused tests 8/8 and full `npm test` 231/231 passed, zero failed. `git diff --check` clean.
- No HA actuation or v2 restart. Known remaining gaps: comprehensive natural-language intent coverage, operator-reviewed real lighting classification, mixed-domain execution design, staged deployment.
- Next: strengthen cross-phrase and agent-path tests, inspect real-site light classification with operator review, then controlled Gate C.

## 2026-10-08 — Whole-home lighting intent safety regression

- Hardened `src/decision/agent-area-guard.mjs` against whole-home instructions such as «Погаси свет везде», «Выключи освещение во всей квартире», and «Выключи по всему дому свет». These now fail closed for state-changing proposals instead of falling through as `not_applicable`.
- Added isolated test covering three phrases with zero MCP calls. Focused tests 9/9 passed; complete Raspberry Pi `npm test` 232/232 passed, 0 failed; `git diff --check` passed.
- Code/test commits `be672c4`, `38fdd48` pushed and synced. No HA actuation, no production restart. Additional natural-language coverage and approved local room lighting classification still required for Gate B.
- Next: test full agent path and mixed-domain/ambiguous requests without real control, review approved mapping with operator, then Gate C.

## 2026-10-08 — verified area target tampering regression

- Added isolated `agent-area-guard` regression for foreign, duplicated, wrong-domain, and unsupported-service tool proposals against a verified room inventory. All four are blocked; zero `ha_call_service` calls in fixture.
- Focused guard suite **10/10 pass**; complete Raspberry Pi `npm test` **233/233 pass**, zero failures; source runtime v2 untouched.
- Commit `848789b` contains the tests. Still pending: full agent/confirmation integration tests, scene tool-path audit, operator-approved local lighting classification, and Gate C controlled fault injection.
- No real HA actuation or runtime restart. Next: isolated agent-path policy/confirmation harness; inspect scene tools that bypass the main HA service guard before declaring Gate B complete.

## 2026-10-08 — Gate B AI scene execution bypass containment

- Audited `src/ai/agent.mjs` and scene tool path. `ai_scene_run` directly delegated to `runAiScene`, whose manager calls `ha_call_service` without the agent's request-scope, area, policy, precondition, autonomy-budget and audit checks. Scene capture/list/delete need a separate authorization review as well.
- Fail-closed containment: `src/scenes/tools.mjs` now blocks `ai_scene_run` before area resolution and actuation, pending a shared per-action policy/verification path. This intentionally disables AI scene runs **in the v3 branch only**; existing v2 runtime not restarted.
- Added isolated regression in `test/ai-scenes.test.mjs`: 6/6 focused scene tests passed. Raspberry Pi full `npm test`: **234/234 passed**, 0 failed. Commits `71bf304`, `d5abb60` pushed; no real HA actuation.
- Not complete: no end-to-end full-agent confirmation harness; no scene action validation / transactional partial-failure policy; no reviewed lighting map. No deployment authorization. Next implement staged scene plan + independent authorization for each service call before re-enabling execution.

## 2026-10-08 — Scene mutation authorization containment

- Audited `ai_scene_capture` and `ai_scene_delete`: these are persistent scene mutations outside the agent's common authorization pathway. In the v3 branch, `src/scenes/tools.mjs` now fails closed for capture, run and delete; list remains read-only. Deleted unreachable playback code and imports from the dispatch module. Existing storage/manager source preserved for later reviewed design.
- Test added for capture/delete blocking, plus existing run-block test. Focused scene suite **7/7**, full Raspberry Pi `npm test` **235/235**, 0 failures. Code commits `8fce3fc`, `745e0d4` pushed. No runtime restart, no HA actuation; currently deployed v2 unchanged.
- Next: design a pure read-only scene action planner with exact scope validation; ensure every future execution is mediated by shared Policy Engine, preconditions, confirmation, verify and audit. Review whether read-only scene list uses a permissive area resolver before v3 deployment. Actual home lighting mapping remains unapproved. Gate B remains open.

## 2026-10-08 — Pure AI scene planner, Gate B read-only checkpoint

- Added `src/scenes/planner.mjs`: pure no-I/O conversion of stored scene snapshots into proposed `ha_call_service` actions. Rejects absent/mismatched expected area ID, empty scenes, malformed/duplicate/forbidden entities, unsupported or unavailable states, and invalid brightness/volume. Atomic fail-closed result contains zero actions on any failure. Plan explicitly marked `plan_only_not_authorized`.
- Added `test/scene-planner.test.mjs`: focused **4/4 passed**; Raspberry Pi full `npm test` **239/239 passed**, zero failures. Source/test commits `052e53f` and `fac667d` pushed.
- This planner does NOT independently establish live HA area membership, freshness, policy authorization, confirmed consent, verification or execution safety. It is not wired to the running agent; all scene mutations and execution remain blocked in v3. No HA state-changing calls or runtime restart.
- Next: integrate authoritative read-only per-entity area evidence into scene planning, test stale/partial/mixed inventories, then route each proposed action via the shared authorization engine. Maintain fail-closed scene execution until verified.

## 2026-10-08 — Read-only authoritative scene membership validation

- Added `src/scenes/live-plan.mjs`: read-only chain through existing `verifyLiveAreaLighting` (live strict HA area identity, locally reviewed classification, HA inventory and states) followed by pure `planAiScene`; proposed scene light IDs must all belong to the verified allowlisted membership. On any failure return zero actions.
- Intentionally reject all non-light scene members for now: generic domain membership and per-domain authorization are not established. No execution pathway is wired; scene capture/run/delete remain blocked in v3.
- Isolated regression `test/scene-live-plan.test.mjs`: 3/3 pass; complete Raspberry Pi `npm test`: **242/242 passed**, 0 failed. Commits `3654982`, `b6b1630` pushed; no HA actuation or v2 restart.
- Remaining: fixture testing for stale, partial, unavailable, mixed inventories; actual reviewed local mapping must be approved. Plan verification does not constitute execution authorization, and there is no rollout permission.
- Next: broaden deterministic error/fault-injection tests and integrate common policy/precondition/verification only in isolated harness.

## 2026-10-08 — Scene read-only HA-MCP fault injection

- Added eight simulated failure scenarios to `test/scene-live-plan.test.mjs`: partial inventory, pagination, inconsistent total count, cross-area result, unclassified light, unavailable state, mismatched state entity, and thrown HA-MCP read error.
- Each scenario is expected to return an entirely rejected plan with zero actions, and test fixtures allow no `ha_call_service` calls. Focused scene-live tests **4/4 passed**; full Raspberry Pi `npm test` **243/243 passed**, 0 failures. Commit `74a9906` pushed.
- No real HA actuation or v2 restart. Stale timestamp validation and comprehensive mixed-domain scenarios still require their own deterministic tests; fixture test success does not approve the local lighting map or scene execution.
- Next: verify freshness semantics and test full agent policy/confirmation path in isolation before any deployment. Gate B remains open.

## 2026-10-08 — Scene evidence collection time bound, flaky SQLite tests

- Added bounded elapsed-time verification to `src/scenes/live-plan.mjs` (default 5s, configurable 0–30s): a slow read cannot yield an accepted read-only scene plan. This is NOT a deadline for future action execution, nor validation of HA `last_changed`: an unchanged entity may be stable for days. The first and final time checks fail closed with zero planned actions.
- Focused `scene-live-plan` tests **6/6 passed**, including slow read and old `last_changed`. Commits `74080e1`, `8c42141` pushed. No HA actuation or production restart.
- Full standard `npm test`: **244/245 passed, 1 failed**, `test/learner.test.mjs` SQLite `database is locked` while parallel tests share `data/bot.db`. Independent sequential `node --test --test-concurrency=1 test/*.test.mjs`: **245/245 passed**, exit 0. Do not report default parallel full suite as green.
- Next P1: isolate test databases, preserve production SQLite integrity and make normal `npm test` stable; then add isolated policy/confirmation harness. Gate B and real site lighting classification remain open.

## 2026-10-08 — SQLite test database isolation

- Audited shared `data/bot.db` paths in database, learned-devices and conversation modules. Added explicit `HA_BOT_DB_PATH` override; normal production launches retain existing default path.
- Added `scripts/run-isolated-tests.mjs`: reads **schema only** from existing SQLite DB, creates fresh temporary independent SQLite DB for each test file, runs up to three test-file processes concurrently with their own `HA_BOT_DB_PATH`, and deletes temporary files after run. Skips SQLite internal `sqlite_sequence` schema statement. No production DB writes from the isolated test launcher.
- Updated npm test to use the isolated runner after syntax checks. Initial launcher test failed due to SQLite reserved internal table and was corrected. Isolated runner: **43 files / 245 passed / 0 failed**. Normal **`npm test` completed with exit 0**, 43 files / 245 passed / 0 failed. No bot restart or HA actuation.
- Caveat: test runner still reads the existing DB schema at startup; later improve to a committed test schema fixture so tests also function without any access to production DB. Future: isolated policy/confirmation/execution mock harness; Gate B remains open.

## 2026-10-08 — Confirmation execution fail-closed audit

- Found `queueConfirmedAction` in `src/utils/queue.mjs` previously consumed a stored confirmation and executed `callHA` without rechecking policy/scope. Confirmation is consent, not authorization.
- Required explicit asynchronous `authorize(action,actor) === true` before consuming or executing a confirmation. No gate, rejected policy or policy exception returns a blocked status and makes **zero calls** to the executor. The existing Telegram bot caller does not yet supply this independent gate: confirmed actions therefore remain intentionally unavailable in v3 until full shared authorization integration.
- Added regression tests for missing/denied/throwing authorization. Focused 3/3 passed; standard `npm test`: **43 files, 246 assertions passed, 0 failed**, exit 0. Code/test commits `8b6ca56`, `f0603de` pushed.
- Important remaining work: wire real policy + scope + preconditions to confirmation execution; verify outcome & audit in an isolated harness; do not re-enable actuation before reviews. No production v2 restart or real HA actuation.

## 2026-10-08 — Isolated confirmation policy gate and queue harness

- Added `src/decision/confirmed-action-gate.mjs` as **purely invoked test/reference gate**, not wired into live bot: checks actor, exact saved action, single verified light entity allowlist, explicit `confirm` policy/services, and live read-only preconditions. Fail closed on missing/mismatched scope, denied/default/auto-safe policy, unsupported actions and stale/unavailable/read exceptions.
- Added focused gate tests (3/3) and a queue+gate integration fixture with a mock executor, proving authorized one-time execution and blocked deny. Existing `queueConfirmedAction` still defaults to no authorizer and therefore blocks in v3; live Telegram call site not modified.
- Standard `npm test`: **44 isolated files, 250 assertions passed, zero failed, exit 0**. Commits `58212c0`, `5a2de52`, `d69f110` pushed. No HA actuation or production restart.
- Estimate: approximately **84% of v3 technical foundation only**, **not** deploy readiness. Remaining: strict trusted derivation of allowedEntityIds rather than caller-supplied IDs, exact state entity identity, policy configuration validation, time-bounded verification and auditing, wider agent E2E tests, operator-reviewed lighting map, Gate C fault simulations and gated deployment. Never wire mock authorizer to real execution.

## 2026-10-08 — Confirmation state identity hardening

- Hardened isolated `confirmed-action-gate.mjs`: mocked/live read-only precondition replies must report **exact expected entity_id**, valid `on/off` state, otherwise no authorization. Avoid trusting a bare state from a different or anonymous device. It is still not connected to live Telegram execution.
- Added four hostile state-response cases (foreign identity, missing identity, unknown/unavailable state). Focused confirmation gate + queue tests **8/8 passed**; full standard `npm test`: **44 isolated files, 251 assertions passed, 0 failed**, exit 0. Code commits `66e6590`, `ac94cda` pushed.
- Outstanding before critical authorization: derive `allowedEntityIds` from independently reviewed HA scope rather than supplied arrays, apply time-bounded re-verification and audit at execution, ensure policy configuration is trusted, test actor/token expiry and malicious LLM paths end-to-end, perform Gate C failure injection, and obtain operator sign-off on HA lighting classification. Production v2 unchanged; real HA control not invoked.

## 2026-10-08 — Sandbox-only backup proof of concept

- Added `src/backup/fixture-sqlite.mjs`, test-only SQLite consistent `.backup` within an explicit sandbox, integrity checks, SHA-256 and schema version manifest, no overwrite/outside-path/symlinked-source. `test/fixture-backup.test.mjs` tests these invariants with disposable SQLite files. Commits `e55bf0d`, `6cb2798`, `ef1241d`.
- Focused **1/1** and standard `npm test` **45 files, 252 assertions, 0 failed**, exit 0. Real production DB not backed up, no restore/schedule/encryption/remote storage; existing bot and HA unchanged.
- Next: sandbox-only restore rehearsal and hardened manifest checks. Production backup/restore, secret handling and automated schedules require separate owner approval. Gate B remains open.

## 2026-10-08 — Sandbox-only SQLite restore verification

- Added sandbox-only `restoreFixtureSqlite` to `src/backup/fixture-sqlite.mjs`, rejecting mismatched/corrupt backup manifests, schema newer than caller-supported ceiling, existing destination, symlink, and outside-sandbox target. Fixture restore copies a SQLite snapshot to a disposable empty filename and rechecks manifest/integrity.
- Added tests for sample row round-trip, schema compatibility rejection, corrupted manifest, existing target, symlink and path escape. Focused **2/2** passed, full `npm test` **45 isolated files / 253 passing assertions / 0 failures** (exit 0). Commits `6910572`, `e399e9d`.
- This utility is NOT production-ready: directory race attacks, multi-file state consistency, encryption, retention, off-device backups, and secrets are out of scope. No live restore, real HA actuation or production bot restart.
- Next: audited backup/restore specification and fixture coverage for WAL/live writer behavior and restore failure rollback, then resume Gate B trusted policy-source work.


## 2026-10-08 — Completed sandbox WAL / failed-backup cleanup stage

- Updated `src/backup/fixture-sqlite.mjs` to reserve snapshot destinations exclusively and clean incomplete backup files after failure (commit `8bdc287`).
- Added `test/fixture-backup.test.mjs` regression with a live uncommitted SQLite WAL writer, before/after committed snapshot checks and corrupted-source cleanup (commit `b8ba15e`).
- Focused tests **4/4**, full standard `npm test` **45 files / 255 assertions / 0 failures**, exit 0. Only ephemeral fixture SQLite databases were modified. No live backup, HA control or production restart.
- This **sandbox substage** is complete. Production-ready backup/restore is a separate open task. Continue Gate B with trustworthy policy scope inputs and isolated authorization tests; do not enable real actions without explicit approval.

## 2026-10-08 — Trusted read-only scope before isolated confirmed action

- Added `src/decision/trusted-confirmed-area.mjs` as a **test/reference wrapper** around `authorizeConfirmedAction`: strict HA room identity, independently reviewed local lighting classification, complete HA-MCP inventory, and fresh state read now derive the one permitted target. Supplied `allowedEntityIds` from model/caller is ignored. Reject mismatched action target, unconfigured/missing room, partial HA inventory, MCP failures, and expired collection.
- Only supports a **single eligible light in the verified area** and exact confirmed action. It is NOT yet wired into the live bot or generic multi-light confirmation. This avoids silently allowing partial area control or caller-provided lists. The local operator-approved real-house classification is still absent.
- Focused tests **5/5 passed**; standard full `npm test`: **46 isolated files / 256 passing assertions / 0 failed**, exit 0. Commits `dbb4819`, `33afe50`.
- Next Gate B: trusted policy source and user request scope binding (not just caller-supplied areaQuery), comprehensive agent simulation and action verification. Gate C and deployment remain blocked. No HA actuation or production restart.

## 2026-10-08 — Bind trusted room light confirmation to explicit user text

- Hardened isolated `trusted-confirmed-area.mjs`: requires the original explicit Russian room-wide light request, exactly matching normalized area name and on/off service. Modified room, reversed service or ambiguous/missing request fails closed before HA-MCP reads. Read-only classification and scope rules remain independent.
- Added malicious/mismatched request fixtures. First focused test exposed an expected case difference (`Комната` vs `комната`); corrected exact case-insensitive comparison. Focused test **1/1 passes** after fix. Code commits `4d0d9ff`, `5ac64ba`, `23e69b4`.
- This does NOT establish cryptographic provenance of `userText` or `policy`; they must be bound to immutable actor-specific confirmation records by the eventual production integration. The module is still sandbox-only, and no live actuation or production restart occurred.
- Next gate: isolated verification contract and actor-scoped queue integration; test failures/pending service response and HA state readback. Never treat a returned `success:true` as verified state.

## 2026-10-08 — Start isolated post-service verification stage

- Added `src/decision/confirmed-result-verification.mjs` (test-only): a successful HA-MCP service response is insufficient; require explicit `success:true`, exact entity identity and readback of expected on/off state. Errors, stale state, wrong/missing identity and failed read are never marked verified.
- Added `test/confirmed-result-verification.test.mjs` with positive and negative mocked cases. Focused **1/1 passed**; standard `npm test` **47 isolated files / 257 assertions passed / 0 failed**, exit 0. Commits `e0cc84a`, `8027e34`.
- This starts the next Gate B/C isolated verification stage; not connected to live queue. User-text/area fixture stage previously passed 256/256. Still pending immutable actor/token binding to original request and independently trusted policy configuration before production permission. No HA actuation or service restart.

## 2026-10-08 — Mock full-chain completion / Gate C began

- Added `test/confirmation-full-chain.test.mjs` (commit `0753479`) with isolated actor-scoped pending confirmation → independent policy/preconditions → mock service → strict readback; verifies one-time token consumption, denial before write, and failure to call stale/foreign state a success. Full standard `npm test` after addition: **48 files / 260 passed / 0 failed**, exit 0. This completes the mock full-chain fixture substage, not production approval.
- Started Gate C fault injection: `test/gate-c-confirmation-faults.test.mjs` (commit `2a036d3`), simulating exceptions, mismatched identity, unknown state. Confirms that an accepted service followed by failed verification remains **pending** and cannot silently issue a second service call. Focused 4/4 passed including full-chain scenarios.
- Still blocked: secure immutable original request/policy binding per actor/token, trust of approved per-home area classification, audit and timeout limits, production caller integration and owner-approved live acceptance/deployment. No live HA device calls or production restart. Next: comprehensive Gate C faults, then full suite and documentation checkpoint.

## 2026-10-08 — Gate C adversarial confirmation queue extension

- Added mock-only races in `test/gate-c-confirmation-faults.test.mjs` for six concurrent confirmations, authorization exceptions/denials, and expiry during slow policy evaluation. Exactly one simulated service call in the concurrency case, none after authorization refusal or expiry. Focused 4/4 tests pass.
- An initial 30-ms expiry fixture triggered the equally safe `missing` branch before the policy check; refined it to distinguish expiry *during* the authorizer. Commits `db5f86c`, `e4f95ae`. No new HA service integration or real device action.
- Further Gate C work remains: strict timeouts for hung policy/MCP calls, cancellation semantics, immutable request/policy provenance, audit events and cross-process confirmation safety. Full regression result to be recorded separately.

Gate C extended checkpoint: full standard `npm test` succeeded on Raspberry Pi — **49 isolated files, 264 assertions passed, 0 failed, exit 0**. Remaining P0 limitations unchanged: no trusted production policy provenance or signed-off device mapping; mock-only tests do not authorize deployment.

## 2026-10-08 — Gate C timeout and cancellation protections

- `queueConfirmedAction` now bounds the asynchronous authorizer with a 3000-ms default timeout (configurable up to 30000 ms in isolated tests); exceptions/timeout are fail-closed and do not call the executor. Commit `ec9c86c`.
- Expanded Gate C regression: unresolved promise fails closed; cancellation during authorization causes the final token consumption to fail, with **zero writes**. Focused test suite 6/6 passed. Commit `7473204`.
- **Security caveat:** `Promise.race` times out the queue's wait, **not** the underlying HA-MCP request. The production integration must use cancellable requests/AbortSignal, bounded network calls and trusted actor-specific provenance. No production v2 restart and no real HA service action. Complete full-suite result to be recorded after test run.

Full regression for Gate C timeout/cancel checkpoint: **49 isolated files, 266 assertions passed, zero failed; exit 0** on Raspberry Pi. The production integration remains disabled and no real HA service execution was performed.

## 2026-10-08 — Entity rename audit started

- Added pure read-only `src/home/entity-rename-audit.mjs` to detect changed `entity_id` using exact `platform + unique_id` with preserved domain. No fuzzy matching, no automatic changes; ambiguous/missing identities produce unresolved findings.
- Added isolated `test/entity-rename-audit.test.mjs`: stable identity yields review-only proposal, friendly name-only change is ignored, wrong domain/identity and duplicates fail closed. Focused tests **3/3 passed**; commits `46db7d5`, `1d99506`.
- Next: trusted HA registry snapshot adapter, dependency impact report for policy/memory/reviewed config and a human-approved migration strategy. Live HA was not modified.

Entity rename audit regression checkpoint: **50 isolated test files, 269 assertions passed, 0 failed**, `npm test` exit 0 on Raspberry Pi. This read-only detector is not yet connected to live HA registry collection, nor may its proposals modify policy/memory/classification without review.

## 2026-10-08 — HA lifecycle independence guard (isolated)

- Reviewed `src/mcp/client.mjs`, `src/mcp/executor.mjs`, `src/policy/risk.mjs`: AI client is separate but the generic MCP executor is capable of arbitrary tool invocations, so risk classification alone is **not** a hard lifecycle deny rule.
- Added pure isolated `src/decision/ha-independence-guard.mjs` to refuse HA/supervisor lifecycle services, generic stop/restart/shutdown/reload, and known integration reloads. `test/ha-independence-guard.test.mjs` verifies forbidden and ordinary benign tool calls. Focused **2/2 passed**. Commits `982a1fa`, `fdf20cc`.
- This guard is **not yet wired into the production executor**. Next required work: make hard-deny enforcement unavoidable at the v3 call boundary; independently verify no critical HA automations rely on the bot; test HA continuing while optional AI/MCP is stopped (owner-approved live maintenance only). No HA stop, service restart or live actuation was performed.

## 2026-10-08 — V3 MCP capability boundary

- Added `src/decision/v3-tool-boundary.mjs` deny-by-default allowlist: named read-only tools and single `light.turn_on/turn_off` with exact single entity target. Rejects all other tools including `ha_config_*` and lifecycle operations. Writes additionally require an explicit authorization flag from a separate gate. Tests `test/v3-tool-boundary.test.mjs` (3/3 focused passed). Commits `a5e9c55`, `f7d15c3`.
- **Critical:** The boolean `authorized` input is not a trustworthy authorization credential by itself; callers cannot be allowed to self-assert it. This module is a reference perimeter only, **not yet wired to the production or v3 execution pathway**. Before deployment, use an unforgeable actor/token-scoped gate and centralized guarded dispatcher, plus trusted policy and device classification. No HA action was executed.

Full regression checkpoint for v3 MCP tool perimeter: **52 isolated test files, 274 assertions passed, 0 failures**, `npm test` exit 0 on Raspberry Pi. Reference guard remains offline and requires trusted centralized integration before any real writes.

## 2026-10-08 — Reference centralized v3 dispatcher (mock execution only)

- Added `src/decision/v3-isolated-dispatcher.mjs`, which composes pending confirmation, strict v3 tool allowlist, independent reviewed room + HA discovery, original user request matching, policy and state preconditions, mock service execution, and exact-state readback. No caller-provided `authorized` flag or model-provided entity allowlist is used as permission.
- Added `test/v3-isolated-dispatcher.test.mjs` checking dangerous `homeassistant.restart` denial and a single verified simulated light action despite forged caller flags. Focused **1/1 passed**. Commits `4a99a18`, `3ba3adb`.
- **NOT production-ready:** `trustedPolicy`, `originalUserText`, `areaQuery`, and `simulatedService` are still constructor-supplied; constructor provenance must be anchored to trusted operator config + immutable actor/token record. Do not replace simulatedService with HA `ha_call_service` or connect dispatcher to live Telegram. Production also needs deny-by-default runtime network and tool boundaries, audit trails and owner-approved staged rollout.

Full regression after mock-only centralized v3 dispatcher: **53 isolated test files, 275 assertions passed, 0 failed**, `npm test` exit 0 on Raspberry Pi. Production integration and immutable provenance remain open.

## 2026-10-08 — Immutable-intent reference ledger

- Added isolated `src/decision/v3-intent-ledger.mjs`: actor/chat-scoped unpredictable token, deep-copied original request and exact action, 60s max expiry, replacement invalidation, cancellation and single consume. AI model does not receive authority to create trusted records in the intended architecture.
- Added `test/v3-intent-ledger.test.mjs` for mutation resistance, cross-actor denial, replay rejection, expiry, replacement and cancellation. Focused **2/2 passed**. Commits `1f0d932`, `579a887`.
- **Not yet integrated** with the mock dispatcher or trusted Telegram ingress. Constructor/issuer authority, persistence across restarts, crash consistency, independently reviewed policy provenance, logging and replay isolation remain blocking. No real service calls or restart performed.

Regression checkpoint for isolated v3 intent ledger: **54 test files, 277 assertions passed, 0 failed**, full `npm test` exit 0 on Raspberry Pi. Production state and HA remain unchanged.

## 2026-10-08 — Provenance integration review

- Inspected `v3-intent-ledger.mjs` and `v3-isolated-dispatcher.mjs`: they are not connected. Dispatcher receives `originalUserText` and `areaQuery` through its constructor rather than deriving them from an actor/token-scoped record. No production trust guarantee exists yet.
- Required next safe integration: after read-only authorization, atomically consume exactly matching actor/chat/token record; derive area from original request; reject cancellation, replacement and expiry; mock executor only. Test concurrent confirmations and state readback. Do not connect production services.
- Attempted to create the isolated module but repository write tool rejected the operation, so no executable code was added in this step.

## 2026-10-08 — Strategy audit corrective actions approved and applied

- Harmonized `docs/home-agent-v3-strategy.md`, `docs/TODO.md`, and `docs/PROGRESS.md`: Gate B is **blocking**, Gate C remains isolated, Gates D/E not started, overall percentage readiness withdrawn as not evidenced. Production must preserve independent Home Assistant Green availability.
- Added reference-only `src/decision/v3-ledger-bound-mock.mjs`: the dispatcher derives actor-scoped original request and exact action from the private v3 ledger rather than accepting model-supplied text, targets, or authorization flags. `test/v3-ledger-bound-mock.test.mjs` verifies forged/unknown token and HA restart rejection without touching tools; focused **2/2 passed**. Commits `226f6f9`, `3889002`.
- **Still OPEN:** trusted Telegram ingress as the only ledger issuer, approved policy source/configuration, positive read-only HA discovery fixture, tested in-flight cancellation/race, single-use authorization atomically across process crashes, and production gate wiring. Do not authorize live HA actuation.

Full regression checkpoint after approved strategy correction and ledger-bound fixture: **55 isolated files, 279 assertions passed, 0 failures**, `npm test` exit 0 on Raspberry Pi. Gate B stays OPEN: the new fixture has negative tests only; trusted ingestion, positive scoped fixture and concurrency/cancellation tests still required.

## 2026-10-08 — Gate B ledger-bound successful mock execution

- Expanded `test/v3-ledger-bound-mock.test.mjs` with a successful single-light synthetic area fixture, actor/token-scoped ledger authorization, two concurrent confirmations, replay rejection, cancellation and exact readback. Only one simulated write occurs. Focused **3/3 passed**.
- First assertion required second concurrent request to report `missing`, but valid alternative denial was `denied` when first request already changed the state; corrected to assert the invariant (one verified result, no second write). Commits `f1649be`, `b9d98db`.
- Gate B remains OPEN: only mock execution has been tested, while Telegram ingress ownership and operator-approved policy/classification provenance, cancellation during live lookup and real read-only acceptance still need proof. No physical HA action taken.

Regression checkpoint after positive ledger-bound fixture and concurrent confirmation testing: **55 test files, 280 passing assertions, zero failed**, full `npm test` exit 0 on Raspberry Pi. Gate B remains OPEN pending trusted policy/Telegram ingress and in-flight cancellation tests.

## 2026-10-08 — Gate B in-flight invalidation

- Added `test/v3-ledger-inflight-invalidation.test.mjs` with deliberately blocked mock HA area discovery. While read-only authorization is unresolved, the fixture cancels the token, replaces the actor's request, or advances past expiry. Once discovery resolves, the dispatcher detects invalidated consent and makes **zero mock writes**. Focused test suite **3/3 passed**, commit `aab58b8`.
- This tests cancellation before commit, not cancellation of an already-dispatched HA service call. Real integrations still need trusted ingress/policy, bounded read timeouts and shutdown handling. Gate B remains OPEN.

Full regression after in-flight consent invalidation fixture: **56 isolated test files, 283 assertions passed, 0 failed**, `npm test` exit 0 on Raspberry Pi. Gate B remains OPEN pending verified trusted Telegram ingestion and operator-controlled policy source.

## 2026-10-08 — Gate B policy origin

- The v2 policy contains existing auto_safe grants. These are not evidence of consent for v3.
- Created fail-closed `src/decision/v3-trusted-policy-source.mjs` and `test/v3-trusted-policy-source.test.mjs`; isolated **1/1 passed** (`5851cb2`). Default v3 grants remain empty.
- Pending: operator-reviewed config loader, trusted Telegram event ingress, and binding to the isolated dispatcher. No production deployment.

## 2026-10-08 — Gate B Telegram event envelope

- Reviewed live v2 `src/telegram/bot.mjs`: its authorization compares `ctx.from.id` with configured user and uses `ctx.message.text` and `ctx.chat.id`. No v3 integration performed.
- Added isolated `src/decision/v3-telegram-intent.mjs` to validate actor/chat/message consistency and reject untrusted/malformed, forwarded, slash or empty text. New tests passed **2/2**, and the separate v3 fail-closed policy test passed **1/1** (commits `4781477`, `5d429a0`).
- Telegram transport authenticity still depends on trusted Telegraf ingress; this pure adapter alone does not authenticate arbitrary caller objects. It is not connected to the v3 ledger issuer. Gate B remains OPEN.

Full regression for isolated Telegram envelope and deny-by-default policy source: **58 isolated files, 286 passing assertions, zero failures**, `npm test` exit 0 on Raspberry Pi. Trusted ingestion-to-ledger wiring remains an open Gate B blocker; no HA changes performed.

## 2026-10-08 — Gate B fixture Telegram ingress to intent ledger

- Added isolated `src/decision/v3-mock-telegram-issuer.mjs` joining a validated Telegram-like event envelope to the v3 actor/token-scoped intent ledger. Stores exact original text and action snapshot, rejects malformed actor/chat and disallowed MCP candidates. `test/v3-mock-telegram-issuer.test.mjs`: **2/2 focused passed**; commits `0ea8cf1`, `d78ae33`.
- **Security caveat:** This is NOT authentication or trusted ingress. Any caller possessing the fixture issuer can pass a fabricated object and request a candidate. Only the real trusted Telegraf transport handler may hold the issuer reference; protected policy and original action validation must independently authorize before any service execution. Do not connect to production v2 or HA.

Full regression checkpoint for Telegram-to-ledger mock issuer: **59 isolated files, 288 passing assertions, 0 failed**, `npm test` exit 0 on Raspberry Pi. Gate B remains OPEN because event authenticity must be enforced by the trusted live transport boundary and the separately reviewed policy loader remains unimplemented.

## 2026-10-08 — Voice-first channel-neutral refocus

- Owner approved deferring production Telegram-specific integration; shared authorization and provenance remain mandatory. Added `src/decision/v3-command-envelope.mjs`, `test/v3-command-envelope.test.mjs`; focused **2/2 passed**. Commits `5300fad`, `c2711a0`.
- The pure reference envelope distinguishes authenticated Telegram transport from device-only voice/Assist and denies claimed voice user identity. It is NOT authentication or verified device provenance; adapters must be reviewed before trusting metadata. The low-risk check is only a preliminary eligibility gate and does not authorize HA execution.
- Next: join normalized sources to common policy and ledger without assuming Telegram actor/chat identity. Gate B remains OPEN. No v2 or HA changes.

## 2026-10-08 — Voice-first shared channel intent fixture

- Added isolated `src/decision/v3-channel-intent-ledger.mjs`, `test/v3-channel-intent-ledger.test.mjs`. The ledger scopes proposals to source/channel identity, binds original command and action snapshot, and invalidates replaced/cancelled/expired/replayed tokens; device-only Assist is never treated as an authenticated human identity. Together with envelope tests **4/4 focused passed**. Commits `7ed8d43`, `0dc46f6`.
- This is not a trusted device ingress, not an execution authorization and not production persistence; a caller with access to the fixture issuer can still fabricate metadata. Next: channel-neutral restricted authority/low-risk authorization bound to trusted ingress and reviewed policy; do not connect to live HA.

Full regression for channel-neutral request envelope: **60 isolated test files, 290 assertions passed, 0 failed**, `npm test` exit 0 on Raspberry Pi. Gate B remains OPEN; normalizer is a pure reference module and does not establish authenticated transport or production voice control.

Full regression checkpoint for the voice-first channel intent fixture: **61 isolated files, 292 passed assertions, 0 failures**, `npm test` exit 0 on Raspberry Pi. Gate B remains OPEN pending authenticated input adapters, common reviewed policy and authorization binding.

## 2026-10-08 — Isolated Assist voice satellite ingress

- Added `src/decision/v3-isolated-assist-adapter.mjs` and `test/v3-isolated-assist-adapter.test.mjs` as offline fixtures, **2/2 targeted tests passed**. An allowlisted satellite can produce a normalized device-only command with `authorization: not_granted`; unknown satellites, impersonated speakers, and unverified high-risk identity fail closed.
- The satellite allowlist is fixture-local, not an authenticated connection to HA Assist. It does not confer user identity, execution permission, or an approved autonomy policy. Shared policy/room classification and trusted source binding remain Gate B blockers. No ESPHome or live HA changes.

Full Raspberry Pi regression after isolated Assist ingress fixture: **62 isolated test files, 294 passing assertions, 0 failures**, `npm test` exit 0. Gate B remains OPEN: neither authenticated Assist transport nor policy-bound execution/confirmed voice identity is implemented.

## 2026-10-08 — Gate B shared Assist preflight and next stage start

- Finished offline Assist-to-common-tool-boundary preflight: `src/decision/v3-assist-decision-fixture.mjs` and tests, **2/2 focused pass**. Voice commands remain `review` only, never authorized HA writes; claimed room, unknown targets, high-risk and forbidden tools fail closed. Commits `70fa417`, `6fc176d`.
- Began next stage with `src/decision/v3-satellite-area-fixture.mjs`: only explicitly reviewed satellite-to-area references, no inferred membership or authorizations. Tests reject duplicate, unreviewed, malformed and overridden mapping; combined focused tests **4/4 pass**. Commits `22f2252`, `58e2500`.
- OPEN: authoritative live HA satellite device/area mapping and completeness validation; private trusted input adapter and actual operator-approved target policy. None of these fixture results establish production control permission. No live HA operations.

Full regression after voice preflight completion and satellite-area reference stage start: **64 isolated test files, 298 passing assertions, 0 failures**, `npm test` exit 0 on Raspberry Pi. Gate B still OPEN until actual trusted HA device/area mapping and independently approved policy are integrated; no HA actuation.

## 2026-10-08 — Satellite registry freshness and identity reference

- Added isolated `src/decision/v3-satellite-registry-binding.mjs`, comparing explicitly reviewed satellite-area mapping with a synthetic registry snapshot. Requires complete, successful, non-partial, fresh snapshot and exactly one matching available/active device whose area matches reviewed configuration. No HA calls or control performed.
- Added `test/v3-satellite-registry-binding.test.mjs` for correct match and negative cases (stale, partial, missing, duplicated, moved, unavailable, disabled, missing device ID). First test run revealed an incorrect stale-fixture timestamp (not actually >30s old); corrected. **2/2 focused passed** (`44a0e41`, `673c2cb`, `cc040e0`).
- Next: prove snapshot provenance/registry completeness using read-only HA adapter, verify stable device identity and fail closed on missing registry capabilities. Reviewed map plus snapshot remains **reference evidence**, never execution authorization. Gate B remains OPEN.

Full regression checkpoint for synthetic satellite registry identity: **65 isolated test files, 300 assertions passed, zero failed**, `npm test` exit 0 on Raspberry Pi. This is not a live authoritative HA registry adapter. Gate B remains OPEN.

## 2026-10-08 — Satellite read-only registry acquisition fixture

- Resumed from latest branch HEAD `dba7a76` (which already included `v3-satellite-registry-binding.mjs` and freshness/identity tests). Avoided duplicate implementation.
- Added `src/decision/v3-satellite-registry-reader.mjs` and `test/v3-satellite-registry-reader.test.mjs`. The bounded injected read-only fixture rejects missing/partial/paginated/stale/duplicate/ambiguous/malformed inventory, offline read failures and timeouts, and strips extra input fields. Only complete fresh snapshots reach the separate reviewed mapping comparator. Targeted **2/2 passed** (`a03d03d`, `a500b9d`).
- **Not a live HA registry adapter or authenticated read-only transport.** Snapshot `success` and `complete` still originate with the injected provider; production adapter must prove registry completeness and device identity. Gate B remains OPEN. No HA service call or restart.

Full regression after the isolated bounded registry acquisition stage: **66 isolated test files, 302 passing assertions, 0 failures**, full `npm test` exit 0 on Raspberry Pi. Gate B remains OPEN; actual HA device-registry read adapter, provenance guarantees, stable identity and owner-reviewed policy are outstanding.

## 2026-10-08 — Satellite registry provenance capability checkpoint

- Inspected v3 exposed MCP tools and registry reader; generic `ha_search`/`ha_get_overview` cannot prove complete authoritative device registry membership, stable IDs, or device area assignment. Do **not** adapt entity search as if it were a device registry.
- Added `src/decision/v3-registry-capability-guard.mjs` with `test/v3-registry-capability-guard.test.mjs`, **2/2 focused passing** (commits `525039e`, `eca22cc`). Requires explicit claims for dedicated authenticated read-only device registry snapshot, completeness, stable device IDs and area IDs. Even a claimed supported capability remains **adapter-review-only**, not execution permission.
- Gate B blocker: implement/inspect an actual read-only HA device registry interface with provenance and completeness, then isolated tests for malformed/partial/stale snapshots before enabling channel-to-area decisions. No HA actions or v2 modifications.

Full regression after satellite registry capability guard: **67 isolated test files, 304 passing assertions, zero failed**, `npm test` exit 0 on Raspberry Pi. Gate B still OPEN; no actual authenticated HA device registry source has been connected.

## 2026-10-08 — Requested Gate B closure assessment

- Gate B **cannot honestly be marked complete**: the installed MCP capabilities have not established an authenticated, complete HA device registry, the private home mapping/policy has not been operator approved, and a trusted joined caller-to-action chain is not deployed or verified.
- Added `src/decision/v3-operator-policy-schema.mjs` and focused `test/v3-operator-policy-schema.test.mjs` (**2/2 pass**): versioned deny-by-default policy schema only allows exact `light.*` confirmation for `turn_on`/`turn_off`, rejects extra grants/fields/unknown services, and returns **schema-valid-only, not operator-approved**. Commits `e880c58`, `f392a52`.
- Added `docs/GATE-B-ACCEPTANCE.md` documenting evidence, outstanding blockers and permissible sequence. No HA actions, private config changes or production restart.

Full regression after strict operator policy schema and Gate B acceptance checklist: **68 isolated files, 306 passing assertions, 0 failed**, `npm test` exit 0 on Raspberry Pi. Gate B remains OPEN due to unresolved trusted HA registry and operator-reviewed live policy; closing it based solely on unit tests would violate documented release conditions.

## 2026-10-08 — Local policy loader fixture

- Created `src/decision/v3-operator-policy-loader.mjs` with local JSON schema and filesystem checks; added `test/v3-operator-policy-loader.test.mjs` (2/2 focused pass), commits `0d77cb9`, `7c0d37f`.
- This is a test-only loader, not yet a complete secure operator approval pipeline. File ownership and path-race robustness, trusted caller binding, and device-registry provenance remain open. Gate B stays OPEN.

Full regression after local-policy loading fixture: **69 isolated test files, 308 assertions passed, zero failed**, `npm test` exit 0 on Raspberry Pi. Gate B remains OPEN pending approved protected policy origin, complete HA registry source and end-to-end trusted authorization. No HA operations.

## 2026-10-09 — Three-environment design checkpoint
- Owner requested future dev (development), stage (testing), prod (production). Added ADR and pure fail-closed environment contract. Dev is fixture-only, stage mock/read-only by default, prod deployment needs explicit review. Four focused tests passed. No live environment was deployed or reconfigured.
- Next: validate environment boundaries in a separate mock executor and test cross-environment isolation; no live Home Assistant writes or production changes.

## 2026-10-09 — Gate B synced source and focused regression

- Fast-forwarded local `feature/v3-home-agent` from `b0075fa` to `29938c8` (101 commits), clean starting tree. No service restart, no HA MCP write, no live bot modification.
- Ran focused Node tests for joined chain, strict gate, Telegram binding, registry invalidation, group confirmation and approval revocation: 6 test files, 15 assertions passed, zero failures, exit 0.
- Existing isolated joined chain is present; no duplicate implementation was introduced. This is a focused regression only, not a full npm test or Gate B acceptance.
- Gate B remains OPEN: protected owner-approved per-home policy, authoritative complete live registry, authenticated production transport binding and joined audit/fault acceptance are not established.
- Next: design and test the operator-controlled trust boundary for policy/registry provenance using offline fixtures, then run full isolated regression. Do not deploy or expand device access without explicit approval.

## 2026-10-09 — Fail-closed registry identity collisions (Gate B)

- Added strict non-empty unique ID validation for device and area records in `normalizeLightingRegistry`; duplicate or absent IDs previously risked being silently collapsed by Map/Set.
- Added negative fixtures for duplicate, empty and missing device/area IDs, plus valid unchanged evidence.
- Focused offline tests: 3 files, 8 passed, 0 failed; `git diff --check` clean. No Home Assistant write, restart, policy grant or deployment.
- Gate B remains OPEN: this strengthens read-only evidence integrity, but cannot authenticate original ingress or establish owner-approved live policy. Full suite regression result is recorded after completion, not presumed.

## 2026-10-09 — Full isolated regression after Gate B hardening

- Full `npm test` completed: 108 isolated files, 431 passing assertions, 0 failed files, exit 0, runtime 291.01 seconds on Raspberry Pi 3.
- Coverage run used fixture SQLite databases, dummy test credentials and unreachable loopback MCP; not production acceptance.
- Registry collision fail-closed patch: commit `313ebff`. Policy post-read ownership/permissions revalidation: commit `7185d69`. Focused follow-up: 10/10 passed.
- Gate B remains OPEN pending trusted channel ingress, protected owner-reviewed approval, authoritative complete live registry and live acceptance approvals. No service restart or HA write.

## 2026-10-09 — Malformed rollback approval records fail closed

- Strengthened offline rollback guard: absent, primitive, array and empty approval record inputs now return invalid evidence rather than throwing or being mistaken for a meaningful review candidate.
- Added adversarial malformed-input tests. Focused approval revocation and rollback suites: 5/5 passed; git diff --check clean.
- Still isolated only: no authenticated owner checkpoint, production authorization, MCP writer or live deployment. Gate B remains OPEN.

## 2026-10-09 — Offline Telegram replay capacity guard

- Full regression for previous approval rollback patch: 108 test files, 432 assertions passed, zero failed files, exit 0 (287.88 seconds).
- Isolated Telegram transport admission now rejects same chat/message with changed update ID and denies when replay cache reaches capacity instead of evicting still-relevant IDs. No persisted replay identity across restart; authenticated production ingress remains unavailable.
- Focused tests: 8/8 passed, zero failures. Gate B remains OPEN; no live wiring, bot restart or HA control.

## 2026-10-09 — Offline durable Telegram replay adapter

- Previous full isolated runner passed 108 files / 434 assertions / zero failures, exit 0.
- Extended isolated Telegram admission with optional injected durable claim store, reusing existing Assist replay fixture. Claims key off chat and message ID, not mutable update ID; storage failures reject before admission.
- Offline restart and storage failure tests added. Focused suites 11/11 passed. No live transport integration; persistent replay storage provenance, concurrency, retention and owner approval remain open.
- Gate B OPEN, no HA writes, production bot restart or authorization expansion.

## 2026-10-09 — Durable Telegram offline regression result

- All isolated tests after durable replay adapter: 108 files, 436 passing assertions, 0 failed files, exit 0 (116.17 seconds).
- This is offline evidence only: production authentication, protected replay store, retention, multi-process admission and deployment authorization remain OPEN.

## 2026-10-09 — Cross-chat handoff and PR #1 verification

- Read `docs/CHAT-HANDOFF.md`, `AGENTS.md`, strategy, TODO and WORKLOG; checked Raspberry Pi `feature/v3-home-agent` matched GitHub and had a clean working tree at session start (`dd4c6e0`).
- Cross-chat handoff committed and pushed as `dd4c6e0` in the prior work session. Treat this dated status as a pointer, never a claim of live production acceptance.
- PR #1 Gate E snapshot hardening kept in separate draft branch, not merged or deployed. Its focused isolated tests ran on an independent temporary Git worktree: **11/11 passed, exit 0**. Existing main-branch focused tests: **9/9 passed, exit 0**.
- Full PR `npm test` initiated in isolated temporary worktree; result **PENDING** at this checkpoint. Log `/tmp/rs-v3-pr-full-test.log`; inspect process/result before claiming success or removing the worktree. Tests began with slow sequential `node --check` on Pi 3.
- Gate B general actuation and Gate E live Assist remain OPEN. No Home Assistant writes, service restarts, permission expansion or production changes.
- Next exact action: obtain completed full PR test exit status, check PR diff against latest upstream, then update WORKLOG and handoff before considering merge. Do not merge without evidence and explicit review.

## 2026-10-09 — PR #1 full isolated regression completed
- Draft PR #1 (`review/gate-e-target-snapshot-hardening-20261009`, head `6a761ba`) was tested in a separate detached Git worktree on Raspberry Pi 3.
- Full `npm test` log `/tmp/rs-v3-pr-full-test.log`: 109 isolated test files, **442 passing assertions, zero failed files**, `npm test` exit **0**. The outer Desktop Commander process reported exit 1; do not conflate that wrapper status with test exit, and investigate worktree cleanup separately.
- Main `feature/v3-home-agent` stayed clean and was not deployed; PR is still unmerged. Existing Gate B and Gate E authorization prerequisites remain OPEN. No HA actuation, service restart or policy expansion.
- Next: inspect PR #1 diff and reconcile it with latest base, perform explicit review, then merge only if safe. Clean temporary worktree without deleting shared dependencies or unrelated files.

## 2026-10-09 — Gate E PR #1 merged after isolated regression
- Reviewed PR #1 patch: only the offline `verifyAssistReadTarget` snapshot validator and adversarial tests changed; no MCP execution, HA write, production secrets or privilege broadening.
- Focused PR tests: 11/11 pass. Full isolated test: 109 files / 442 assertions / zero failed files, `npm test` exit 0; outer wrapper exit 1 followed successful test and left disposable worktree requiring separate cleanup.
- PR #1 marked ready, merged into `feature/v3-home-agent` as `8eab92b`. Raspberry Pi working branch then fast-forwarded cleanly to the same commit, without restarting services.
- This completes the Gate E **snapshot-validation hardening task only**. Gate B general authorization and Gate E live voice controls remain OPEN. Next: return to Gate B operator-controlled evidence provenance and authoritative HA registry read design.

## 2026-10-09 — Gate B fail-closed full-registry entity identity check
- Reviewed `src/decision/v3-registry-evidence-reader.mjs`, `src/decision/v3-registry-drift-check.mjs` and focused test fixtures. Existing normalizer only checked light-domain duplicates, allowing invalid or duplicate unrelated registry identities to be silently ignored despite an asserted complete snapshot.
- Changed offline normalization to reject missing, malformed or duplicate `entity_id` for **all** registry entries before constructing light bindings. Added adversarial cases for malformed unrelated IDs and duplicate switch/sensor identities.
- Focused registry suites: 8/8 passed, exit 0; `git diff --check` clean. Full `npm test` passed on Raspberry Pi 3: **109 isolated files / 443 assertions / zero failed files**, exit **0**; log `/tmp/rs-v3-gateb-registry-full-20261009.log`.
- This is a source change validated offline; production deployment is not performed. It does not authenticate a live registry source, grant operator policy, alter MCP wiring, restart v2/v3, or actuate Home Assistant. Gate B remains OPEN.
- Next exact action: continue Gate B with the authoritative complete live HA registry reader and operator-approved policy provenance; do not infer either from a SHA digest or model input.

## 2026-10-09 — Gate B dedicated-registry-source contract (offline)
- Added `src/decision/v3-registry-source-contract.mjs` and 3 adversarial tests. A purported dedicated read-only HA registry source must declare independently expected transport/operator/completeness/stable-ID guarantees, and snapshot must explicitly be unpaginated (`partial:false`, `has_more:false`, null cursor) with exact array counts.
- Focused `node --test test/v3-registry-source-contract.test.mjs`: **3/3 passed**, exit 0. Full project regression NOT run for this checkpoint.
- Important limitation: source metadata can be forged; this pure contract does not authenticate transport or read HA, and returns `authorization:false` even on acceptance. Do not treat `accepted:true` as trusted provenance or allow control. Gate B OPEN.
- Next: independently review actual HA-MCP capabilities and design a protected authenticated HA registry transport plus offline fault fixtures; run full regression before any merge/deployment.

## 2026-10-09 — Gate B installed-client source audit
- Read current repo and Pi Git status; inspected `src/mcp/tools.mjs`, registry reader/guard and related code. No validated dedicated authenticated complete HA registry reader is wired into the project. Generic `ha_search`/`ha_get_overview` cannot be used as authority.
- Added `docs/GATE-B-REGISTRY-SOURCE-REVIEW.md` with exact acceptance prerequisites for an authenticated read-only source. Added negative fixture rejecting generic MCP tool kinds as purported registry source.
- Focused suite: **4/4 passed**, exit 0; full npm regression not rerun in this checkpoint. No live HA API writes, service changes or production deployment.
- Next: use sanitized read-only diagnostics to inspect installed HA-MCP registry API/version; implement only after actual source and operator policy provenance is independently verified. Gate B OPEN.

## 2026-10-09 — Real HA-MCP transport schema inspection, no actuation
- Connected a separate Node MCP client to the configured server and invoked **only** `listTools()` (twice), returning 53 advertised tools and read-only input schemas. No `ha_device_registry_snapshot` exists. `ha_get_device` paginates devices, `ha_get_entity` resolves IDs, `ha_list_floors_areas` lists areas, and `ha_search` paginates search matches; none advertises cross-page atomic consistency / shared version binding.
- Detailed source assessment in `docs/GATE-B-REGISTRY-SOURCE-REVIEW.md`. This is evidence of capability discovery, not evidence of complete authoritative live snapshot or permission to actuate. Gate B remains OPEN.
- No source code or permission changes. Next: design version-consistent dedicated read-only registry collector with independent authenticated origin; negative-test pagination mutation, transient missing entries, and mismatched area/device relationships before deployment.

## 2026-10-09 — Gate B offline paginated registry consistency fixture
- Added `src/decision/v3-registry-page-consistency.mjs` and adversarial tests. Requires a consistent opaque generation token, exact counts/offsets/cursors, all records unique, and a final complete page; rejects drift and missing records.
- Focused `node --test test/v3-registry-page-consistency.test.mjs`: 2/2 passed, exit 0. No full regression run yet at this checkpoint.
- Limitation: an opaque generation string supplied by an untrusted caller is forgeable, and the installed HA-MCP does not currently prove this generation across pages. **Offline fixture only, authorization:false always.** No production integration or HA actuation. Gate B OPEN.
- Next: identify a trusted HA snapshot/generation mechanism with verified transport and read-only credentials, then test real read faults and full regression before deployment.

## 2026-10-09 — Native HA registry WebSocket design review
- Reviewed Home Assistant's upstream WebSocket registry list handlers (`config/entity_registry/list`, `config/device_registry/list`, `config/area_registry/list`) and 2026.9 child-device semantics. Proposed a dedicated transport-restricted read adapter; no live HA WebSocket call performed.
- Added offline `v3-registry-double-read.mjs` and adversarial fixtures to reject detected entity/device/area drift and duplicate IDs. Focused tests: **2/2 passed**, exit 0. Full regression is NOT yet rerun.
- The two-pass check provides only observed consistency, NOT atomicity or authentication. No live credentials, HA writes, deployments or policy changes. Gate B remains OPEN.
- Next: source-specific read-only adapter, bounded transport checks and cross-registry child-device verification; full isolated regression before deployment.

## 2026-10-09 — Offline allowlisted HA WebSocket registry adapter
- Implemented `src/decision/v3-ha-registry-read-adapter.mjs`: injected transport, fixed three read-only registry commands, bounded timeout/count, two-pass consistency and child/area/entity relationship checks. Does not open sockets or store credentials.
- Focused `node --test test/v3-ha-registry-read-adapter.test.mjs test/v3-registry-double-read.test.mjs`: **5/5 passed, zero failures**.
- Full `npm test` completed: **113 isolated files / 454 assertions passed / zero failed files**, exit **0**; log `/tmp/rs-v3-registry-read-adapter-full.log`. No production wiring, HA commands, policy grants or restarts.
- Next: record full regression result, then commit/push; subsequently design authenticated source/pinned endpoint and validation of effective child-device areas, with explicit operator approval before live tests.

## 2026-10-09 — Protected WebSocket endpoint preflight (offline)
- Added a pure Gate B config preflight with fail-closed URL validation: wss-only, exact `/api/websocket`, no URL credentials/query/fragment, protected credential source and explicit operator/TLS-pin declarations.
- Focused tests: **2/2 passed**, exit 0. This **does not implement real TLS certificate pinning** or authenticate an endpoint, and the flags are untrusted until transport verifies them independently. Full `npm test` NOT rerun for this small checkpoint.
- No real HA network requests, service restarts or configuration changes. Gate B OPEN. Next: implement a bounded, independently authenticated transport with mocked WebSocket frames and verify token/host provenance, then full regression before promotion.

## 2026-10-09 — Offline HA WebSocket frame protocol guard
- Added `src/decision/v3-ha-registry-ws-frames.mjs` and negative fixtures for malformed handshake, rejected authentication, invalid JSON/size, unmatched result IDs, and non-allowlisted operations.
- The state-machine accepts only three registry list command names, one outstanding request and exact result IDs. Focused tests: **2/2 passing**, exit 0. Full `npm test` not rerun at this checkpoint.
- This module **does not open a WebSocket, send/validate a token, authenticate a host or enforce real network timeout/TLS**. Fake `auth_ok` fixture is a protocol simulation, not trusted identity. Its results have `authorization:false` throughout; Gate B remains OPEN.
- Next: implement an independently reviewed bounded transport with injected mock WebSocket and protected token handling; ensure deny on disconnect, timeout, invalid authentication, oversized payload and connection reuse. No HA production integration until approved.

## 2026-10-09 — Gate B injected WebSocket transport harness
- Added `src/decision/v3-ha-registry-ws-client.mjs` and test fixtures: injected socket only, fixed registry read command allowlist, protocol auth handshake, exact response IDs, per-exchange timeout and cleanup, closes fixture on all paths.
- Focused regression: **4/4 passing**, exit 0 (WebSocket client and frame protocol). Full `npm test` PASSED: **116 isolated files / 460 assertions / zero failed files**, exit **0**; log `/tmp/rs-v3-ws-client-full-20261009.log`.
- Important: caller supplies an already-connected mock socket and test token. This module does NOT validate a host, TLS pin/certificate, server identity or token source, does NOT open a real WebSocket and is NOT integrated into production. A mock `auth_ok` is not evidence of trusted HA; `authorization:false` always. A real transport also needs cancellation of outstanding operations, not just promise timeouts.
- Next: verify full suite, then checkpoint Git; deployment/real HA auth and operator policy remain separately blocked. Do not use this harness as live authorization.

## 2026-10-09 — Gate B offline injected secret lifetime fixture
- Added an offline injectable `v3-ha-registry-secret-boundary.mjs` with an explicit `loadSecret`, `openSocket`, `performRead` contract. Validates fixture secret shape, does not return a token or live socket to its caller, and closes the injected socket after read handling.
- Focused tests: 2/2 passed, exit 0. Full suite NOT run at this checkpoint.
- **Not a security boundary for untrusted callbacks:** `performRead` receives the credential and must be supplied only by trusted deployment code. No actual credential file ACL verification, TLS identity or production secret source is implemented. Gate B remains OPEN. No live HA calls or service changes.

## 2026-10-09 — Gate B local secret-file permission guard
- Added standalone `v3-ha-registry-secret-file.mjs` with tests against temporary fixture files only. Requires absolute path, regular non-symlink file owned by intended UID, no group/other permissions, bounded size; opens with `O_NOFOLLOW`, verifies opened inode and closes descriptor.
- Focused tests: 2/2 passed, exit 0. Full regression not yet rerun at this checkpoint.
- Limitations: parent-directory traversal/ownership and path race resistance across ancestors have not been audited; secure deployment must constrain a fixed trusted path, reject attacker-writable ancestors and independently authenticate TLS/HA. Reading a token is not authorization. No real credentials accessed or services changed. Gate B OPEN.

## 2026-10-09 — Gate B secret ancestry hardening
- Extended `v3-ha-registry-secret-file.mjs` to inspect each ancestor directory for symlink traversal, foreign ownership, and unsafe group/other write permissions (sticky shared system directory exception). Added fixture tests covering writable parent and ancestor symlink.
- Focused 3/3 passed, exit 0. Full `npm test`: **118 test files, 465 assertions passed, 0 failed**, exit **0**, log `/tmp/rs-v3-secret-ancestor-full.log`.
- This remains an offline fixture, not a final race-free hardened credential loader: securely held directory file descriptors / openat-style traversal and approved deployment path are still needed before a real HA token is used. Home Assistant and production untouched. Gate B OPEN.

## 2026-10-09 — Gate B mock TLS peer evidence fixture
- Added `v3-ha-registry-tls-evidence.mjs` with constant-time certificate SHA-256 pin comparison, exact expected hostname, peer authorization flag validation. Focused 2/2 passing, exit 0.
- **Only offline/mock peer evidence:** all peer fields are injected and forgeable. This is not a real TLS handshake, certificate chain verification, trusted channel attestation or production connector. Return authorization:false unconditionally; Gate B remains OPEN.
- Full regression PASSED: **119 test files / 467 assertions / 0 failed**, exit 0, log `/tmp/rs-v3-tls-fixture-full.log`. Next: actual server-side transport must independently verify TLS (not trust caller-provided booleans) and bound I/O/cancellation before real credentials or HA read requests.

## 2026-10-09 — dev/stage/prod storage boundary follow-up
- Reused existing `src/ops/environment-isolation.mjs` and `docs/ADR-DEV-STAGE-PROD.md`; added nested/unsafe storage-path denial and a focused regression fixture. Focused environment suites: 9/9 passed, no HA writes, no service restart. Full suite **124 files / 484 assertions / 0 failures**, exit 0, 218.87s.
- Three actual running environments are NOT deployed; v2 prod and v3 narrow pilot remain untouched. Next: real installed unit/resource inventory and operator-owned manifest template; do not create stage using live HA Green.

## 2026-10-09 — Environment inventory and full-regression checkpoint
- Read `AGENTS.md`, `docs/CHAT-HANDOFF.md`, TODO and dev/stage/prod ADR. Raspberry Pi live Git branch `feature/v3-home-agent` was clean at the start; latest starting commit `5e9d2ec`.
- Read-only live unit inventory: system v2 active, isolated user v3 and Desktop Commander active; Gate D health/alert timers scheduled. No dev/stage services were installed or deployed.
- Focused environment tests: 9/9 pass, exit 0. Started full `npm test` in `/tmp/rs-v3-environment-isolation-full-20261009.log`; record its final exit and totals before claiming full acceptance.
- No HA commands, Telegram actions, service restarts or modifications to secrets. Next: record full suite outcome, update handoff, and continue **offline** environment isolation manifest and source-boundary review. Stage needs explicit approval and a mock HA endpoint.

## 2026-10-09 — Gate B mock WebSocket cancellation hardening
- Updated `src/decision/v3-ha-registry-ws-client.mjs` to pass an `AbortSignal` to the injected `socket.exchange(frame, {signal})` and abort on timeout/settlement. A new offline adversarial test confirms the pending exchange receives abort and socket close follows.
- Focused `node --test test/v3-ha-registry-ws-client.test.mjs`: 3/3 passed; `git diff --check` clean. Full regression: **119 isolated files / 468 assertions passed / zero failed**, `npm test` exit **0**, log `/tmp/rs-v3-ws-abort-full-20261009.log`.
- This is *cooperative* cancellation only: the caller-provided socket can ignore the signal, and `socket.close()` is not currently independently bounded. There is no real WebSocket connector, trust anchor, TLS certificate validation, production credential access, deployment or HA actuation. Gate B remains OPEN.
- Next: independently enforced network I/O and socket-close deadlines, actual TLS peer evidence from a trusted runtime, and read-only operator-approved integration before any real HA access.

## 2026-10-09 — Gate B offline bounded socket cleanup
- Mock-only `testRegistrySocket` now accepts a validated `closeTimeoutMs` (1–10000 ms) and bounds injected `socket.close()` in `finally`, including when an exchange ignores `AbortSignal`.
- Focused transport tests: **5/5 passed**, `node --check` and `git diff --check` passed. Full `npm test`: **119 isolated files / 471 assertions passed / zero failed**, exit **0**, log `/tmp/rs-v3-bounded-close-full-20261009.log`.
- Limitation: settling the caller does **not** prove that an uncooperative underlying I/O is terminated. A trusted future socket implementation must enforce its own transport abort/destroy and TLS identity before accepting real credentials. No HA operations, production service changes or deployments. Gate B remains OPEN.

## 2026-10-09 — approved Gate B acceleration strategy documented
- Re-read AGENTS, handoff, TODO, WORKLOG, strategy and registry source review on live clean Pi branch. Accepted documented vertical-slice priority, maintained official HA transport candidate and three-tier testing.
- Changed documentation only: `AGENTS.md`, new `docs/ADR-GATE-B-ACCELERATION.md`, TODO, WORKLOG, CHAT-HANDOFF. No package installation, source code change, HA call, bot restart, token access, deployment or actuation.
- Validation: documentation assertions and `git diff --check`; no new source behavior, so previous full code regression remains historical (119 files / 471 assertions, exit 0). Gate B OPEN.
- Next: evaluate official JS WebSocket API and Node transport boundaries, then prioritize integrated offline Gate B actor/action/policy/scope chain.

## 2026-10-09 — upstream transport package metadata preflight
- On Pi ran `npm view` for `home-assistant-js-websocket` (9.7.1, Apache-2.0) and `ws` (8.22.0, Node >=10) plus `npm ls --depth=0` (neither directly installed). This validates only published metadata, not real trust guarantees.
- Documentation updated; no dependencies installed, no tests of new runtime behavior, no HA connections, no actuation and no service restarts. Next: inspect package interfaces/security and build isolated end-to-end Gate B chain.

## 2026-10-09 — Gate B vertical-slice adversarial integration fixture
- Added `test/v3-gate-b-vertical-slice.test.mjs` combining existing in-memory original-intent ledger, reviewed local fixture policy, live-scope simulation, exact tool boundary, confirmation consumption and simulated write verification. No source policy or runtime paths changed.
- Focused tests **2/2 pass**: correct actor/chat/token one-time use; reject actor/chat spoof, forged token, dangerous tool, changed scope and cancelled intent with zero writes. Existing separate in-flight invalidation tests remain in place.
- Full project regression **120 files / 473 assertions passed / zero failed**, npm exit **0**; `/tmp/rs-v3-gate-b-vertical-full-20261009.log`. This is offline only; trusted Telegram/Assist provenance, installed HA registry source and approved local policy still missing. Gate B OPEN.

## 2026-10-09 — Gate B channel-neutral provenance regression
- Added offline `test/v3-gate-b-channel-provenance-slice.test.mjs`, reusing existing command envelope, channel ledger and MCP tool boundary. Focused 2/2 pass; Assist device-only identity cannot impersonate human actor; test Telegram requires authenticated transport assertion, binds actor/original text, rejects replay and unknown/dangerous tools.
- Full isolated regression **121 files / 475 assertions passed / zero failed**, exit **0**, `/tmp/rs-v3-channel-slice-full-20261009.log`. The fixture does not verify a real Telegram signature, sender or Assist identity and grants no HA authorization. No operational changes; Gate B OPEN.

## 2026-10-09 — Gate B strict joined-evidence fault cases
- Extended existing `test/v3-telegram-joined-adapter.test.mjs` rather than creating a new production pathway. Strict offline chain now tests missing both evidence callbacks, missing registry evidence, missing approval evidence, and explicit approval rejection. Every branch rejects execution and records zero simulated writes.
- Focused `node --test test/v3-telegram-joined-adapter.test.mjs`: **3/3 pass**. Full `npm test` **121 files / 476 assertions passed / 0 failures**, exit 0; `/tmp/rs-v3-strict-evidence-full-20261009.log`.
- Caveat: tests intentionally have no independently authenticated Telegram ingress, HA source or operator policy; strict callbacks are fixtures. No production service change or HA access. Gate B OPEN.

## 2026-10-09 — verified upstream JS Home Assistant client on live Pi without HA connection
- Git clean at start (HEAD `4412c7c`), reread AGENTS, handoff, TODO and WORKLOG. Confirmed npm metadata: official client ESM `dist/index.js`, ws Node >=10.
- Created a **temporary, isolated** npm prefix under `/tmp` (not the app). Installed only `home-assistant-js-websocket@9.7.1` and `ws@8.22.0` with `--ignore-scripts --no-audit --no-fund --save=false`; command exit 0, added 2 packages. ESM imports for connection/token-auth and ws default succeeded, exit 0.
- Documentation-only repo change; `git diff --check`. No project dependencies changed, no production HA connection, no token access, no service restart. Upstream API runtime compatibility demonstrated, not TLS/security or read-only source authenticity. Gate B OPEN.

## 2026-10-09 — official client shape integrated via read-only injected bridge
- Added `src/decision/v3-ha-upstream-read-bridge.mjs`: tiny adapter for `home-assistant-js-websocket` Connection `sendMessagePromise`, reusing existing `inspectHaRegistryReadOnly`; six calls restricted to native entity/device/area registry read types (two passes), no direct package dependency or socket construction.
- `test/v3-ha-upstream-read-bridge.test.mjs` focused **2/2 passing**; malformed/failed/oversized fixture returns authorization:false. Full suite **122 files / 478 assertions passed / zero failures**, exit 0, `/tmp/rs-v3-official-bridge-full-20261009.log`.
- Trust boundary remains open: injected Connection does not prove TLS source, credential hygiene, registry atomicity or operator policy; positive fixtures are **read_only_review**. No real HA calls, service restarts or package installation in project. Gate B OPEN.

## 2026-10-09 — upstream official client reconnect fail-closed guard
- Inspected installed upstream 9.7.1 `connection.d.ts` on Pi: Connection exposes `connected`, `socket`, `closeRequested`, reconnect and `sendMessagePromise`; the built-in library can reconnect and custom socket implementations must enforce their own connect timeout. Reused these upstream public client indicators rather than extending custom WS internals.
- Strengthened `v3-ha-upstream-read-bridge.mjs` offline: only read when client is connected with current socket, deny while closing/disconnected; detect socket replacement before/after every awaited registry response and stop further reads.
- Focused bridge tests **4/4 passed** including reconnect, disconnected, close requested, socket replacement with no further reads; all responses remain `authorization:false`. Full suite **122 files / 480 assertions passed / 0 failures**, exit 0, `/tmp/rs-v3-upstream-reconnect-guard-full-20261009.log`.
- Does not terminate pending underlying I/O, prove real TLS peer, or prevent every queued response timing race. No real HA or credentials, service restart or production change. Gate B OPEN.

## 2026-10-09 — transport TLS local acceptance fixture and policy handoff
- On Raspberry Pi used built-in `node:tls`/OpenSSL with an ephemeral self-signed localhost certificate and **loopback-only** server to test real certificate verification. Results: untrusted certificate denied=true, explicitly trusted CA accepted=true, wrong hostname denied=true. No credentials or HA calls, fixture directory removed. The real upstream HA websocket TLS and transport close/cancellation have NOT been integrated or independently verified.
- Inspected existing `v3-trusted-policy-source.mjs`: reviewed v3 policy is deliberately default-deny/empty; v2 permissions are never imported. Entered next stage with `test/v3-gate-b-reviewed-policy-boundary.test.mjs`, proving simulated verified registry+approval callbacks still cannot grant a v3 write without owner-reviewed policy. Focused 1/1 passed, zero simulated writes.
- Full isolated npm regression **123 test files / 481 passing assertions / 0 failures**, exit 0, `/tmp/rs-v3-gateb-tls-policy-full-20261009.log`. No installed service altered, no real HA API/Telegram operations, no new production credentials. Gate B OPEN.

## 2026-10-09 — Simplified full regression on Raspberry Pi
- Identified 256 `.mjs` source/test files and slow serial syntax validation in `npm run check` (`find -exec node --check {} \;`); retained exactly the same Node syntax checker but used GNU `xargs -0 -P 3 -n 1` for bounded three-way parallelism, respecting Pi resources and null-safe paths. No dependencies, production code, policy or service modifications.
- Isolated parallel syntax probe passed (69.47s; exit 0). Updated `package.json` npm `check` script and verified `npm run check` passes exit 0 (73.69s). Full `npm test`: **123 files / 481 assertions / zero failures**, exit 0, **220.98s**, `/tmp/rs-v3-accelerated-test-20261009.log` (previous full baseline 322.81s).
- This optimizes development workflow only and does not change Gate B authorization evidence. Gate B OPEN; next: official HA registry read source and operator-reviewed policy, not more custom protocol.

## 2026-10-09 — composed registry evidence and reviewed-policy Gate B denial
- Added `test/v3-gate-b-registry-policy-composition.test.mjs`: real existing offline upstream-Connection bridge with 6 fixed read-only registry calls feeds strict joined Telegram chain and default-deny V3 reviewed-policy source.
- Focused test 1/1 passed: returned read-only evidence is NOT permission; `authorization:false`, `ready:false`; positive test-only approval callback does not cause any write, simulated writes 0.
- `npm test` full isolated regression passed: **124 files / 482 assertions / 0 failures**, exit 0, 219.32s; this checkpoint alone cannot establish independent TLS trust, production Telegram actor identity, real registry provenance or operator-approved V3 writes. Gate B OPEN. No real HA or production changes.

## 2026-10-09 — upstream read timeout denial regression
- Added a focused test to the existing upstream read bridge suite: a hanging registry request times out and no second request is issued. Focused 5/5 tests passed; full npm regression 124 files / 483 assertions / zero failures, exit 0, runtime 217.65 seconds.
- This proves denial at the caller boundary, NOT cancellation of a pending network request or TLS provenance. No live HA credentials, connection, actuation, or service restart. Gate B OPEN.

## 2026-10-09 — upstream registry payload-size post-receive bound
- Expanded existing official-client bridge with a configurable 1 KiB–16 MiB post-receive JSON byte limit (default 2 MiB); payloads exceeding it fail closed before more registry requests. Focused tests 6/6 passed. Full suite **124 files / 484 assertions / 0 failures**, exit 0, 218.87s.
- This is NOT a WebSocket frame limit and does not prevent a large frame from entering process memory; trusted ws `maxPayload` remains required before live use. No live HA connection or production changes.

## 2026-10-09 — actual upstream WSS loopback validation
- Used isolated ws 8.22.0 package, Node TLS/OpenSSL and an ephemeral localhost certificate. All five real loopback WSS cases passed: reject untrusted, accept explicitly trusted CA, reject wrong hostname, reject oversized frame via maxPayload, and force client termination. No HA or production connection.
- Recorded precise limitations and operator-controlled live prerequisites in docs/GATE-B-WSS-ACCEPTANCE.md. Gate B remains OPEN pending actual HA origin and credentials and review.

## 2026-10-09 — Gate B timeout race
Late upstream responses previously resumed registry reads after timeout. Added expiration checks before/after awaited calls and two adversarial regressions. Focused 11/11 passed. Full regression in /tmp/rs-v3-gateb-late-read-full.log pending. No live HA control.

- Full npm test PASSED: 124 files, 486 assertions, 0 failures, exit 0; /tmp/rs-v3-gateb-late-read-full.log.

## 2026-10-09 — Gate B denial regression expansion
- Added offline upstream registry regressions for a rejected second read and connection close on the fifth read. Both cases must abort subsequent reads; focused bridge suite 10/10 passed. Full npm test pending. No HA calls or production changes; Gate B remains OPEN.

- Full npm test PASSED: 124 test files, 488 assertions, zero failures, exit 0.

## 2026-10-09 — Gate B simplification and closure-path review
- Rechecked live Pi branch, comprehensive TODO/strategy and existing source. Confirmed many transport/security fixtures already exist; new custom protocol implementation would duplicate upstream `home-assistant-js-websocket`/`ws` and not solve trusted actor/approval issues.
- Added `docs/ADR-GATE-B-MINIMAL-CLOSURE.md`, selecting the maintained upstream client, one strict joined policy chain, six bounded registry reads, explicit operator policy and separate live read-only acceptance; no weaker gates or automatic v2 permission import.
- Focused tests spanning composed registry/policy, upstream reader, joined chain and operator policy loader: **20/20 passed**, exit 0. Documentation-only source change, no full regression needed to assert no runtime mutation.
- Gate B remains OPEN due to absent operator-reviewed approved V3 policy and lighting classification, independently verified actual TLS+credential source, trusted live ingress binding and acceptance evidence. No live HA access/actuation, unit restarts or privileges changed.
- Next: implement the smallest connected stage fixture with independent provenance, then request operator-reviewed specific credentials/policy for live read-only acceptance only when isolated tests pass.

## 2026-10-09 — minimal joined Gate B denial slice
- Reused existing upstream registry bridge, Telegram joined adapter, intent ledger and default-deny V3 policy. Added negative integration fixtures: mock-positive scope and approval cannot override missing reviewed policy, replay cannot create writes, and absent approval verifier denies. Focused 3/3 passed, simulated writes 0.
- Full regression running at this checkpoint. No live HA action or production service changes. Gate B OPEN pending independently verified ingress/source and owner policy.

- Full npm test PASS: 124 test files, 490 passing assertions, 0 failed, exit 0.

## 2026-10-09 — Gate B Telegram ingress consistency
- Added raw Telegram update versus Telegraf convenience-field consistency checks (message ID, actor, chat, timestamp and exact text) when the raw message is available. This blocks one mismatch class before issuing a pending token but does NOT independently authenticate externally injected contexts.
- New negative fixtures pass, focused ingress tests 7/7. Full npm regression running; no live Telegram/HA operations.
- Gate B still OPEN: production handler ownership, reviewed V3 policy and authenticated HA origin remain separate blockers.

- Full npm test PASS: 124 files, 491 assertions, 0 failures, exit 0.

## 2026-10-09 — Gate B Telegram update type boundary
- Enforced an explicit text-message-only Telegram update shape in the isolated transport admission. Callback queries, edited messages, channel posts and inline queries cannot be combined with synthetic ctx.message fields to obtain a command admission.
- Focused transport and joined adapter tests passed 11/11; full npm regression in /tmp/rs-v3-gateb-update-kind-full.log pending. This does not authenticate arbitrary caller-created ctx objects; still requires real trusted Telegraf handler and reviewed policy. No production changes. Gate B OPEN.

- Full npm test PASS: 124 files, 492 assertions, zero failures, exit 0.

## 2026-10-09 — Optional strict Telegram message provenance
- Added `requireRawMessage` to isolated Telegram transport admission. When enabled, a synthetic `ctx.message` without `ctx.update.message` cannot issue a command; mismatches still deny. Legacy fixture default remains unchanged and no runtime service was rewired.
- Focused admission tests 9/9 passed. This consistency check alone does NOT authenticate Telegram; actual provenance requires ownership of the Telegraf update processing path, durable replay and protected operator policy.
- Full regression launched at `/tmp/rs-v3-gateb-strict-admission.log`; result pending. Gate B OPEN.

- Full npm test PASSED: 124 files / 493 assertions / 0 failures, exit 0.

## 2026-10-09 — Gate B minimal full vertical-slice fixture
- Extended the already existing Telegram joined adapter to optionally pass strict original-message and durable replay dependencies into the existing transport admission; default untouched.
- Added one complete isolated integration scenario: strict raw Telegram event -> bound actor -> immutable intent -> reviewed test room/light config -> default-deny explicit confirm grant -> independent test registry and approval callbacks -> one mock service result -> verified mock HA state -> replay denied. Mismatched actor and missing raw update deny; simulated writes exactly one only after matching confirmation. Focused 4/4 passed.
- This is an OFFLINE acceptance fixture: test approval callback is not a real operator signature; mock state/source does not prove live HA identity. Real control or production deployment not authorized. Full regression pending in `/tmp/rs-v3-gateb-vertical-full.log`.
- Remaining blockers: trusted operator-controlled live ingress, authenticated TLS HA registry with protected separate credential, actual reviewed V3 policy and light/switch mapping, live read-only acceptance with owner approval, stage rollback evidence. Gate B remains OPEN.

- Full npm test PASS: 124 files / 494 assertions / zero failed, exit 0.

## 2026-10-09 — strict Telegram ingress durable replay restart acceptance
- Tested the existing joined Telegram chain with strict raw-message requirement and durable replay backed by a temporary isolated directory. A previously admitted message with a different Telegram update ID is rejected after the adapter/chain is recreated. Focused joined adapter tests 5/5 passed.
- Full `npm test` running at `/tmp/rs-v3-gateb-durable-replay-full.log`; record exact result before committing.
- The durable store fixture is not installed in the running Telegraf service and does not authenticate user-provided contexts. Gate B remains OPEN pending operator-reviewed read-only HA source, approval policy, trusted ingress binding and live acceptance authorization. No HA calls/real messages/writes or service changes.

- Full npm test PASS: 124 isolated files, 495 assertions, 0 failed, exit 0.

## 2026-10-10 — One-shot official upstream Connection read boundary
- Added `inspectOneShotRegistryConnection` to the existing upstream read bridge. Trusted caller supplies an authenticated official `Connection` factory; this offline abstraction bounds acquisition, reads six registry lists with the existing strict reader and attempts connection close on success/failure and late acquisition. Focused upstream tests 12/12 passed.
- Official HA client may automatically reconnect. One-shot short-lived read avoids deliberate socket reuse, but timeout/close guarantees and TLS peer provenance have not been proven for actual upstream `Connection`; injected mocks do not grant source authenticity or operator authorization.
- Full isolated regression pending in `/tmp/rs-v3-gateb-one-shot-full.log`; no live HA transport or production service touched. Gate B OPEN.

- Full npm test PASS: 124 files / 497 assertions / 0 failures, exit 0.

## 2026-10-10 — Real official HA websocket client loopback acceptance
- Actual `home-assistant-js-websocket` 9.7.1 with `ws` 8.22.0 and HTTPS localhost fixture successfully exercised the one-shot upstream registry bridge: one connection, exactly six registry reads, read-only evidence and no authorization. Unknown-CA case failed before WebSocket upgrade with zero registry reads. Both cases exit 0. See docs/GATE-B-WSS-ACCEPTANCE.md.
- These are direct isolated WSS runtime tests; no code/dependency/service change, live HA, real secrets or writes. Gate B OPEN pending operator-owned origin/token and policy.

## 2026-10-10 — transport fault test and Gate C isolated start
- Real `home-assistant-js-websocket` with localhost TLS test server: force-terminated WSS connection during second registry read; result `registry_transport_failure`, authorization false, 2 requests only, exit 0. No HA Green connection. See GATE-B-WSS-ACCEPTANCE.
- Gate B isolated transport scenarios now cover success, untrusted certificate and read-time disconnect; **formal Gate B OPEN** for operator identity, actual origin and reviewed grants. Do not waive live acceptance.
- Began Gate C in isolated faults suite: a pending authorization which returns true only after its deadline cannot trigger a write. Focused Gate C tests 7/7 pass. Full suite pending `/tmp/rs-v3-gatec-timeout-full.log`.

- Full npm test PASS: 124 isolated files, 498 assertions, 0 failed, exit 0.

## 2026-10-10 — Strategy, structure and branch audit
- Examined fetched Git refs, modular structure, README, AGENTS, strategy, PROGRESS, TODO, previous review and gate records; findings in `docs/REVIEW-2026-10-10.md`.
- Corrected visible current-status pointers and clarified branch purposes without rewriting chronological history or altering gates. No branch merge/deletion, live HA access or service changes. Full regression not rerun for docs-only edits.

## 2026-10-10 — Pi directory/repository structural audit and development planning
- Confirmed both `/home/drpoh/ha-telegram-bot` and `/home/drpoh/rs-home-ai-v3` are separate worktrees of the same GitHub remote but serve different systemd units. V3 older checkout must not be auto-updated. Vinted is independent and has local changes.
- Added no-write layout inventory script and `docs/PI-REPOSITORY-LAYOUT-PLAN.md` with target dev/stage/prod convention, explicit migration prerequisites and rollback rules. No moving, deleting, service changes, secrets or HA calls.
