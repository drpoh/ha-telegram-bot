**2026-10-10:** Dedicated dev clone created at `/home/drpoh/projects/rs-home-ai-dev` without touching active service checkouts; dependency install succeeded. Full isolated regression in progress before promoting as tested dev source. Stage/prod are not yet deployed.

**Pi structure/current deployment warning:** see [PI-REPOSITORY-LAYOUT-PLAN.md](PI-REPOSITORY-LAYOUT-PLAN.md). Both HA checkouts are live service sources; NEVER assume `/home/drpoh/rs-home-ai-v3` is a spare clone. Plan migration before any relocation.

# TODO — Open work register

**Current reviewed status (2026-10-10):** see [repository and branch audit](REVIEW-2026-10-10.md). Gate B OPEN for live source/policy/ingress acceptance; Gate C isolated faults underway; Gate D operational checks partial; Gate E offline only. Earlier unchecked items and checkpoints below are historical and may describe work subsequently completed in fixtures.

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
- [x] Evaluate official `home-assistant-js-websocket`/`ws` metadata and Node.js/ARMv7 ESM import compatibility in a temporary isolated Pi prefix; **no live HA connection**.
- [ ] Before any read-only deployment: independently verify TLS identity/pinning, bounded socket lifecycle, reconnect policy, operator-owned configuration and credential path; perform reviewed rollback/acceptance tests.
- [ ] Assemble **one isolated end-to-end Gate B harness** using existing provenance, intent ledger, isolated dispatcher, reviewed policy and authoritative scope adapters. Ensure actor mismatch, replay, expired confirmation, changed scope, tool substitution and bypass all deny.
- [ ] Only after independent source/operator identity evidence, propose read-only integration with explicit approval. Gate B OPEN.
- [ ] Adopt tiered CI; do not add GitHub Actions workflow before permission/secrets review.

## Gate B integrated fixture checkpoint — 2026-10-09
- [x] Add a combined **offline** ledger/actor/action/policy/scope/consumption test fixture reusing existing modules, with adversarial actor/chat/token/tool/scope/cancel cases.
- [ ] Bind provenance from an independently authenticated channel ingress (not caller fields) and complete HA registry/approved policy before Gate B acceptance. Extend whole-chain expired/inflight/replacement and alternative-MCP fault matrix; existing unit fixtures alone do not close Gate B.

## Channel-neutral provenance follow-up — 2026-10-09
- [x] Add combined offline Assist/Telegram channel-bound ledger/risk/tool denial tests; no actual transport authentication.
- [ ] Provide independently established ingress identity from adapter-owned transport context and gate actions with reviewed source/policy evidence. No caller-provided `authenticated` claims may authorize operations.

## Gate B strict joined-chain evidence — 2026-10-09
- [x] Test fail-closed when strict joined action lacks independent registry evidence and/or reviewed approval evidence; no simulated writes.
- [ ] Replace callback assertions with genuinely independently verified registry origin and operator-owned policy; prove positive and negative end-to-end acceptance without granting real HA authorization.

## Gate B upstream connection reuse — 2026-10-09
- [x] Reuse official HA JS client `Connection.sendMessagePromise` interface behind a tiny offline-only registry read bridge; no custom wire protocol and no HA connection.
- [ ] Supply independent, operator-reviewed authenticated TLS connection and bounded transport lifecycle before allowing any live read-only registry use; no authorization based on registry contents alone.

## Gate B upstream reconnect boundary — 2026-10-09
- [x] Reject an offline registry read on upstream Connection disconnect/close/socket replacement without implementing custom reconnect logic.
- [ ] Prove authenticated TLS provenance and actual cancellation/close behavior of the official client in an independently reviewed isolated transport fixture before accessing real HA.

## Transport-to-policy handoff — 2026-10-09
- [x] Run isolated *real* Node TLS loopback certificate-chain/hostname negative tests on Pi without HA secrets or network contact; record that actual HA WebSocket transport acceptance remains outstanding.
- [x] Enter policy-source stage: assert that a positive simulated evidence callback cannot import v2 grants into default-deny v3 policy.
- [ ] Operator-review actual v3 policy storage and independently authenticated HA registry source before authorizing read-only integration, then stage with explicit owner approval. No production HA credentials introduced.

