# V3 sauna immutable candidate — controlled promotion

Status: **preparation only**. The live systemd service still uses `rs-home-ai-v3-release-97343fa`; this document does not authorize switching it.

## Evidence already obtained
- Owner Telegram: `/start`, `/status`, empty `/confirm`, `/cancel`, and light intent→cancel→confirm pass on current live release.
- Pi DEV commit `3a889da`: 166 test files, 643 assertions, zero failures.
- Owner read-only live HA-MCP test: sauna temperature `75.875 °C`, readiness `off`, `summarizeSauna` complete.
- GitHub PR #15 extends fixtures to real HA-MCP response shape, merged `8cbedd1`. Pi test on this new commit still pending.

## Safe candidate creation (no systemd changes)

On Raspberry Pi:

```sh
cd /home/drpoh/projects/rs-home-ai-dev
git status -sb
git fetch origin feature/v3-home-agent
git rev-list --left-right --count HEAD...origin/feature/v3-home-agent
git merge --ff-only origin/feature/v3-home-agent
npm test
bash scripts/prepare-v3-release-candidate.sh
```

Before the merge, **stop** if DEV has local changes or local-only divergent commits. The packaging script itself rejects wrong branch, dirty tree, mismatch with fetched origin and existing target. It makes a new uniquely named release directory from an exact Git commit, installs lockfile dependencies using `npm ci --omit=dev --ignore-scripts`, validates entrypoint syntax and prints path/SHA. It neither starts another Telegram poller nor changes systemd.

## Final owner-controlled promotion gate (NOT automated)

1. Confirm candidate source/lockfile, `RELEASE_COMMIT`, `node_modules` permissions and actual systemd `ExecStart`. Verify `sauna-status.mjs` uses exact sensor ID scope; `ha_call_service` remains limited to `light.tambur_svet_l1`.
2. Check read-only candidate sensor access through the same trusted MCP endpoint. Confirm no unexpected network/credential or trust boundary change; review source restriction before any expanded permission.
3. Preserve a working `97343fa` release and backup the **unit text** (not the secret files). Preserve external claims DB under `~/.local/state/rs-home-ai-v3`; never copy it into a release or reset it.
4. Record the exact previously effective systemd unit, previous ExecStart, rollback path and a time-bound operator maintenance window. Never start both instances with the same Telegram bot token.
5. Ask owner for explicit production switch approval. Only then atomically update the **user** unit to point to the new immutable candidate, reload the user manager, restart exactly once, validate health/logs and rollback to the previous ExecStart if failure. Never run the tracked historical `deploy/rs-home-ai-v3.service` template unchanged.
6. In private Telegram: `/status`, `/sauna`, `Какая температура в сауне?`, `Сауна готова?`; verify actual readbacks, then pending/cancel/confirm protection. If unavailable, show unknown rather than guessed state.
7. Once stable, record active release and tests in `CHAT-HANDOFF.md`, `TODO.md`, `WORKLOG.md`.

Do **not** delete old Pi release folders or stale GitHub heads as part of promotion. Rollback retention and branch cleanup remain separate reviewed housekeeping.
