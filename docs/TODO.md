# RS Home AI V3 — active next steps

Updated 2026-10-11. **Single current priority: deliver useful capabilities through the existing @RSHomeAI_v3_bot.** Completed work and historical plans are preserved in Git history, `docs/archive/TODO-history-through-2026-10-11.md`, `docs/WORKLOG.md` and `docs/CHAT-HANDOFF.md`. Do not use older dated sections as authorization.

## Verified baseline
- Live V3: `rs-home-ai-v3.service`, **active/running** on 2026-10-11, effective `ExecStart`: `/usr/bin/node /home/drpoh/projects/rs-home-ai-v3-release-97343fa/src/pilot/telegram-readonly.mjs`; working directory: immutable release `/home/drpoh/projects/rs-home-ai-v3-release-97343fa`. Keep pinned until explicitly approved promotion.
- Owner's Telegram V3 acceptance: `/start`, `/status`, empty `/confirm`, empty `/cancel`, and pending light request → `/cancel` → `/confirm` behaved correctly. No independent light readback in cancellation scenario.
- Canonical Pi DEV at GitHub `5621292`, owner ran `npm test` on Raspberry Pi: **165 test files / 640 assertions / zero failures**. Newer GitHub source commit `aa5af27` contains sauna feature; Pi compatibility for this newer commit is **not yet verified**.
- V2 uses separate live checkout; read-only `/lights_on` in *development source* belongs to V2; do not confuse it with deployed V3.
- GitHub offline CI for sauna PR #13: **166 test files / 643 assertions / zero failures**; merged as `aa5af27`. No V3 production deployment.

## Latest production checkpoint
- [x] Owner verified V3 systemd effective release `c6a9812`, active/running, and four working Telegram sauna/status queries. Full evidence in `V3-PRODUCTION-CHECKPOINT-2026-10-11.md`.
- [x] Post-switch request → `/cancel` → `/confirm` Telegram regression: owner confirmed pending, cancelled, then missing. No confirmed write; independent physical state not inspected.
- [ ] Read-only Pi runtime/old-file inventory and rollback retention; cleanup classification before deleting source files, branches or release directories.
- [ ] One-off branch cleanup (20 remote branches before checkpoint PR) and read-only Pi stale-file consumer audit. No mass deletion of 77 referenced decision modules.

## P0 — next useful V3 release (only)
- [ ] Synchronize clean canonical Pi DEV to `feature/v3-home-agent` head `aa5af27` (or verified newer SHA) using **fast-forward only** and rerun `npm test` on Pi ARMv7. Never pull into live V2/V3 paths.
- [x] Verify actual read-only `ha_get_state` response envelopes for `sensor.sauna_te_sauna_temperature` and `binary_sensor.sauna_sauna_te_sauna_ready` from trusted existing HA-MCP path, for live normal state. Unknown/unavailable are covered by offline tests; real fault injection not performed. No HA write.
- [ ] Review V3 sauna command and MCP allowlist for real endpoint identity, network source controls and existing admission boundary. GitHub CI alone is not authorization to deploy.
- [ ] Prepare new **immutable** V3 release candidate, verify systemd executable path and rollback procedure, preserve external SQLite claims/credentials, request owner approval before restart or production change.
- [ ] After approved promotion, Telegram acceptance: `/sauna`, `Какая температура в сауне?`, `Сауна готова?`; validate truthful values and fallback while retaining existing tamboor `/confirm` protection.

- [x] Add source-only `scripts/prepare-v3-release-candidate.sh` to package an exact clean V3 DEV commit to a new immutable-path candidate without changing live services; see `V3-SAUNA-RELEASE-CANDIDATE.md`. Candidate packaging and production switching still pending.

- [x] Owner-approved V3 sauna candidate switched and Telegram functional acceptance **4/4**: `/status`, `/sauna`, temperature question and readiness question (all successful). Actual effective systemd release path and post-switch rollback/write protections still require read-only verification.
- [ ] Verify post-switch `systemctl --user show ... -p ExecStart -p WorkingDirectory`, no second Telegram poller, and old release retained. Confirm request→cancel→confirm after switch without performing physical write.

## P1 — subsequent user value
- [ ] Add bounded read-only lighting overview to **V3** (not the V2 `/lights_on` implementation), reusing existing pure summary and only explicitly reviewed read scope.
- [ ] Add trusted, limited conversation context and room status; then reuse HA Assist/ESPHome for voice. Never create independent voice authority or a second Telegram poller.

## Safety gates — still open
- [ ] Gate B: complete authoritative HA registry and actual secure HA-MCP source restriction including unrelated LAN denial, actor identity and exact write-policy authorization before wider physical control.
- [ ] Gate C: live fault/restart acceptance, durable identity/action binding, independent Pi validation and owner-review. Offline replay tests are **not** live acceptance.
- [ ] Gate D: operational disaster recovery/real notification acceptance; Gate E: Assist voice adapter and trusted policy reuse. Stage remains an offline loopback mock.
- [ ] Maintain HA Green independence and no automatic change to V2 or V3 production.

- [x] Owner moved historic V3 releases `7d9bab5` and `920585d` to `~/projects/archive/rs-home-ai-v3/` and confirmed `rs-home-ai-v3.service` still active. This did **not** free disk space; historical unit backup paths now refer to archived locations.
- [ ] Verify Gate D timer health and V2 after archive; keep historical checkout `~/rs-home-ai-v3` because enabled Gate D timers use its scripts.

## Safe hygiene remaining (non-blocking)
- [ ] GitHub contains historical squash-merged PR branches. Confirm PR head SHA, branch protection and external consumers before deleting; preserve `main`, `refactor/v2`, `feature/v3-home-agent`. Connector does not expose branch deletion.
- [ ] Review actual systemd, cron, shell/manual consumers before moving or deleting root `bot.mjs`, `smoke-auto-safe.mjs`, prior release directories or historical V3 checkout. Retain rollback artifacts.
- [ ] Do **not** mass move/delete `src/decision`: audited 77 modules have incoming references. `scripts/legacy/` already contains grouped model experiments.

## Navigation
Read `AGENTS.md`, `docs/PROJECT-MAP.md`, `docs/CHAT-HANDOFF.md`, `docs/WORKLOG.md`, and `docs/home-agent-v3-strategy.md` before modifying live-adjacent V3 code. `docs/REPOSITORY-MAINTENANCE-2026-10-11.md` documents branch candidates. `docs/PROJECT-AUDIT-2026-10-11.md` and `docs/V3-DECISION-DEPENDENCY-AUDIT-2026-10-11.md` explain why code deletion is restricted.

## Cleanup checkpoint 2026-10-11
- Owner-confirmed live V3 `c6a9812` `/sauna` and protected cancellation after upgrade. See `V3-CLEANUP-CHECKPOINT-2026-10-11.md`. No production mutation during cleanup audit.

## 2026-10-12 — Remote branch cleanup verified
- Owner removed 19 ephemeral remote branches; connector independently confirmed four retained GitHub branches: `main`, `refactor/v2`, `feature/v3-home-agent`, and Gate E review. See `docs/V3-GITHUB-CLEANUP-2026-10-12.md`. V3 production unchanged. Gate D runtime health and Pi DEV resync remain to verify.
