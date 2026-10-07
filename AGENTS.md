# AGENTS.md — Home Assistant AI Agent

## Mission
Build a reliable conversational Home Assistant agent that can remember useful context, analyze Home Assistant history, and autonomously perform explicitly permitted non-critical actions.

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

## Secrets and runtime data
Never commit .env, API keys, Telegram tokens, private MCP URLs, credentials, personal runtime databases, backups or logs containing secrets. Keep example configuration sanitized.

## Compatibility
Target Node.js 20+ and keep Raspberry Pi-class hardware viable where practical. Heavy services (vector DB/local LLM) must remain optional so the project can later migrate to a stronger server.

## Reference designs
See docs/REFERENCES.md. Borrow architecture intentionally; do not copy code without checking its current license and attribution requirements.
