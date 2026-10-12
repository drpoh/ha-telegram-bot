# RS Home AI — authoritative project map

**Start with [CURRENT-STATE](CURRENT-STATE.md) for the concise latest verified status.** Older dated checkpoints in this map remain historical, not permission to deploy.

Updated 2026-10-12 (owner-confirmed first CI-gated immutable candidate after PR #33). See [latest cleanup audit](PROJECT-AUDIT-2026-10-11.md) before considering any file or branch removal. **Start here to avoid confusing source branches with running services.**

## Which directory is authoritative?
| Location | Purpose | Edit policy |
|---|---|---|
| `/home/drpoh/projects/rs-home-ai-dev` | **Only canonical source checkout**; V3 `feature/v3-home-agent`; tests, docs, GitHub push | Edit here |
| `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-b1122bd` | **Prepared only** candidate, exact SHA verified 2026-10-12, NOT running production | Offline STAGE validation only; never auto-promote |
| `/home/drpoh/projects/rs-home-ai-v3-release-c6a9812` | Active **V3 production pilot** immutable release artifact; only `light.tambur_svet_l1` on/off with private Telegram `/confirm` | Read only; deploy new separately reviewed artifact, never `git pull` |
| `/home/drpoh/projects/rs-home-ai-v3-release-97343fa` | Previous V3 release retained for rollback | Read only |
| `/home/drpoh/projects/archive/rs-home-ai-v3/` | Historical releases `7d9bab5` and `920585d` (archived, not deleted) | Preserve until retention audit |
| `/home/drpoh/ha-telegram-bot` | Running V2 service's preserved Git checkout (historical commit) | Read only; no auto-pull |
| `/home/drpoh/rs-home-ai-v3` | Historical V3 Git checkout, NOT active user-service executable, but USED by Gate D timers | Preserve; read only |
| `~/.config/rs-home-ai-v3`, `~/.local/state/rs-home-ai-v3` | Live private credentials, owner policy and durable claims | Not in Git; no bulk copies, no reset |
| `vinted-sales-agent`, `ha-backups` | Separate ownership | Out of scope |

**Do not force all Git checkout HEADs to match.** A checkout on `feature/v3-home-agent` is not necessarily the running release. Get actual `ExecStart` from systemd before any action.

Engineering direction: [reuse-first ADR](ADR-REUSE-FIRST-2026-10-11.md). For code/document grouping and safe cleanup decisions see [structure index](STRUCTURE-INDEX.md).

## Repository navigation
| Path | Role |
|---|---|
| `AGENTS.md` | Must-follow operating rules |
| `docs/CHAT-HANDOFF.md` | Latest verified runtime and continuation point |
| `docs/TODO.md` | Short authoritative current backlog; previous append-only register archived at `docs/archive/TODO-history-through-2026-10-11.md` |
| `docs/WORKLOG.md` | Append-only evidence and commits |
| `docs/V3-NEXT-STAGE-DEV-STAGE-PROD.md` | Current Stage 2 plan and acceptance gates |
| `docs/ADR-*.md`, `docs/GATE-*.md`, `docs/REVIEW-*.md` | Historical decisions and evidence; may describe older states |
| `src/decision/` | Deterministic policy and pure resolution/verification modules |
| `src/ops/` | Offline stage mock, environment contracts and deployment support |
| `src/pilot/` | Narrow V3 Telegram pilot and trusted MCP gateway; deployed code requires a release gate |
| `src/{ai,telegram,home,mcp,...}` | Other app components, including legacy V2 dependencies |
| `test/` | Offline tests, including stage tests; never contact production HA |
| `scripts/manual/` | Potentially LIVE hardware smoke scripts; require separate explicit approval |
| `scripts/` | Read-only audit, local test harness, operational tooling; inspect before running |
| `config/` | Sanitized examples only; **not** live policy or secrets |
| `deploy/` | Templates only; actual systemd units are outside Git |
| `bot.mjs`, `test-*.mjs`, `smoke-auto-safe.mjs` at root | Historical entry/experiment files; keep until dependency and manual-script safety review; do not assume safe to run |

## Branches vs environments
- `main`: baseline; `refactor/v2`: V2 lineage; `feature/v3-home-agent`: active source development; `review/gate-e-target-snapshot-hardening-20261009`: unmerged review work at last audit.
- `dev` is a canonical source checkout with an installed user-systemd pull-only candidate timer, whose first successful run was confirmed 2026-10-12. `stage` currently is a disposable local mock used by tests, not an installed service. `prod` is the separately pinned V3 release and legacy V2 service, not a Git branch.
- Promotion requires explicit review, isolated candidate, tests, identity/policy check, rollback, and owner authorization. Git push alone is not deployment.

## GitHub-first development when Pi remote tools are unavailable
- Source changes may be proposed on short-lived GitHub PR branches with isolated GitHub-hosted CI; passing CI does not update the canonical Pi DEV checkout or authorize live deployment. See `GITHUB-FIRST-DEV-WORKFLOW-2026-10-11.md`.
- Prior source status on Pi: DEV `2a71552` clean before GitHub merged PR #2–#4; inspect local status before fast-forward, do not touch pinned V2/V3 runtimes.

## Quick safe maintenance
1. Read `AGENTS.md`, this map, `docs/CHAT-HANDOFF.md`, latest `docs/TODO.md` and `docs/WORKLOG.md`.
2. Run `node scripts/audit-pi-layout.mjs` (read-only) and `git status -sb` in canonical dev. Inspect actual systemd `ExecStart` separately.
3. Modify source only in canonical dev, run focused tests, full regression at release milestones, update TODO/WORKLOG/HANDOFF, then commit/push.
4. Never copy prod tokens, change live HA, silently start another Telegram poller, or rehome live units to tidy directories.

## Honest debt register
- Legacy names `kitchen-*` remain in V3 pilot modules even though the authorized light is in the tambur. Do not mass-rename those modules before a separate dependency and safety audit.
- Historical TODO unchecked items may already be superseded. Preserve past evidence; use newest dated section as active backlog.
- Stage mock and source-only selector return non-authorizing candidates, never live write grants.

## 2026-10-12 verified release checkpoint
- Active owner-accepted V3 executable is now `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs` via user-systemd override. This candidate **is production**, not an offline-only candidate anymore. Preserve previous `c6a9812` rollback and `97343fa` reserve. The earlier table row describing `c6a9812` as active is historical and superseded by this paragraph.
- Source branch can advance with documentation while immutable prod remains at `9dd5964`; no need or authorization to update prod because of documentation commits. Owner verified scoped Telegram read, confirm, cancel/replay denial. V2/Gate D remain independent.
- New GitHub audit: 11 remote branches, including seven merged PR #46–52 heads awaiting safe remote-ref cleanup. Avoid claiming old four-branch inventory as current.

## 2026-10-12 — Pi obsolete-build cleanup completed (owner evidence)
- Owner ran the reviewed guarded deletion and reported `CLEANUP=PASS`. Eight directories removed: five old candidate siblings `b1122bd`, `e231afb`, `46ce492`, `ed27051`, `f4acd11`, plus standalone `rs-home-ai-v3-candidate`, `rs-home-ai-v3-candidate-v2`, `rs-home-ai-v3-release-968748d`. Each previously measured ~64M, estimated ~512 MiB freed (df rounded: avail 43G→44G, used 22%→21%).
- Before deletion, exact-target directory and production ExecStart validation succeeded. After deletion both `rs-home-ai-v3.service` user and `ha-telegram-bot.service` system remained `active`, all eight target paths absent. Retained active `9dd5964` child inside shared candidate parent, `c6a9812`, `97343fa`, Gate D historical checkout, V2 checkout, archives, and private state. Disk figures approximate; no byte-accurate measurement provided.
- Documentation-only GitHub update creates a new DEV commit beyond owner's last shown `75e23bd`; next safe Pi sync is clean-worktree fetch + ff-only; do NOT redeploy immutable production for documentation.
