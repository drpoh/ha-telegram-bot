# RS Home AI — current actionable tasks

Reviewed 2026-10-11. **This is the current queue**, not the historical running log. Earlier 389-line register is preserved in [the historical TODO archive](archive/TODO-history-through-2026-10-11.md) with Git history intact. Read [PROJECT-MAP](PROJECT-MAP.md) and [CHAT-HANDOFF](CHAT-HANDOFF.md) for service ownership and runtime state. Completion evidence belongs in [WORKLOG](WORKLOG.md).

## Verified baseline
- [x] Live V3 one-light Telegram MVP on `light.tambur_svet_l1`: both `turn_off` and `turn_on` were confirmed via independent HA-MCP reads on 2026-10-11. Active pinned release: `97343fa`, not the canonical dev branch.
- [x] Existing Telegram V2 and V3 services remained active during the latest cleanup. No broader Home Assistant permission was granted.
- [x] Canonical development checkout: `/home/drpoh/projects/rs-home-ai-dev`, branch `feature/v3-home-agent`; immutable V3 release and V2 runtime must not be auto-updated.
- [x] Dev Stage 2 mock isolation, exact light selection, stale/replaced target revalidation, one-use consent and transport-failure checks; full Pi regression after cleanup: 150 test files, 574 assertions, 0 failures (2026-10-11).
- [x] Six historical standalone model experiments moved to `scripts/legacy/` with Git rename; root live-capable `smoke-auto-safe.mjs` and old `bot.mjs` retained.

## Engineering principle
- [x] Reuse-first architecture accepted and documented in [ADR-REUSE-FIRST-2026-10-11.md](ADR-REUSE-FIRST-2026-10-11.md): Home Assistant/Assist/ESPHome/HA-MCP/systemd/Node.js own infrastructure; write only missing deterministic policy and adapters.
- [x] Simplify Stage single/batch consent to reuse the same pure selector for each independently fetched snapshot (13 focused tests); no new decision framework.
- [x] Audit live V3 vs Stage selection/consent imports and source-of-trust contracts; document differences in `V3-SHARED-DECISION-AUDIT-2026-10-11.md`, with offline boundary tests.
- [ ] Compare trusted actor/action-envelope invariants in live pilot and isolated joined chain before any shared contract refactor; no production changes without reviewed promotion.

## P0 — trust and safety before broader live control
- [ ] Prove authoritative complete/fresh HA registry identity and secure HA-MCP transport/source restrictions; current LAN 9584 trust boundary requires independent review. Do not infer live authority from Stage mock results.
- [ ] Extend strict actor, command provenance, device identity, policy and confirmation gates from single light to an owner-reviewed set in **dev/stage only**. Block ambiguity, room/domain mismatch, missing/renamed/unavailable entities, replay and partial failures.
- [ ] Preserve Home Assistant Green and native automations when AI, Pi, Zigbee2MQTT or HA-MCP fails. Any real failure testing needs a reviewed maintenance window, backup and operator authorization.

## P1 — Stage 2 and operations
- [x] Draft conservative Node.js + systemd stage deployment design, `deploy/stage/README.md`; no service installed and no new credentials.
- [x] Implement source-only mock Stage entry with loopback bind, no live HA/Telegram imports and SIGTERM exit; two subprocess tests pass.
- [x] Stage 3 source-only subprocess safety tests: clean loopback shutdown and rejected HA/AI credentials and port settings (4/4).
- [x] Stage 3 source-only readiness milestone: 153 isolated test files / 588 assertions / 0 failures.
- [x] Create inert systemd Stage template and validate policy directives (2 unit tests and rendered syntax check; not installed).
- [ ] Provision/install isolated Stage service only after independent owner-approved sandbox, effective IP isolation and identity review; no service deployed.
- [x] Dev-only batch confirmation for 2–12 exact light targets, revalidation, one-use claim and all-or-nothing denial (13 focused tests including existing gates).
- [x] Batch simulation uses independent Stage HTTP registry reads at issue/confirmation, rejects dropped connection and real HA LAN address (test/stage-batch-http-simulation.test.mjs).
- [ ] Address historical Zigbee2MQTT Ember coordinator ASH disconnect issue independently from V3; verify coordinator/serial connectivity before any network reconfiguration or firmware change.
- [ ] Validate isolated restore/rollback and backup procedures, preserving external V3 SQLite claims and HA Green independence. Do not handle production secrets or schedule backups without approval.
- [ ] Evaluate authenticated HA webhook/loopback migration and other MCP consumers before modifying the currently configured server listener.

## P2 — repository and architecture hygiene
- [ ] Confirm GitHub branch protection/PR policy, then decide whether to delete `review/gate-e-target-snapshot-hardening-20261009`; comparison shows no unique commits relative to active V3 and GitHub search returned no PRs. Do not delete automatically.
- [ ] Audit manual/cron/external invocation before moving root `bot.mjs` and `smoke-auto-safe.mjs`. Keep historical kitchen policy fixture files referenced by tests.
- [ ] Replace historical `deploy/rs-home-ai-v3.service` with an operator-reviewed, immutable-artifact template; current one is explicitly **NOT INSTALLABLE AS-IS**.
- [ ] Review release artifact retention/rollback before deleting any former V3 releases or checkout.
- [ ] Build Gate E Assist/voice adapter on the shared policy and confirmation engine; do not establish separate voice authority.

## Working protocol
At each new chat, read `AGENTS.md`, `PROJECT-MAP.md`, `CHAT-HANDOFF.md`, this TODO and the latest WORKLOG. Verify canonical dev Git status and actual service `ExecStart`. Use focused tests while implementing, full isolated regression at release-worthy milestones, then append evidence to WORKLOG/HANDOFF and commit/push. Production changes require separate explicit approval; tests do not automatically promote builds.
