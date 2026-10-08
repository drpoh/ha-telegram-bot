# Home Agent v3 — strategy and acceptance gates

Status: active development on `feature/v3-home-agent`. Keep the running v2 service available.

## Architecture
Telegram/Assist → AI interpretation → resolved entity/area scope → policy and authorization → freshness/preconditions → HA-MCP action → state verification → audit/learning.

## Non-negotiable safety invariants
1. A model-selected entity, area, nickname, or tool argument is not proof of room membership.
2. Resolve HA area IDs/names from live authoritative HA metadata. Unresolved/ambiguous areas fail closed.
3. Enumerate a complete, non-paginated inventory; reject missing, duplicate, cross-area, malformed and unverifiable members.
4. Distinguish lights from auxiliary switches; include a switch as a light ONLY when explicitly configured and independently verified.
5. An unavailable/unknown target never enters an action batch. No silent partial execution of a room-wide request.
6. Read-only discovery cannot grant policy authorization. User intent, request scope, source policy, autonomy budget and preconditions remain separate independent gates.
7. Never execute a second unapproved action when verification is pending, failed or contradictory.
8. Untrusted AI output never modifies allowlists, area mappings or policy.
9. Changes require tests, review and GitHub sync before service deployment. Preserve existing untracked work.

## Milestones and gates
- Gate A: document invariants and build isolated read-only generic area discovery. Unit tests for complete/partial results, wrong area, mixed types, duplicates, unavailable states and stale data.
- Gate B: integrate scope discovery into decision policy without bypassing any current controls. Scenario tests cover simple, mixed, ambiguous, plural and maliciously widened requests.
- Gate C: isolated end-to-end MCP read tests and controlled execution tests with explicit consent; verify service response and final state.
- Gate D: staged Telegram deployment with rollback and monitoring. Only afterwards expand auto_safe allowlists.
- Gate E: reuse same engine for voice/Assist.

## Current issues
- Existing special-case bathroom guard is narrow; must not become the model for each room.
- Some configured auto_safe entity IDs may be outdated; independently verify them before allowing autonomous actions.
- The current process may load older code until restarted.
- Existing area-resolver substring matching is useful for convenience but cannot alone authorize a specific room.
- Project README does not yet document this roadmap.

## Rollout
Do not restart production or actuate Home Assistant during Gates A/B. Keep all new generic discovery behind a read-only API until integration tests pass.
