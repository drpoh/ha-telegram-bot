# V3 cleanup checkpoint — 2026-10-11

## Confirmed stable running feature
- Systemd user unit runs immutable release `c6a9812`, active/running. Previous `97343fa` retained.
- Telegram `/status`, `/sauna`, natural-language temperature/readiness requests succeeded with real HA readings.
- Post-switch request `Включи свет в тамбуре` → `/cancel` → `/confirm`: pending, cancelled, then missing; **no confirmed write requested**. Physical light state was not independently checked.
- DEV last owner-verified `c6a9812`, 166 files / 644 assertions, no failures; GitHub integration subsequently advanced.

## One-time cleanup — strict order
1. Record a **read-only Pi inventory** first: actual user/system units, directory sizes, Git status, references to historical files, release paths and disk free. Do not read secrets or launch any bot. Never delete production folders, SQLite claims or V2.
2. GitHub: preserve `main`, `refactor/v2`, `feature/v3-home-agent`; short-lived branches of merged PRs are cleanup candidates **only** after checking branch head against merged PR, branch protection and external consumers. Squash merges make ancestry-only pruning unsafe. GitHub connector cannot delete branches.
3. Source: 77 `src/decision` modules have static references; no verified safe deletions. Retain `scripts/legacy` as historical; root `bot.mjs` and `smoke-auto-safe.mjs` may have manual/cron consumers and cannot be deleted from repository without audit.
4. Documentation: keep `AGENTS.md`, `docs/TODO.md`, `docs/CHAT-HANDOFF.md`, `docs/WORKLOG.md`, `docs/PROJECT-MAP.md` as current entrypoints; historical files remain source evidence, not runtime dependencies.
5. Release and old Pi checkouts: preserve `c6a9812`, `97343fa`, V2 runtime checkout, and any older release until effective systemd/rollback references and backup retention are independently reviewed.
6. Sync canonical Pi DEV only after clean Git status, fetch + `merge --ff-only`, `npm test`. GitHub commits never auto-promote to production.

## Scope of current change
This checkpoint documents the approved cleanup boundary and supplies only **read-only audit support**. No removal, systemd operation, secret inspection, Home Assistant mutation, permission change, or bot poller was performed.

## Exit criterion
Produce a classified inventory: active, rollback, test-only, historical with external references unverified, safe-to-remove. Then remove only verified safe candidates in a separate, tested PR and use an explicitly reviewed operator step for remote branch deletion. Return development to user-facing V3 lighting summary / Assist.