## Accelerated verification workflow — 2026-10-09
- [x] Reuse Node check and GNU xargs to parallelize syntax verification at `-P 3`, preserving coverage with no new runtime dependencies.
- [ ] Benchmark total full-suite time under normal Pi load and keep test isolation; consider GitHub CI only after reviewed least-privilege workflow, not by skipping safety gates.

## Gate B composition checkpoint — 2026-10-09
- [x] Compose existing upstream registry bridge + joined Telegram confirmation + V3 reviewed policy into one isolated denial integration test.
- [ ] Require independent HA TLS/registry provenance, owner-reviewed policy grants, authenticated live Telegram adapter and full approval before any real execution. Offline composed denial is not Gate B acceptance.

## Gate B registry response limits — 2026-10-09
- [x] Enforce post-receive JSON byte limit in injected official-client-shaped registry reader with oversized-response denial test.
- [ ] Enforce actual WebSocket max frame size in the reviewed upstream socket configuration; post-receive checks alone cannot bound memory allocation.

## Gate B WSS transport acceptance — 2026-10-09
- [x] Prove actual `ws` TLS chain/hostname validation, frame-size limit and forced client termination using an ephemeral loopback-only WSS fixture.
- [ ] Operator approval and independently verified live HA endpoint, protected purpose-specific credential, real socket close/reconnect acceptance, default-deny V3 policy review and staged rollback. No production wiring before explicit review.

## Gate B minimal closure path — 2026-10-09
- [x] Reviewed existing upstream-client, scope and policy modules; wrote `docs/ADR-GATE-B-MINIMAL-CLOSURE.md` to stop duplicate custom WS work.
- [ ] Remaining hard acceptance: independently authenticated HA origin and read-only registry, operator-reviewed local policy/classification, trusted ingress action binding and staged end-to-end proof. Without these Gate B cannot be marked done.

## Gate B minimal vertical slice — 2026-10-09
- [x] Strict original Telegram message -> ledger actor -> area classification -> policy confirmation -> guarded mock service -> state verification, one isolated positive/replay-denial fixture (no real HA write).
- [ ] Real ingress owner and durable replay deployment; independently authenticated TLS HA registry and bounded socket teardown; reviewed and protected V3 policy + real light/switch classification; operator-approved read-only live acceptance. Do not mark Gate B complete until evidence exists.

## 2026-10-10 — Gate B transport offline exit and Gate C development
- [x] Real official upstream WSS client with trusted local certificate: six bounded reads; untrusted CA: zero reads; forced disconnect on second read: no continuation (isolated only).
- [ ] Gate B final acceptance still requires actual operator-authorized HA registry origin/credential, V3 policy+light classification, trusted ingress binding and formal live read-only acceptance. No production changes before explicit approval.
- [x] Gate C started in isolated fault tests: late positive authorization after timeout must not cause execution; 7/7 focused pass.
- [ ] Gate C needs full joined-chain fault coverage and later owner-approved controlled acceptance; offline tests alone do not permit actuation.

## 2026-10-10 — Isolated stage planning
- [x] Persist workspace separation rules and checked sanitized environment manifest fixture (125 test files / 499 assertions passed).
- [ ] Provision real stage only after separate authorization, protected mock endpoints, identities and rollout plan; no change to current v2/V3 units.

## 2026-10-10 — Stage mock work
- [x] Build disposable loopback-only, read-only synthetic HA mock; test allowed registry reads and denied writes without real HA/Telegram credentials.
- [ ] Before deploying a persistent stage: owner-approved separate service, independent storage/credentials, suitable request authentication, monitoring and rollback, all isolated from household HA Green. Stage **NOT deployed**.

## 2026-10-10 — Gate C staged HTTP integration checkpoint
- [x] Exercise real loopback I/O through existing registry read-only decision adapter; malformed transport and write attempts fail closed in isolated Stage mock.
- [ ] Add fault injection for delayed/dropped responses and bind trusted identity/action/policy to an actual independently reviewed staging acceptance. No live HA until Gate B owner-approved read-only source criteria are met.

