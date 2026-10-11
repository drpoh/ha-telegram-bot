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
- [x] Compare trusted actor/action-envelope invariants in live pilot and isolated joined chain; preserve distinct trusted ingress and durable claim boundaries (`docs/V3-SHARED-DECISION-AUDIT-2026-10-11.md`).
- [x] Add focused cross-path contract tests for trusted actor, action scope and replay before any live refactor (test/v3-cross-path-trust-contract.test.mjs); no production changes.
- [x] Review joined-chain policy-denied token retention vs live pilot consume-on-dispatch semantics; focused offline contract test PASS on Pi. Preserve distinct behavior; no physical retry permission. See `V3-PRACTICAL-MVP-PRIORITIES-2026-10-11.md`.

## P0 — trust and safety before broader live control
- [x] Review whether new HA-MCP/registry infrastructure is necessary: reuse existing HA-native path and source/endpoint guards; documented in `V3-MCP-TRUST-NECESSITY-REVIEW-2026-10-11.md`.
- [ ] **Promotion gate, not dev blocker:** independently prove authoritative complete/fresh HA registry and secure HA-MCP source restriction, including unrelated-LAN-client denial. HA/network changes need separate approval; LAN 9584 remains unverified.
- [x] Complete offline Stage batch fixture scope/identity hardening: existing deny-default policy schema, exact per-light two-service mock scope, fresh identity/name check, group-wide failure, token replay/transport tests. This is **non-authorizing**, not approved real multi-device control.
- [ ] Real owner-reviewed multi-device permissions and authenticated complete HA registry remain separately gated; no live scope expansion.
- [ ] Preserve Home Assistant Green and native automations when AI, Pi, Zigbee2MQTT or HA-MCP fails. Any real failure testing needs a reviewed maintenance window, backup and operator authorization.

- [x] Review HA-native multi-light registry inspection in dev with injected read-only official-connection contract and two-pass negative fixture tests; documented in `V3-MULTIDEVICE-REGISTRY-READINESS-2026-10-11.md`. One-shot late/disconnected lifecycle checks also pass; real endpoint attestation remains open.

- [x] Dev-only bounded "which lights are on" summary with explicit entity scope and failure-safe reads (`src/home/on-lights-summary.mjs`); not deployed to V2/V3.
- [x] Wire `/lights_on` in dev Telegram V2 source to existing `ha_get_state` for the bounded configured light subset; strictly label partial house coverage; not deployed.
- [ ] Verify source-only `/lights_on` against real authenticated HA-MCP read response and owner-reviewed inventory before any production deployment; do not change active V2 service without a rollback plan.

## P1 — Stage 2 and operations
- [x] Revoke exact actor/token batch consent on Stage HTTP confirm registry-read failure; deny replay after mock recovers (offline only).
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
- [x] Group source and document responsibilities in `docs/STRUCTURE-INDEX.md` without mass-moving imports or changing live file ownership.
- [x] Inventory static imports and test/entrypoint reachability of `src/decision/` (`V3-DECISION-DEPENDENCY-AUDIT-2026-10-11.md`): all 77 referenced, no safe deletion candidates.
- [ ] Defer physical `src/decision/` moves pending concrete benefit, dynamic/external-consumer review and complete regression; consolidate only proven-equivalent policy logic.
- [ ] Confirm GitHub branch protection/PR policy, then decide whether to delete `review/gate-e-target-snapshot-hardening-20261009`; comparison shows no unique commits relative to active V3 and GitHub search returned no PRs. Do not delete automatically.
- [ ] Audit manual/cron/external invocation before moving root `bot.mjs` and `smoke-auto-safe.mjs`. Keep historical kitchen policy fixture files referenced by tests.
- [ ] Replace historical `deploy/rs-home-ai-v3.service` with an operator-reviewed, immutable-artifact template; current one is explicitly **NOT INSTALLABLE AS-IS**.
- [ ] Review release artifact retention/rollback before deleting any former V3 releases or checkout.
- [ ] Build Gate E Assist/voice adapter on the shared policy and confirmation engine; do not establish separate voice authority.

## Working protocol
At each new chat, read `AGENTS.md`, `PROJECT-MAP.md`, `CHAT-HANDOFF.md`, this TODO and the latest WORKLOG. Verify canonical dev Git status and actual service `ExecStart`. Use focused tests while implementing, full isolated regression at release-worthy milestones, then append evidence to WORKLOG/HANDOFF and commit/push. Production changes require separate explicit approval; tests do not automatically promote builds.
