# Raspberry Pi read-only diagnostics over Tor and GitHub Actions

Status: **not deployed** until the owner configures a separate SSH key, host pin and GitHub Secrets. Costs: GitHub-hosted runner minutes subject to account/repository free quotas. Do not confuse this with production access or HA control.

## Boundaries

- The workflow is **manual-only** (`workflow_dispatch`) on the GitHub **default branch**, with no scheduled/push trigger, no repository checkout, and `contents: read` permission.
- GitHub-hosted Linux runner connects to the Pi's existing Tor v3 onion SSH service via a local Tor SOCKS5 proxy. No port forwarding/router/public IPv4 changes.
- Dedicated SSH key is restricted in Pi `authorized_keys` with `restrict,command=...` (no shell, no forwarding, no PTY). The installed script only accepts `SSH_ORIGINAL_COMMAND=diagnose-v1`; it never executes input.
- It prints only DEV branch/short SHA/clean-vs-modified, three systemd statuses and a simple HA-MCP HTTP *reachability* indicator. MCP reachable **does not** mean full MCP API access, authenticated reads, or that lights can be switched.
- It never pulls, installs packages on Pi, restarts services, alters HA, reads the HA token, or attempts `ha_call_service`.
- Host's ED25519 public key is pinned through `PI_DIAG_KNOWN_HOSTS`; SSH fails closed on host-key mismatch. Do not use `StrictHostKeyChecking=no`.
- Reports are short-lived artifacts (3 days) and also appear in workflow logs. No private URLs or raw HA attributes are printed.
- Keep the bot's existing Tor, Termux and SSH keys unchanged. This new key is for **diagnostics only**.

## One-time Pi setup (run locally on Pi or through your existing Termux SSH)

First merge the small reviewed PR containing this workflow into **main**; `workflow_dispatch` is not available until the workflow file is on the default branch. GitHub PR approval alone does not configure secrets or deploy anything.

```bash
# Use your already working SSH session on the Raspberry Pi as drpoh.
set -e
mkdir -p -m 700 ~/.ssh ~/.local/bin ~/.config/rs-home-ai-gh-diag
if [ -e ~/.ssh/rs-home-ai-gh-diag ]; then
  echo "Diagnostic key already exists: stop and review before replacing"
else
  ssh-keygen -q -t ed25519 -f ~/.ssh/rs-home-ai-gh-diag -N '' -C 'github-actions-readonly-pi'
fi
# Download only the reviewed source from the remote GitHub branch, without
# resetting/updating the DEV working tree.
git -C ~/projects/rs-home-ai-dev fetch origin main
git -C ~/projects/rs-home-ai-dev show FETCH_HEAD:scripts/ops/rs-home-ai-gh-readonly-diagnostic.sh \
  > ~/.local/bin/rs-home-ai-gh-readonly-diagnostic.sh
chmod 700 ~/.local/bin/rs-home-ai-gh-readonly-diagnostic.sh
# The dedicated key is appended: it does not revoke existing Termux access.
printf 'restrict,command="/home/drpoh/.local/bin/rs-home-ai-gh-readonly-diagnostic.sh" %s\n' \
  "$(cat ~/.ssh/rs-home-ai-gh-diag.pub)" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Before entering the new secrets, test the installed script **locally** with the fixed original command:

```bash
SSH_ORIGINAL_COMMAND=diagnose-v1 ~/.local/bin/rs-home-ai-gh-readonly-diagnostic.sh
```

It must print a small `KEY=value` report with `HA_WRITES=none`. No sensitive paths, logs, tokens or full HA responses should be printed.

## Configure the three GitHub Actions repository Secrets

In repository **Settings → Secrets and variables → Actions → New repository secret**:

1. `PI_DIAG_ONION`: the existing **56-character Tor v3 hostname**, ending in `.onion`. Never paste this into an issue or public repo.
2. `PI_DIAG_SSH_KEY`: **one-line Base64 encoding** of the dedicated private key `~/.ssh/rs-home-ai-gh-diag`, produced on the Pi by `base64 -w 0 ~/.ssh/rs-home-ai-gh-diag; echo`. Copy that entire line into the GitHub Secret; the workflow decodes it before SSH validation. Treat Base64 as sensitive private key material: never paste in chat, commit it or use the existing Termux private key.
3. `PI_DIAG_KNOWN_HOSTS`: a line `<the-same-onion-host> ssh-ed25519 <Pi-SSH-host-public-key-base64>`, where the key comes from the Pi's `/etc/ssh/ssh_host_ed25519_key.pub` (this is a public host key, **not** the user's diagnostic key). This pins the server identity.

To prepare the third value on the Pi, run this without saving the host in shell history:

```bash
read -r -p 'Existing Tor onion hostname: ' PI_ONION
printf '%s %s\n' "$PI_ONION" "$(cut -d' ' -f1,2 /etc/ssh/ssh_host_ed25519_key.pub)"
unset PI_ONION
```

Copy the printed line **directly into the GitHub Secret**. Do not send any secret, key, onion hostname or token to ChatGPT.

## First manual run

Open **Actions → Raspberry Pi read-only diagnostics via Tor → Run workflow** on `main`. Wait for a result. Inspect job output or the `raspberry-pi-readonly-report` artifact; only the fields below should appear:

```text
DIAG_VERSION=1
DEV_BRANCH=feature/v3-home-agent
DEV_HEAD=<short-sha>
DEV_TRACKED_TREE=clean|modified
V3_SERVICE=active|inactive|failed|unknown
DEV_CHECK_TIMER=active|inactive|failed|unknown
V2_SERVICE=active|inactive|failed|unknown
HA_MCP_HTTP=reachable|unverified
HA_WRITES=none
```

Do not treat example values as evidence of today's Pi state. The runner waits up to 120 seconds for Tor to report `Bootstrapped 100% (done)` before attempting SSH, then makes at most two strictly pinned SSH attempts. The combined timeout is bounded by the ten-minute job limit. If the workflow still fails, check the stage and SSH error; a banner-exchange timeout may indicate onion reachability or Tor service issues on the Pi and is not proof of a wrong SSH key. Never disable key pinning, expose TCP 22, or disable Tor security to make it pass.

## Rollback

Disable/delete the workflow in GitHub and remove the **single** authorized_keys entry containing `github-actions-readonly-pi` (or the dedicated public key). Delete the three GitHub Secrets; optionally remove `~/.ssh/rs-home-ai-gh-diag*` and `~/.local/bin/rs-home-ai-gh-readonly-diagnostic.sh`. Do not edit any other SSH keys, Tor settings, services or runtime checkouts.

## Next expansion after first successful report

Review adding an explicitly bounded read-only HA-MCP state check. Keep shell command execution blocked: any future HA writes or new V3 permission scopes require separate physical identity confirmation and deployment approval, not this diagnostics channel.
