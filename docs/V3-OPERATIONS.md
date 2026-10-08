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
