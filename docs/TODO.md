# TODO — Open work register

Updated: 2026-10-08. Branch: `feature/v3-home-agent`. Last verified commit before this log: `29e510f`.

## Working agreement
At session start: read `docs/home-agent-v3-strategy.md`, this TODO, `docs/WORKLOG.md`, current `git status`, and the most recent tests. Choose the next task from confirmed blockers.
At session end: record completed work, failed/unfinished steps, test results, commit/remote status, and next exact action. Never classify an unknown file as safe to delete without inspecting it.
`docs/PROGRESS.md` is a broader milestone summary, not a substitute for this current queue.

## Open tasks
- [ ] **P0 — Gate B: connect trusted area evidence to the running agent path.** `src/decision/engine.mjs` accepts optional areaEvidence, but `src/ai/agent.mjs` does not supply it. Preserve independent policy, scope, preconditions and budgets. Do not deploy before end-to-end tests.
- [ ] **P0 — Gate B: prevent unsafe area resolution.** Review substring matching in `src/home/area-resolver.mjs`; resolve authoritative HA ID/name and ambiguity deterministically. Test Russian variants and misleading multi-room requests.
- [ ] **P0 — Gate B: separate light controls from device status LEDs/auxiliary switches.** Generic `src/decision/area-target-discovery.mjs` currently includes all light entities, which may include indicator LEDs. Require explicit verified classification for room-wide lighting actions.
- [ ] **P0 — Gate B: mixed-domain and unavailable scope.** Whole-room light + switch requests must never silently execute a subset; unknown/unavailable members block pending an explicit partial-execution policy.
- [ ] **P1 — Gate C: isolated end-to-end MCP read tests and fault injection.** No real actuation until explicit approval; cover malformed, paginated, stale, unavailable and incorrectly classified inventory.
- [ ] **P1 — Gate D: staged deployment and rollback.** Running v2 process remains untouched; restart only after review and controlled acceptance tests.
- [ ] **P1 — verify AUTO_SAFE allowlist device IDs.** Inspect `src/policy/config.mjs` against HA state; do not broaden allowlist before audit.
- [ ] **P1 — refresh `docs/PROGRESS.md` and README.** Previous progress report dated 2026-10-07 says 137 tests; most recent full run was 195/195.
- [ ] **P2 — Gate E: reuse shared engine in Assist/voice, no parallel authorization system.**

## Untracked files — unresolved ownership/content
Do not stage, remove, modify or reset until separately reviewed:
- `smoke-living-room-auto-safe.mjs`
- `smoke-living-room-isolation.mjs`
- `src/audit/collector.mjs` and `src/audit/collector-v2.mjs`
- `tatus --short` (literal filename; determine purpose before touching)

## Completion criteria
A task can be marked done only with a file/commit reference, verification evidence and any remaining caveat. Local-only work is marked *not pushed*. Do not imply that passing unit tests proves production safety.
