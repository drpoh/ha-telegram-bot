# V3 production checkpoint — 2026-10-11

## Independently observed
- Owner supplied `systemctl --user show rs-home-ai-v3.service` output: `ExecStart=/usr/bin/node /home/drpoh/projects/rs-home-ai-v3-release-c6a9812/src/pilot/telegram-readonly.mjs`; `WorkingDirectory=/home/drpoh/projects/rs-home-ai-v3-release-c6a9812`; `ActiveState=active`, `SubState=running`, PID `1780`, process start 2026-10-11 20:45:01 EEST.
- Owner tested current bot after the version switch: `/status` responded journal available; `/sauna` reported 87.625 °C / ready; temperature question 87.8125 °C / ready; readiness question 87.875 °C / ready. Telegram functional checks 4/4 succeeded.
- Source commit of the installed immutable release is `c6a9812c7b43348841be33150cf82e5184d030e8`; owner confirmed the RELEASE_COMMIT file before promotion. Former release `97343fa` was confirmed present before promotion.
- Pi DEV `c6a9812` had 166 isolated test files / 644 assertions / 0 failures. Latest GitHub feature integration has continued beyond this release; do not mix DEV HEAD with deployed release.

## Outstanding acceptance before stable designation
- [ ] After switch, test private Telegram: `Включи свет в тамбуре` → `/cancel` → `/confirm`; verify cancelled action is not executed. Do not perform a confirmed physical light write solely for release acceptance.
- [ ] Verify old release directory and saved systemd unit backup remain readable and inspect the effective unit for unmanaged overrides; do not expose secrets.
- [ ] Verify that only one V3 Telegram polling process owns the bot token and V2 remains unaffected (read-only service/process inspection).
- [ ] Consider a reviewed rollback rehearsal only in a separate approved maintenance window. Do not mark disaster-recovery Gate D complete based on release rollback path alone.

## Planned one-off cleanup — separate from production
Current GitHub inventory on 2026-10-11 after PR #17: **20 branches and zero open PRs**. Preserve `main`, `refactor/v2`, and `feature/v3-home-agent`. Review historical `review/gate-e-target-snapshot-hardening-20261009` separately. The **16 other non-keep branch heads** correspond to completed short-lived PRs; verify each merged PR's final head SHA, absence of later commits, protection, Actions/other consumers before deletion. The connected GitHub tools do **not** provide branch deletion. Do not assert the branches are removed or send an unchecked bulk delete command.

Pi inventory must be done read-only with `scripts/audit-pi-layout.mjs`, `systemctl --user show` and system-wide service inspection before removing or archiving any file/directory. Preserve active `c6a9812`, previous `97343fa`, V2 checkout, owner credentials, external SQLite claims, backups, and historical V3 checkout until external callers are excluded. No deletion of 77 imported `src/decision` modules based on size alone.

**Optimization goal:** one canonical DEV source, one immutable running V3 release, one rollback release, concise current TODO/HANDOFF, GitHub branches minimized only after safe validation. Then resume user-facing V3 light-status and Assist work; do not create another infrastructure framework.