## 2026-10-10 — Gate C fault acceptance
- [x] Bounded delayed and dropped Stage mock registry requests fail closed; no second read retry, no authority grant, focused 5/5.
- [ ] Complete actor/action/policy-bound integrated fault cases and independent stage deployment readiness review. No live writes without Gate B acceptance.

## 2026-10-10 — Gate C confirmation concurrency
- [x] Isolated tests cover replacement while policy awaits, actor/chat mismatch, executor failure without implicit retry, and cancellation before dispatch (11/11 focused).
- [ ] Add bounded MCP lifecycle, stale state revalidation, durable idempotency across restart and separately approved stage acceptance. No live actuation.

## 2026-10-10 — Gate C state freshness contract
- [x] Optional post-action `last_updated` boundary denies pre-command, missing, malformed and mismatched state readback; five focused tests pass.
- [ ] Require trusted read adapter to supply a post-command boundary and evidence. Existing callers do not opt in, so this alone is NOT proof of fresh state, HA provenance or authorization.

## 2026-10-10 — Gate C durable no-replay acceptance fixture
- [x] Add SQLite PRIMARY KEY atomic dispatch claim using existing SQLite CLI rather than a bespoke lock service. Reserve before the simulated write, persist unknown result through restart, never retry uncertain operations; six focused checks pass.
- [ ] Independently validate real concurrent claims under process race, bounded actual MCP transport, durable actor/action binding and trusted ingress, crash/fsync guarantees, stale readback and monitored restart/rollback. Offline tests do not constitute live Gate C acceptance.
- [ ] **Gate C production acceptance BLOCKED** by Gate B trusted HA origin/identity/policy and separately authorized controlled stage/live read-write acceptance. Do not mark production Gate C closed.

## 2026-10-10 — Gate C composed durable execution acceptance fixture
- [x] Integrated offline admission → durable action claim → simulated MCP write → strict post-action readback → replay denial with concurrent requests and stale/unknown negative cases (3/3 focused).
- [ ] Real MCP protocol abort/close, trusted action identity and actual HA source/policy remain outstanding. This does not authorize controlled live HA exercise.

## 2026-10-10 — Gate C upstream MCP SDK contract
- [x] Reuse installed `@modelcontextprotocol/sdk` Client/McpServer/InMemoryTransport to test actual protocol tool dispatch and SDK timeout against durable no-replay journal (2/2 focused).
- [ ] Remaining blockers: live HA identity/policy Gate B, authenticated staging deployment, forced network socket teardown, rollback and owner-approved controlled acceptance. Do not close operational Gate C based on in-memory transport.

## 2026-10-10 — Gate C actual loopback HTTP MCP and Stage rollback
- [x] Official installed MCP SDK Streamable HTTP localhost server/client abort and deadline cases passed focused 2/2, no HA or service calls.
- [x] SQLite `.backup` / restore fixture identifies critical rollback replay window: an older snapshot does not contain claims made later. Therefore restored Stage must remain QUARANTINED (no actions), pending reconciliation against a separate durable ledger.
- [ ] Implement independently durable rollback-safe claim reconciliation, real network disconnect after dispatch, explicit trusted auth for isolated Stage and operator-managed lifecycle; current Stage is NOT deployed.
- [ ] Gate B acceptance still requires operator-owned real HA endpoint, credentials, approved V3 policy, authenticated actor and permitted entity classifications. Do not inspect or use real secrets without scoped permission.
- [ ] Live controlled HA actuation and deployment are NOT accepted by this request without a specified permitted device/action/rollback plan. Gate C operational acceptance OPEN.

## 2026-10-10 — Gate C rollback replay-window mitigation
- [x] Offline recovery guard checks protected claim DB is outside rollback tree, exists with valid schema and SQLite quick_check; cannot auto-create missing ledger during recovery. Stage snapshot restore retains later claims in separate protected journal (3/3 focused).
- [ ] Deployment must provision independently owned immutable-path claim store and verify permissions/symlink races, durable backup, crash behavior and incident reconciliation. Current recovery guard is a prototype and is not wired to live service.
- [ ] Gate B independently authenticated HA origin, trusted actor ingress and owner-approved entity policy are still real-world acceptance blockers; no synthetic identity can satisfy them.

