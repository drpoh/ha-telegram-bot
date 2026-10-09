# RS Home AI v3 operations (Raspberry Pi)

## Isolation
- Dedicated checkout: `/home/drpoh/rs-home-ai-v3` (branch `feature/v3-home-agent`).
- Dedicated user systemd service: `rs-home-ai-v3.service`; runs as `drpoh`.
- Dedicated private configuration: `/home/drpoh/.config/rs-home-ai-v3` (0700); tokens and local approved policy must never enter Git.
- v2 service `ha-telegram-bot.service` is independent and must not be restarted by v3 procedures.
- V3 dependencies are installed privately with `npm ci --omit=dev --ignore-scripts`; no v2 `node_modules` symlink remains.

## Automatic startup
`loginctl show-user drpoh -p Linger` should return `yes`.
The v3 user service is enabled at `default.target`, waits for network, and restarts on failure with 8-second delay, limited to 5 attempts in 120 seconds.

## Operator commands
Use `systemctl --user status rs-home-ai-v3.service` from an ordinary interactive drpoh login; or set `XDG_RUNTIME_DIR=/run/user/1000` and `DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus` in a non-login remote shell.
- Stop / immediate rollback: `systemctl --user stop rs-home-ai-v3.service`
- Start: `systemctl --user start rs-home-ai-v3.service`
- Disable startup: `systemctl --user disable rs-home-ai-v3.service`
- Logs (if journal available): `journalctl --user -u rs-home-ai-v3.service -n 50 --no-pager`

## Safety
V3 controls only `light.led_kukhnia` after trusted Telegram confirmation, pinned private operator policy, and fresh registry validation. If V3 is stopped or fails, HA Green and v2 continue independently. Do not copy secrets or put private MCP path in logs/docs.

## Real resilience test — 2026-10-08
- Installed private v3 dependencies with `npm ci --omit=dev --ignore-scripts`; shared v2 `node_modules` symlink was removed.
- Restarted only the v3 systemd user service: active; v2 systemd service remained active.
- Terminated the supervised v3 Node process with SIGKILL. After the configured restart delay, systemd showed `ActiveState=active`, a new MainPID and `NRestarts=1`; v2 service remained active.
- Full Raspberry Pi host reboot was later authorized and completed on 2026-10-08; see below.

## Real host reboot verification — 2026-10-08
- Raspberry Pi rebooted at 23:29:59 EEST. v2 system service automatically active from 23:30:18; v3 user service automatically active from 23:30:22. Both units were enabled.
- V3 Telegram `/status` replied after reboot. Read-only HA-MCP `ha_get_state` for `light.led_kukhnia` returned `off`; no device action was performed by this check.
- Desktop Commander Remote initially stayed offline after reboot: it had been running manually. Created separate user `desktop-commander-remote.service` (enabled with `Restart=always`, using the pinned cached package and Node 22 executable). Stopped the original manual agent, then confirmed Remote connection remained online through the new service; v2 and v3 stayed active.
- Full reboot verification of the **new Desktop Commander service** has not yet been performed. Treat it as a remaining test, not a passed gate. Its cached `npx` executable path may need maintenance after npm cache cleanup.
- Neither Home Assistant Green nor physical device entities were modified during these operations.

## Night unattended read-only checks — 2026-10-08
- After the 23:29:59 EEST host boot, `ha-telegram-bot.service`, `rs-home-ai-v3.service` and `desktop-commander-remote.service` all reported active. The last two were enabled; `drpoh` linger was enabled.
- Remote Desktop Commander returned online and accepted new commands after detaching the manual process. No second host reboot had been done to verify its *boot-time* activation.
- V3 isolated test suite: `npm test`, 92 test files, 360 assertions, 0 failed files. Log: `/tmp/rs-v3-night-tests.log` (transient local file).
- Read-only HA-MCP `ha_get_state` for `light.led_kukhnia`: `off`, with `isError=false` and process exit code 0. No physical switching.
- Private configuration permissions: directory 0700, Telegram token and private MCP URL 0600, Desktop Commander device credential file 0600.
- Raspberry Pi system remained sufficiently available for read-only checks; v2 reported active during testing. No change to HA Green or v2 was made.
- A later read-only follow-up was completed on 2026-10-09; see the results below.

