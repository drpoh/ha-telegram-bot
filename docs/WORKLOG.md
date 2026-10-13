# WORKLOG — Development checkpoint journal

## 2026-10-13 — selective reuse of Matt Pocock / ECC engineering practices

Owner agreed to **adopt ideas, not install frameworks**. Reviewed upstream public repositories Matt Pocock / skills (MIT, main `49dd158d1076134a641b33efb035946536778336`) and affaan-m / ECC (MIT, main `b92f181b3b748d1abbc2afd94af6aa7d8c8fca29`). Wrote [ENGINEERING-PRACTICES](development/ENGINEERING-PRACTICES.md) adapting fast reproducible failure tests, red-green-refactor, two-axis PR review and local-evidence MCP/security/release auditing. Kept AGENTS and existing Gate B–E authoritative, reused Node 20 `node:test`, existing npm test/CI and systemd/HA-MCP. No external source code was copied; no CLI, plugin, hooks, services, npm modules, secrets, new tokens or runtime paths were changed.

**First application:** scoped DEV-to-V3 Telegram kitchen read-only review (see [GATE-D](gates/GATE-D.md)). Source `v3-readonly-question-router.mjs` plus kitchen status is read-only and describes exactly four selected HA entities with unknowns treated separately. But the larger DEV `telegram-readonly.mjs` also adds `/newlight`, `/lightcheck` and changes `/confirm`/`/cancel` and in-memory pending consent; `createNewLightDispatch` is currently disabled for new writes, which does not prove complete old-policy compatibility. **NO-GO** to promote the entire DEV SHA as a kitchen feature. Prepare minimal read-only-only patch and negative tests, with separate owner approval for production switching. Documentation-only work; pinned V3 `9dd5964`, V2 and HA Green left untouched.

## 2026-10-13 — real pinned V3 Telegram natural-language acceptance (owner evidence)

Operator used **already running** private `RSHomeAI_v3_bot` on pinned `9dd5964`, without starting another Telegram process or triggering physical HA writes. Live Telegram replies: `/status` reported protected journal available; `/confirm` **without pending request** returned «Нет действующего запроса для подтверждения»; `/sauna` returned 88.625 °C, ready, 85 °C threshold. Three separately sent natural questions all responded: «Сколько градусов в сауне?» → 89 °C / ready; «Где горит свет?» → **0 ON / 4 OFF / 0 UNKNOWN among exactly 4 selected HA entities**, not whole home; «Горит ли свет в тамбуре?» → off.

Confirms only scoped Telegram ingress/owner replies and HA-MCP read-only status of pinned active V3, not broad intent coverage or DEV read-only kitchen Telegram, not global token poller uniqueness or functional rollback. Pi prior evidence: 437/437 tracked V3 Git blobs + exec bits PASS, local V2/V3 process check PASS, `npm ls --offline` static PASS for active and two historical release dirs, historical `97343fa` selected Git blobs 3/3 PASS. Compare `9dd5964...fabfaa7`: 116 DEV commits/121 changed files; full DEV promotion is not a scoped release. Next: review read-only kitchen delta and prepare explicitly approved single-poller release/rollback, no automatic production change.

## 2026-10-13 — documentation phase 1 (DEV source only)

Created `docs/README.md` index and compact `docs/development/HANDOFF.md`; rewrote `docs/CURRENT-STATE.md` as the only operational status; reduced `docs/TODO.md` to open tasks. The old full TODO is preserved in `docs/archive/TODO-snapshot-before-phase1-2026-10-13.md` and historical `docs/CHAT-HANDOFF.md` remains in place until phase 2. Updated AGENTS and navigation. This is GitHub-only: no Pi runtime, HA or production changes.



## 2026-10-13 — owner-verified Pi source, HA reads and documentation review

Owner reports clean DEV ff-only from `163fc89` to `6f6e694` on `feature/v3-home-agent`, Node `22.23.3`, isolated suite **198 files, 726 assertions, zero failed**, no Git changes. Live manual read-only sauna 28 °C and four scoped lights (one ON, three OFF) passed. Subsequent operator-only 19 light candidate inspection: 2 ON, 7 OFF, 10 unavailable (`partial` expected), no HA writes and no new physical fixture identity approval. Outbound HTTPS reporter in private GitHub Issue #1 returned `REPORT=sent`; public `main` PR #102 fixed a strict parser that rejected V2/V3 numbered diagnostic keys. The connector to private reports still returns 404; do not claim the assistant independently read the posted payload.

Reviewed inventory of **71 Markdown files**; updated operative entrypoints rather than rewriting dated historical evidence. Full disposition and unresolved runtime release SHA contradiction: [documentation audit](DOCUMENTATION-AUDIT-2026-10-13.md). Documentation-only commit; **no Pi DEV sync yet for this documentation change**, no deployment, no production/HA alterations.



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

## 2026-10-10 — First development/runtime filesystem separation
- Created independent clean Git clone `/home/drpoh/projects/rs-home-ai-dev` from `feature/v3-home-agent` at `32b5299`, without changing v2 or V3 pilot runtime checkout. `npm ci --ignore-scripts --no-audit --no-fund` completed successfully (149 packages; exit 0). No secrets copied.
- This is a safe development workspace, not deployed dev/stage/prod units. New canonical development directory documented in README, TODO, layout plan and handoff. Full offline npm test launched at `/tmp/rs-dev-clone-regression-20261010.log`; result to be recorded after completion.

- New isolated dev checkout full npm test PASSED: 124 files / 498 assertions / 0 failed, exit 0; `/tmp/rs-dev-clone-regression-20261010.log`. Both old service checkout paths unchanged.

## 2026-10-10 — Workspace rules and offline stage fixture
- Canonical development checkout is `/home/drpoh/projects/rs-home-ai-dev`; runtime v2 and V3 pilot checkouts remain read-only and unchanged.
- Added `AGENTS.md` rules and `config/environments/isolation.example.json` with isolated mock stage, no real credentials or HA writes. Targeted test 6/6; full regression 125 files / 499 assertions / 0 failures, exit 0.
- Stage is a planning fixture only, not an installed service.

## 2026-10-10 — Gate C / staged HA loopback mock prototype
- Added a minimal ephemeral stage HA-shaped loopback server (`src/ops/stage-mock-ha.mjs`) with two GET-only synthetic fixture endpoints, HTTP 403 for everything else, and no HA/Telegram imports, credentials or real calls. Test covers loopback-only bind, synthetic reads, write denial and clean closure; focused 1/1 passes.
- Full test started at `/tmp/rs-v3-stage-loopback-full-20261010.log`; result pending. Stage remains NOT deployed; Gate B live acceptance OPEN. Production v2/V3 units unchanged.

- Full isolated npm test PASSED: 126 test files / 500 assertions / zero failures, exit 0.

## 2026-10-10 — Gate C local stage I/O registry integration
- `test/stage-gate-c-registry-bridge.test.mjs` joins a real ephemeral localhost HTTP fixture server to the existing injected read-only registry adapter. Six bounded fetch reads produce `read_only_review`, never authorization. Service POST returns HTTP 403.
- Malformed fixture response and rejected/unreachable request both fail closed. Focused 2/2 passed. This is an HTTP fixture bridge, **not** actual Home Assistant WSS or approved policy/live acceptance. No HA access, Telegram, service restart or real writes.
- Full regression pending `/tmp/rs-stage-gatec-http-integration-20261010.log`.

- Full npm regression PASSED: 127 test files, 502 passed assertions, zero failures; exit 0.

## 2026-10-10 — Gate C stage transport faults
- Extended offline `createStageMockHa` with bounded opt-in `registryFault=delay/drop`, only on the second registry request, no HA client or real credentials. All other requests remain deny-by-default.
- Integration tests prove second-read delay beyond adapter deadline and forcibly dropped response cause `registry_transport_failure`, `authorization:false`, with exactly two attempted reads and no retry even after delayed response. Focused Stage tests 5/5 passed. Full suite pending `/tmp/rs-v3-stage-faults-20261010.log`.
- Stage remains ephemeral loopback fixture, NOT a permanent installed systemd service. Gate B live source/approved policy still OPEN. Runtime checkouts unchanged.

- Full npm test PASS: 127 test files / 504 assertions / zero failures, exit 0.

## 2026-10-10 — Low-interruption workflow policy
- User explicitly requested far fewer repeated chat progress messages. Persisted quiet autonomous execution in `AGENTS.md` and cross-chat handoff; keep real test results and Git events in repository logs instead of narrating each tool operation. This is a documentation-only change; no service/config/device changes or new tests required.

## 2026-10-10 — Gate C confirmation concurrency (dev only)
- Prior stage-fault regression log: 127 files / 504 assertions / zero failures. Already pushed as `361cc9c`, followed by docs-only `b51941b`; GitHub feature head matched local. Original shell exit code was not independently preserved in the log; runner summary is observed.
- Added four tests covering in-flight action replacement, actor/chat isolation, uncertain executor outcome without retry, and pre-dispatch cancel. Focused tests 11/11 passed, exit 0, with temporary SQLite and fake environment. Direct `node --test` without fake TELEGRAM_BOT_TOKEN initially failed at import; resolved by correct isolated harness invocation.
- These are offline tests, not live authentication, real MCP idempotency or Gate B/C production acceptance. Full test evidence to follow.

- Full isolated `npm test` PASS: 127 test files / 508 assertions / 0 failed, process exit 0, log `/tmp/rs-v3-gatec-races-full-20261010.log`. No runtime systems were touched.

## 2026-10-10 — Gate C optional state freshness contract
- Extended pure `verifyConfirmedLightResult` with optional `minObservedAtMs`. When explicitly supplied, a valid `last_updated` at/after the boundary is required; malformed/missing/old timestamps fail closed. Five new isolated unit tests pass. Historical callers retain their existing semantics for compatibility and are NOT upgraded to fresh-state assurance.
- Timestamp is untrusted unless the invoking adapter authenticates its source and supplies its own boundary; a post-action timestamp cannot independently prove causality. No live MCP/HA or service changes. Full suite evidence follows.

- Full isolated regression PASS: 128 test files / 513 assertions / 0 failures, process exit 0; `/tmp/rs-v3-gatec-freshness-20261010.log`. No runtime change.

## 2026-10-10 — Gate C durable SQLite no-retry fixture
- Reused built-in sqlite3 CLI and current `src/db/database.mjs` helper: new isolated `v3-gate-c-execution-journal.mjs` reserves an action ID with primary-key `INSERT OR IGNORE` before simulated invocation. Uncertain outcome is retained and cannot be retried automatically after re-instantiation. Six focused tests pass; an additional pair of independent processes confirmed persistence across process boundary (sequential, not a simultaneous concurrency proof).
- The module is **NOT wired into live bot or pilot**. This is deliberate: user-provided IDs or fixture policy booleans cannot authenticate admission. SQLite at-most-once claim protects only a designated durable database, cannot prove exactly-once physical actuation and does not guarantee successful operations. SQLite reference: https://www.sqlite.org/lang_conflict.html.
- Remaining production Gate C: authenticated and authorized end-to-end action provenance, bounded actual MCP I/O and cancellation semantics, durable real replay defense with safe restart, source-fresh state verification, monitored rollback and owner-approved controlled acceptance. Gate B remains open. Full regression result follows.

- Full isolated `npm test` PASS: 129 test files / 519 assertions / 0 failed / exit 0, `/tmp/rs-v3-gatec-durable-full-20261010.log`.

## 2026-10-10 — Gate C composed durable mock execution
- Added `test/gate-c-durable-joined-chain.test.mjs`, combining the SQLite dispatch claim and strict fresh readback into a single simulated chain. 7 simultaneous requests for one frozen action yield exactly one mock invocation; stale HA-shaped readbacks and dropped-after-send mocked executor results cannot cause another invocation. Policy failure also denies. Focused 3/3 pass.
- Simulation boundaries: `admit` and `verify` are injectable fixture callbacks, not independently authenticated, and write is never real MCP or HA. This is additional integrated negative evidence, not full Gate C operator acceptance. Full regression follows.