## 2026-10-10 — Owner-approved V3 minimum viable release scope
- [x] Freeze single-light Telegram MVP and explicitly defer generic multiroom, voice, auto_safe, LLM migration and long-term learning; see `docs/V3-MVP-RELEASE.md`.
- [x] Implement pure non-authorizing MVP checklist (3/3 focused) to track acceptance evidence without adding a release bypass.
- [ ] Close Gate B with operator-owned HA source, trusted Telegram actor and reviewed one-light policy. Then integrate durable no-replay and perform owner-approved one-light controlled Gate C acceptance; keep V2 and HA Green independent.

## 2026-10-10 — MVP joined ledger and durable action claim
- [x] Reuse the existing V3 intent ledger, reviewed area-light policy, scoped tool boundary and SQLite replay journal in one offline candidate-light joined chain. Wrong actor rejected, action confirmed once, state read back and claim survives new journal instance.
- [ ] Trusted Telegram adapter, operator-reviewed HA origin and actual one-device scoped policy/deployment remain mandatory before pilot writes. Fixture action text uses narrow simulated single light, not permission to execute live.

## 2026-10-10 — Narrow Telegram MVP admission fixture
- [x] Compose existing raw Telegram update consistency/admission with the existing actor-bound intent ledger; deny non-private, altered text, changed actor, duplicate message and repeated confirmation. Focused 2/2.
- [ ] Wire ONLY via separately operator-reviewed actual Telegraf handler, then independently attest HA origin/approved light/policy. Synthetic ctx fixture never proves actual Telegram authentication.

## 2026-10-10 — MVP pilot integration review
- [x] Reviewed real dev source `src/pilot/telegram-readonly.mjs`: an existing dedicated Telegraf pilot already has `/confirm`, `/cancel`, a hard one-light boundary, operator-policy hash admission, direct HA registry checks and an official MCP SDK client. Do NOT replace it with another bot/handler.
- [x] Added optional durable claim to `createKitchenDryrunConsent` **before** injected pilot dispatch; unknown MCP outcome consumes token, missing claim store denies, focused 6/6 including existing fault tests.
- [ ] Deployment approval required before wiring a protected rollback-independent SQLite journal or changing running pilot. Existing pilot is still unchanged; test its operator policy, HA source trust, auth and current actual safety gate before any approved release.

## 2026-10-10 — MVP pilot protected storage preflight
- [x] Added offline read-only preflight for existing separate SQLite claim ledger: owner UID, restrictive file/parent permissions, reject symlink, reject journal within rollback tree, verify schema/integrity. Focused 3/3.
- [ ] Before actual V3 pilot wiring, provision protected dedicated storage with operator-controlled ownership and an independent rollback plan. Handle parent-component symlinks and filesystem races at deployment. Gate B operator HA source/policy acceptance remains required.

## 2026-10-10 — Dev pilot fail-closed journal wiring
- [x] In DEV ONLY, wired existing dedicated V3 Telegraf pilot to the protected SQLite journal via read-only storage preflight. Missing/unsafe DB yields claim refusal and no physical dispatch; `/status` and `/confirm` explain the block.
- [ ] Provision protected journal through approved deployment (do not auto-create in pilot), confirm HA identity, exact light and operator policy, then separately approve one-device rollout. Live pilot checkout/service unchanged.

## 2026-10-10 — MVP dev pilot journal wiring milestone finalized
- [x] Review failure path for protected SQLite opening. Central `prepareV3PilotExecutionJournal` returns deny-only journal if preflight or journal opening fails; no database auto-creation on missing storage, no write permissions inferred. 4/4 focused tests pass.
- [x] Development implementation checkpoint COMPLETE; do not confuse with runtime release acceptance.
- [ ] Owner-controlled release acceptance: approve and provision protected ledger separately, verify HA origin/operator policy/light identity, obtain explicit one-device test authorization, observe rollback; existing live V3 pilot and v2 remain untouched.

