# Home Agent v3 — strategy and acceptance gates

## CURRENT STRATEGY — owner decision 2026-10-14: V2 evolution, V3 archived as candidate R&D

**V2 stays the product.** Its existing conversational AI tool-calling + context + HA-MCP behavior already answers real household questions well. The previous goal of delivering a separate V3 replacement, including the 2026-10-14 V2-parity-first plan below, is **superseded**. Do not rebuild features that V2 already provides.

**Success criterion:** a change to V2 demonstrably improves accuracy, convenience, reliability, privacy or safety on actual user scenarios, with no regression or break in running service.

**Delivery roadmap:**
1. Establish V2 baseline using existing example conversations: room light on/off + follow-up context, sauna heating duration, HA errors/warnings. Preserve current runtime and only collect privacy-safe aggregates.
2. Identify one user-visible weakness or concrete risk per iteration. Prefer a small existing V2 module improvement over a new stack.
3. Reuse vetted V3 building blocks **selectively**: read-only registry freshness, safer diagnostics, typed tool validation, redacted logging and deterministic write-policy checks when needed. Avoid migrating the V2 agent into a replacement V3.
4. Test in isolated DEV with offline fixtures; prove Pi/runtime read-only behavior where appropriate; review secrets, model-selected tools, rate limits, action safety and rollback.
5. Promote to the **same single V2 service** only by separate owner-approved deployment/rollback; never run two Telegram pollers.

**Stop / defer:** V3 feature parity as an independent milestone, general Gate B infrastructure for its own sake, nonessential registry watcher, speculative multi-agent services. Keep existing open PRs #188 and #190 for reassessment (do not merge blindly). Retain historical architecture and tests as research, not a promise of deployment.

**Security:** V2's unrestricted model-selected tool invocation is an improvement candidate, not permission to copy it into production changes without review. Maintain HA Green independence; no unattended critical actions, no untrusted tool authorization, no secrets in logs, no new public network listeners.


## 2026-10-14 — OWNER-APPROVED STRATEGY: V2 agent parity first

**Primary goal:** deliver a genuinely useful Russian-language Home Assistant assistant, preserving and improving the capabilities proven by the running V2. Use V2's existing agent/tool-calling/context implementation as a reusable reference, not a reason to bypass V3 safety. Stop optimizing isolated infrastructure while basic home questions are missing.

**Target pipeline:** Telegram/Assist -> conversation context + device memory -> AI plans/selects typed tools -> deterministic capability/policy gate -> HA-MCP (live state/history/diagnostics; actions only after authorization) -> verify/result -> short Russian answer -> bounded memory. The existing five-registry WebSocket catalog supplies fresh names/relationships, NOT live device states or authority.

**Functional parity gates, in priority order:**
1. Read-only: "Что включено на кухне?", "Какой свет выключен в гостиной?", and cross-turn "А какой выключен?" preserving the last room and device class. Resolve actual area membership and inspect authoritative current states; distinguish unavailable/unknown and physical devices from HA entities. No guesses.
2. Read-only: current sauna temperature and historical heating duration **only if supported by actual HA history/statistics**, clearly distinguishing events and aggregates; system repairs/add-on warnings with attributed sources.
3. Shared Russian dialogue agent: adapt V2 `src/ai/agent.mjs`, prompt, conversation/device memory and existing HA-MCP client/provider router selectively; bounded steps, timeout, tool schema, tool error handling, privacy-safe logs and explicit fallbacks. **Never directly route model-selected write calls to the legacy unrestricted executor.**
4. Controlled actions: retain immutable V3 envelope, exact actor/target/provenance, fresh scope/preconditions, policy, explicit confirmation where required, act/verify/audit. Start with existing single-light approved pilot; no broad room actions or expanded auto_safe without Gates B/C/D and owner consent.
5. Extend Telegram V3 using the **existing authorized route, not a second poller**, then Assist/ESPHome via the same engine after identity/voice risk review.

**Reuse First:** use installed HA-MCP, Home Assistant, existing provider router, systemd, Telegram infrastructure, ESPHome and HA Assist. Adapt V2 conversational capabilities; do not reproduce its permissive write path, raw MCP response logging or unreviewed persistence. Do not build a competing HA state store or custom MCP transport.

**Definition of Done for MVP parity:** reproducible offline tests for each read-only example (including unavailable, ambiguous, renamed rooms, missing data, second-turn context, MCP failures), independently verified Pi3 runtime read-only queries, and reviewed end-to-end Telegram acceptance without interrupting V2. Comparisons must use actual identical requests; CI-only claims are not live acceptance. Home Assistant must keep working if AI is unavailable. Prior Gating A–E continues to govern write/voice/production release; functional read-only parity is a distinct delivery milestone.

**Priority rule:** freeze optional catalog/infrastructure enhancements unless required for one of these vertical slices, safety, or an existing approved acceptance check. In-flight PRs may complete if narrow/low-risk; no new general architecture refactor until MVP parity is demonstrated.


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

## 2026-10-12 — Current delivery strategy
- Prioritize a useful limited home assistant, not custom infrastructure. Reuse HA Assist, ESPHome, HA-MCP, Node/systemd and existing libraries; retain Home Assistant Green independence.
- Owner confirmed successful CI-gated candidate preparation for b1122bd, not production promotion or stage execution.
- NEXT: offline isolated STAGE smoke for the immutable candidate; no live HA, Telegram poller or production secrets. Then independently validate Pi ARMv7, narrowed read-only real-world functionality and explicit approval/rollback before release. General Gate B, live Gate C, recovery Gate D and voice Gate E remain open.
