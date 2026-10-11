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

## 2026-10-08 — Approved gate sequencing and hard release criteria

Owner approved the audit recommendation: **no overall percentage of production readiness**. Report separately test evidence, gate completion, and live acceptance. Gate B remains OPEN even with passing isolated tests; Gate C fault fixtures are not production acceptance.

Gate B may close only after an end-to-end isolated caller chain derives actor/chat/token, original user text, exact action and reviewed policy from trusted sources; demonstrates invalidated/replayed/cancelled/expired confirmations fail closed; validates complete live *read-only* scope and entity identity; rejects dangerous or unknown MCP tools; and produces audit evidence. No AI-supplied authorization flags.

Next Gate C: fault and race analysis in the complete execution chain. Gate D: staged deployment/rollback **after explicit owner approval** and proof that Home Assistant Green is operationally independent of the AI/Raspberry Pi. Gate E: Assist reuses the same engine. No live HA actuation or service changes in Gates A/B.

Scope freeze until Gate B closes: no expanded autonomy or extra integrations. Entity renames, production backups and independent HA runtime acceptance stay tracked as separate safety/deployment prerequisites. See `docs/ADR-HA-INDEPENDENCE.md`.

## 2026-10-08 — Owner-approved channel-neutral engine

Prioritize a shared command envelope and deterministic decision/policy/confirmation engine over Telegram-specific production integration. Telegram transport integration moves to a later adapter milestone; Atom Echo/ESPHome Assist and similar satellites become first-class planned channels. Each adapter must bind original text, device/channel provenance and any actually verified user identity, never promote speaker inference or device location to authenticated user identity. Voice/device-only inputs cannot authorize high-risk or identity-required actions. Safe low-risk candidates still require every independent policy/scope/precondition gate. Voice confirmations need their own reviewed protocol, not Telegram token assumptions. No HA actuation or production deployment until explicit owner approval; HA Green must remain independent of agent availability.

## 2026-10-11 — Current verified development gates
- Practical MVP: Telegram confirmed turn_off and turn_on for exactly `light.tambur_svet_l1`; this is **not** whole-home or voice acceptance.
- Gate B remains open: authoritative complete live registry, trusted identity and operator-reviewed policy/source restriction not independently accepted for wider scopes.
- Gate C isolated fault and concurrency tests have advanced through GitHub PR #3–#4 (GitHub CI 161 files / 628 assertions, zero failures). Cooperative AbortSignal and per-process in-flight guards are **not** verified network cancellation, durable replay protection, or release approval.
- Stage is a source-only loopback mock, not a deployed isolated environment. Gate E Assist/Atom Echo must reuse shared policy and trusted identity; no independent voice authority.
- GitHub CI is development evidence, not ARMv7 Pi validation or authorization for real HA actions. Maintain Home Assistant Green autonomy and immutable active pilot scope.