## 2026-10-10 — Operational MVP acceptance evidence (read-only)
- [x] Verified Pi service states and distinct deployed Git SHAs; v2 active, V3 pilot active/running, neither changed.
- [x] Verified existing operator policy file metadata (0600) and matching pinned SHA256, without reading or publishing the policy/credentials.
- [!] NO-GO: pre-provisioned protected `~/.local/state/rs-home-ai-v3/claims.db` is absent. See `docs/V3-MVP-OPERATIONAL-ACCEPTANCE.md` for precise missing approvals and controlled release/rollback steps.
- [ ] Next operator-approved procedure: provision protected separate journal, verify authenticated HA origin and real entity/policy authority, promote reviewed immutable commit separately from v2, then scoped one-light controlled acceptance.

## 2026-10-10 — Gate D operator-controlled storage provisioner
- [x] Added explicit-only `provisionV3PilotJournal` for a separately reviewed target: protected directory, atomic 0600 create, existing-ledger preserve, schema/integrity preflight. Focused 2/2; no live provisioning or service changes.
- [ ] Operator must approve use against runtime storage separately; read-only HA source/actor/entity evidence and scoped one-light acceptance remain blocking. Pilot deployment NO-GO.

## 2026-10-10 — Actual V3 MCP origin inspection
- [x] Read-only inspection of runtime MCP URL *classification* (no endpoint or secret disclosed): configured protocol is HTTP on a non-loopback host. This is NOT authenticated HA provenance.
- [x] Dev MCP endpoint policy now denies unauthenticated non-loopback HTTP, embedded URL credentials, query/fragment and unapproved hosts. 2/2 focused.
- [ ] Resolve real MCP transport trust (TLS-verified endpoint or operator-reviewed protected local tunnel) and authenticated HA registry identity before any release; operational Gate B remains NO-GO.

## 2026-10-10 — MCP trusted transport: runtime topology inspection
- [x] Confirmed read-only: no loopback listener on port 9584; no dedicated SSH/MCP tunnel user unit; live V3 active. SSH configuration uses interactive host-key checking, not reviewed pinning evidence.
- [x] Documented minimum SSH local-forward acceptance path and no-go conditions in `docs/V3-MVP-MCP-TRUST-RUNBOOK.md`.
- [ ] Verify operator-pinned HA SSH host key/identity, provision and verify restricted loopback forward, then read-only MCP/HA entity identity under authorized session. Do not point production V3 at arbitrary localhost services.

## 2026-10-10 — Authenticated SSH read-only HA registry evidence
- [x] Existing SSH key record accepted with strict host-key checking, remote HA MCP port listening; ephemeral local SSH forward TCP passed then stopped.
- [x] Read-only HA entity/device registry confirms a single enabled MQTT `light.led_kukhnia` matching expected unique ID, device ID and kitchen area.
- [ ] Independently attest HA SSH key, review exposed MCP listener and privileges, restrict direct LAN access, accept MCP transport identity and owner-scoped read-only capability; then approve a separate persistent forward/release.

## 2026-10-10 — SSH tunnel service candidate prepared
- [x] Added disabled example user service for strict-key SSH loopback forwarding; `systemd-analyze verify` passed (temporary copy only).
- [ ] Do not install/start until operator has independently verified host key, allowed identity, HA-side MCP listener security, and approved the service. Live pilot remains unchanged.

## 2026-10-10 — SSH tunnel blocked by HA sshd policy
- [x] Read-only remote `sshd -T` confirmed `allowtcpforwarding no`; real tunnel HTTP attempt fails `administratively prohibited` even when local TCP listener appears open. HA loopback `/mcp` returns 404; runtime path differs.
- [ ] Owner-authorized HA SSH forwarding policy (prefer restricted identity) or verified TLS alternative required. Validate exact MCP path and SDK initialize/listTools under approved connection; DO NOT install disabled unit template yet.

