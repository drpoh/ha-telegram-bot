# TODO — Open work register

Updated: 2026-10-08. Branch: `feature/v3-home-agent`. Latest pushed checkpoint before this session: `8374ec0`.

## Working agreement
At session start: read `docs/home-agent-v3-strategy.md`, this TODO, `docs/WORKLOG.md`, current `git status`, and the most recent tests. Choose the next task from confirmed blockers.
At session end: record completed work, failed/unfinished steps, test results, commit/remote status, and next exact action. Never classify an unknown file as safe to delete without inspecting it.
`docs/PROGRESS.md` is a broader milestone summary, not a substitute for this current queue.

## Open tasks
- [ ] **P0 — Gate B: connect trusted area evidence to the running agent path.** A fail-closed gate has been wired into `src/ai/agent.mjs` for explicit «весь свет в ...» requests. Broaden intent coverage and test the full agent/confirmation path, including mixed-domain and paraphrased group commands, before deployment. The pure Decision Engine areaEvidence path remains separate; consolidate later.
- [ ] **P0 — Gate B: prevent unsafe area resolution.** Added pure strict resolver and read-only HA-backed resolver, tested on real HA. Live strict identity is now chained to reviewed local config and inventory in an isolated read-only module. Next: connect approved scope to agent while preserving all policies. Existing permissive resolver used by scenes remains unchanged and requires migration review.
- [x] **P0 — Gate B: refuse unclassified `light.*` entities.** Generic read-only discovery now requires an explicit, complete partition of light IDs into selected and excluded classes; unclassified or overlapping IDs fail closed. Wiring a trusted per-installation classification source remains open below.
- [ ] **P0 — Gate B: trusted lighting classification source.** Live HA read-only inventory obtained for sauna, kitchen and corridor, with pending review saved locally in ignored `data/lighting-inventory-review-2026-10-08.json`. Read-only chained discovery now supports approved local config, but actual home mapping remains unapproved. Review undecided switches and lights; only then create approved local config. No room-wide actuation until reviewed.
- [ ] **P0 — Gate B: mixed-domain and unavailable scope.** Whole-room light + switch requests must never silently execute a subset; unknown/unavailable members block pending an explicit partial-execution policy.
- [ ] **P1 — Gate C: isolated end-to-end MCP read tests and fault injection.** No real actuation until explicit approval; cover malformed, paginated, stale, unavailable and incorrectly classified inventory.
- [ ] **P1 — Gate D: staged deployment and rollback.** Running v2 process remains untouched; restart only after review and controlled acceptance tests.
- [ ] **P1 — verify AUTO_SAFE allowlist device IDs.** Inspect `src/policy/config.mjs` against HA state; do not broaden allowlist before audit.
- [ ] **P1 — refresh README and long-term milestone details.** Historical totals were refreshed in PROGRESS; latest full baseline before this checkpoint is 198/198.
- [ ] **P2 — Gate E: reuse shared engine in Assist/voice, no parallel authorization system.**

## Recovered files and review

- [x] Move live-actuating smoke scripts into `scripts/manual/`. They require explicit approval and isolation before execution.
- [x] Archive accidental terminal diff locally in ignored `data/local-archive/`; not part of Git.
- [ ] Review standalone audit collectors `src/audit/collector.mjs` and `src/audit/collector-v2.mjs` for compatible read-only APIs and coverage before deploying or scheduling them. Source files preserved.
- [ ] Review manual smoke scripts end-to-end and validate their restore behavior in controlled conditions. A dual opt-in guard is now present, but the scripts have not been live-tested.

## Completion criteria
A task can be marked done only with a file/commit reference, verification evidence and any remaining caveat. Local-only work is marked *not pushed*. Do not imply that passing unit tests proves production safety.
