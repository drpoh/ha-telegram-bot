# RS Home AI — authoritative project map

Updated 2026-10-11. See [latest cleanup audit](PROJECT-AUDIT-2026-10-11.md) before considering any file or branch removal. **Start here to avoid confusing source branches with running services.**

## Which directory is authoritative?
| Location | Purpose | Edit policy |
|---|---|---|
| `/home/drpoh/projects/rs-home-ai-dev` | **Only canonical source checkout**; V3 `feature/v3-home-agent`; tests, docs, GitHub push | Edit here |
| `/home/drpoh/projects/rs-home-ai-v3-release-97343fa` | Active **V3 production pilot** immutable release artifact; only `light.tambur_svet_l1` on/off with private Telegram `/confirm` | Read only; deploy new separately reviewed artifact, never `git pull` |
| `/home/drpoh/ha-telegram-bot` | Running V2 service's preserved Git checkout (historical commit) | Read only; no auto-pull |
| `/home/drpoh/rs-home-ai-v3` | Historical V3 Git checkout, NOT active user-service executable | Preserve; read only |
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
- `dev` is a source checkout. `stage` currently is a disposable local mock used by tests, not an installed service. `prod` is the separately pinned V3 release and legacy V2 service, not a Git branch.
- Promotion requires explicit review, isolated candidate, tests, identity/policy check, rollback, and owner authorization. Git push alone is not deployment.

## Quick safe maintenance
1. Read `AGENTS.md`, this map, `docs/CHAT-HANDOFF.md`, latest `docs/TODO.md` and `docs/WORKLOG.md`.
2. Run `node scripts/audit-pi-layout.mjs` (read-only) and `git status -sb` in canonical dev. Inspect actual systemd `ExecStart` separately.
3. Modify source only in canonical dev, run focused tests, full regression at release milestones, update TODO/WORKLOG/HANDOFF, then commit/push.
4. Never copy prod tokens, change live HA, silently start another Telegram poller, or rehome live units to tidy directories.

## Honest debt register
- Legacy names `kitchen-*` remain in V3 pilot modules even though the authorized light is in the tambur. Do not mass-rename those modules before a separate dependency and safety audit.
- Historical TODO unchecked items may already be superseded. Preserve past evidence; use newest dated section as active backlog.
- Stage mock and source-only selector return non-authorizing candidates, never live write grants.
