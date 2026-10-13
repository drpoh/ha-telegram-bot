# AGENTS.md — Home Assistant AI Agent

> **2026-10-13 operations checkpoint:** For current observed state read [docs/CURRENT-STATE.md](docs/CURRENT-STATE.md) and [docs/DOCUMENTATION-AUDIT-2026-10-13.md](docs/DOCUMENTATION-AUDIT-2026-10-13.md). DEV `6f6e694` passed 198 test files / 726 assertions on Pi; HA-MCP read-only passed; 19 new light candidates produced 9 responsive / 10 unavailable. **Physical device identities and active production release must be independently verified**; these observations confer no write or deployment authorization.


## Mission
Build a reliable conversational Home Assistant agent that can remember useful context, analyze Home Assistant history, and autonomously perform explicitly permitted non-critical actions.

## Cross-chat continuation
At the beginning of every new chat, first read `docs/CHAT-HANDOFF.md`, then verify the live Pi Git status, current TODO/WORKLOG and GitHub PRs. Do not treat old chat memories or historical counters as current evidence. Update the handoff after stable milestones.

## Raspberry Pi workspace ownership — effective 2026-10-10
- **ONLY canonical development checkout:** `/home/drpoh/projects/rs-home-ai-dev`, branch `feature/v3-home-agent`. Perform source edits, tests, documentation, commits and GitHub pushes here.
- `/home/drpoh/ha-telegram-bot` is the **live v2 system-service directory**; `/home/drpoh/rs-home-ai-v3` is the **preserved historical V3 checkout used by Gate D timers, NOT the active pilot executable**. The last owner-confirmed active V3 pilot is the immutable `/home/drpoh/projects/rs-home-ai-v3-release-c6a9812` release (verify current systemd ExecStart read-only before any operational decision). They are separately versioned checkouts of the same GitHub remote. Inspect them read-only, NEVER auto-pull/rebase/reset, overwrite, delete, move, symlink, or `npm install` in them.
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

## Zero-additional-cost AI development — owner requirement 2026-10-12
- Do not require or enable any new paid subscription, pay-as-you-go API, cloud VM, paid GitHub runner, purchased credits, or billing method. Prefer available free tiers. When a free allowance is exhausted, stop and wait for reset; never auto-upgrade, silently use a billable fallback or bypass account limits.
- Preferred optional cloud coding agent: Google Jules **free tier** via narrowly authorized GitHub access only. Its cloud sandbox is for *offline source changes and tests*, not HA, Pi SSH, Telegram tokens or owner private runtime state. Existing GitHub Actions and Pi DEV validation remain distinct trusted gates.
- Agent must read this AGENTS.md and current docs, use `feature/v3-home-agent` as **base**, publish a new review PR, and never push directly to active production, edit live services, enable broad HA device writes or merge its own security/release changes automatically.
- Jules integration is **not installed or authorized** simply because this policy exists. Owner must explicitly authorize the GitHub app for this one repository via Jules UI; no secrets copied to it. Do not schedule repetitive PRs until a first manual task has passed review and free plan constraints are verified.
- Approved production V3 is immutable SHA `9dd5964a4956b88227ec4002ac80ef46a186d632` via a reviewed systemd drop-in. Preserve `c6a9812` rollback, older `97343fa`, V2, Gate D. Documentation-only changes are not production upgrades. See `docs/FREE-AI-DEVELOPER.md`.

## Parallel development coordination — owner approved 2026-10-12
- To reduce owner interaction, ChatGPT may work independently alongside the free-tier Jules coding agent, but **assign different functional slices and preferably disjoint files**. Each agent creates a dedicated short-lived source branch from `feature/v3-home-agent` and a small PR into that same branch; never target the stale `main` branch. No simultaneous edits of production, credentials, HA registry, service units, authorization/confirmation logic or shared runtime state.
- Only one agent may integrate or merge a given feature at a time. Before merging, compare with current DEV head, inspect changed-file count, check CI for the exact PR head, and reject an unexpectedly large diff. Combine the best reviewed changes without duplicating a completed feature. GitHub CI passing is not Pi ARMv7 or production acceptance.
- The owner only needs to approve production promotions, expanded Home Assistant action scope, secrets/network access, financial/billing obligations or other materially risky changes. No billable fallback; wait for free quota. Preserve immutable active production `9dd5964` and `c6a9812` rollback.

## Latest short checkpoint, 2026-10-12
Read `docs/V3-AGENT-CHECKPOINT-2026-10-12.md` for the current light-only scope, exact tested PRs, Jules issue #72, known unavailable HA entities, production boundaries and branch hygiene. All `light.browser_mod*` excluded. Do not derive current acceptance from older logs or stale `main` PR diffs.
