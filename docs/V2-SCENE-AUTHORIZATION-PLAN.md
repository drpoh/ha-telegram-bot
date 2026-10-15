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
