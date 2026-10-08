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