- Full `npm test` PASS: 130 files / 522 assertions / 0 failures / exit 0; `/tmp/rs-v3-gatec-joined-full-20261010.log`.

## 2026-10-10 — Gate C real SDK in-memory protocol fixture
- Used already-installed upstream `@modelcontextprotocol/sdk` Client and McpServer over linked `InMemoryTransport`, without installing a new dependency or calling HA. A successful SDK tool call is durably claimed once; SDK protocol timeout after dispatch yields unknown/unverified and subsequent duplicate is denied. Focused 2/2 pass (exit 0).
- This is actual SDK protocol processing but NOT a real network socket or authenticated MCP endpoint. Cancellation at the SDK client does not prove server-side side effects were cancelled. Gate C production acceptance remains OPEN pending source/policy Gate B, approved stage and network lifecycle tests. Full regression follows.

- Full npm regression PASS: 131 test files / 524 assertions / zero failures / exit code 0; log `/tmp/rs-v3-gatec-sdk-full-20261010.log`.

## 2026-10-10 — Gate C loopback SDK and isolated Stage rollback audit
- Implemented actual TCP loopback Streamable HTTP integration using existing upstream `@modelcontextprotocol/sdk` server/client and its Express helper. AbortSignal and deadline both terminate client wait after server receives one synthetic call. No retry is issued, but server-side effects may survive abort: client cancellation is NOT a transactional undo. Focused 2/2 passing, no HA access.
- Added SQLite online `.backup`/restore test using built-in sqlite3 rather than copying WAL database files. A restored pre-command snapshot preserves earlier claims but necessarily lacks claims created after backup. **Critical**: restoring only the journal creates a replay window; require quarantine and separate monotonic durable claim ledger/reconciliation before deploying Stage or any rollback. Test does not modify an installed Stage (none exists).
- Gate B review: production-authorized HA TLS identity, reviewed policy and actor binding are not present. No live credentials or devices were accessed. Real controlled HA write acceptance cannot be claimed; owner must specify an isolated approved device/action and rollback prerequisites. Full npm regression result to follow.

- Full isolated regression PASS: 133 test files / 527 assertions / 0 failed / shell exit 0; `/tmp/rs-v3-gatec-http-stage-20261010.log`. Network fixture uses 127.0.0.1 only. Stage restore replay hazard remains a BLOCKER, not an accepted rollback.

## 2026-10-10 — Gate C rollback replay mitigation (offline)
- Added `src/ops/gate-c-stage-recovery.mjs` and three focused tests (3/3): SQLite backup/restore of disposable Stage-state database leaves a separately located execution claim database intact; both earlier and post-snapshot action IDs remain denied after recovery. Missing, schema-free and in-rollback-tree ledgers fail closed without silently recreating a database.
- This narrows the discovered replay window for correctly separated Stage storage, not an approved operational rollback: filesystem ownership, concurrent mutation, root trust, exact deployment identities, real MCP and HA credentials require additional evidence. Runtime paths and HA Green untouched. Full regression result follows.

- Full regression PASS: 134 test files / 530 assertions / 0 failures / exit 0; `/tmp/rs-v3-gatec-recovery-full-20261010.log`.

## 2026-10-10 — MVP scope reduction accepted
- Owner agreed to prioritize working one-light Telegram V3 MVP over full feature completion. Added release contract `docs/V3-MVP-RELEASE.md` and explicit offline-only review checklist with nine required evidentiary fields, no runtime release side effect. Focused 3/3 pass.
- Feature work on voice, generic multiroom, autonomous learning, multi-LLM, persistent Stage and auto rollback deferred. Existing policy, MCP SDK, pilot capability boundary and durable journal are to be reused rather than replaced. No HA credentials or runtime changed. Full isolated regression follows.

- First full 135-file isolated regression found one pre-existing loaded-Pi HTTP MCP deadline test failure (`unhandledRejection` because assertion handler was attached after awaiting server entry), 532 passed assertions / one failed file. Updated the test to attach `assert.rejects` synchronously and bounded deadline to 200 ms; focused combined transport+MVP suite passed 5/5. Full regression rerun follows; no production code or environment was affected.

- Verified final full isolated `npm test` PASS: 135 test files / 533 assertions / 0 failed / exit 0, `/tmp/rs-v3-mvp-scope-rerun-20261010.log`.

## 2026-10-10 — Narrow MVP integrated mock
- Extended the **isolated-only** ledger-bound mock dispatcher with optional durable execution journal claim from the original server-side confirmation UUID. Claim happens after consume and before the simulated write; unknown write failure retains used ID. Existing calls without journal keep prior semantics. New focused one-light actor/policy/consent/SQLite/readback/replay integration test passed 1/1. No runtime client or HA touched. Full regression follows.

- Full isolated `npm test`: 136 files / 534 assertions / 0 failures, process exit 0; `/tmp/rs-v3-mvp-joined-full-20261010.log`.

## 2026-10-10 — Reused Telegram admission → consent fixture
- Added two focused offline integration tests joining existing `v3-telegram-joined-adapter` (`requireRawMessage:true`) to `v3-intent-ledger`; original request is bound to user/chat and consumed only once, spoofed raw/convenience fields, unrelated actor, group chats and duplicate updates denied. No new runtime adapter was created; test context is intentionally synthetic and not proof of actual Telegram authenticity. Focused 2/2 PASS. Full regression follows.

- Full first 137-file isolated run: 535 assertions passed but one pre-existing Stage delayed-read test assumed exactly two requests; heavily loaded Pi can timeout before the second request. This was a test expectation problem, not a permissive decision. Adjusted to assert 1–2 bounded requests with registry_transport_failure and authorization=false. Focused Stage+Telegram 6/6 PASS. Full rerun follows.

- Final isolated npm regression PASS: 137 files / 536 assertions / 0 failed / exit 0; `/tmp/rs-v3-mvp-telegram-rerun-20261010.log`. No runtime paths or HA touched.

## 2026-10-10 — Existing pilot path audit, safer MVP integration
- Found actual V3 dedicated Telegraf bot already implemented in `src/pilot/telegram-readonly.mjs`, with `/confirm` and `/cancel`, single kitchen-light intent parsing and `createKitchenLiveAdmission`. The original live pilot is an **independent runtime checkout**; no edits or restarts there.
- Rather than introducing another Telegram handler, extended isolated `createKitchenDryrunConsent` with optional durable action journal using the existing SQLite implementation. Journal UUID claim occurs after consumption but before injected dispatch; an unavailable journal blocks execution, and unknown outcome is retained as unverified. All six focused pilot and fault tests passed.
- Important: current running pilot has not been changed to use this option. It still requires evidence-based operator acceptance and protected storage before promotion. Full isolated regression follows.

- Full isolated npm test PASS: 138 files / 538 assertions / zero failures / exit 0, `/tmp/rs-v3-mvp-pilot-durable-20261010.log`.

## 2026-10-10 — Protected pilot journal storage readiness
- Implemented read-only `src/ops/v3-pilot-storage-preflight.mjs` and three focused tests: do not create a missing SQLite ledger; deny in-rollback-tree storage, symlink alias, world-readable database and wrong ownership; accept prepared 0600 owner-held SQLite journal outside rollback. This does not enable execution, mutate the running pilot or inspect live secrets. Further trusted deployment permission/TOCTOU review is still required.

- Full isolated test PASS: 139 files / 541 assertions / zero failures / exit 0; `/tmp/rs-v3-mvp-storage-20261010.log`.

## 2026-10-10 — V3 MVP dev pilot journal wiring
- Edited canonical dev `src/pilot/telegram-readonly.mjs` only. The existing pilot now uses `inspectV3PilotStorage` against a separately provisioned, rollback-independent expected path before constructing `executionJournal` for `createKitchenDryrunConsent`. If absent/unsafe, it injects a deny-only claim function and no MCP dispatch is possible through confirmation. User-facing `/status` and `/confirm` explain the blocked condition. No DB, credentials or live services created/touched; this change remains unpromoted.
- Focused syntax and 5/5 journal/storage tests passed. Full regression follows. Operator-owned HA provenance and one-light acceptance still OPEN.

- Full isolated `npm test` PASS: 139 test files / 541 assertions / 0 failed / shell exit 0, log `/tmp/rs-v3-mvp-pilot-wired-20261010.log`.

## 2026-10-10 — Finalization: MVP journal integration milestone
- Replaced direct SQLite journal constructor in dev V3 Telegraf pilot with `prepareV3PilotExecutionJournal`. Missing/invalid/unavailable journal yields a deny-only claim adapter without changing HA. Confirmed in focused tests: missing storage does not get created, prepared protected SQLite allows one durable claim, subsequent replay blocked. 4/4 focused PASS.
- **Development journal-wiring milestone closed. Overall V3 MVP release NOT accepted**: independent operator-owned HA source, policy, one approved device, protected on-host storage provisioning and controlled one-device acceptance not yet verified. No live pilot checkout, service or HA write changed. Full suite result follows.

- Final isolated `npm test` PASS: 140 test files / 543 assertions / zero failures / exit code 0; `/tmp/rs-v3-mvp-milestone-final-20261010.log`.

## 2026-10-10 — Operational acceptance preparation (read-only)
- Verified dev `96745bb`, live V3 `a7fc446`, live v2 `32b5299`. V3 user service active/running PID 971; v2 system service active. Existing kitchen operator policy 0600 owned by drpoh and SHA256 matches pinned dev expected hash; hash consistency is not approval or HA identity evidence. Protected external SQLite claims DB at expected target path **missing**. Did not inspect live secret content, execute Home Assistant actions, restart units, create DB, or edit live checkouts.
- Added sanitized operator acceptance checklist `docs/V3-MVP-OPERATIONAL-ACCEPTANCE.md`, clear NO-GO and no silent promotion. Documentation-only milestone; no functional test requirements changed.

## 2026-10-10 — Safe operational journal provisioning implementation
- Rechecked Pi: dev HEAD c7f401c, V3/v2 services still active, protected state directory exists (0700), target `claims.db` absent. Added callable offline-only `src/ops/v3-pilot-journal-provision.mjs` with existing-ledger no-reset policy, exclusive 0600 SQLite file creation and immediate validation. Focused 2/2. Did NOT invoke against live target, access HA, change credentials, or restart services. Full regression follows.

- Full isolated regression PASS: 141 test files / 545 assertions / 0 failures / exit 0. Log: `/tmp/rs-v3-operator-storage-20261010.log`.

## 2026-10-10 — Real runtime MCP source audit (metadata only)
- Inspected only scheme/host class of dedicated V3 pilot URL (actual URL and credentials redacted): HTTP over NON-loopback. This fails secure transport assurance regardless of familiar hostname. Added dev `kitchen-mcp-endpoint-policy` denying non-loopback HTTP and common URL tricks; wired into dev MCP client. Focused 2/2 passed. Live V3 service still active and unchanged; no HA tool invoked or secrets printed. Full regression follows.

- Full isolated npm regression PASS: 142 files / 547 assertions / 0 failures / exit 0; log `/tmp/rs-v3-mcp-trust-audit-20261010.log`.

## 2026-10-10 — SSH local-forward readiness check
- Observed Pi via metadata-only commands: no TCP listener 9584, no dedicated V3 tunnel unit, SSH host key strict checking configured as `ask`, active V3 unit. A loopback URL **cannot** yet be trusted as HA source; current live URL remains non-loopback HTTP. Added `docs/V3-MVP-MCP-TRUST-RUNBOOK.md` for an operator-controlled host-key-pinned, least-privilege SSH forward and separate HA identity test. No network connection established and no runtime configuration changed.