## Follow-up health check — 2026-10-09 04:05 EEST
- v2, v3 and Desktop Commander Remote: active/running and enabled; no service restarts since last start.
- HA-MCP read-only state for `light.led_kukhnia`: `off`, `isError=false`, process exit 0. No physical switching.
- Original `npm test` log: 92 test files, 360 passed assertions, 0 failed files. Original exit code was not recorded.
- No warning-or-higher journal entries for these three services since the last Raspberry Pi boot.
- Desktop Commander user unit passes systemd verification; full post-install host reboot remains untested.
- Branch `feature/v3-home-agent` matched origin at the time of inspection.
- OS issue: local console getty repeatedly attempts automatic login to missing user `pi`, generating thousands of error logs. Left unchanged pending review.
- Existing whole-home rollout gates remain open. HA Green and v2 were not modified.
- Independent repeat of `npm test` on 2026-10-09: 92 isolated test files, 360 passed assertions, 0 failed files; explicitly captured `NPM_TEST_EXIT=0` (exit 0). Local log: `/tmp/rs-v3-morning-tests.log`.

## Post-overnight stabilization review — 2026-10-09
- Confirmed root cause of Raspberry Pi console error: `/etc/systemd/system/getty@tty1.service.d/autologin.conf` sets `agetty --autologin pi`; `getent passwd pi` returns no user. `getty@tty1.service` showed thousands of restarts. Repair requires an authorized privileged edit, deferred; unrelated bot services were left unchanged.
- Read-only HA-MCP `ha_get_state(light.led_kukhnia)` again returned `off` with `isError=false`; v2, v3 and Desktop Commander remained active. No HA configuration or device state was changed.
- Focused standalone security tests passed: channel intent ledger, one-shot intent ledger, in-flight invalidation, kitchen MCP dispatch boundary, single target scope and registry capability guard.
- A seventh standalone test (`gate-c-confirmation-faults`) failed to initialize because standalone execution omitted required synthetic `TELEGRAM_BOT_TOKEN`. It **did pass** as part of the full isolated suite (92 files, 360 assertions, zero failures), whose harness supplies isolated synthetic environment variables. A follow-up standalone attempt was blocked by remote tool policy; no attempt to bypass it was made. No product regression has been established from this isolated launch error.
- Desktop Commander auto-start following an actual host reboot remains an unverified acceptance condition. Gate B authorizes only the previously approved single light with Telegram per-action confirmation; never expand physical scope without approval.

## Console autologin correction verified — 2026-10-09 05:10 EEST
- Owner disabled the invalid `pi` autologin override by renaming it to `autologin.conf.disabled`. `systemctl cat getty@tty1` no longer includes the bad override. No new `pi` login failures observed after 05:09:33 at inspection.
- v2, v3 and Desktop Commander services all remained active. `getty@tty1.service` currently reports `disabled` and `inactive`; interactive local tty1 availability is NOT confirmed and may require a separate privileged enable/start if desired. No effect on SSH was observed.

## Local console restored — 2026-10-09 05:11 EEST
- Owner ran privileged `systemctl enable --now getty@tty1.service` following removal of invalid `pi` autologin override. Verified `getty@tty1.service`: `enabled`, `active`, `NRestarts=0` and journal only shows clean startup at 05:11:16. v2, v3 and Desktop Commander remained active.
- A subsequent full isolated test run for Gate C was started in `/tmp/rs-v3-gate-c-20261009.log`; record the final result only after process exit is observed, not while running. No live physical actuation was requested.
