# AGENTS.md — Home Assistant AI Agent

## Mission
Build a reliable conversational Home Assistant agent that can remember useful context, analyze Home Assistant history, and autonomously perform explicitly permitted non-critical actions.

## Cross-chat continuation
At the beginning of every new chat, first read `docs/CHAT-HANDOFF.md`, then verify the live Pi Git status, current TODO/WORKLOG and GitHub PRs. Do not treat old chat memories or historical counters as current evidence. Update the handoff after stable milestones.

## Raspberry Pi workspace ownership — effective 2026-10-10
- **ONLY canonical development checkout:** `/home/drpoh/projects/rs-home-ai-dev`, branch `feature/v3-home-agent`. Perform source edits, tests, documentation, commits and GitHub pushes here.
- `/home/drpoh/ha-telegram-bot` is the **live v2 system-service directory**; `/home/drpoh/rs-home-ai-v3` is the **live V3 pilot user-service directory**. They are separately versioned checkouts of the same GitHub remote. Inspect them read-only, NEVER auto-pull/rebase/reset, overwrite, delete, move, symlink, or `npm install` in them.
- Treat `vinted-sales-agent`, `ha-backups`, app state, tokens, live unit files and Home Assistant Green as independently managed; never reorganize or inspect secrets merely to tidy folders.
- `dev` is the canonical source checkout with an installed pull-only 6-hour CI-gated candidate timer (owner-confirmed on 2026-10-12); `stage` remains offline/mock only, and production is a separately pinned release. Automatic candidate packaging NEVER authorizes activation. Distinct environment manifests are planning evidence only, not credentials or authority.
- When a new chat begins, inspect Git state in dev first and compare runtime Git state read-only. Read `docs/PI-REPOSITORY-LAYOUT-PLAN.md`. Changes to running services, live HA connections or writes, owner-controlled credentials, stage deployment and production release require the existing explicit gate/authorization workflow.

## Project navigation
- Read `docs/PROJECT-MAP.md` to distinguish canonical development checkout, preserved historical clones, immutable active V3 release, local stage mock, branches and private runtime state.
- Do not rename/move historical root scripts or `kitchen-*` pilot modules as routine tidying; first prove dependency safety and update imports, tests, release/runbooks separately.

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

## Quiet autonomous execution — owner preference 2026-10-10
- Minimize chat interruptions: one short initial plan and one concise report after a meaningful completed milestone. Do not narrate each test run, documentation edit, command, poll or Git commit.
- Continue independently through related low-risk tasks without waiting for repeated "Продолжай". Report during execution only for a material blocker, meaningful unexpected risk, required approval or unusually long operation.
- Batch related tests and documentation updates. Do focused tests while coding, then run full regression once per stable milestone rather than after every small edit. Never skip necessary safety validation or claim passing tests without results.
- Keep factual status, unfinished work and commit details in TODO, WORKLOG and CHAT-HANDOFF instead of repeating progress messages in chat.

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
