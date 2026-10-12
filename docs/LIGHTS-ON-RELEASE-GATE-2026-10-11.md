# /lights_on — Pi DEV acceptance and reversible release gate

Status: **source candidate only**, not installed into live Telegram V2. GitHub PR/CI validates fixtures, not a real HA-MCP endpoint or Raspberry Pi compatibility.

## Scope and outcome

- Existing V2 Telegram entry: `src/telegram/bot.mjs`, command `/lights_on`, owner-only **private chat**. No new Telegram bot or poller.
- `src/home/discovered-lights-overview.mjs` makes exactly one `ha_search` read with a 5s caller deadline. Rejects partial/paginated/invalid inventories; distinguishes `unknown` from `off`; shows up to 20 ON entity IDs and accurate totals.
- **Known limitation**: `src/mcp/executor.mjs` currently destructures the optional third argument as `{mcpClient}`; it does **not** forward an AbortSignal to the SDK. The caller returns unavailable on deadline, but underlying read may continue and existing `callHA` may update session/device memory from an eventual result. Do not describe this as socket cancellation. Evaluate SDK API and memory/read-only side effects before any release.
- This is read-only status; no generic whole-room, batch or autonomous write authorization follows from it.

## Operator-only DEV synchronization and compatibility

Do not run commands in `/home/drpoh/ha-telegram-bot`, `/home/drpoh/rs-home-ai-v3` or the pinned V3 release path. On Pi **canonical DEV only**, inspect first:

```sh
cd /home/drpoh/projects/rs-home-ai-dev
git status -sb
git log -1 --oneline
git fetch origin feature/v3-home-agent
git rev-list --left-right --count HEAD...origin/feature/v3-home-agent
```

Only if DEV is **clean**, on `feature/v3-home-agent`, and `git rev-list` reports 0 locally unique commits, fast-forward DEV only:

```sh
git merge --ff-only origin/feature/v3-home-agent
npm test
git status -sb
```

Stop on dirty tree, divergence, unexpected branch, missing dependencies or any failed test; never reset/rebase/fix by replacing a checkout. Record real test exit status; GitHub x64 test pass does not prove ARMv7 compatibility.

## Release readiness — still requires explicit owner decision

1. Independently inspect effective V2 systemd `ExecStart`, `WorkingDirectory`, actual executable SHA, relevant runtime dependency support and saved rollback artifact. No assumption that `feature/v3-home-agent` is safe for drop-in production.
2. Verify HA-MCP `ha_search` live **read-only** response contract and endpoint trust/security from allowed source; no live HA writes or network reconfiguration.
3. Verify SDK cancellation/late response side effects and Telegram privacy controls. If unresolved, fix dev source and re-run offline/ARMv7 tests before promotion.
4. Prepare a separately versioned immutable candidate V2 artifact (never overwrite live checkout), externalize secrets, check systemd and dependencies, preserve durable state and backups, and document exact rollback/stop procedure.
5. Request owner approval for the versioned release and a controlled, reversible private Telegram read-only acceptance. No automatic deployment on CI pass.
6. If approved and launched, check `/lights_on` with actual ON, OFF, UNKNOWN cases and after an MCP outage. Confirm V2/V3 coexist with one poller per token, Home Assistant continues independently. Roll back on regression.

## Next value milestone

After verified read-only `/lights_on`, expose a bounded room status query by reusing existing ingress and HA-MCP trusted reads; then Home Assistant Assist/Atom Echo as an adapter to the **same** deterministic policy engine. Keep Gate B broader actuation disabled.
