# V3 DEV automation — GitHub + systemd (2026-10-12)

Goal: remove routine manual Pi commands with a **pull-only, production-isolated** user systemd timer. It polls the approved GitHub feature branch every six hours, fast-forwards a clean canonical DEV checkout, runs `npm test` with a 15-minute timeout and, only after success, packages an immutable candidate under `~/projects/rs-home-ai-v3-candidates/`. A lock prevents overlapping runs. The job writes only `~/.local/state/rs-home-ai-dev-automation/latest.txt`; inspect status with `cat`, or `journalctl --user -u rs-home-ai-dev-check.service`. Nothing automatically starts candidate or modifies V2/V3 services.

## One-time owner installation (after CI and Pi verification)

```bash
cd ~/projects/rs-home-ai-dev &&
test -z "$(git status --porcelain)" &&
git fetch origin feature/v3-home-agent &&
git merge --ff-only origin/feature/v3-home-agent &&
bash scripts/automation/install-dev-check.sh
```

The installer refuses dirty/wrong DEV or existing differing units, creates private candidate/state directories, installs exactly two **user** systemd units and enables the timer. It never restarts the Telegram bot. First automatic run can happen based on calendar/persistent timer. Optional operator one-off run: `systemctl --user start rs-home-ai-dev-check.service`.

**Security boundaries:** unit uses `ProtectSystem=strict`, `ProtectHome=read-only`, `ReadWritePaths` for DEV/candidates/automation state **only**, and `InaccessiblePaths` for V2, Gate D old checkout, V3 private token/claims. It deliberately has network access for GitHub and npm. The job runs repository-supplied tests; only trusted reviewed feature branch may be used, and it is **not a secure runner for arbitrary/untrusted PR code**. Never add public webhooks, expose tokens, or permit ChatGPT text to become shell commands. If the local Pi's systemd cannot enforce namespace protections, service must fail instead of silently running unconfined. This is not a replacement for an isolated CI host.

## Remote ChatGPT→Pi

Existing authorized Desktop Commander connector is preferred for interactive operator diagnosis. Its quota was observed at zero on 2026-10-12; thus **direct remote command execution is currently unavailable from this chat**. Reconnect/upgrade quota through the connector UI when available. The systemd path works without this connector. SSH via Tor/Tailscale can help humans, but does not itself grant ChatGPT shell access. Do not install an unreviewed Telegram command executor or an internet-facing endpoint.

## Rollout gate

Auto-generated candidates **do not deploy**. Verify V2 and Gate D and HA-MCP scoped reads, review candidate SHA, preserve rollback `c6a9812` and private SQLite/credentials, then ask owner to separately approve production switch. Use immutable release promotion flow; one Telegram poller per token. Current V3 remains pinned.

## Disable or inspect

```bash
systemctl --user list-timers rs-home-ai-dev-check.timer --no-pager
cat ~/.local/state/rs-home-ai-dev-automation/latest.txt
journalctl --user -u rs-home-ai-dev-check.service -n 40 --no-pager
# Stop automation, not V3:
systemctl --user disable --now rs-home-ai-dev-check.timer
```

The timer is initially a **candidate** until the owner runs the one-time install; no claim of installed Pi state is made here.
