# TODO — Open work register

## Current status note — 2026-10-09

See `docs/REVIEW-2026-10-09.md` for the reviewed file inventory, operational evidence, current gate boundaries and next priority tasks. Earlier counters/checkpoints below are historical, not present-day production acceptance. General Gate B and voice Gate E remain open; Gate D reboot and Telegram receipt passed but real-alert and disaster-recovery acceptance remains incomplete.

Updated: 2026-10-08. Branch: `feature/v3-home-agent`. Latest pushed checkpoint before this session: `8374ec0`.

## Working agreement
At session start: read `docs/home-agent-v3-strategy.md`, this TODO, `docs/WORKLOG.md`, current `git status`, and the most recent tests. Choose the next task from confirmed blockers.
At session end: record completed work, failed/unfinished steps, test results, commit/remote status, and next exact action. Never classify an unknown file as safe to delete without inspecting it.
`docs/PROGRESS.md` is a broader milestone summary, not a substitute for this current queue.

## Open tasks
- [ ] **P1 — Backup/restore design and disaster-recovery testing.** See `docs/BACKUP-RESTORE.md`. Build encrypted off-device SQLite-consistent snapshots, schema/version/hash manifests, isolated restore and negative tests; require explicit approval for schedules, live backups containing secrets, and any production restore. Separate HA Green backups.
- [ ] **P1 — Engineering ADRs and external project reference reviews.** See `docs/REFERENCES.md`. For each major architecture choice, record alternatives, threat model, upstream license/commit, regression evidence and rollback. No wholesale reuse of third-party code.
- [x] **P1 — isolate automated SQLite test databases.** Standard `npm test` now uses one temporary schema-only database per file; 43 files / 245 passed, exit 0. Follow-up: replace production schema read with a committed test fixture.
- [ ] **P0 — Gate B: connect trusted area evidence to the running agent path.** A fail-closed gate has been wired into `src/ai/agent.mjs` for explicit «весь свет в ...» requests. Expanded unresolved plural and mixed light/other-device phrasing protection (231/231 tests); continue covering paraphrases and full agent/confirmation path before deployment. The pure Decision Engine areaEvidence path remains separate; consolidate later.
- [ ] **P0 — Gate B: prevent unsafe area resolution.** Added pure strict resolver and read-only HA-backed resolver, tested on real HA. Live strict identity is now chained to reviewed local config and inventory in an isolated read-only module. Next: connect approved scope to agent while preserving all policies. Existing permissive resolver used by scenes remains unchanged and requires migration review.
- [x] **P0 — Gate B: refuse unclassified `light.*` entities.** Generic read-only discovery now requires an explicit, complete partition of light IDs into selected and excluded classes; unclassified or overlapping IDs fail closed. Wiring a trusted per-installation classification source remains open below.
- [ ] **P0 — Gate B: trusted lighting classification source.** Live HA read-only inventory obtained for sauna, kitchen and corridor, with pending review saved locally in ignored `data/lighting-inventory-review-2026-10-08.json`. Read-only chained discovery now supports approved local config, but actual home mapping remains unapproved. Review undecided switches and lights; only then create approved local config. No room-wide actuation until reviewed.
- [ ] **P0 — Gate B: mixed-domain and unavailable scope.** Whole-room light + switch requests must never silently execute a subset; unknown/unavailable members block pending an explicit partial-execution policy.
- [ ] **P1 — Gate C: isolated end-to-end MCP read tests and fault injection.** No real actuation until explicit approval; cover malformed, paginated, stale, unavailable and incorrectly classified inventory.
- [ ] **P1 — Gate D: staged deployment and rollback.** Running v2 process remains untouched; restart only after review and controlled acceptance tests.
- [ ] **P1 — verify AUTO_SAFE allowlist device IDs.** Inspect `src/policy/config.mjs` against HA state; do not broaden allowlist before audit.
- [ ] **P1 — refresh README and long-term milestone details.** Historical totals were refreshed in PROGRESS; latest full baseline before this checkpoint is 198/198.
- [ ] **P2 — Gate E: reuse shared engine in Assist/voice, no parallel authorization system.**

## Recovered files and review

- [x] Move live-actuating smoke scripts into `scripts/manual/`. They require explicit approval and isolation before execution.
- [x] Archive accidental terminal diff locally in ignored `data/local-archive/`; not part of Git.
- [ ] Review standalone audit collectors `src/audit/collector.mjs` and `src/audit/collector-v2.mjs` for compatible read-only APIs and coverage before deploying or scheduling them. Source files preserved.
- [ ] Review manual smoke scripts end-to-end and validate their restore behavior in controlled conditions. A dual opt-in guard is now present, but the scripts have not been live-tested.

## Completion criteria
A task can be marked done only with a file/commit reference, verification evidence and any remaining caveat. Local-only work is marked *not pushed*. Do not imply that passing unit tests proves production safety.

- [ ] **P0 — entity rename lifecycle (Gate B).** Implement read-only HA entity-registry snapshots and compare `platform + unique_id + domain`; core proposal module `src/home/entity-rename-audit.mjs` and isolated tests added. Next: authoritative registry adapter with completeness/freshness checks, impacted configuration dependency report, reviewed migration transaction and rollback. Never silently remap or actuate devices.