## 2026-10-10 — Approved restricted HA SSH forwarding completed
- [x] Backed up HA sshd_config and applied restricted `Match User hassio` local forwarding to 127.0.0.1:9584 while preserving global deny; config validation PASS and SSH reconnect PASS.
- [x] Temporary Pi loopback tunnel now passes upstream MCP SDK `listTools` (53 tools) and `ha_get_state(light.led_kukhnia)` read-only. Each tunnel stopped.
- [ ] Actual MCP grants include `ha_call_service` (not read-only). Require operator review, separate V3 deployment/tunnel approval, independent host key confirmation, external SQLite claim store and one-light controlled acceptance. Do not declare Gate B/C/D fully closed.

## 2026-10-10 — Verified SSH/MCP read and redirect hardening
- [x] Latest GitHub checkpoint 8567494 already records owner-approved, restricted hassio SSH forwarding and real MCP read via temporary tunnel. Verified effective `sshd -T -C user=hassio` returns local-only forwarding to 127.0.0.1:9584.
- [x] Hardened dev upstream MCP SDK fetch to reject HTTP redirects, preventing unintended alternate destination. Focused syntax and 6/6 test cases pass.
- [ ] Keep permanent tunnel disabled until reviewed host key and MCP tool grants. Separate user/key grant scope remains broader than ideal, and live pilot/mcp-url are unchanged.

## 2026-10-10 — Operational tunnel activation preflight repeated
- [x] Effective restricted HA SSH forwarding still present; policy file hash unchanged; runtime endpoint remains insecure non-loopback HTTP; port 19584 not active, durable journal absent. Audit captured in `docs/V3-MVP-MCP-TRUST-RUNBOOK.md`.
- [ ] Separate approval and trust verification required before installing/enabling tunnel or changing running pilot; do not treat tested dev release as live.

## 2026-10-10 — Owner chose direct LAN HA-MCP MVP
- [x] Read-only Pi route shows 192.168.31.124 -> 192.168.31.94; HA-MCP listens on 0.0.0.0:9584; runtime endpoint config file 0600. Added `docs/V3-MVP-LAN-MCP-DECISION.md`.
- [ ] Limit HA TCP/9584 to Pi source via owner-controlled firewall/proxy/network control and verify rejection of unrelated LAN client; attest MCP credential scope. Only then review narrowly scoped LAN exception in client. **Default deny remains**.

## 2026-10-10 — Direct LAN MVP restriction review
- [x] Confirmed HA-MCP still listens on 0.0.0.0:9584. No verified firewall/proxy isolation found through available HA SSH shell commands; do NOT claim source filtering.
- [x] Added dev-only strict LAN endpoint candidate `kitchen-lan-endpoint-policy.mjs`: denies until network isolation AND credential review independently affirmed, accepts only 192.168.31.94:9584, no URL credentials/query/fragment. Focused 2/2.
- [ ] Determine HA add-on/network control surface and apply/verify allow Pi 192.168.31.124 only, deny other LAN clients, then review credentials. Candidate is deliberately NOT wired to executing MCP client.

## 2026-10-10 — HA-MCP listener source filter discovery
- [x] Read-only HA inventory did not identify an obvious dedicated MCP Docker app by name/port; active 0.0.0.0:9584 confirmed.
- [ ] Identify HA-MCP actual owning process/app and supported network/authorization configuration. Apply only narrow verified network controls; do not bind to HA loopback while selecting direct LAN.

## 2026-10-10 — TCP 9584 attribution
- [x] Confirmed listening host socket inode, but PID namespace and host-network containers prevent safe attribution from SSH add-on. Do not infer which app owns port from name alone.
- [ ] Use proper Supervisor/host process or official MCP deployment metadata to establish listener owner; if unavailable, restrict LAN access at managed router and verify from independent client.

## 2026-10-10 — Same-subnet router filtering limitation
- [x] Verified Pi eth0 192.168.31.124/24, HA 192.168.31.94 direct on eth0, router 192.168.31.1 serves HTTP/HTTPS. Generic routed firewall cannot be relied on to filter same-subnet packets.
- [ ] Identify actual router/switch model and intra-LAN bridge ACL/client isolation support or choose HA server-side port restriction. Do not modify router blind; validate from independent LAN client when enforcing.