## 2026-10-10 — Real read-only HA trust evidence, ephemeral tunnel
- Strict SSH key checking with existing Pi known_hosts successfully authenticated the host. Used only authenticated, read-only registry JSON inspection on HA to verify unique light.led_kukhnia, mqtt platform, enabled status, matching device/unique ID and kitchen area. HA has a listening MCP 9584 port on 0.0.0.0. Ephemeral SSH local forward on Pi 127.0.0.1:19584 passed a TCP probe, then was stopped and confirmed absent. **No MQTT/MCP tool called, device switched, HA configuration changed, claim DB created, or active systemd service touched.** Owner independent key attestation and tool-level acceptance remain missing. Details in MCP trust runbook.

## 2026-10-10 — Candidate persistent V3 MCP SSH forward
- Generated a non-installed example user-systemd unit for loopback-only port 19584 -> HA-MCP 9584 with strict SSH host verification and fail-closed startup. Verified unit syntax with systemd-analyze (exit 0); no service installed/enabled/restarted. Existing SSH BatchMode authentication still succeeds; live V3 user service remains active. The trust/security gate remains OPEN, and an owner-signed HA host identity and permission review are required.

## 2026-10-10 — Live transport blocker definitively identified
- Strict-key temporary SSH forward used TCP port 19584 but real forwarded curl reset. Collected SSH diagnostic `administratively prohibited` and read-only remote `sshd -T`: `allowtcpforwarding no`. Direct read-only HA loopback `/mcp` returned 404; existing MCP URL path is different (actual path kept secret). No HA config modifications, MCP tool calls, persistent processes or live service changes. Corrected trust runbook: TCP listener alone is insufficient; candidate systemd template must remain disabled and NOT installed.

## 2026-10-10 — Approved HA SSH forwarding and real MCP read verification
- Explicit user approval received for restricted forwarding. Applied HA SSH config with backup `/etc/ssh/sshd_config.rs-v3-backup-20261010`; global AllowTcpForwarding no remains, scoped Match User hassio permits local forward only to 127.0.0.1:9584. sshd -t PASS, reloaded, strict SSH reconnect PASS. No other HA config touched. Ephemeral Pi loopback forwarded actual configured MCP path. Official SDK listTools PASS (53 tools, including a write capability); exact scoped `ha_get_state(light.led_kukhnia)` response contains structured data and no isError. No light write and no persistent tunnel or pilot change. Caveat: hassio Match rule covers all hassio SSH logins and key fingerprint not independently attested. See trust runbook.

## 2026-10-10 — Verify previous authorization and harden SDK transport
- Re-inspected HA sshd effective configuration: global AllowTcpForwarding no, Match User hassio local forwarding PermitOpen 127.0.0.1:9584. Previous checkpoint 8567494 proves upstream SDK listTools and single-light ha_get_state through temporary forwarding. Current user-service is not attached to new tunnel.
- Updated dev `src/pilot/kitchen-mcp-client.mjs` to disable redirects at the SDK fetch layer, not just check the initial configured URL. Focused check and 6/6 focused tests pass; full regression follows. No HA state change, ongoing service restart, persistent tunnel activation, or claim-db creation.

- Full npm test PASS: 142 test files / 547 assertions / zero failures / exit 0 (`/tmp/rs-v3-sdk-no-redirect-20261010.log`).

## 2026-10-10 — Release-blocker validation, no runtime changes
- Reconfirmed current development HEAD e8665a6, live V3 user service active, HA SSH Match User forwarding limited to HA loopback 9584, runtime MCP URL rejected by dev strict endpoint validator, 19584 listener absent, claims.db missing and policy hash unchanged. No live filesystem/config/HA operation. Refined operational trust runbook with atomic activation order and rollback semantics. This is a documentation-only preflight: no functional regression necessary.

## 2026-10-10 — Change of MVP transport strategy (owner decision)
- Owner selected existing LAN HA-MCP, no tunnel. Confirmed Raspberry Pi 192.168.31.124 via eth0 to HA 192.168.31.94, HA listening on 0.0.0.0:9584, MCP URL mode 0600. Did not change the client to accept unprotected HTTP; wrote LAN-specific security and release requirements in docs/V3-MVP-LAN-MCP-DECISION.md. Still need LAN source restrictions and controlled write scope. No HA, V2 or V3 runtime changed.

## 2026-10-10 — LAN transport evidence and candidate client gate
- Owner-selected direct LAN HA-MCP path remains dev-only. HA TCP 9584 is exposed on 0.0.0.0; no usable host firewall utility or source-specific rule verified from restricted SSH shell. Added strict dev-only LAN endpoint eligibility helper with independent network/credential evidence switches (not runtime authorization), refusing wrong host/port/protocol/URL credentials. Two focused tests pass. Live HA-MCP network exposure, Telegram v2, V3 pilot, and runtime secrets unchanged. Full regression follows.

- Full suite PASS: 143 files / 549 assertions / 0 failures, exit 0 (`/tmp/rs-v3-lan-policy-20261010.log`).

## 2026-10-10 — HA-MCP access-control surface inspection
- Read-only HA CLI, Docker process name and published-port metadata reviewed. Listener 9584 still 0.0.0.0, but no obvious MCP Docker container could be attributed from those listings. Consequently no add-on-specific restriction can yet be safely applied; no speculative iptables, Supervisor configuration or HA production changes were made. Detailed next steps documented in docs/V3-MVP-LAN-MCP-DECISION.md.

## 2026-10-10 — Investigate TCP 9584 owner using HA namespace
- Read-only `/proc/net/tcp`, BusyBox fuser, lsof, netstat and Docker port/network inventory: listener 0.0.0.0:9584 inode 8244936; restricted SSH PID namespace does not expose owning host process, and Docker contains multiple host-network workloads with no obvious published 9584. No ownership assertion or risky firewall edit. Recorded next accepted discovery path in LAN MCP decision doc.

## 2026-10-10 — Corrected source-restriction strategy for same subnet
- Read-only Pi routing and router reachability reveal same /24 L2 path (192.168.31.124 to 192.168.31.94, gateway 192.168.31.1). Router HTTP(S) web admin reachable but model and bridge ACL feature unknown. Generic routed gateway firewall cannot assure restriction; changed release plan to require proven bridge ACL/VLAN or HA-side filter, including denied independent-client test. No router login, ACL, HA or live app changes.

## 2026-10-10 — HA-MCP actual owner and supported network option discovered
- Read-only /homeassistant/.storage/core.config_entries metadata confirms HA-MCP Server is `ha_mcp_tools` custom component, not a Docker add-on; its bind_host 0.0.0.0, port 9584, webhook enabled with ha_auth. This offers supported loopback bind and authenticated HA webhook alternative. Live 9584 bind not altered because it would break the existing V3 and other direct clients. No config writes, credentials exposed or HA reloads.

## 2026-10-10 — Provisioned permanent claim ledger
- User authorized completion of MVP blocks. Invoked dev operator-only protected SQLite provisioning once: `JOURNAL created`; `inspectV3PilotStorage` ready=true; file drpoh:0600 outside V3 rollback checkout. This closes operational journal block; no HA configuration/restarts/actuation. Reviewed live V3 checkout a7fc446 and v2 checkout 32b5299; staged dev HEAD 1528e86 differs. Transport/read privileges, deployment promotion and acceptance remain pending.

## 2026-10-10 — Existing MCP pilot deployment readiness inspection
- Compared active V3 SHA a7fc446 against dev 490b31d: 67 changed files, ~2988 added lines. Both v2 and V3 service status active, focused 4/4 endpoint tests and node syntax pass. Direct LAN implementation is opt-in and currently denies without independently reviewed network/credential controls. No hot deployment, credential change, HA write or service interruption. Updated operational release plan to require candidate audit instead of blind promotion.

## 2026-10-10 — Fast isolated release candidate assembled
- Created /home/drpoh/projects/rs-home-ai-v3-candidate from a clean `git archive` of dev HEAD 0deece0, with protected directory permissions 0700 and RELEASE-COMMIT pin file 0600. No dependencies installed or bot started; cannot conflict with live Telegram tokens or services. Checked pilot and MCP client syntax; targeted LAN policies pass 4/4. This is a static candidate only, NOT deployment or production acceptance.

## 2026-10-10 — Isolated candidate dependency and complete regression evidence
- Under /home/drpoh/projects/rs-home-ai-v3-candidate (pinned 0deece0), `npm ci --ignore-scripts --no-audit --no-fund` exit 0, 149 packages installed, no lifecycle scripts executed. `npm test` exit 0: **143 isolated test files, 549 passed assertions, 0 failed files**; output `/tmp/rs-v3-candidate-full-test.log`. No Telegram bot, MCP tool call or HA write was started from candidate. Live V2/V3 services remain active. Candidate is ready for release REVIEW, not yet approved for network/device actuation.

## 2026-10-10 — Journal failure handling hardened
- Fixed an unhandled SQLite claim exception in `createKitchenDryrunConsent.confirm`: throws now cause `replay_claim_unavailable` deny and consumed confirmation, without calling physical dispatch. New targeted regression PASS 1/1, commit a07d264. Historical static release candidate 0deece0 remains unchanged and must not be deployed as this new fix is absent there. Live V3 and V2 untouched.

## 2026-10-10 — Candidate-v2 final validation in progress
- Started full regression on isolated candidate pinned 72616d07f1a2850bc977a16d301034aafe5671c2. Rechecked protected external claims.db via inspector: ready=true, storage_preflight_passed; both V2 and V3 services active. Pending final test output; no HA actuation or production deployment.

## 2026-10-10 — Candidate-v2 complete regression SUCCESS
- On isolated candidate-v2 at immutable commit 72616d07f1a2850bc977a16d301034aafe5671c2, `npm test` finished EXIT=0: **144 isolated test files, 550 assertions, zero failures**. Log `/tmp/rs-v3-candidate-v2-full.log`. Protected SQLite journal preflight passed and both live V2/V3 services remain active. This is software validation, not authorization for actual MCP write or proof that the active V3 was upgraded.

## 2026-10-10 — Explicit operator live rollout request, fail-closed preflight
- Current URL inspection via dev validators: secure policy rejects current non-loopback HTTP, opt-in LAN policy returns `lan_acceptance_missing`. Existing HA-MCP ha_auth server listens 0.0.0.0:9584 and exposes broad write tools. Release candidate 72616d0 passes tests but would deny live dispatch if promoted, so did not restart V3 or fake approval flags. Telegram private `/confirm` must be generated by owner. Live V2/V3 active; no physical actuation. See operational acceptance document.

## 2026-10-10 — V3 release 7d9bab5 deployed and HA-MCP read verified
- Owner approved direct LAN HTTP MVP with explicit transport risk. Built isolated `/home/drpoh/projects/rs-home-ai-v3-release-7d9bab5` (0700), installed dependencies and checked 5 focused tests. Preserved original user service unit at `/home/drpoh/.config/systemd/user/rs-home-ai-v3.service.before-7d9bab5` and unmodified previous checkout `/home/drpoh/rs-home-ai-v3` for rollback.
- Updated ONLY the dedicated user service `rs-home-ai-v3.service` WorkingDirectory/ExecStart and restarted once. Verified active, MainPID=18430, NRestarts=0; system v2 `ha-telegram-bot.service` remained active. External claims.db passed storage preflight afterward; do not reset it.
- Used the newly deployed release client for **read-only** `ha_get_state(light.led_kukhnia)` via existing LAN HA-MCP: `LIVE_RELEASE_READ OK true`. Broad MCP write tools still exist; only V3 client/tool-policy bounds the requested entity/actions. Actual Telegram request + /confirm + device state transition has NOT been tested yet. Release is deployed as a pilot, not operationally accepted.
- Rollback: copy the preserved unit file over current user unit, `systemctl --user daemon-reload`, `systemctl --user restart rs-home-ai-v3.service`. Never delete or reset the external claims.db. Do not start a second poller with the same Telegram token.

