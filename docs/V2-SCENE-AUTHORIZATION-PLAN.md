# Safe V2 local-scene dispatcher — stage 1

Owner approval to develop DEV only, 2026-10-15. Real V2 conversation shows scene CRUD worked historically, but current verified running commit blocks capture/run/delete. Preserve existing scene tables and records without touching the live process.

This PR adds only a **pure, not-yet-wired** authorization function and focused tests. It has no external side effects and cannot unlock the active scene dispatcher. Reuse stored scene code; do not simply restore the legacy unguarded dispatcher.

Required wiring for next stage:
- Carry trusted `source` from agent to scene dispatch; never ask model to set it.
- Independently resolve trusted area and exact scene identity; reject ambiguous/unknown targets.
- Capture: verify actual Home Assistant room entity list, limit/hidden/domain checks, read states only, then write local scene into isolated DEV database.
- Run: resolve known scene; requery live area membership and compare every target before **any** device action. Verify each action; report partial failure. Do not use untrusted model-supplied entity lists.
- Delete: delete only scoped local scene, not HA `scene.*`. Explicit scene name or reliable scoped clarification needed.
- Lock down autonomous scene writes; route read-only list without new barriers.
- Never run tests against the production SQLite snapshot when mutation can occur. The isolated test runner creates throwaway SQLite databases.
- Preserve owner-established scene data format and all existing V2 user-facing behavior.
- Progress bar for testing, quick targeted tests in iteration, full suite only before a meaningful merge. Do not deploy to running V2.

Validation: code added in GitHub; Pi tests not executed yet.

## Stage 2 added (2026-10-15)
A pure read-only `discoverSceneAreaEntities` helper now verifies complete HA area membership across four supported domains, rejects truncation/invalid payloads/cross-area entities, and uses injected tool calls. Added focused offline regression tests. This is not yet wired into the runtime scene dispatcher and cannot control devices. Additional validation required: real HA search response shape and strict entity-area identity; direct scene manager still lacks per-action authorization and complete execution verification. **Do not remove the current scene mutation block until end-to-end guarded dispatch is ready.**

## Area-binding guard added (2026-10-15)
The pure authorization function now requires that its trusted `area.requestedArea` was bound by the dispatcher to the exact requested room string, and explicitly rejects a mismatched AI argument (e.g. user/scoped living room versus model-proposed kitchen). The dispatcher has **not yet been wired**, and will be responsible for independently resolving/validating and supplying this field; this value must never be copied blindly from model arguments without matching the original user request. Updated focused fixture to cover rejection. No runtime or production behavior changed. Tests on latest branch remain pending; do not merge/deploy until execution-path and safety checks are complete.

## Stage 3 — read-only plan composition
Added `src/scenes/safe-scene-plan.mjs` and `test/safe-scene-plan.test.mjs`. The helper composes trusted source/area/scene checks with fresh `ha_search` inventory for proposed scene runs; it returns a decision, never executes services or mutates scene tables. Unknown/cross-room proposals are rejected before reads, truncated inventory rejects. This is intentionally **not yet wired to the agent**: dispatcher must safely derive trusted requested area independently and enforce action policy plus verification. Latest focused tests pending.
