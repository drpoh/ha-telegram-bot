# V2 Evolution — goals and delivery roadmap

## Goal
Improve the existing working V2's usefulness, reliability, accuracy and security without losing natural-language Gemini agent behavior, HA-MCP tool calling, conversation/device context or existing integrations.

## Principles
- **Reuse First:** existing V2 agent, memory, HA-MCP, Home Assistant, Telegram, systemd and useful proven V3 safety modules.
- **Behavior preservation:** protect working examples (room lights on/off, room follow-ups, sauna history, HA diagnostics).
- **One measurable improvement at a time:** prefer a focused bug/regression fix to a rewrite or new platform.
- **Safe separation:** DEV code/tests and snapshot database isolated; working V2 untouched.
- **Least privilege:** LLM tool choices aren't authorization; review read/write scope before any production change.
- **No silent promotion:** source CI -> isolated validation -> owner-approved live acceptance and rollback -> optional deployment.

## Milestones
1. **Baseline — verified:** matching Git source, offline tests, isolated DB snapshot and no active credentials in DEV. Runtime equivalence not yet proven.
2. **Audit:** map the V2 agent/provider/MCP/history/device memory and record concrete risks or user-facing deficiencies without sensitive logs.
3. **First improvement:** minimal reproducible regression and change, tests and comparison against baseline; prefer protection of logged MCP payloads or tool error handling if verified needed.
4. **Real acceptance:** private owner-controlled read-only Pi verification and performance check; no second Telegram poller.
5. **Approved rollout:** only after explicit approval, with rollback plan for single running V2 service.
6. **Further improvements:** user-requested features prioritized over speculative infrastructure, drawing selectively on V3.

## Definition of done for any improvement
User-visible benefit or security benefit documented; failing-before/passing-after regression where feasible; isolated tests pass; no secrets in source/logs; no double polling; production unchanged until authorized; documentation CURRENT-STATE, TODO, HANDOFF and WORKLOG updated.

## Working cadence
Proceed autonomously with read-only research, DEV code, tests and Markdown documentation whenever tools allow. Ask the owner only for access, authorization or a meaningful blocker. Batch user-run Pi commands and avoid unnecessary repeated full-suite runs. Report verified work, not just intentions.