## 2026-10-10 — Real Telegram acceptance fault diagnosed: target unavailable
- Owner sent actual kitchen light request and /confirm to deployed V3; response `preflight_state_unverified`. Read-only deployed MCP SDK `ha_get_state(light.led_kukhnia)` repeated twice: exact entity matches, `structuredContent.data.state=unavailable`, `isError=false`; payload shape is correct. HA registry confirms enabled MQTT entity with unique_id `0x2c1165fffeb1e848_light_zigbee2mqtt`, device_id `6b9dafcf36218948bb2a4b9b60b82837`. Same device has select effect, power-on behavior, identify, linkquality and update entities. Cause is HA target unavailability, NOT a JSON parser bug. Boundary correctly denied physical action before calling ha_call_service; do not weaken on/off preflight or automatically target other lights. Recover light/Zigbee2MQTT connectivity/power, wait for HA state `on` or `off`, then owner may send a fresh request and /confirm. Previous token is consumed and must not be reused.

## 2026-10-10 — Fix live Telegram state_pending: bounded read-only Zigbee verification
- Owner's real /confirm returned `state_pending`; read-only HA-MCP state of `light.led_kukhnia` afterwards was `off`. HA service had been accepted by the verification layer but expected state was not observed on its single immediate read.
- Added up to 3 delayed read-only `ha_get_state` retries (750 ms apart) **only on state_pending**; never resend `ha_call_service`. New regression explicitly verifies one write and delayed readback; relevant five focused tests pass. Commit 920585d pushed.
- Isolated release `/home/drpoh/projects/rs-home-ai-v3-release-920585d` built and tested. Updated ONLY dedicated V3 systemd user unit; backup `/home/drpoh/.config/systemd/user/rs-home-ai-v3.service.before-920585d` points at prior known-running 7d9bab5 release. New V3 active PID 19169, NRestarts=0; v2 remains active. Journal and previous release retained; if next acceptance fails, investigate Zigbee/MQTT actual actuation, do not retry writes automatically.
- Physical on/off acceptance with this exact new release not yet performed. Owner must send fresh request and /confirm; previous confirmation is consumed.

## 2026-10-10 — Definitive failed delivery after second live confirmation
- Owner again received `state_pending` after live release 920585d. Real MCP `ha_get_state(light.led_kukhnia)` still `off` with last_updated 18:20:38 local. V3 active PID 19169, NRestarts 0.
- Read-only Zigbee2MQTT Docker logs identified exact physical failure at 18:38:23: `Publish 'set' 'state' to 'Led кухня' failed: ZCL command 0x2c1165fffeb1e848/1 genOnOff.on ... Delivery failed for '31135'`. This directly ties the Telegram actuation attempt to unreachable Zigbee target, not V3 readback timing or JSON parsing. Other Zigbee2MQTT devices reported normally nearby, suggesting per-device issue.
- Do not resend commands or loosen entity verification. Verify power to this luminaire, restore Zigbee connectivity; inspect its availability, last seen, link quality and mesh routes, and repair/re-pair only if necessary (preserve HA entity identity). Retest with fresh owner Telegram request /confirm after HA reads `on` or `off` and device connectivity restored. No remote device modifications performed during diagnosis.

## 2026-10-10 — IKEA driver offline independently corroborated
- Real HA-MCP `light.led_kukhnia` still `off`, last_updated and last_reported 18:20:38 local, no updates. Dedicated V3 service active and NRestarts=0. Zigbee2MQTT docker app healthy (up 3h), Mosquitto up 2 days. Target Zigbee2MQTT database row: 0x2c1165fffeb1e848, network address 31135, IKEA TRADFRI Driver 30W, mains-powered Router, interview successful, `lastSeen=1791543384064` = 2026-10-09 13:56:24 EEST. So pairing exists but target has not been heard from since yesterday, consistent with repeated ZCL Delivery failed. Do not modify V3 code or send further actuator commands; check physical 230V input/driver, power-cycle after safe isolation, mesh reachability; re-pair only if needed while preserving HA entity.

## 2026-10-11 — Owner-selected pilot target change to tambur
- Owner requested testing `light.tambur_svet_l1` rather than failed IKEA kitchen driver. HA registry validated active MQTT entity/device 4cbaab0f1663e40a638b7636f938a7e7, unique_id 0xa4c13898b491c3ca_light_l1_zigbee2mqtt, area koridor_1_etazh. Real read-only MCP state `on`.
- Changed pilot single-target boundaries, Telegram intent phrases to «Включи свет в тамбуре» / «Выключи свет в тамбуре», registry admission, policy pinned hash. Previous signed operator policy backed up; new file still authorizes exactly one light for on/off with confirm. Focused regression 28/28 passing; real read-only admission returned valid=true. No physical write issued; fresh Telegram /confirm still required.

## 2026-10-11 — First real V3 Telegram Zigbee actuation ACCEPTED
- Owner ran fresh V3 private Telegram `Выключи свет в тамбуре` + `/confirm`; bot returned `Home Assistant подтвердил состояние светильника после команды.`
- Independently read exact target through the deployed release 97343fa HA-MCP client: `light.tambur_svet_l1` state=`off`, last_updated=`2026-10-11T12:46:38.448755+03:00`, isError=false. V3 user service ActiveState=active NRestarts=0; V2 Telegram bot remains active. This closes first live off-path verification, including HA state readback. Next: owner fresh `Включи свет в тамбуре` + `/confirm` to complete opposite direction, with independent readback; do not claim full bidirectional acceptance until that succeeds.

## 2026-10-11 — V3 ONE-LIGHT MVP BIDIRECTIONAL LIVE ACCEPTANCE PASSED
- Owner sent fresh «Включи свет в тамбуре» and /confirm to private V3 Telegram bot, received `Home Assistant подтвердил состояние светильника после команды.`
- Independently checked deployed release 97343fa real MCP `ha_get_state(light.tambur_svet_l1)`: exact entity, state=`on`, last_updated=`2026-10-11T12:48:25.228409+03:00`, isError=false. Prior actual turn_off was independently confirmed as off at 12:46:38. Both physical state directions verified.
- V3 service ActiveState=active NRestarts=0; existing V2 Telegram service active. This closes the explicitly scoped one-light V3 pilot acceptance, not general multi-device coverage or Zigbee coordinator reliability. Retain strict allowlist, 60-second one-time Telegram confirmation, claim journal, and rollback. Next stage: design gradual dev/stage/prod expansion with regression gates, not automatic broader grants.

## 2026-10-11 — Stage 2 begins: isolate stage runtime and fault checks
- Owner authorized next development stage after real one-light MVP completed. Read AGENTS.md, HANDOFF, TODO, PI layout and existing environment policy. Left live release 97343fa, V2, all HA credentials and private claims untouched.
- Added stage-only loopback HTTP integration tests: forbidden service writes, endpoint isolation, fixture identity/unauthorized registry, dropped registry response, prod read denial. Focused tests (environment + new stage mock): 12/12 pass. Planning doc `docs/V3-NEXT-STAGE-DEV-STAGE-PROD.md` sets deployment and staged expansion gates. Stage environment not deployed; fixture server runs only temporarily under node:test.
- Full Pi regression completed, exit 0: 146 isolated test files, 553 assertions, zero failed files; evidence `/tmp/rs-v3-stage2-full-20261011.log` (local only). No active production service modification.

## 2026-10-11 — Offline multi-light candidate selector
- Reused existing read-only discovery conventions and added deterministic `resolveStageLight` pure selector in dev only, with seven passing tests including identical names within an area, exact area and entity ID, stale/incomplete snapshots, unavailable/disabled targets, duplicates and malformed registry data. Returns `authorized:false` even when uniquely resolved. No HA connections, actuation, Telegram service or grants changed.

## 2026-10-11 — Stage registry reader integrated, mock only
- Added non-authorizing loopback-only stage registry read adapter, extended disposable mock with a complete fixture snapshot, and five HTTP integration tests. Initial tests found clock-order problem (`now` measured before HTTP response), corrected to sample receive time. Combined 14/14 focused tests pass. No production changes; no actual stage credentials or continuous service.

## 2026-10-11 — Branch/file audit plus Stage revalidation
- Git fetch/prune, status and ls-remote confirmed `feature/v3-home-agent` aligned with origin and clean before edits. GitHub branches main, refactor/v2, feature/v3-home-agent and review/gate-e-target-snapshot-hardening-20261009 exist. Required AGENTS/HANDOFF/TODO/WORKLOG/Stage-2 plan present. Live V2 service active; live V3 user service active at immutable 97343fa; old V2 and V3 checkouts intentionally at different revisions 32b5299 and a7fc446. Not a sync fault; avoid risky auto-pulls of service-owned repositories.
- Added offline two-snapshot identity revalidation and 20-attempt concurrent token consumption tests, 6/6 pass. Revalidation remains NON-AUTHORIZING. No running services, credentials or physical HA targets changed.

## 2026-10-11 — Safe repo structure clarifications and stage confirmation
- Inspected canonical dev root, 22 src subdirectories, docs, deployment templates, unit paths and historical checkout commits using read-only Pi layout audit. Found potentially confusing legacy root scripts and kitchen-named pilot modules; retained in place to avoid breaking imports or manually triggered real-device tools.
- Added `docs/PROJECT-MAP.md` authoritative source/runtime/branch/credential ownership index, linked from README and AGENTS. No live filesystem paths, services, branches or secret locations modified.
- Built mock-only 60s confirmation simulator with exact registry recheck at confirm, one-time consumption, actor isolation and no HA actuation. Focused simulation+revalidation tests 9/9 passed.

## 2026-10-11 — Safe repository hygiene review
- Audited GitHub branches, Pi checkout/runtime mapping, root scripts and references, historical pilot fixture uses and old release footprints. Documented prioritized findings in `docs/PROJECT-AUDIT-2026-10-11.md`; marked old systemd deployment template NOT INSTALLABLE AS-IS. No deletions, running service/unit changes or HA actions.

## 2026-10-11 — Minimal reversible cleanup
- Checked tracked source/scripts/config/test refs and user crontab + systemd entries for six standalone root model experimentation scripts: no exact-name consumers found in inspected paths. Preserved Vinted separate service reference, existing live bots, HA and root `smoke-auto-safe.mjs`.
- Moved six test/model scripts into `scripts/legacy/` using `git mv`, preserving Git contents/history; added archive README. No executable code changed, live release untouched, no branches deleted. External shell aliases and unspecified manual workflows remain unverified.
- Full Pi test run initially surfaced two pre-existing Stage fixture contract mismatches (stage-mock-ha.test and stage-gate-c-registry-bridge.test) that arose from prior `/registry` schema expansion, not the file moves. Restored `devices:[]` and `areas:[]` in mock fixture and updated old assertion to verify new schema; 12 related focused checks pass.
- Final full `npm test` PASS: 150 isolated test files / 574 assertions / 0 failed files, exit 0. Local log `/tmp/rs-cleanup-full-final-20261011.log`. No production or Home Assistant changes.

## 2026-10-11 — Current TODO normalized without discarding history
- Original append-only `docs/TODO.md` (389 lines) was preserved via `git mv` to `docs/archive/TODO-history-through-2026-10-11.md`; new `docs/TODO.md` lists current P0/P1/P2 work and a separately verified baseline. This is backlog triage, not proof all old entries are completed; unresolved older tasks may require later triage.
- GitHub comparison confirms `review/gate-e-target-snapshot-hardening-20261009` has 0 commits ahead and 115 behind active V3, as of this audit. GitHub PR search found no matching and no open PRs. Remote branch not deleted because protection/retention policy was not independently established.