## 2026-10-10 — HA-MCP server config identified
- [x] Found `ha_mcp_tools` integration entry on HA; bind_host 0.0.0.0, port 9584, webhook enabled, webhook auth ha_auth. No secrets inspected.
- [ ] Evaluate staged V3 HA-authenticated webhook client connection and existing MCP consumers. ONLY THEN change HA-MCP Network access to 127.0.0.1, verifying old clients remain functional or migrated. Do not change bind_host directly during current live operation.

## 2026-10-10 — Real operator journal ready
- [x] Provisioned outside rollback tree: ~/.local/state/rs-home-ai-v3/claims.db (0600, owner drpoh); storage preflight passes. Never reset it.
- [ ] Finish HA-MCP credential/transport acceptance, deploy approved dev commit separately and run real one-light Telegram confirmed acceptance; not yet safe to mark release GO.

## 2026-10-10 — Candidate promotion check
- [x] Confirmed 67-file delta from active V3 pilot (a7fc446) to dev; focused endpoint tests 4/4 and both active services healthy. Protected claims DB remains ready.
- [ ] Package/test isolated release candidate; must not silently merge 67-file delta into active V3. LAN read-only/credential acceptance and operator-reviewed live on/off still pending.

## 2026-10-10 — Candidate assembled
- [x] Isolated candidate created from commit 0deece0, mode 0700, RELEASE-COMMIT pinned, syntax + 4 targeted tests pass without launching Telegram or HA control.
- [ ] Remaining: dependencies in isolated candidate, complete tests against candidate, reviewed source grants, controlled V3 cutover, live /confirm readback. Never start two Telegram pollers with the same bot token.

## 2026-10-10 — Full candidate regression complete
- [x] Candidate npm ci 149 dependencies, exit 0 (scripts disabled). `npm test`: 143 test files, 549 assertions, 0 failures, exit 0.
- [ ] Confirm authenticated LAN MCP credentials/network rule and safe single-light policy; only then perform controlled V3 service cutover. Do not run a second Telegram poller with same token; preserve candidate SHA, rollback and external claims.db.

## 2026-10-10 — Current release blockers after journal hardening
- [x] Journal claim error is now fail-closed in dev and covered by a focused regression test.
- [ ] Rebuild candidate from a07d264+, test it, review actual MCP credentials and source rules. Real Telegram /confirm acceptance requires a fresh owner-created Telegram request and is not safely reproducible by sending an assistant-invented event. No live release yet.

## 2026-10-10 — Candidate-v2 final regression
- [x] Candidate-v2 pinned 72616d07f1a2850bc977a16d301034aafe5671c2; external claims.db preflight passed again and v2/V3 services are active.
- [ ] Full candidate-v2 npm test running; record actual result before release claim.
- [ ] Complete HA-MCP trusted permission review and controlled single-light Telegram confirmation before live V3 promotion. Do not start duplicate polling bot or assert an unverified release.

## 2026-10-10 — Candidate-v2 full tests green
- [x] Full test PASS: 144 files, 550 assertions, 0 failures, exit 0; candidate pinned 72616d0.
- [ ] Final MVP launch still depends on actual LAN MCP permission/trust review, controlled one-poller V3 deployment and real user Telegram `/confirm` acceptance. Do not misrepresent as completed.

## 2026-10-10 — Requested live acceptance outcome
- [x] Current HA-MCP identity/options, policy SHA and candidate evidence rechecked. Both current endpoint validators deny the live LAN URL without a reviewed exception; cannot honestly mark release GO.
- [ ] Establish independently reviewed LAN network+MCP scope permission or choose authenticated HA webhook; then deploy candidate one-poller only with rollback. Owner must send real Telegram request and `/confirm` to perform physical-light test. Do not spoof the confirmation.

