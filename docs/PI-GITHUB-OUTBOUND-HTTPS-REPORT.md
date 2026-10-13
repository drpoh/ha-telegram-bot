# Raspberry Pi → GitHub diagnostics over HTTPS (manual pilot)

**Status:** code-only, not installed, not scheduled and no token configured. This replaces the *proposed* inbound Tor/GitHub Actions diagnostic path once acceptance succeeds. The existing Pi diagnostic SSH script is reused strictly as a local fixed-output collector.

## Privacy and access boundaries

**WARNING: the repository is public and issue comments are public.** This approach is suitable only for the explicitly allowlisted operational fields (DEV Git branch/short commit/tracked cleanliness, three service states and HTTP MCP reachability). Do not send raw HA state, personal information, device inventory, logs, secrets, IP addresses, onion hostnames or private URLs. `HA_MCP_HTTP=reachable` is not proof of authenticated HA-MCP access.

The Node.js sender needs outgoing HTTPS to `api.github.com`, using a fine-grained GitHub personal access token limited to **only** `drpoh/ha-telegram-bot` with **Issues: Read and write** permission (Metadata: Read is implicit). Keep repository Contents, Actions, Secrets, Workflows etc. without write access. Do **not** reuse existing SSH keys, Telegram credentials, HA or MCP tokens.

## Operator setup after PR merge

1. Create a dedicated **public** GitHub Issue for reporting and note its number. Avoid automatic or recurrent posting until explicitly approved. Choose another private destination instead if even these limited status fields must stay private.
2. Create fine-grained token in GitHub settings (only this repository; Issues read/write, shortest workable expiration). Never paste the token in ChatGPT or any committed file.
3. On Pi, install the *reviewed* sender from `main` without changing DEV checkout, live V2/V3 or HA:

```bash
mkdir -p "$HOME/.local/bin" "$HOME/.config/rs-home-ai-gh-report"
chmod 700 "$HOME/.config/rs-home-ai-gh-report"
git -C "$HOME/projects/rs-home-ai-dev" fetch origin main
git -C "$HOME/projects/rs-home-ai-dev" show FETCH_HEAD:scripts/ops/rs-home-ai-pi-report-github.mjs \
  > "$HOME/.local/bin/rs-home-ai-pi-report-github.mjs"
chmod 700 "$HOME/.local/bin/rs-home-ai-pi-report-github.mjs"
node --check "$HOME/.local/bin/rs-home-ai-pi-report-github.mjs"
```

4. Store the fine-grained token in `~/.config/rs-home-ai-gh-report/token` with permission 0600. Prefer a hidden interactive read so it is not echoed or captured in shell history:

```bash
umask 077
read -r -s -p 'GitHub fine-grained token: ' GH_REPORT_TOKEN
printf '\n'
printf '%s' "$GH_REPORT_TOKEN" > "$HOME/.config/rs-home-ai-gh-report/token"
unset GH_REPORT_TOKEN
chmod 600 "$HOME/.config/rs-home-ai-gh-report/token"
```

5. Manually send **one** report. Replace `123` with the dedicated issue number:

```bash
RS_PI_GITHUB_REPORT_ISSUE=123 \
RS_PI_GITHUB_REPORT_CONFIRM=PUBLIC_READONLY_REPORT \
node "$HOME/.local/bin/rs-home-ai-pi-report-github.mjs"
```

Expected result: `REPORT=sent` and the GitHub issue comment URL. Inspect the issue publicly and ensure the listed fields contain no personal details. For `REPORT=github_http_401` or `403`, verify token permissions/expiry; for `404`, verify repository issue number and token repository access. Never log or share the token. Sender fails closed on unexpected diagnostic fields and never calls HA write APIs.

## Deployment, retention and rollback

The first version is **manual-only**; no timer, daemon, cron, GitHub workflow triggers, HA scopes, repository commits or service changes. Each invocation creates one public comment. Consider a timer only after acceptance and a decision on comment retention/rate limits. Revoke the new token and delete the local token file to disable reporting immediately.

After a successful manual outbound report, retire the unused GitHub-hosted Tor diagnostic workflow and revoke the dedicated inbound Tor SSH diagnostic key and three related GitHub Secrets in a **separate reviewed cleanup**. Do not remove Termux SSH or production credentials.
