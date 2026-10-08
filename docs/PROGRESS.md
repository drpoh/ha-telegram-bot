# v3 Home AI Agent — Progress

> Living project status for the `feature/v3-home-agent` branch. Update this page after each stable, tested milestone.

## Overall status

**Foundation progress: ~82%**

The project is evolving the working v2 bot into a safe, context-aware Home AI Agent without rebuilding the existing system.

```text
User
  → Conversation AI
  → Context Builder
  → Memory + History + Current HA State
  → Decision Engine
  → Policy Engine
  → HA-MCP
  → Home Assistant
  → Verify
  → Learn / Remember
```

Target agent loop:

```text
OBSERVE → REASON → DECIDE → POLICY CHECK → ACT → VERIFY → REMEMBER
```

## Milestones

| Area | Status | Progress | Notes |
|---|---|---:|---|
| v3 architecture and documentation | ✅ Done | 100% | v2 preserved; v3 developed on a separate branch |
| Context Builder | 🟡 In progress | 70% | Bounded context and history-fact rendering implemented |
| Home Assistant history adapter | ✅ Done | 100% | Bounded/paginated history access via HA-MCP |
| Sauna History Analyzer | ✅ Done | 100% | Full heats and reheats classified separately |
| Safe AI history tool | ✅ Done | 100% | AI uses `ai_history_summary`; raw history is not exposed directly |
| MCP history logging | ✅ Done | 100% | Large history logs reduced from ~39,000 to 178 lines in live test |
| Policy Engine | 🟡 In progress | 85% | Explicit commands preserve v2 by default, while explicit confirm/deny policies now block before execution; autonomous actions remain policy-enforced |
| Decision Engine | 🟡 In progress | 80% | Deterministic proposal → policy → source enforcement is wired; one-time scoped confirmation flow is implemented |
| Conversation memory | ✅ Existing | 100% | Reused from v2 |
| Device/semantic memory | 🟡 In progress | 65% | Existing device memory reused; v3 semantic expansion remains |
| Behavioral memory | 🟡 In progress | 80% | Persistent correction learning, service-specific 30-day downgrade signals, truthful per-service audit visibility and selective operator reset implemented |
| Operational memory | 🟡 In progress | 70% | Compact bounded action outcomes persist in SQLite, include per-entity verification, and expose only bounded entity-relevant context |
| Current HA state context | 🟡 In progress | 70% | Known-device state and sensor-value requests prefetch one bounded live state into v3 context; control requests still avoid extra reads |
| Post-action verification | 🟡 In progress | 90% | Deterministic on/off verification covers light, switch, input_boolean, fan and media_player with bounded single/multi-entity polling and pending/failed states |
| Shadow / Suggest mode | 🟡 In progress | 40% | State-changing HA service proposals are evaluated/logged in shadow; v2 user-command execution is unchanged |
| AUTO_SAFE autonomy | 🟡 In progress | 55% | Strict kitchen/living-room allowlist wired; live kitchen autonomous actuation and restore verified |
| Manual-override learning | 🟡 In progress | 80% | Quick explicit reversals of autonomous actions are persisted as negative feedback and can conservatively downgrade matching autonomy |
| Context freshness + preconditions | 🟢 Implemented | 90% | Freshness plus target/context gates are implemented; trusted contextual preconditions come only from deterministic policy config, never from LLM proposal metadata |
| Risk classes | 🟢 Implemented | 90% | Generic R0-R4 domain/service classification is independent from autonomy; unknown state-changing domains fail conservatively and deployment config may override risk |
| Idempotency + autonomy budget | 🟢 Implemented | 85% | Stable action fingerprints, 30s duplicate guard, 10s per-entity cooldown and 6/min global autonomous budget; reservation occurs before ACT so uncertain MCP outcomes cannot auto-retry |
| Additional history analyzers | ⬜ Planned | 0% | Sauna is the first supported subject |

## Verified live behavior

