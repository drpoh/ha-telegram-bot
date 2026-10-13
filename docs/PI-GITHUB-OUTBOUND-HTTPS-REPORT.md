# Private Raspberry Pi diagnostics via outbound HTTPS

**Code ready, not deployed.** Reports are pinned to `drpoh/rs-home-ai-private-reports`, a separate repository that **must be Private**. Do not send reports into the public `drpoh/ha-telegram-bot` repository.

The Pi initiates HTTPS requests to GitHub's API. Before collecting or sending data, the reporter verifies the destination's exact repository identity, `private=true`, `visibility=private`, Issues enabled, and a valid open Issue (not a PR). All failures stop the sender. Reports contain only allowlisted statuses of DEV Git, V2/V3 systemd services and HA-MCP HTTP reachability. No HA write operations, logs, tokens, addresses or other device data are included.

## Owner setup

1. Create **Private** repository `rs-home-ai-private-reports` under account `drpoh` at https://github.com/new . Keep Issues enabled. This action must be performed by the owner in GitHub UI; the available connector does not create repositories.
2. Create an issue named `Pi read-only diagnostics`; note its number.
3. Create a fine-grained token at https://github.com/settings/personal-access-tokens/new limited **only** to `drpoh/rs-home-ai-private-reports`; grant **Issues: Read and write** (Metadata: Read is automatic), no Contents/Actions/Administration write. Set a short expiration. Never share or commit this token.
4. Install the code on Pi without changing the DEV worktree or any running services:

```bash
mkdir -p "$HOME/.local/bin" "$HOME/.config/rs-home-ai-gh-report"
chmod 700 "$HOME/.config/rs-home-ai-gh-report"
git -C "$HOME/projects/rs-home-ai-dev" fetch origin main
git -C "$HOME/projects/rs-home-ai-dev" show FETCH_HEAD:scripts/ops/rs-home-ai-pi-report-github.mjs > "$HOME/.local/bin/rs-home-ai-pi-report-github.mjs"
chmod 700 "$HOME/.local/bin/rs-home-ai-pi-report-github.mjs"
node --check "$HOME/.local/bin/rs-home-ai-pi-report-github.mjs"
```

5. Enter the token only on Pi, into a 0600 file:

```bash
umask 077
read -r -s -p 'Private reports token: ' GH_REPORT_TOKEN
printf '\n'
printf '%s' "$GH_REPORT_TOKEN" > "$HOME/.config/rs-home-ai-gh-report/token"
unset GH_REPORT_TOKEN
chmod 600 "$HOME/.config/rs-home-ai-gh-report/token"
```

6. **Manually**, after verifying target privacy, send one report; substitute the real Issue number:

```bash
RS_PI_GITHUB_REPORT_ISSUE=123 RS_PI_GITHUB_REPORT_CONFIRM=PRIVATE_READONLY_REPORT node "$HOME/.local/bin/rs-home-ai-pi-report-github.mjs"
```

Expected: `REPORT=sent` and a GitHub Issue comment URL in the private repository. The script does not schedule reports. For a 403/404 check token scope, repository identity and issue number; **never disable privacy checks**.

## Security and rollback

Private GitHub Issues are accessible to authorized collaborators and GitHub, not end-to-end encrypted. Use minimal token permissions and no sensitive raw diagnostics. To stop reporting, revoke the token and remove the local token file. Once a report succeeds, separately review retirement of the old Tor-inbound GitHub Actions diagnostic channel and its diagnostic-only SSH credentials. Do not alter Termux SSH or production.