## 2026-10-11 — Stage batch consent checkpoint
- Resumed after an earlier blocked Git operation. `src/ops/stage-batch-consent.mjs` and `test/stage-batch-consent.test.mjs` exist in canonical dev only and were not previously committed. Verified 13/13 focused tests across batch, single-consent and registry revalidation. Batches of 2–12 distinct exact light entities yield only `authorized:false, actualWrite:false`, and block the entire simulated action on a missing/replaced/stale/unavailable member. No live HA client or production update.
- Added `src/ops/stage-batch-http-simulation.mjs`, which requests fresh registry JSON separately for issue/confirmation, accepts only 127.0.0.1 Stage mocks and never dispatches real HA actions. Three HTTP integration tests passed including a dropped second registry read and rejected live HA LAN endpoint. No prod credentials/services touched.

## 2026-10-11 — Stage 2 HTTP edge tests and next stage design
- Extended mock-only HTTP batch confirmation tests to expiration and actor mismatch; initial test fixture clock ahead/behind discrepancy correctly denied and was fixed in test setup rather than weakening freshness logic. 6/6 HTTP tests pass. No HA client or service dispatcher added.
- Wrote `deploy/stage/README.md` for future low-complexity Node.js built-in HTTP + systemd deployment, no Docker, separate identity/state and no production credentials. Planning document only, not an installed service or authorization.
- Full Stage 2 Pi regression passed: 152 isolated test files / 584 assertions / zero failed, exit 0. Offline mock milestone closed; independent persistent Stage deployment remains future work. Evidence: `/tmp/rs-stage2-final-regression-20261011.log`.

## 2026-10-11 — Next phase: standalone mock Stage entry
- Began next phase after Stage 2 mock batch gate full regression PASS (152 test files/584 assertions/0 failed). Added `scripts/stage/mock-server.mjs`: minimal Node built-in HTTP standalone test entry, loopback-only, empty fixtures, no MCP/Telegram/HA imports, denies known live credential env keys, signal shutdown. No unit deployed. Two focused subprocess tests PASS (test token rejection, loopback /health and clean SIGTERM).

## 2026-10-11 — Stage 3 subprocess safety checkpoint
- Added subprocess rejection cases for invalid/privileged ports and HA/MCP/AI credential environment variables. Stage process tests 4/4 pass. Prepared review-only, non-installable systemd checklist `deploy/stage/stage-unit.review.txt`; no actual unit installed, no ports reserved, no prod changes. Full regression pending.
- Final full Pi regression passed: 153 isolated test files, 588 assertions, zero failed, exit 0; local evidence `/tmp/rs-stage3-full-20261011.log`. Stage 3 **source-only readiness milestone** complete. Persistent stage installation and real host network sandbox validation remain separately gated.

## 2026-10-11 — Stage isolation template review
- Created inert, unresolved `deploy/stage/rs-home-ai-stage.service.template` using standard systemd restrictions and a test asserting no prod path/secrets. 2/2 source tests pass. A sample rendered unit was syntax-checked with local systemd-analyze verify; no unit was installed or started. Effective kernel/cgroup IP isolation and fresh immutable artifact remain unverified; stage deployment NOT approved by this validation.
- Full regression after inert Stage systemd template PASS: 154 isolated files / 590 assertions / 0 failures, exit 0. Evidence `/tmp/rs-stage3-unit-final.log`. Separate stage installation/network enforcement approval remains OPEN. No active service edited.

## 2026-10-11 — Reuse-first architecture alignment
- Confirmed Node 20 project already relies on built-in HTTP/node:test, Telegraf, HA-MCP SDK and systemd for infrastructure. Adopted `docs/ADR-REUSE-FIRST-2026-10-11.md`: use platform capabilities instead of rebuilding infrastructure; reserve custom code for source trust, deterministic selection, scoped authorization, replay protection and safe verification.
- Corrected a stale TODO that still listed mock batch HTTP registry integration as incomplete after existing `stage-batch-http-simulation` tests were added. No runtime behavior or service settings changed.

## 2026-10-11 — Shared Stage selector simplification
- Reused existing pure `resolveStageLight()` directly for both single-light and batch mock consent issue/confirm snapshots, rather than artificially passing the same snapshot twice into `revalidateStageTarget()`. At both phases the actual separate registry snapshot is still checked, actor and single-use gates are unchanged, no additional authority is granted. Focused batch/single/HTTP tests: 13/13 pass. This avoids duplicative policy evaluation while preserving fail-closed behavior.
- Full regression after simplification PASS: 154 isolated test files, 590 assertions, 0 failed, exit 0. Evidence `/tmp/rs-shared-selector-full-20261011.log`. Stage/production boundaries unchanged.

## 2026-10-11 — Stage/production shared-decision review
- Audited actual V3 pilot imports, separate mock stage consent modules, `createV3IntentLedger`, isolated joined chain and offline confirmed-action gate. They share primitive ledger semantics but different trusted ingress and execution boundaries. Did not equate an offline reference gate with live authorization or modify the pinned production release.
- Added `docs/V3-SHARED-DECISION-AUDIT-2026-10-11.md` and import-boundary tests asserting no Stage mock use in the live pilot entry and no real pilot dispatcher in Stage consent. 9/9 focused checks pass. Next is careful common actor/action contract comparison, not adding another framework.
- Full Pi regression after source boundary audit PASS: 155 isolated test files, 592 assertions, 0 failed, exit 0. Evidence `/tmp/rs-shared-decision-audit-full.log`.

## 2026-10-11 — Ingress contract comparison
- Compared the pinned pilot chain with `v3-isolated-joined-chain`: both reuse the ledger, but differ in trusted ingress, strict one-device approval, durable claim and actual MCP execution vs injected simulation. Recorded explicit five-row contract table in shared decision audit. Decision: no replacement universal transport or hot swap; preserve policy boundaries.

## 2026-10-11 — Cross-path trust contract regression
- Added offline `test/v3-cross-path-trust-contract.test.mjs` for source/actor provenance, strict pilot allowlist, disabled release, confirmation TTL, replay and denied joined-chain policy. Stage/prod code and permissions untouched.
- Focused 6 checks PASS including stage import boundaries. The joined mock retains policy-denied tokens until cancel/expiry; pilot consumes after dispatch attempt. Tracked difference in shared decision audit and TODO, rather than changing security-sensitive semantics without review.
- Full regression evidence: `/tmp/rs-cross-path-contract-full-20261011.log` (PASS, see log).

## 2026-10-11 — HA-MCP trust necessity audit (read-only)
- Checked canonical dev branch and actual user-service `ExecStart`: immutable V3 97343fa active, V2 system service active. Reviewed existing registry-source, endpoint and capability fail-closed guards. Historical HA integration evidence identifies `ha_mcp_tools` bound on 0.0.0.0:9584, but server-side network isolation and independent denied-client proof are not established.
- Decision documented in `V3-MCP-TRUST-NECESSITY-REVIEW-2026-10-11.md`: reuse native HA registry and supported authentication rather than create new infrastructure. Complete source-only review; real network restriction and HA registry attestation remain prerequisites for wider production scope, NOT prerequisites for further isolated dev tests.

## 2026-10-11 — Source navigation and cleanup review
- Canonical dev is clean at baseline `4b0da51`; read-only Pi inventory confirms active V2 checkout and pinned V3 `97343fa` distinct from dev. Inspected 77 `src/decision` modules, 44 documentation entries, root legacy scripts and test/service entrypoints.
- Added `docs/STRUCTURE-INDEX.md` and entry links from README/PROJECT-MAP. Chose logical responsibility grouping instead of mass-moving source, historical records or retained service artifacts; `npm start` remains V2, and the old deploy template is not installable.
- No executable changes, HA interaction, process restart, branch deletion or token inspection.

## 2026-10-11 — Dependency audit of decision modules
- Node built-in, read-only relative-import traversal across 317 `.mjs` files found 415 import edges, no unresolved matched paths, 77 decision modules all with inbound refs and 76 directly imported by tests. V2 source entry transitively reaches 16 decision modules; V3 source entry reaches 5.
- Added `V3-DECISION-DEPENDENCY-AUDIT-2026-10-11.md`, updated structure index and TODO. No executable change, module move, service update or production write. Decision: no justified `src/decision` deletion or bulk restructure; preserve historical mock regression evidence. Full regression not needed for document-only modifications.

## 2026-10-11 — Fail-closed Stage batch confirmation after transport failure
- Confirm registry-read failures previously returned denial without consuming the pending batch token, which could later be replayed after recovery. Minimal change to existing Stage `createStageBatchConsent` exposes exact actor/token-bound `cancel` via the existing ledger, and `stage-batch-http-simulation` invokes it on missing confirm snapshot. No new service or abstraction.
- Added two regression cases: unrelated actors/incorrect tokens cannot cancel another pending batch; failed HTTP confirm invalidates token even if a subsequent fixture registry read succeeds. Focused Stage suite 15/15 PASS. Full regression: `/tmp/rs-stage-batch-revoke-full-20261011.log` (PASS).
- All changes source-only in dev; no HA client, V2/V3 runtime, credentials, real device writes or permission expansion.

## 2026-10-11 — Stage multi-device scope and identity gate
- Reused existing `validateV3OperatorPolicy` in offline Stage batch: explicit deny-by-default schema-validated fixture policy required, each target must have scoped `confirm` grants for both on and off in this action-neutral simulated batch. Missing/partial scope never creates a pending intent. Not operator authentication; fixture schema alone grants no live authority.
- Batch confirmation now compares original entity, device, area AND original registry display name against fresh mock snapshot; rename, removal, unavailability, cross-area substitution, duplicate/ambiguous name and invalid scope deny all members, with zero actual writes. Added focused cases; 14/14 batch + HTTP checks pass.
- Full regression log: `/tmp/rs-multidevice-scope-full-20261011.log` (PASS). No live HA client, production deployment, credential changes or service restart.

## 2026-10-11 — Native HA multi-light read-only inspection readiness
- Reused existing native websocket registry bridge and two-pass inspection; confirmed there is no need to build another HA reader or Stage network service. Added mock multi-light tests to `v3-ha-registry-read-adapter.test.mjs` for six allowlisted read requests, no grant, duplicate/orphan failures and second-pass replacement rejection (5 focused tests PASS).
- Detailed remaining provenance and network restrictions in `V3-MULTIDEVICE-REGISTRY-READINESS-2026-10-11.md`. No live registry connection or actual device action was performed. Full regression evidence: `/tmp/rs-ha-multilight-readonly-full-20261011.log` (PASS).

## 2026-10-11 — One-shot upstream HA read lifecycle safety closeout
- Reused `inspectOneShotRegistryConnection`; added offline tests for delayed connection creation after timeout (close once, zero registry requests) and disconnected fixture (zero requests, closes once). No connection to production HA was made. Focused upstream suite 14/14 PASS.
- Source-only registry readiness is complete: no new transport, no authority, no service. Authenticated real registry provenance and LAN MCP isolation remain separate promotion gates. Full regression evidence `/tmp/rs-upstream-lifecycle-full-20261011.log` PASS.

## 2026-10-11 — Practical MVP decision and replay contract
- Fast-forwarded canonical dev to GitHub `8b7b7fd`; focused `v3-policy-denial-retention-contract` plus `v3-cross-path-trust-contract` executed on Raspberry Pi: 5/5 PASS. The mock policy-denied token remains pending but cannot write; the pinned one-light pilot consumes before dispatch. No refactor of production semantics warranted.
- Prioritized real user utility and reuse of existing V2 status/control functionality over another layer of infrastructure. `V3-PRACTICAL-MVP-PRIORITIES-2026-10-11.md` records the limited next feature and promotion blocks. Full regression pending for this checkpoint.