- End-to-end sauna history question works: LLM → `ai_history_summary` → HA-MCP → analyzer → LLM.
- Real sauna data identified one complete heat from 27.5 °C to 85 °C in about 60.8 minutes.
- A separate warm-sauna reheat was classified independently (~13 minutes).
- The assistant correctly avoids presenting one full cycle as a reliable average.
- Raw `ha_get_history` is not directly exposed as an AI tool.
- History logging was reduced by roughly 220× without changing analysis results.
- A known-device state question prefetches exactly one live `ha_get_state`, performs no search/history call, and reuses that state in the AI context without a duplicate state request.
- Control commands are excluded from state prefetch so normal actions do not gain an unnecessary read call.
- Decision Engine deterministically maps proposals through Policy Engine to observe/suggest/approve/confirm/deny outcomes; it has no MCP execution access.
- State-changing `ha_call_service` proposals now pass through a shadow evaluator before the existing v2 execution path; shadow records what policy would decide but never executes an action itself. Persistent decision audit entries now link authorized decisions to execution and post-action verification status.
- Live read-only regression produced one bounded `ha_get_state`, zero service calls and zero shadow proposals.
- Runtime action source is explicit: current user requests default to `user_explicit`; future proactive calls must opt into `autonomous`.
- Live autonomous regression proposed `light.turn_off` for the kitchen, produced one shadow decision and one policy block, and made zero `ha_call_service` calls; the device was not changed.
- Strict AUTO_SAFE allowlist now permits only `turn_on` / `turn_off` for kitchen `light.kukhnia_svet` and living-room lights `light.liustra`, `light.podsvetka`, `light.podsvetka_2`; bathroom/sauna are back to default `suggest`, and unlisted services such as `toggle` are blocked.
- Live AUTO_SAFE smoke test verified the kitchen end to end: initial `on` → autonomous `turn_off` → verified `off` → restored `on` → verified `on`.
- CONFIRM pending actions are scoped to user+chat, carry an exact one-time token, expire after TTL, execute the stored tool name/arguments rather than regenerated LLM output, and now survive bot restarts through SQLite persistence.
- Operational memory stores a bounded last-50 compact action ledger with accepted/verification/expected/observed state fields and excludes raw MCP responses.
- Multi-entity light/switch actions now use one service call followed by independent bounded verification for every entity; one stale entity makes the aggregate result pending without retrying the action.
- Operational context is exposed to AI only for a precisely resolved entity and is limited to its 3 most recent action outcomes.
- Behavioral correction learning observes quick USER_EXPLICIT reversals only after an AUTONOMOUS action has a confirmed verifier result; pending/failed/unsupported autonomous outcomes do not seed correction learning. Corrections within 2 minutes persist as bounded history.
- Repeated corrections now conservatively downgrade autonomous AUTO_SAFE execution to SUGGEST for the affected entity/service using a 30-day evidence horizon. Learning can only reduce autonomy; it never grants new permissions, and explicit user commands are unaffected.
- Behavioral audit visibility exposes per-entity correction counts, latest reversal pair, and active autonomy reduction through the read-only health status/API.
- Operator commands `/behavior` and `/behavior_reset <entity_id>` inspect and selectively reset behavioral correction state without clearing unrelated memory.
- Explicit user commands remain backward-compatible for normal `suggest` policy, but explicit `confirm` and `deny` policies now stop execution before the HA tool call.
- Post-action verifier performs bounded state reads without retrying the state-changing service; `confirmed`, `pending`, and `failed` are distinguished.
- Autonomous state-changing calls now pass a deterministic deduplication/cooldown/rate budget before ACT; reservations occur before MCP execution so an uncertain timeout cannot immediately trigger a duplicate service call.
- Structured `TRACE` logging exposes factual runtime stages (policy, risk, precondition, budget, ACT and verification) while explicitly excluding prompts, raw evidence and MCP payloads.
- Decision Audit now marks thrown execution errors as `failed` instead of leaving authorized decisions indefinitely `pending`.
- Live verifier test on `light.kukhnia_svet` succeeded: `off` → `on` confirmed in one read → restored `off` confirmed in one read. The verifier also handled an HA-MCP service warning where the subsequent state read already showed the correct restored state.

## Test status

**Historical checkpoint: 137 / 137. Latest verified full run: 223 / 223 (2026-10-08, read-only verified area lighting chain).**

Current automated coverage includes:

- context bounds and history rendering
- generic history analysis
- sauna cycle detection and classification
- history gaps and reheats
- safe AI history tool routing
- rejection of unsupported history subjects before HA access
- learning/session behavior
- controlled memory
- entity resolution
- scene safety and domain allowlists

## Autonomy policy

The LLM is not the safety boundary.

| Level | Meaning |
|---|---|
| OBSERVE | Read state only |
| SUGGEST | Recommend an action but do not execute |
| AUTO_SAFE | Execute only explicitly allowlisted low-risk actions |
| CONFIRM | Require user confirmation |
| DENY | Never execute |

Likely future AUTO_SAFE candidates: selected lights, WLED, media/volume, timers and explicitly approved switches.

Security-sensitive or high-impact actions remain confirmation/deny candidates.

## Next milestones

1. Implement context freshness and deterministic preconditions for state-changing autonomous actions.
2. Complete R0-R4 risk classification independently from autonomy permissions; generic domain/service defaults are implemented with conservative unknown-device handling and configurable overrides.
3. Add action idempotency/deduplication and deterministic autonomy rate/cooldown budgets.
4. Continue shadow/suggest evaluation and verified decision audit before expanding the existing AUTO_SAFE allowlist.
5. Extend verification only where service outcomes can be modeled deterministically without unsafe assumptions.
6. Productize configuration before public release: move maintainer-specific entity IDs, room mappings and preferences out of tracked core defaults; ship generic examples/schema plus per-installation local configuration and migration guidance.

## Post-v3 sustainability and monetization

Monetization is intentionally deferred until v3 is stable, documented and ready for a public release. It must not influence runtime safety policy, autonomy decisions or core architecture.

After release readiness:
- prepare a GitHub Sponsors profile and repository sponsor button via `.github/FUNDING.yml`
- evaluate optional complementary funding platforms supported by GitHub funding links
- define transparent one-time/monthly sponsorship tiers and benefits that do not weaken the open-source core
- improve public README, installation guide, screenshots/examples, release notes and contribution documentation before promoting sponsorship
- document funding transparently and keep sponsorship optional; normal Home Assistant functionality must not depend on sponsorship
- review licensing, third-party licenses, privacy/security documentation and applicable tax/accounting requirements before accepting project income

## Definition of v3 success

v3 is complete when the assistant can understand natural home requests and make bounded autonomous household decisions from sufficiently fresh current state, history and memory. Every state-changing action must pass deterministic risk, policy and precondition checks, be protected against duplicate execution and autonomy-budget violations, execute only through HA-MCP, be verified from Home Assistant afterward, and remain fully auditable. Learning may conservatively reduce autonomy from verified outcomes and corrections, but may never grant new permissions without explicit operator approval.

---

Last broader status review: 2026-10-07. See TODO.md and WORKLOG.md for current 2026-10-08 work.
