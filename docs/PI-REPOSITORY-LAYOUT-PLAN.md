# Raspberry Pi and Git repository layout — reviewed 2026-10-10

Status: **planning + read-only inventory tool only**. No files moved, no production units changed. Current real unit paths are authoritative, not proposed names.

## Verified on Pi

| Current path | Role and provenance | Migration rule |
|---|---|---|
| `/home/drpoh/ha-telegram-bot` | Git checkout of `drpoh/ha-telegram-bot`, branch `feature/v3-home-agent` at audit `e199770`; **system v2 unit starts** `src/index.mjs` in this directory | Critical: not a disposable dev checkout despite feature branch. Do not rename, reset, change active dependencies, relocate or delete |
| `/home/drpoh/rs-home-ai-v3` | **Second checkout of the SAME remote and branch**, older HEAD `a7fc446` (28 commits behind `8093db0` at prior comparison); **user V3 pilot unit starts** `src/pilot/telegram-readonly.mjs` here | Critical: distinct live runtime snapshot. Never auto-pull/merge/rebase/update dependencies, delete or redirect live unit |
| `/home/drpoh/vinted-sales-agent` | Independent Git remote `drpoh/vinted-sales-agent`, unrelated service/project; has local changes | Out of scope. Do not reorganize |
| `/home/drpoh/ha-backups` | Existing backups, no inventory of contents performed | Preserve; no move or cleanup |
| `/home/drpoh/.config/rs-home-ai-v3` | Operator local V3 config | Keep private; no copying into Git |
| `/home/drpoh/.config/systemd/user` | Runtime V3 + Gate D service/timer units | Keep stable; do not edit without deployment approval |
| `/home/drpoh/n8n`, `/home/drpoh/searxng`, hidden app/cache dirs | Other software/runtime state | Outside this project; no cleanup based on disk usage alone |

Two checkouts of the same remote are **not** duplicate junk. One is directly used by production v2, the other by the V3 pilot, and their Git history differs. Also the existing project checkouts are **not yet** actual isolated dev/stage/prod environments.

## Future layout — only after explicit deployment review

```text
/home/drpoh/projects/                  # independently cloned NEW development worktrees
  rs-home-ai/                          # canonical reviewed source checkout
  vinted-sales-agent/                  # independent project (move only with separate authorization)
/home/drpoh/environments/
  rs-home-ai/dev/                      # fake secrets + offline HA fixtures
  rs-home-ai/stage/                    # separately provisioned mock services
  rs-home-ai/prod/                     # immutable, reviewed artifact (future only)
/home/drpoh/.config/rs-home-ai/         # protected local configuration, never committed
/home/drpoh/.local/state/rs-home-ai/    # per-environment logs/replay/storage
/home/drpoh/ha-backups/                # existing backups retained until replacement is verified
```

This is a *target convention*, not an instruction to create/copy these paths now. Prefer short-lived feature branches/PRs and immutable release commits over perpetual `dev`, `stage`, `prod` Git branches. A Git branch is not an environment. Promote reviewed artifacts by pinned commit with distinct secrets, HA access, Telegram tokens, ports and storage. Reserve rollback to the prior pinned artifact and keep Home Assistant Green autonomous. No symlinks between runtimes.

## Recommended repository structure

```text
src/             # production modules (ai, decision, policy, home, mcp, telegram, ops, etc.)
test/            # pure/offline checks and fault tests
scripts/audit-pi-layout.mjs  # read-only inventory, not runtime
scripts/manual/  # explicit operator-only manual/smoke actions
config/          # sanitized examples only
deploy/          # reviewed service templates, not live secrets
docs/           # one current overview + dated decisions, milestones, historical logs
```

Do not move `src` modules or rename packages during security Gate B/C without evidence. Later identify unreferenced root `bot.mjs`, `smoke-auto-safe.mjs`, model experiments and other historical scripts, then archive separately with explicit dependency checks; old location alone is not proof of dead code. Keep versioned fixtures, avoid committing generated logs/dbs/tokens. Root README, TODO and handoff should link here so future chats can distinguish checkouts.

## Migration prerequisites and safe order

1. **Now:** record owner/runtime mapping and use `node scripts/audit-pi-layout.mjs` to see only paths, branch/HEAD and Git dirtiness (no secrets). Check `git status` in BOTH checkouts before any future change. Verify source of active systemd units separately.
2. **Dev only:** create a NEW clean isolated clone/worktree from a reviewed commit (requires operator approval of destination and installed tooling). Run offline tests there. Keep `/home/drpoh/ha-telegram-bot` immutable while v2 is running; do not let development edits silently change its runtime.
3. **Stage:** create separate mock HA + bot identity and storage/ports; validate environment guards, fault/rollback tests. Never use the family HA Green as stage.
4. **Prod:** after Gate B/C acceptance, explicit backup, independent owner approval and immutable artifact release; move one unit at a time with monitoring/rollback. No automatic promotion from a passing test.
5. **Clean-up:** only after successful service/path verification and verified backups, remove obsolete checkouts/symlinks/fixtures. Never remove a directory by matching a name.

## Remaining risks

- Current V3 and v2 are both executed from working Git trees. Updating a development branch in v2's runtime location is a genuine change-management risk.
- V3 checkout is stale relative to actively developed source. **This is intentional isolation until a staged deployment**, not evidence it should be pulled now.
- Home Assistant access, trusted policy and independent channel provenance are still unapproved for broad Gate B; no live control changes.
- Disk usage is not a deletion plan. Never delete caches, backup directories or hidden runtime state without dependency/ownership review.
