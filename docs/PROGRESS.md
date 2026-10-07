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
| Behavioral memory | 🟡 In progress | 70% | Persistent correction learning, service-specific 30-day downgrade signals, audit visibility and selective operator reset implemented |
| Operational memory | 🟡 In progress | 70% | Compact bounded action outcomes persist in SQLite, include per-entity verification, and expose only bounded entity-relevant context |
| Current HA state context | 🟡 In progress | 70% | Known-device state and sensor-value requests prefetch one bounded live state into v3 context; control requests still avoid extra reads |
| Post-action verification | 🟡 In progress | 90% | Deterministic on/off verification covers light, switch, input_boolean, fan and media_player with bounded single/multi-entity polling and pending/failed states |
| Shadow / Suggest mode | 🟡 In progress | 40% | State-changing HA service proposals are evaluated/logged in shadow; v2 user-command execution is unchanged |
| AUTO_SAFE autonomy | 🟡 In progress | 55% | Strict kitchen/living-room allowlist wired; live kitchen autonomous actuation and restore verified |
| Manual-override learning | 🟡 In progress | 80% | Quick explicit reversals of autonomous actions are persisted as negative feedback and can conservatively downgrade matching autonomy |
| Context freshness + preconditions | 🟡 In progress | 60% | Freshness model now classifies live/recent/stale/unknown; autonomous deterministic on/off actions re-read every target immediately before ACT and record live observation evidence |
| Risk classes | ⬜ Planned | 0% | Add R0-R4 impact classification independently from autonomy level |
| Idempotency + autonomy budget | ⬜ Planned | 0% | Deduplicate logical actions and bound autonomous rate/cooldowns |
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
- Live verifier test on `light.kukhnia_svet` succeeded: `off` → `on` confirmed in one read → restored `off` confirmed in one read. The verifier also handled an HA-MCP service warning where the subsequent state read already showed the correct restored state.

## Test status

**116 / 116 tests passing**

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
2. Add R0-R4 risk classification independently from autonomy permissions.
3. Add action idempotency/deduplication and deterministic autonomy rate/cooldown budgets.
4. Continue shadow/suggest evaluation and verified decision audit before expanding the existing AUTO_SAFE allowlist.
5. Extend verification only where service outcomes can be modeled deterministically without unsafe assumptions.

## Definition of v3 success

v3 is complete when the assistant can understand natural home requests and make bounded autonomous household decisions from sufficiently fresh current state, history and memory. Every state-changing action must pass deterministic risk, policy and precondition checks, be protected against duplicate execution and autonomy-budget violations, execute only through HA-MCP, be verified from Home Assistant afterward, and remain fully auditable. Learning may conservatively reduce autonomy from verified outcomes and corrections, but may never grant new permissions without explicit operator approval.

---

Last updated: 2026-10-07
