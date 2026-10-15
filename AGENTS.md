# AGENTS.md — Home Assistant AI Agent

> **CURRENT V2 DEVELOPMENT RULE (2026-10-15):** The owner chose to evolve the running V2 rather than replace it with V3. The **current** status is [docs/CURRENT-STATE.md](docs/CURRENT-STATE.md), next steps [docs/development/HANDOFF.md](docs/development/HANDOFF.md), active roadmap [docs/ROADMAP.md](docs/ROADMAP.md). Existing V3-focused instructions below are historical and may not override this product decision. Only modify isolated `/home/drpoh/projects/rs-home-ai-v2-running-copy`; never edit/restart running `/home/drpoh/ha-telegram-bot` or activate a second Telegram poller. The local database snapshot and any secrets stay untracked. Require offline tests, Git review and explicit owner approval for any production rollout.


## Mission
Build a reliable conversational Home Assistant agent that can remember useful context, analyze Home Assistant history, and autonomously perform explicitly permitted non-critical actions.

## Cross-chat continuation
At the beginning of every new chat, first read `docs/CHAT-HANDOFF.md`, then verify the live Pi Git status, current TODO/WORKLOG and GitHub PRs. Do not treat old chat memories or historical counters as current evidence. Update the handoff after stable milestones.

## Source of truth
GitHub is the source of truth for code and documentation. Never rely on chat/model memory as the only project state. Before substantial changes, inspect the current branch and relevant files.

## Architecture rules
- Home Assistant remains the authority for device state and automation.
- HA-MCP is the primary control/read interface.
- LLM output is untrusted. All autonomous actions must pass a deterministic Policy Engine.
- Separate conversation, home/device, behavioral and operational memory.
- Do not send raw large Recorder history to an LLM. Aggregate/filter it first.
- Every action should follow Observe -> Reason -> Policy -> Act -> Verify -> Learn.
- User corrections/overrides are learning signals, never proof that a new autonomous rule is safe.
- Prefer small replaceable interfaces over coupling to one AI provider, vector DB or hardware platform.

## Autonomy
Default to least privilege:
- observe: read only
- suggest: propose an action
- auto_safe: autonomous action only when explicitly allowed
- confirm: require user confirmation
- deny: never execute

Locks, alarm/security, destructive configuration changes and other critical operations must never become autonomous merely because an LLM requests them.

## Development workflow
1. Read relevant implementation and docs.
2. Make the smallest coherent change.
3. Run syntax checks and tests.
4. Do not weaken existing safety/tests to make a change pass.
5. Update documentation when behavior or architecture changes.
6. After a stable tested milestone, commit/push it to GitHub.

## Accelerated vertical-slice workflow (approved 2026-10-09)
- Prioritize complete, independently tested Gate B command-provenance -> immutable action -> reviewed policy -> confirmation -> authoritative scope -> deny/audit chain over isolated protocol micro-modules.
- Prefer maintained upstream Home Assistant / MCP libraries for commodity transport. Review version, license, Node 20/ARMv7 support, trust boundaries and rollback before adding dependencies. Never assume a library grants policy authorization.
- Fast focused tests during edits; integration tests for complete slices; full isolated regression before pushing each stable milestone or merging. GitHub Actions may offload heavy CI after workflow/security review, but final Pi compatibility remains mandatory.
- No live HA access, new credentials, stage/prod wiring, agent restart, automation, or real actuation without the existing explicit approval and gate criteria. Preserve all previous fail-closed invariants.
- Keep TODO, WORKLOG and CHAT-HANDOFF synchronized at each stable milestone. Do not mark Gate B complete because an offline adapter passes.

## Secrets and runtime data
Never commit .env, API keys, Telegram tokens, private MCP URLs, credentials, personal runtime databases, backups or logs containing secrets. Keep example configuration sanitized.

## Compatibility
Target Node.js 20+ and keep Raspberry Pi-class hardware viable where practical. Heavy services (vector DB/local LLM) must remain optional so the project can later migrate to a stronger server.

## Reference designs
See docs/REFERENCES.md. Borrow architecture intentionally; do not copy code without checking its current license and attribution requirements.
