# V3 DEV automation — GitHub + systemd (2026-10-12)

Goal: remove routine manual Pi commands with a **pull-only, production-isolated** user systemd timer. It polls the approved GitHub feature branch every six hours, fast-forwards a clean canonical DEV checkout, verifies a successful exact-SHA GitHub Actions push run using a read-only GitHub API token, and only after success packages an immutable candidate under `~/projects/rs-home-ai-v3-candidates/`. A lock prevents overlapping runs. The job writes only `~/.local/state/rs-home-ai-dev-automation/latest.txt`; inspect status with `cat`, or `journalctl --user -u rs-home-ai-dev-check.service`. Nothing automatically starts candidate or modifies V2/V3 services.

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

**Owner verified 2026-10-12:** timer installed and service manually triggered successfully; `stage=complete`, `status=passed`, `exit_code=0` at 07:10 UTC for `b1122bd`, candidate `rs-home-ai-v3-release-b1122bd` with exact `RELEASE_COMMIT` observed. This is NOT proof of an unattended later run, STAGE acceptance, or production deployment.

## Verified GitHub CI split (2026-10-12 update)
The private repo needs authenticated read-only GitHub Actions metadata. The new `.github/workflows/v3-dev-verified-gate.yml` runs all offline tests on every push to `feature/v3-home-agent`. The Pi runner verifies the **same SHA**, branch, `push` event, workflow path, repository, completed status and success conclusion via official GitHub API. If there is no matching run or the API is inaccessible, candidate generation is denied. `workflow_dispatch` runs never satisfy this gate.

**One-time credential**: create a fine-grained GitHub PAT for **only** `drpoh/ha-telegram-bot` with **Actions: Read-only** and **Metadata: Read-only**, preferably with an expiration. Store the value locally, never paste it into ChatGPT or commit it:
```bash
install -d -m 700 ~/.config/rs-home-ai-dev
umask 077
read -rsp 'GitHub read-only fine-grained token: ' GH_RO_TOKEN; echo
printf '%s' "$GH_RO_TOKEN" > ~/.config/rs-home-ai-dev/ci-token
unset GH_RO_TOKEN
chmod 600 ~/.config/rs-home-ai-dev/ci-token
```
The token file is read by the job under `ProtectHome=read-only`; file mode/owner are checked before use. No write credentials are needed on Pi. Do not use a broad classic PAT, user SSH private key, or CI token shared in chat.

To apply GitHub updates in the canonical DEV checkout, run `git fetch origin feature/v3-home-agent && git merge --ff-only origin/feature/v3-home-agent`. The existing installed user unit can remain; its script path follows DEV checkout. No production service is modified. Check `latest.txt` for `stage=ci_gate` while GitHub's push run is pending or token is missing. Wait for GitHub CI to pass rather than bypassing the check.

**Why split:** systemd's user sandbox maps root-owned `/` and `/home` to UID 65534; real security policy tests deliberately reject that ownership and must not be weakened. GitHub Actions runs the full test suite instead; Pi runs the existing isolated immutable candidate preparation with node syntax checks and `npm ci --ignore-scripts`. Full Pi hardware integration testing and production approval remain separate gates.