## 2026-10-10 — V3 pilot deployed; human acceptance pending
- [x] Isolated release 7d9bab5 deployed to dedicated user service; old unit backed up, old checkout retained, PID 18430 active, NRestarts=0, v2 active, claims DB healthy.
- [x] Real read-only `ha_get_state(light.led_kukhnia)` from deployed release client PASS.
- [ ] Owner: message V3 Telegram bot `Включи свет на кухне` or `Выключи свет на кухне`, then send `/confirm` within 60s. Check post-command reply; collect service evidence with no secrets. Do NOT claim physical actuation occurred before it actually does.

## 2026-10-10 — Real acceptance blocked on Zigbee light availability
- [x] Confirmed root cause `light.led_kukhnia` is `unavailable` (not on/off) in real HA-MCP readback, registry MQTT device identity unchanged; fail-closed preflight correctly blocked write.
- [ ] Restore target Zigbee light via power/link/Zigbee2MQTT availability outside V3. Verify MCP state `on` or `off`, then retry from NEW private Telegram request + /confirm; never replay previous command or silently substitute another device.

## 2026-10-10 — state_pending fix deployed
- [x] Bounded delayed readback (three extra reads only, no repeated writes), test 5/5, release 920585d deployed successfully, previous unit backed up.
- [ ] Fresh real owner Telegram request and /confirm, independently verify final HA state. If still `off` after turn_on, investigate Zigbee2MQTT service/availability and MQTT command delivery; do not bypass protection.

## 2026-10-11 — Tambur V3 pilot
- [x] Replace failed IKEA test target with `light.tambur_svet_l1` across pilot gates and trusted operator policy; verify live MCP state on, registry identity and 28 focused tests.
- [ ] Complete a real owner Telegram /confirm turn_off with verified state, then turn_on with verified state; preserve rollback.

## 2026-10-11 — Live pilot acceptance
- [x] Real owner Telegram V3 `/confirm` turn_off `light.tambur_svet_l1`: verified `off` independently via HA-MCP; both services active.
- [ ] Complete fresh turn_on via Telegram and independently verify on; then close bidirectional pilot acceptance.

## 2026-10-11 — One-light pilot completion
- [x] Real private Telegram turn_off plus /confirm -> independent HA-MCP `off`.
- [x] Real private Telegram turn_on plus /confirm -> independent HA-MCP `on` at 12:48:25 EEST.
- [x] Verify V3 user service active with zero restarts; existing V2 bot active.
- [ ] Plan next stage's dev/stage/prod separation, safe scoped target expansion, independent failure regression and Zigbee coordinator stability audit; do not enable broader live permissions without fresh owner approval.

## 2026-10-11 — Stage 2 (in progress)
- [x] Document dev/stage/prod boundaries and stage exit gates; retain existing V3 one-light prod baseline.
- [x] Test stage mock via loopback HTTP with denied writes and forced registry connection drop (12 focused assertions/tests).
- [x] Full Pi regression for this checkpoint: 146 isolated files / 553 assertions / 0 failed, exit 0.
- [ ] Build registry-backed multi-device resolution in dev only (ambiguity, stale state, scope, confirmation and replay tests); no automatic live grant.
- [ ] Plan independently provisioned stage runtime credentials/service only after explicit authorization; do not start a second poller or copy prod secrets.
- [x] Pure Stage 2 multi-device selection candidate implementation, seven offline tests passing; exact name/ID + area, stale/ambiguous/disabled deny, no live authority.
- [ ] Wire only into mock stage's read path and test attack/fault cases before proposing any production support.
- [x] Connect candidate resolver to stage mock HTTP `/registry`: loopback-only endpoint, explicit mock provenance, read timeout, ambiguity/fault/forged-grant tests (14 focused tests pass).
- [ ] Simulate concurrent confirmations and stale registry changes in stage; evaluate trusted registry-binding before live device expansion.

## 2026-10-11 — Latest audit and Stage revalidation
- [x] Verify GitHub heads, canonical dev branch sync, status of both running services and retained checkouts; preserve deliberate version pinning.
- [x] Add two-snapshot identity revalidation and concurrency/replay offline tests (6/6).
- [ ] Integrate with mock-only staged confirmation flow; model registry changes between intent and dispatch without ever writing to HA.
- [ ] Repeat full regression before any release candidate, review stage service/credentials separately and do not promote automatically.
