# AGENTS.md — Home Assistant AI Agent

## Delivery priority — owner-approved 2026-10-14

**V2 functional parity is the immediate V3 priority.** V2 already answers live state questions, follow-up context, sauna history and system health using an AI tool-calling loop plus HA-MCP. V3 must recover these *read-only* capabilities first, then exceed V2 with deterministic action policy, verification and safe memory. See [revised strategy](docs/home-agent-v3-strategy.md). Build complete user-visible vertical slices; do not spend new iterations on generic infrastructure or isolated registry metadata at the expense of answering everyday home questions.

Reuse V2's agent, prompt, context/device memory, provider router and HA-MCP interfaces selectively, with bounded tool contracts, privacy controls and test evidence. Never transplant V2's direct unrestricted model-to-`ha_call_service` executor: all actions require V3 provenance, policy, allowed scope, confirmation as applicable, verification and audit. Live HA registry is authoritative for area membership, HA-MCP for approved current state/history/actions. The registry alone cannot answer on/off/history questions. Keep one Telegram poller, independent HA Green and pinned production. Maintain gates B–E unchanged for writes, runtime rollout and voice.

**MVP acceptance:** kitchen lights on; living-room lights off; contextual "А какой выключен?"; sauna live status/history from real evidence; HA repair/add-on health summaries. Handle unknown/unavailable states explicitly. Run offline regression, Pi read-only validation, then owner-approved narrow Telegram V3 pilot; do not claim parity from source-only work.


> **Current runtime and acceptance are recorded only in [docs/CURRENT-STATE.md](docs/CURRENT-STATE.md).** Dated prior checkpoints here are historical, not a replacement for live evidence or permission to modify HA. Selective external engineering practices: [docs/development/ENGINEERING-PRACTICES.md](docs/development/ENGINEERING-PRACTICES.md).


## Mission
Build a reliable conversational Home Assistant agent that can remember useful context, analyze Home Assistant history, and autonomously perform explicitly permitted non-critical actions.

## Cross-chat continuation and single current-status source
Before any work, **first read `docs/CURRENT-STATE.md`**, then `docs/development/HANDOFF.md` (≤150 lines), `docs/TODO.md` (open tasks) and this AGENTS file. Verify live Pi Git status, current service ExecStart and GitHub PRs when relevant and access permits; never treat a historical checkpoint as current evidence. The current status is maintained **only** in CURRENT-STATE. After stable milestones update current status with verification date/source, open TODO tasks, and short next-step HANDOFF; put detailed history in WORKLOG or archive. Old `docs/CHAT-HANDOFF.md` remains preserved history, **not** the first-read entrypoint. Keep source and production observations separate.

## Raspberry Pi workspace ownership — effective 2026-10-10
- **ONLY canonical development checkout:** `/home/drpoh/projects/rs-home-ai-dev`, branch `feature/v3-home-agent`. Perform source edits, tests, documentation, commits and GitHub pushes here.
- `/home/drpoh/ha-telegram-bot` is the **live v2 system-service directory**; `/home/drpoh/rs-home-ai-v3` is the **preserved historical V3 checkout used by Gate D timers, NOT the active pilot executable**. The most recent owner-confirmed active V3 pilot is pinned at `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964` (Git source verified), with `c6a9812` retained for rollback; re-check actual `ExecStart` read-only before any operational decision. They are separately versioned checkouts of the same GitHub remote. Inspect them read-only, NEVER auto-pull/rebase/reset, overwrite, delete, move, symlink, or `npm install` in them.
- Treat `vinted-sales-agent`, `ha-backups`, app state, tokens, live unit files and Home Assistant Green as independently managed; never reorganize or inspect secrets merely to tidy folders.
- `dev` is the canonical source checkout with an installed pull-only 6-hour CI-gated candidate timer (owner-confirmed on 2026-10-12); `stage` remains offline/mock only, and production is a separately pinned release. Automatic candidate packaging NEVER authorizes activation. Distinct environment manifests are planning evidence only, not credentials or authority.
- When a new chat begins, inspect Git state in dev first and compare runtime Git state read-only. Read `docs/PI-REPOSITORY-LAYOUT-PLAN.md`. Changes to running services, live HA connections or writes, owner-controlled credentials, stage deployment and production release require the existing explicit gate/authorization workflow.

## Project navigation
- Read `docs/PROJECT-MAP.md` to distinguish canonical development checkout, preserved historical clones, immutable active V3 release, local stage mock, branches and private runtime state.
- Do not rename/move historical root scripts or `kitchen-*` pilot modules as routine tidying; first prove dependency safety and update imports, tests, release/runbooks separately.

## Source of truth
GitHub is the source of truth for code and documentation. Never rely on chat/model memory as the only project state. Before substantial changes, inspect the current branch and relevant files.

## Permanent Home Assistant registry synchronization rule — owner request 2026-10-14

- Home Assistant native **WebSocket registry lists** are the approved source for the complete metadata catalog: floors, areas, devices, entities and labels. A successful live owner-operated read-only sweep on Pi confirmed 2 floors, 17 areas, 294 registered device records, 2881 entity records and 15 labels on 2026-10-14. These counts are a dated snapshot, not a constant. See `docs/CURRENT-STATE.md`.
- Owner intends to **rename, move, create and remove areas and other HA registry objects**. Never hardcode the area/device/entity/label inventory, inferred physical room assignment or these dated counts as permanent facts. Refresh data from Home Assistant; an entity area overrides its device area; entities/devices without areas remain legitimately unassigned.
- On registry change events, connectivity loss, failed subscription, or reconnect, mark the local metadata cache stale. Revalidate through the full five-list snapshot before advertising an up-to-date all-home inventory; discard snapshot reads raced by a later change event. Apply bounded work and fail-closed freshness rules.
- Keep **HA-MCP** for explicitly authorized live state reads and actions; WebSocket registry metadata, room assignments and labels are *not* authorization to read states or control devices. No registry writes or automatic physical actions follow discovery. No token or runtime credential may enter GitHub, chat, logs or tests. Production changes still require the existing release gates and owner approval.
- Prefer the validated standard HA APIs and existing adapters over repeated exploratory search probes or new custom infrastructure. Run pure offline/mock tests in DEV before any separately approved live read.

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

## Selective engineering practices — 2026-10-13

- **Reuse methods, not frameworks.** Apply the concise local [engineering playbook](docs/development/ENGINEERING-PRACTICES.md), informed by selected Matt Pocock and ECC documentation. Do **not** install their agents, hooks, CLI, memory or MCP configurations; no extra paid services or process managers.
- Bug fixes: reproduce a precise failure using existing `node:test`/offline fixture before fixing; run focused test then full existing `npm test` at the stable milestone. Preserve real red/green evidence; do not invent production results.
- Meaningful code/PR reviews must independently inspect **spec behavior** and **standards/security**. When touching MCP, Telegram, policy, confirmation, secrets or HA writes, check exact scope, authorization, unavailable/failure handling, secrets, single-poller and rollback paths.
- For prospective releases, record exact diff against immutable pinned production. **Broad DEV diff is not automatically deployable**; prefer a small reviewed read-only slice, GitHub CI, separate Pi evidence and explicit owner approval for any runtime change. Existing Gate B/C/D/E controls override external examples.
- Keep one current status in `docs/CURRENT-STATE.md`; put open actions in TODO and evidence in WORKLOG/HANDOFF. Minimize extra process documents and repeated owner questions.

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