## 2026-10-11 — Practical read-only lights overview (dev)
- Added small pure `src/home/on-lights-summary.mjs` which summarizes only explicitly supplied `light.*` entity IDs through an injected readState function. Never calls HA itself or any write service. Rejects duplicate/invalid scope and incomplete or mismatched states without a misleading partial "all off" answer. Four focused tests PASS.
- This is a dev library building block, NOT wired to live Telegram; a trusted HA read adapter, scoped inventory and reviewed deployment are still prerequisites. No added dependencies or daemon. Full regression log `/tmp/rs-lights-overview-full-20261011.log` PASS.

## 2026-10-11 — Useful Telegram read-only `/lights_on` in dev
- Added small HA-MCP read adapter `src/home/on-lights-mcp-read.mjs`, reusing existing `ha_get_state` executor and pure `on-lights-summary`. Telegram V2 source has private-chat-only `/lights_on` command for known `light.*` entities in `config/devices.json`, maximum 20 distinct IDs. The output explicitly states that this is NOT a whole-home inventory. Errors or unavailable telemetry refuse partial results; no control calls.
- Seven focused overview tests PASS. This is **source-only**, since active V2 service runs a different pinned checkout. Full regression `/tmp/rs-lights-telegram-integration-20261011.log` PASS. No production HA/Telegram restart or expansion of permissions.

## 2026-10-11 — `/lights_on` response shape and live gate
- Added strict JSON text-content MCP response parsing while retaining matching entity IDs, zero-write behavior and fail-closed errors. Four focused adapter tests PASS. Known device inventory contains only three lights; no live HA read performed. See `V3-LIGHTS-ON-ACCEPTANCE-2026-10-11.md` for prerequisites.

## 2026-10-11 — Practical full light inventory from existing HA-MCP
- Real read-only HA-MCP `ha_get_state` on the 3 configured lights: response has `structuredContent` with matching entity IDs; only one had on/off, two lacked a known state. No state values or credentials stored.
- Real read-only `ha_search` on existing V2 MCP endpoint returned complete 41 light entities (6 on, 14 off, 19 unavailable, 2 unknown) at inspection time. Used existing search rather than inventing registry infrastructure.
- Dev Telegram `/lights_on` now uses strict one-shot `ha_search` inventory with fail-closed pagination/duplicates and reports unknowns separately from off. No production V2 restart or deployment. Added three focused tests PASS; full regression pending.

## 2026-10-11 — Read-only light discovery negative contract extension
- Verified clean canonical dev baseline `6eded60` had previous stage/production audit already committed. Added 2 negative tests for incomplete HA-MCP light search identity/pagination proof and empty/duplicate/foreign-domain registry entries, plus updated stale `/lights_on` acceptance documentation to reflect current complete `ha_search` read-only adapter. Focused 5/5 pass; full `npm test` 160 files, 618 assertions, zero failed, exit 0 (`/tmp/rs-discovery-guard-full-20261011.log`). No runtime service touched.

## 2026-10-11 — Read-only lighting overview contract reinforcement
- On current `4425b18` dev HEAD, verified earlier Stage/production audit full regression evidence exists (155/592/0); newer `/lights_on` work already committed by separate checkpoints (see recent git history). Added only pure read-only contract tests: hard maximum inventory limit must deny oversized response; unsupported light states always stay in `unknown`, never silently converted to `off`. Focused `discovered-lights-overview` tests PASS 7/7. No source action path or live bot service modified.

## 2026-10-11 — Gate C read-only MCP inventory timeout
- Canonical dev source: `summarizeDiscoveredLights` now has a 5000 ms bounded wait, explicit 1..30000 ms parameter validation and rejection on expiry. Timer clears on settle. Late callback resolution cannot revise an already denied result.
- Focused `test/discovered-lights-overview.test.mjs`: 9/9 PASS including unresponsive and late HA-MCP, and malformed time budgets. This is NOT transport/socket cancellation; readTool may remain active after timeout. No HA write or live service change.
- Full npm regression: PASS, 160 test files, 622 assertions, 0 failed files; log: /tmp/rs-v3-lights-timeout-full-20261011.log. Production promotion remains separately gated.

## 2026-10-11 — Gate C cooperative read-only cancellation (GitHub PR)
- Added optional `{signal}` to the existing injected `readTool` request when listing lights; on timeout, AbortController aborts while caller still fails closed. This is a hint to adapters only, not proof that the live HA-MCP SDK cancels its network request.
- Three isolated negative tests cover cooperating transport, ignored cancellation with a late result, and timer cleanup after success. GitHub Actions CI result must be inspected before merging; Raspberry Pi ARMv7 and deployment remain separate gates.

## 2026-10-11 — Gate C in-flight actor guard (GitHub PR)
- Dev source-only pilot holds an in-memory actor lock during unresolved confirmed dispatch. New request while pending returns action_in_flight; consumed token cannot be confirmed twice. Journal mark exceptions are denied without another HA write. Three focused negative tests added. Await GitHub CI result and review.
- Limitation: lock is per process, not a cross-restart or cross-process durable claim; immutable production V3 and HA unchanged.

## 2026-10-11 — Documentation verification and GitHub sync audit
- PR #2 merged `a4a07ae`, GitHub Actions run `38151447467` PASS 160 files / 622 assertions. PR #3 merged `142dfec`, run `38151750491` PASS 160 / 625. PR #4 merged `a1ee64c`, run `38152097367` PASS 161 / 628. All zero failed files.
- Prior statements that these PR checks are pending are historical records, now superseded by this entry. Active project documents are corrected accordingly. No live Pi inspection or ARMv7 regression performed for these latest three commits.
- Last owner-provided canonical Pi DEV Git status: clean `2a71552` before GitHub added three commits. Pi status may since have changed; verify before any fast-forward. Preserve both runtime checkouts, immutable V3 release, HA Green and deployment-owned secrets.

## 2026-10-11 — Gate C durable journal process replay tests (GitHub PR)
- New offline subprocess tests for the already-existing SQLite PRIMARY KEY journal: crash with unknown reserved claim before outcome mark, five competing OS processes, and terminal verified/unverified outcome cannot be re-claimed. Does not change production implementation, launch configuration, privileges or runtime storage. CI result pending.
- Separate requirement remains: trusted actor/action binding, recovery behavior and real integration acceptance before any live multi-device expansion.

## 2026-10-11 — Joined Gate C offline review and Stage handoff
- Added single-chain pilot test using private actor, exact action, one-time intent, SQLite journal and unknown MCP outcome fixture. Corrected stale execution journal comment that falsely claimed the journal was never used by the pilot. No production path/code behavior changed.
- Gate C offline regression is ready for GitHub CI; **operational Gate C remains open** pending real boundary attestation, Pi ARMv7 test, source/identity and owner-authorized fault acceptance.
- Stage next: use existing loopback mock and reviewed systemd template, not a new server or live HA; installation requires separate owner-controlled boundary acceptance.

## 2026-10-11 — Stage mock write-denial regression PR
- Added HTTP tests for service/MCP POST, registry mutations, and unsupported HA endpoints; mock denies all, with synthetic read-only empty registry and loopback binding. No Stage process installed, no real HA/Telegram access, no network firewall acceptance inferred. GitHub CI pending.

## 2026-10-11 — Gate C journal mark return-value hardening PR
- Found pilot confirm returned `verified` if `executionJournal.mark()` silently returned false. Source-only fix reports `failed:journal_mark_unavailable`, never repeats dispatch, and treats missing `mark` as failure when journal enabled. Updated throw-case assertion and negative tests. CI acceptance pending; live V3 pinned artifact untouched.

## 2026-10-11 — Maintenance freeze and user-value-first MVP
- Maintenance audit PR #9 was merged as `83d5905`, and Gate C journal fail-closed PR #10 as `92846a5`, with GitHub offline CI 164 files / 636 assertions / 0 failed. Remote branch deletion is still pending because the connected GitHub action cannot delete refs. Do not misreport 11-branch inventory as current after new temporary PR branches.
- Freeze cosmetic source moves/renames. Stop building new Gate C framework unless an actual issue blocks owner-reviewed release. Prioritize bounded read-only lighting status using the existing bot and HA-MCP, before voice/general automation.
- Dev-only bounded listing now displays at most 20 ON entity IDs, retaining total ON/OFF/unknown counts; no new HA writes. Await GitHub CI and Pi compatibility check before release.

## 2026-10-11 — Practical MVP /lights_on release candidate review
- Read-only `/lights_on` Pi acceptance and reversible release plan is in `docs/LIGHTS-ON-RELEASE-GATE-2026-10-11.md`. Current `callHA` ignores AbortSignal and can update memory on a late read; fix/review before production. Offline PR CI pending. No Pi or HA changes.

## 2026-10-11 — V3 sauna status practical feature
- V3 sauna read-only candidate: exact `ha_get_state` allowlist for `sensor.sauna_te_sauna_temperature` and `binary_sensor.sauna_sauna_te_sauna_ready`; `/sauna` and four explicit Russian requests. Wrong entity, unknown, unavailable or impossible values fail closed. No wider write scope, no runtime deployment. CI pending.
- Owner reported pending tamboor light → cancel → confirm returned missing, as expected. Live process remains pinned to release `97343fa`; do not treat this GitHub feature branch as deployed.

## 2026-10-11 — V3 practical scope and backlog consolidation
- Live @RSHomeAI_v3_bot confirmed at immutable `97343fa`, running. Owner-confirmed `/start`, `/status`, missing confirmations, and request→cancel→confirm behavior. Pi DEV `5621292` passed 165 files/640 checks. Subsequent sauna feature PR #13 merged `aa5af27` (GitHub CI 166 files/643 assertions), but Pi DEV and live release have NOT been updated to it.
- `docs/TODO.md` replaced with short authoritative V3 delivery queue. Earlier text remains retrievable in Git history; GitHub branches and Pi runtime files were not deleted. `src/decision` remains referenced and is not a safe deletion target. No runtime or permission changes.

## 2026-10-11 — Pi sauna real-read acceptance
- Owner confirmed Pi DEV at `3a889da`, 166 test files/643 assertions/0 failed; real read-only HA-MCP `ha_get_state` returned sauna temperature `75.875 °C`, readiness `off`, and `summarizeSauna` returned `complete`. The readiness binary sensor last_reported was older, which alone does not prove staleness for an unchanged state. No live V3 deployment occurred.

## 2026-10-11 — Sauna candidate preparation
- Added source-only guarded packaging script and `docs/V3-SAUNA-RELEASE-CANDIDATE.md`: exact Git ref, clean DEV, no overwrite of existing release, no Telegram poller or systemd changes. GitHub CI pending; operator still needs Pi acceptance and separate production switch authorization.

## 2026-10-11 — Live V3 sauna Telegram functional acceptance
- Owner confirmed live V3 Telegram responses after approved switch to candidate c6a9812: /status journal available, /sauna 87.625 °C ready, natural-language temperature 87.8125 °C ready, readiness question 87.875 °C ready. This validates functional Telegram read-only sauna path, not independently the effective systemd target nor rollback and write-regression after switch.
- Source-only documentation milestone. Preserve current working release and previous rollback. No code or services modified by this commit.

## 2026-10-11 — Active sauna production checkpoint
- Owner confirmed running V3 systemd release `c6a9812` and successful 4/4 Telegram status/sauna read queries. See `V3-PRODUCTION-CHECKPOINT-2026-10-11.md`. Cancel regression after release, rollback checks and one-off cleanup remain open. Production untouched by this documentation update.