- [ ] **P0 availability independence:** Before deploying v3, demonstrate that stopping the agent/Raspberry Pi and disconnecting AI/MCP does not interrupt native Home Assistant, Zigbee2MQTT, existing automations, dashboards or local device control. No automatic replay of stale writes after reconnection. Acceptance test requires owner-approved maintenance window. See `docs/ADR-HA-INDEPENDENCE.md`.

## 2026-10-08 — Approved priority order (supersedes historical checkpoint numbers above)

- [ ] **BLOCKER Gate B:** Join trusted original Telegram request, actor/chat/token and immutable candidate action to operator-reviewed local policy and complete live read-only scope; deny replay, actor mismatch, cancellation, replacement, ambiguous intent and alternative MCP calls. Prove with isolated end-to-end tests and report evidence. The existing `v3-intent-ledger` and `v3-isolated-dispatcher` are **not yet connected**.
- [ ] **Gate C afterward:** end-to-end fault/race/timeout/cancellation tests through the joined chain; verification must never trigger a second unapproved write.
- [ ] **Pre-deployment invariant:** independent operation of Home Assistant Green if AI, Pi, MCP or Telegram fails. Live acceptance only with owner authorization.
- [ ] **Gate D:** bounded rollout, audited controls, backups, rollbacks and monitoring after owner approval.
- [ ] **Gate E:** voice/Assist on the same policy and authorization stack.
- [ ] **Documentation hygiene:** keep strategy, TODO, PROGRESS and WORKLOG consistent; never infer operational readiness from passing mock tests or quote an overall readiness percentage.

## Voice-first reprioritization (owner approved 2026-10-08)

- [ ] **P0 Gate B:** Integrate channel-neutral command provenance, source trust and strict action scope with shared policy, reviewed local configuration and confirmation; no channel may assert its own privilege.
- [ ] **P0 Gate B:** Add read-only simulated Atom Echo / Assist adapter and test unverified speaker, replay, reclassification and dangerous action rejection.
- [ ] **P1:** Design user-safe voice confirmation with explicit scope, short TTL and no unsafe command replay; require identity verification for sensitive operations.
- [ ] **P2 deferred:** Live Telegram v3 transport wiring. Preserve existing mock adapter and v2 operational service; avoid Telegram-specific assumptions in shared decision code.
- [ ] **P2 after shared engine:** Reuse engine from HA Assist with no production HA side effects until gates and approval.

## 2026-10-09 — Future environment separation
- [ ] Adopt `docs/ADR-DEV-STAGE-PROD.md` before any expanded live deployment. Separate dev/stage/prod endpoints, bot tokens, databases, replay stores, service names, permissions and release credentials. Do **not** deploy stage/prod changes until isolation and rollback are proven and owner approves.
- [x] Pure `src/ops/environment-boundary.mjs` contract and four isolated tests added; **not wired to production**, not an authorization mechanism by itself.

## 2026-10-09 — Environment separation follow-up
- [x] Offline dev/stage/prod descriptor collision checks for service, storage, port, Telegram reference and HA endpoint reference; see `docs/ADR-DEV-STAGE-PROD.md`.
- [ ] Before creating stage: choose distinct test bot credentials, service account/runtime data and mock HA instance, harden permissions, validate actual installed unit files and network isolation. Do not use live HA Green as stage.
- [ ] Before promoting prod: immutable artifacts, stage acceptance, rollback/backup tests and explicit owner authorization; never repurpose the current v2 or v3 runtime automatically.

## Gate B transport follow-up — 2026-10-09
- [x] Bound offline caller completion for uncooperative exchange and hanging/failed close (mock tests; does not guarantee underlying I/O termination).
- [ ] Build trusted transport-layer destruction and late-reply isolation for actual sockets, with independent runtime TLS provenance and complete negative tests before live use.
- [ ] Establish independently verified TLS peer/endpoint provenance with an approved read-only credential deployment; never accept injected claims as authorization.

## Gate B accelerated delivery plan — owner approved 2026-10-09
- [x] Record vertical-slice / upstream-reuse / tiered-testing decision in `AGENTS.md` and `docs/ADR-GATE-B-ACCELERATION.md` (workflow only).
- [ ] Complete official `home-assistant-js-websocket`/`ws` API and runtime security evaluation, Node ARMv7 compatibility and rollback; registry metadata/licensing precheck done without installation.
- [ ] Assemble **one isolated end-to-end Gate B harness** using existing provenance, intent ledger, isolated dispatcher, reviewed policy and authoritative scope adapters. Ensure actor mismatch, replay, expired confirmation, changed scope, tool substitution and bypass all deny.
- [ ] Only after independent source/operator identity evidence, propose read-only integration with explicit approval. Gate B OPEN.
- [ ] Adopt tiered CI; do not add GitHub Actions workflow before permission/secrets review.

## Gate B integrated fixture checkpoint — 2026-10-09
- [x] Add a combined **offline** ledger/actor/action/policy/scope/consumption test fixture reusing existing modules, with adversarial actor/chat/token/tool/scope/cancel cases.
- [ ] Bind provenance from an independently authenticated channel ingress (not caller fields) and complete HA registry/approved policy before Gate B acceptance. Extend whole-chain expired/inflight/replacement and alternative-MCP fault matrix; existing unit fixtures alone do not close Gate B.
