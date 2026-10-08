# WORKLOG — Development checkpoint journal

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