## 2026-10-11 — Live V3 post-switch cancellation / cleanup checkpoint
- Owner tested pending tamboor light request → `/cancel` → `/confirm` in active `c6a9812`; responses pending, cancelled, missing. No confirmed device write. Real physical state not independently checked. `docs/V3-CLEANUP-CHECKPOINT-2026-10-11.md` classifies cleanup by runtime/rollback consumers and requires read-only Pi inventory before deletion. No service or HA changes.

## 2026-10-11 — Historical V3 release folders archived
- Owner ran reversible move of `rs-home-ai-v3-release-7d9bab5` and `rs-home-ai-v3-release-920585d` to `~/projects/archive/rs-home-ai-v3/`; verified both target directories exist with private permissions and `systemctl --user is-active rs-home-ai-v3.service` is `active` afterwards.
- Prior scan showed historic systemd backup unit references to old paths and active Gate D timers bound to **separate historical checkout** `/home/drpoh/rs-home-ai-v3`; keep this checkout and its timers. No source code or live production unit changed. Archive move is reversible and does not reclaim disk capacity.

## 2026-10-12 — Remote branch cleanup verified
- Owner removed 19 ephemeral remote branches; connector independently confirmed four retained GitHub branches: `main`, `refactor/v2`, `feature/v3-home-agent`, and Gate E review. See `docs/V3-GITHUB-CLEANUP-2026-10-12.md`. V3 production unchanged. Gate D runtime health and Pi DEV resync remain to verify.

## 2026-10-12 — Read-only V3 lamp status source milestone
- Verified remote cleanup left four permanent/review branches before opening this feature branch; active release remains `c6a9812`, previous rollback `97343fa` and Gate D checkout preserved.
- Added deterministic status-only `/light` and narrow natural-language questions for existing scoped `light.tambur_svet_l1`, without HA write or new endpoint scopes. New production release **not authorized**. No Pi/Gate D runtime verification output in current turn. See current `docs/TODO.md`.

## 2026-10-12 — Bounded V3 lighting overview source
- New source-only `/lights` and explicit natural-language lighting questions check exactly 7 fixed entities (tambour and six corridor lights) through existing HA-MCP `ha_get_state`, no search, no writes. Three offline tests cover complete, partial, MCP errors. GitHub CI pending; hardware read-only ID validation and owner-authorized immutable release still pending.
- Gate D timers were confirmed **enabled and scheduled** in earlier Pi output, but successful latest job exit and recent V2 live state were not provided. Thus V2/Gate D checkpoint is **provisionally documented, NOT health-certified**. Ask only for bounded read-only `systemctl` output to close operational acceptance.

## 2026-10-12 — Lights candidate preflight
- Prepared release gate `docs/V3-LIGHTS-RELEASE-GATE-2026-10-12.md`; immutable candidate packaging now syntax-checks both light modules. User Pi full test and actual HA-MCP seven-ID acceptance are **not yet provided**; production V3 `c6a9812` unchanged. V2/Gate D runtime result remains unconfirmed. Owner approval is required for any systemd switch.

## 2026-10-12 — Safe combined automation milestone
- Source-only DEV automation added: approved-branch clean fast-forward, locked/tested immutable candidate in `~/projects/rs-home-ai-v3-candidates/`, user systemd 6-hour timer, read-write scope limited to DEV/candidates/job state, inaccessible runtime credentials and V2/Gate D checkouts. A one-time owner installer is provided. No production switch, timer installation or Pi verification performed by this GitHub change. Direct remote Desktop Commander quota is 0%; do not claim live ChatGPT shell access. See `docs/V3-DEV-AUTOMATION-2026-10-12.md`.

## 2026-10-12 — First Pi DEV automation run
- Owner installed the user timer and ran DEV check. It exited 128 at fetch; no npm test or candidate built. V2 active; pinned V3 c6a9812 active; Gate D health and alerts unit Results=success and ExecMainStatus=0, but timestamps/incident recovery not confirmed. Sandbox shows ProtectHome=read-only, ProtectSystem=strict, expected scoped ReadWritePaths and private InaccessiblePaths. No unit journal entries available. Added private fetch-error classification to aid actual SSH diagnosis without secrets. Do not claim runner passing until Pi recheck.

## 2026-10-12 — DEV fetch root cause
- Owner supplied sanitized error: `Bad owner or permissions on /etc/ssh/ssh_config.d/20-systemd-ssh-proxy.conf`. Script now uses `GIT_SSH_COMMAND` with `ssh -F none`, mandatory strict host-key checking, and batch mode only inside DEV script; no global SSH changes or production changes. Pi validation remains pending, as default SSH key/known_hosts access may still need checking.

## 2026-10-12 — First systemd test-stage failure
- Pi owner confirmed Git fetch works after SSH override: job reached `stage=tests`, SHA `2b61a72`, exit 1, no candidate; pinned V3 `c6a9812` active. Added private test-output capture for follow-up. Root cause of `npm test` under namespace still unknown; do not claim Pi tests passed or relax sandbox.

## 2026-10-12 — Pi sandbox security-test fixture remediation
- Owner-provided test failures were `policy_unsafe_ancestor` and `untrusted_secret_parent`, consistent with test fixtures beneath world-writable `/tmp`. DEV automation now exports private `TMPDIR` under its 0700 automation state before `npm test`; no security policy checks or production isolation weakened. Await real Pi validation; CI alone cannot prove Pi systemd compatibility.

## 2026-10-12 — Real Pi fixture ancestor identified
- Owner `namei -l` proved `~/.local` is group-writable 0775. Four secret/policy test files reject it as an unsafe ancestor. Moved automated test scratch to `~/.rs-home-ai-dev-test-tmp` directly beneath private 0700 user home; updated systemd ReadWritePaths and installer to accept an exact known prior unit for controlled upgrade. No global chmod or production change; Pi verification still pending.

## 2026-10-12 — Pi test temp ancestry diagnostics
- Pi user verified `~/.rs-home-ai-dev-test-tmp` and all ancestors are safe, and systemd has the correct `ReadWritePaths`, yet 4 policy/security test files still fail. Added opt-in diagnostic output in the isolated test runner to record only each temporary root ancestor's depth, ownership relation, mode, and policy compatibility, never raw paths or tokens. DEV runner enables it and preserves output in private last-test.log. Root cause remains unverified pending Pi run; no sandbox weakening or prod change.

## 2026-10-12 — split exact-SHA GitHub CI / Pi immutable candidate
- Owner confirmed systemd user namespaces show root / and /home with UID 65534, while user home is UID 1000; security suite intentionally rejects unmapped root owners. Switched DEV runner to verify a completed successful private-repo GitHub Actions push workflow for exact HEAD SHA, correct repo/branch/workflow, using local read-only PAT in a 0600 file; no local security tests under remapped Pi. New workflow runs full npm test on feature branch push. Pi candidate remains blocked if gate unavailable. One-time read-only token configuration required. Production untouched.

## 2026-10-12 — CI API path compatibility
- After token was accepted on Pi, GitHub API returned HTTP 404 on workflow-file-scoped Actions runs endpoint because new workflow is not on default branch. Switched verifier to repository-scoped Actions runs API with unchanged exact SHA/branch/event/workflow/repository filters. Still fail-closed on all errors. Production untouched.

