# v3 Home AI Agent — Progress

> Living project status for the `feature/v3-home-agent` branch. Update this page after each stable, tested milestone.

## Overall status

**Foundation progress: ~60%**

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
| Behavioral memory | 🟡 Early | 25% | Learning infrastructure exists; correction learning remains |
| Operational memory | 🟡 Early | 25% | Controlled-device/outcome foundations exist |
| Current HA state context | 🟡 In progress | 65% | Known-device read requests prefetch one bounded live state into v3 context; broader relevant-state context remains |
| Post-action verification | 🟡 In progress | 75% | Deterministic single-entity light/switch turn_on/turn_off verification is wired with bounded polling and pending/failed states |
| Shadow / Suggest mode | 🟡 In progress | 40% | State-changing HA service proposals are evaluated/logged in shadow; v2 user-command execution is unchanged |
| AUTO_SAFE autonomy | 🟡 In progress | 55% | Strict kitchen/living-room allowlist wired; live kitchen autonomous actuation and restore verified |
| Manual-override learning | ⬜ Planned | 0% | Detect quick user reversal as negative feedback |
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
- State-changing `ha_call_service` proposals now pass through a shadow evaluator before the existing v2 execution path; shadow records what policy would decide but never executes an action itself.
- Live read-only regression produced one bounded `ha_get_state`, zero service calls and zero shadow proposals.
- Runtime action source is explicit: current user requests default to `user_explicit`; future proactive calls must opt into `autonomous`.
- Live autonomous regression proposed `light.turn_off` for the kitchen, produced one shadow decision and one policy block, and made zero `ha_call_service` calls; the device was not changed.
- Strict AUTO_SAFE allowlist now permits only `turn_on` / `turn_off` for kitchen `light.kukhnia_svet` and living-room lights `light.liustra`, `light.podsvetka`, `light.podsvetka_2`; bathroom/sauna are back to default `suggest`, and unlisted services such as `toggle` are blocked.
- Live AUTO_SAFE smoke test verified the kitchen end to end: initial `on` → autonomous `turn_off` → verified `off` → restored `on` → verified `on`.
- CONFIRM pending actions are scoped to user+chat, carry an exact one-time token, expire after TTL, and execute the stored tool name/arguments rather than regenerated LLM output.
- Explicit user commands remain backward-compatible for normal `suggest` policy, but explicit `confirm` and `deny` policies now stop execution before the HA tool call.
- Post-action verifier performs bounded state reads without retrying the state-changing service; `confirmed`, `pending`, and `failed` are distinguished.
- Live verifier test on `light.kukhnia_svet` succeeded: `off` → `on` confirmed in one read → restored `off` confirmed in one read. The verifier also handled an HA-MCP service warning where the subsequent state read already showed the correct restored state.

## Test status

**83 / 83 tests passing**

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

1. Persist pending confirmations so a bot/process restart cannot lose a required approval.
2. Extend verification to multi-entity actions and additional deterministic service types.
3. Record action/verification outcomes in operational memory.
4. Expand current-state context only where it improves decisions without excessive HA reads.
5. Add behavioral learning from manual corrections and quick reversals.
6. Continue shadow/suggest evaluation before expanding the existing AUTO_SAFE allowlist.

## Definition of v3 success

v3 is complete when the assistant can understand natural home requests, combine current state with bounded history and useful memory, make explicit decisions, enforce deterministic safety policy, execute permitted HA actions, verify outcomes, learn from corrections, and remain auditable and testable.

---

Last updated: 2026-10-07
