# v3 Home AI Agent — Progress

> Living project status for the `feature/v3-home-agent` branch. Update this page after each stable, tested milestone.

## Overall status

**Foundation progress: ~45%**

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
| Policy Engine | 🟡 In progress | 45% | OBSERVE / SUGGEST / AUTO_SAFE / CONFIRM / DENY foundation exists |
| Decision Engine | 🟡 Foundation | 20% | Proposal types exist; full decision flow not yet wired |
| Conversation memory | ✅ Existing | 100% | Reused from v2 |
| Device/semantic memory | 🟡 In progress | 65% | Existing device memory reused; v3 semantic expansion remains |
| Behavioral memory | 🟡 Early | 25% | Learning infrastructure exists; correction learning remains |
| Operational memory | 🟡 Early | 25% | Controlled-device/outcome foundations exist |
| Current HA state context | 🟡 In progress | 40% | Needs fuller integration into v3 context |
| Post-action verification | 🟡 Early | 20% | Needs deterministic verify-after-action pipeline |
| Shadow / Suggest mode | ⬜ Planned | 0% | Next major autonomy stage |
| AUTO_SAFE autonomy | ⬜ Planned | 0% | Enable only after shadow-mode validation |
| Manual-override learning | ⬜ Planned | 0% | Detect quick user reversal as negative feedback |
| Additional history analyzers | ⬜ Planned | 0% | Sauna is the first supported subject |

## Verified live behavior

- End-to-end sauna history question works: LLM → `ai_history_summary` → HA-MCP → analyzer → LLM.
- Real sauna data identified one complete heat from 27.5 °C to 85 °C in about 60.8 minutes.
- A separate warm-sauna reheat was classified independently (~13 minutes).
- The assistant correctly avoids presenting one full cycle as a reliable average.
- Raw `ha_get_history` is not directly exposed as an AI tool.
- History logging was reduced by roughly 220× without changing analysis results.

## Test status

**41 / 41 tests passing**

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

1. Commit and protect the 41/41 history-tool test baseline.
2. Verify a normal non-history HA query does not invoke history.
3. Expand current-state context.
4. Connect Decision Engine proposals to Policy Engine decisions.
5. Add post-action verification.
6. Introduce shadow/suggest mode and collect decision quality data.
7. Add behavioral learning from manual corrections.
8. Enable a very small explicit AUTO_SAFE allowlist only after validation.

## Definition of v3 success

v3 is complete when the assistant can understand natural home requests, combine current state with bounded history and useful memory, make explicit decisions, enforce deterministic safety policy, execute permitted HA actions, verify outcomes, learn from corrections, and remain auditable and testable.

---

Last updated: 2026-10-07