## 2026-10-12 — first CI-gated Pi candidate confirmed, docs/strategy reconciled
- Owner output: `rs-home-ai-dev-check.service` returned success and `latest.txt` recorded `time_utc=2026-10-12T07:10:00Z`, `status=passed`, `stage=complete`, `source_sha=b1122bdb274931b5d89e745c9ce171ac4e3addbe`, `exit_code=0`.
- Owner confirmed `~/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-b1122bd/RELEASE_COMMIT` holds the matching SHA. Release was NOT activated; last production observation: user V3 service active at immutable `c6a9812`.
- Root cause investigation: PI systemd user namespace maps root-owned ancestry to UID 65534; security fixture checks intentionally reject it. GitHub CI (PR #33) 169 files/656 assertions/0 failures. GitHub fine-grained PAT initially had no repository access, then owner corrected token/access; exact-SHA CI gate completed successfully. No secrets published.
- New work: synchronize source of truth (AGENTS, TODO, HANDOFF, PROJECT-MAP, DEV-AUTOMATION docs) and prioritize offline isolated STAGE candidate smoke with explicit release/rollback gate. No new runtime execution or Pi stage test performed during this GitHub-only documentation change.

## 2026-10-12 — Offline stage smoke source milestone
- Added scripts/automation/stage-smoke.mjs to load immutable candidate's existing mock-only stage module, verify exact RELEASE_COMMIT and loopback-only health/registry and deny writes, with 30-second bounded user-systemd execution and private last-stage.log.
- DEV validation invokes this after packaging; candidate is still NOT deployed. No HA Green, Telegram token/poller or production service accessed. GitHub CI and owner Pi result must be logged separately; not yet verified as of source change.

## 2026-10-12 — owner-confirmed offline STAGE smoke on Pi
- Owner ran installed DEV automation at 07:56:27 UTC for exact SHA `46ce492033fb6c830a37ef95ba6efdb3ed632470`: `status=passed`, `stage=complete`, `exit_code=0`. Private stage log: `STAGE_PASS ... mode=offline_mock tests=identity,health,registry,deny`.
- Production user service remained active at immutable `c6a9812` (read-only systemctl observation). Candidate never promoted. This is **offline mock stage validation**, not live HA read/write scope acceptance.
- Next: value-first reuse of existing Russian read-only sauna and bounded lighting summaries, test with fixtures first; separate owner approval for deployment.

## 2026-10-12 — read-only Russian question classifier
- Reused summarizeSauna, summarizeLightOverview and summarizeTambourLight. Classified additional natural Russian phrases through a pure allowlisted router; unsupported questions stay read-only with an explanatory reply rather than falling into consent/physical control. No new entities, tokens, services or HA writes. Pi acceptance and release still pending.

## 2026-10-12 — bounded operator-only live HA-MCP read preflight
- Reused existing narrow client and summarizers for direct read-only on-demand smoke. Script does not modify HA or run Telegram. No live test performed by GitHub connector; Pi/HA result remains open. See docs/V3-LIVE-READONLY-PREFLIGHT.md.

## 2026-10-12 — Real read-only Pi acceptance (partial)
- Owner ran `scripts/manual/v3-live-readonly-preflight.mjs`: SAUNA complete 27.125 °C/ready false, TAMBOUR complete/on, LIGHTS partial 1 on/3 off/3 unknown. Unknown IDs: `light.koridor_2`, `light.koridor_1_etazh_2`, `light.koridor_spot_2`.
- Extended explicit read-only preflight to classify error reason for fixed seven IDs, without raw HA payloads, registry search or writes. New Pi run and validation pending. Production release unchanged.

## 2026-10-12 — classified review of lighting inventory
- Owner observed `unavailable` on `light.koridor_2`, `light.koridor_1_etazh_2`, `light.koridor_spot_2` and clarified some items are switches/auxiliary. Limited Pi inventory enhanced to print all seven exact read-only IDs. Existing `lighting-classification.mjs` supports switches/exclusions. See `docs/V3-LIGHT-ENTITY-REVIEW-2026-10-12.md`; no live classification proof or prod promotion.

## 2026-10-12 — Cross-chat history and gate evidence reconciliation
- Inspected AGENTS, PROJECT-MAP, HANDOFF, TODO, STRATEGY, stage plan and lighting review. Current phase: practical narrow MVP inventory/read-only before deployment, NOT general Gate B completion.
- Corrected stale 97343fa production reference in current stage plan; last owner-confirmed live release c6a9812. Mock STAGE and physical HA-MCP scoped read are separate evidence.
- See docs/V3-HISTORY-STAGE-AUDIT-2026-10-12.md. No Pi execution or service changes as part of this documentation audit.

## 2026-10-12 — Branch and duplicate PR housekeeping
- Live GitHub inventory revealed 27 refs; 23 temporary PR heads (#22–#44), of which 21 merged, two documentation duplicates closed unmerged (#42, #43). Closed redundant open #43 after inspecting diff. Prepared exact safe remote-prune command in existing V3-GITHUB-CLEANUP document. Branch deletion not executed; connector has no delete-ref action and Desktop Commander quota blocks remote shell. Production untouched.

## 2026-10-12 — Remote branch deletion independently verified
- Owner executed approved GitHub temporary branch deletion. Connector returned exactly 4 remote branch refs: main, refactor/v2, feature/v3-home-agent, review/gate-e-target-snapshot-hardening-20261009. Cleanup complete. No production changes. See docs/V3-GITHUB-CLEANUP-2026-10-12.md.

## 2026-10-12 — Repository integrity and navigation audit
- Verified GitHub V3 tree fully enumerable (471 entries, no truncation): 155 src file blobs, 174 test blobs, 61 docs blobs; no symlinks. Exactly 4 remote branches, no open PRs at audit. GitHub source and offline CI are not Pi runtime integrity proof.
- Detected and corrected conflicting legacy V3 checkout designation in AGENTS and outdated 97343fa active-release reference in STRUCTURE-INDEX. Added docs/CURRENT-STATE.md as short current entry; historical WORKLOG/HANDOFF preserved rather than rewritten or deleted.
- Incomplete checks: current Pi DEV SHA/cleanliness, effective V3 systemd ExecStart, V2/Gate D health, latest Pi production-candidate ARMv7 validation and HA physical light classification. No deployment, runtime files or Home Assistant devices modified.

## 2026-10-12 — Operator-confirmed Gate D timer execution timestamps
- Owner checked user-systemd: Gate D health and alerts timers both last triggered 13:17:17 EEST; health service ended 13:17:19 and alerts 13:17:18, both Result=success/ExecMainStatus=0 from prior check. Next scheduled both 13:32:17 EEST. DEV check timer last triggered 12:13:16 and next 18:13:07 EEST; timer firing alone does not attest job result. V2 and V3 previously observed active, V3 pinned c6a9812.
- At latest source status provided, Pi DEV HEAD e231afb, remote after fetch 115c6b3; no subsequent fast-forward output received. DEV source sync and last automation latest.txt status remain unverified; no services changed.

## 2026-10-12 — Owner confirms exact-SHA offline STAGE and practical lighting review
- Owner reported Pi DEV automation at 10:33:23 UTC: status=passed, stage=complete, source_sha=f4acd114c10f2c8883e433cd71ca4c60f173d278, exit_code=0; this is offline mock STAGE plus candidate checks, not live registry acceptance or production promotion.
- Reused existing read-only HA-MCP pilot and added bounded friendly_name review evidence for previously approved seven IDs. A name is only metadata and cannot authorize switches/rooms or prove physical circuit. Source CI and Pi run require separate observation.

## 2026-10-12 — Exact seven HA names verified read-only
- Owner Pi HA-MCP read at sauna 28°C (not ready), tamboor on, corridor three available off and three unavailable. Friendly names: light.koridor and light.koridor_2 both Коридор; light.koridor_1_etazh and light.koridor_1_etazh_2 both Коридор 1 этаж; light.koridor_spot Спот; light.koridor_spot_2 Свет. No inferred duplicate/circuit relationship or physical type.
- Source-only /lights overview now explicitly distinguishes seven HA entities from physical lamps and lists unresolved exact IDs. Production c6a9812 unchanged.

## 2026-10-12 — Owner HA cleanup / narrowed four-entity light view
- Owner reports three old unavailable HA entities removed (light.koridor_2, light.koridor_1_etazh_2, light.koridor_spot_2). Screenshot proved first was orphaned from yandex_station; other deletions owner-confirmed, no independent device metadata.
- Source-only V3 light status now targets exactly four retained IDs; original tamboor write permission unchanged. Revised tests assert read set excludes the three deleted IDs. GitHub CI and real Pi updated preflight required separately; production pinned c6a9812.

## 2026-10-12 — Pi live four-entity HA-MCP preflight PASS
- Owner verified revised manual preflight: sauna complete 27.9375°C, ready false; lights complete (on 1, off 3, unknown 0), tamboor complete/on; `READONLY_PREFLIGHT=PASS`. Individual IDs: `light.tambur_svet_l1` on, `light.koridor` off, `light.koridor_1_etazh` off, `light.koridor_spot` off. No HA actions executed.
- PR #49, exact four-ID source and tests, had successful GitHub CI (run #55 at source commit 40d9764) and merged `0a0d024`. Pi live preflight confirms read-only behavior; no new Pi STAGE candidate or production deployment acceptance implied.

## 2026-10-12 — Bounded Russian light detail PR #50
- GitHub source-only PR adds OFF labels to existing /lights summary and extra exact Russian OFF questions with regression tests. All reads remain four reviewed HA entity IDs; no physical classification or permission increase. PR CI to be checked; no Pi execution or production deployment claimed.

## 2026-10-12 — PR #50 GitHub acceptance
- Node 20 isolated suite GitHub job succeeded on head `6989fe3`; PR #50 squash merged `9cbb695`. Four fixed HA light IDs only; OFF names and Russian queries now source-available. No ARMv7/Pi run or production release performed in this chat.

## 2026-10-12 — PR #51 accepted
- PR #51 merged as `d7aad8c` after GitHub Node 20 offline CI succeeded on exact head `668a357`. Four selected lights: all OFF vs any ON vs unknown is now explicit and read-only. Pi ARMv7 DEV/STAGE unverified; production not changed. Next: exact-SHA Pi candidate gate and owner-approved release.

## 2026-10-12 — Production switch startup evidence
- Following owner's separate approval, owner ran reviewed systemd override promotion to immutable candidate `9dd5964`. Output confirmed `/usr/bin/node .../rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs` with `ActiveState=active`, `SubState=running`, PID 3713, started 14:49 EEST. GitHub CI, Pi exact-SHA STAGE and scoped HA live read preflight passed earlier; owner confirmed Gate D success. Telegram end-to-end acceptance still pending. `journalctl --user` showed no journal files. No automatic production action by the assistant or confirmed HA write.

## 2026-10-12 — Real Telegram V3 smoke accepted for read-only endpoints
- Owner screenshot (16:39–16:40 EEST) verifies production 9dd5964 Telegram messages: status journal ready, empty confirm denied, sauna 28.4375 °C not ready, tamboor on, four-entity lighting overview on1/off3/unknown0, Russian two OFF-light questions both routed. Pending cancellation-with-request regression. No confirmed physical actuation. No code or runtime changes in this note.

## 2026-10-12 — Production confirmed-action live acceptance (owner Telegram transcript)
- Operator requested `Включи свет в тамбуре`, received pending exact `light.tambur_svet_l1` + explicit `/confirm` prompt; `/confirm` returned `Home Assistant подтвердил состояние светильника после команды.` Repeated for OFF, again verified by HA response. This proves confirmed on/off flow for existing authorized target, but independent physical observation and request→`/cancel`→`/confirm` regression are not yet supplied. No broader authority established. Active V3 release last observed `9dd5964`, rollback `c6a9812` preserved.

## 2026-10-12 — Live cancel response verified; replay check pending
- Owner Telegram transcript: request `Включи свет в тамбуре` created exact-target pending confirmation; `/cancel` replied `Запрос отменён.` No subsequent `/confirm` output yet: cancellation response verified, invalidated-token replay rejection still pending. No new device write authorized.

## 2026-10-12 — V3 9dd5964 Telegram MVP functional acceptance complete
- Owner-provided live Telegram transcript confirms pending `light.tambur_svet_l1` request → `/cancel` = `Запрос отменён.` → `/confirm` = `Нет действующего запроса для подтверждения.` Previous private-chat smoke passed `/status`, `/sauna`, `/light`, `/lights`, Russian lighting questions, and separately user-confirmed ON/OFF with `/confirm` and HA verified-state replies. This closes **scoped Telegram functional acceptance** only; broader policy/security gates, physical-light classification, fault/recovery tests and voice remain open. Existing production SHA `9dd5964`, no new deployment or permissions. Next: concise question-specific Russian answers and scoped context in DEV via CI without production changes.

## 2026-10-12 — Accepted V3 MVP checkpoint and safe cleanup assessment
- Recorded user-confirmed release `9dd5964`, exact immutable systemd executable and successful private Telegram tests: `/status`, `/sauna`, `/light`, `/lights`, Russian questions, confirmed tamboor ON/OFF, pending `/cancel` then `/confirm` missing. This is narrow functional acceptance, not global policy/voice fault-gate completion.
- GitHub live branch audit found 11 refs, 7 merged PR #46–52 heads and 4 retained branches. Reviewed cleanup candidates without deleting history/refs/runtime. Current Pi DEV revision after documentation commits not independently read because Desktop Commander quota blocked remote shell.

## 2026-10-12 — Pi obsolete-build cleanup completed (owner evidence)
- Owner ran the reviewed guarded deletion and reported `CLEANUP=PASS`. Eight directories removed: five old candidate siblings `b1122bd`, `e231afb`, `46ce492`, `ed27051`, `f4acd11`, plus standalone `rs-home-ai-v3-candidate`, `rs-home-ai-v3-candidate-v2`, `rs-home-ai-v3-release-968748d`. Each previously measured ~64M, estimated ~512 MiB freed (df rounded: avail 43G→44G, used 22%→21%).
- Before deletion, exact-target directory and production ExecStart validation succeeded. After deletion both `rs-home-ai-v3.service` user and `ha-telegram-bot.service` system remained `active`, all eight target paths absent. Retained active `9dd5964` child inside shared candidate parent, `c6a9812`, `97343fa`, Gate D historical checkout, V2 checkout, archives, and private state. Disk figures approximate; no byte-accurate measurement provided.
- Documentation-only GitHub update creates a new DEV commit beyond owner's last shown `75e23bd`; next safe Pi sync is clean-worktree fetch + ff-only; do NOT redeploy immutable production for documentation.

## 2026-10-12 — Jules failed; safe GitHub fallback completed
- First free Jules run was initiated from GitHub issue #54 (task 14398277506199942818) and acknowledged, then bot posted unexpected-error failure; no Jules-created PR. Investigate task setup separately, no billable fallback.
- ChatGPT directly prepared focused read-only Russian lighting summaries using existing four-entity `summarizeLightOverview` and `classifyReadonlyQuestion`; new `classifyLightQuestionMode` returns `off`, `all_off`, `overview`. Existing `/lights` behavior retained. Added offline tests for complete/unknown/mixed read states, preserved authorization:false and actualWrite:false. PR #55 merged as `64ed9f1` after GitHub CI Offline Node checks succeeded on exact PR HEAD `f85864c326f4427ad08870694fb5047737577ff2`. Source only, no Pi DEV checkout or prod service changed here. Issue #54 closed as code delivered; Jules label removed.

## 2026-10-12 — Agent collaboration and light-only milestone
- Owner restated parallel work with free Jules and proactive repository organization. Created short agent checkpoint `docs/V3-AGENT-CHECKPOINT-2026-10-12.md` instead of expanding already-long handoff/WORKLOG further.
- GitHub exact-head CI passed for PR #73 and merged as `e11b0bef9ef50b1bc25b2c08ec28dd1cefd20e5d`. DEV-only pure room counts for 19 new light candidates; no production reads, Telegram integration, or wider action rights.
- Jules #72 acknowledged, not yet confirmed complete via issue-linked PR; older PRs #56/#65/#69 wrongly based on main and include hundreds of unrelated files. Preserve history, review minimal changes rather than bulk-merge. Next work: official HA registry verification for 10 persistent `unavailable` and possible duplicates among nine available, followed by explicit scoped read-only DEV integration.
