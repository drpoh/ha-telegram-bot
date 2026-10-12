# RS Home AI / ha-telegram-bot — repository and file audit

Date: 2026-10-11. Scope: read-only live service/repository inventory, remote Git heads and GitHub branch comparisons; no deletion, migration or HA writes.

## Findings by priority

### P1 — release template disagrees with actual systemd runtime
- `deploy/rs-home-ai-v3.service` still says kitchen and launches `/home/drpoh/rs-home-ai-v3/src/pilot/telegram-readonly.mjs`.
- Live V3 unit instead points to `/home/drpoh/projects/rs-home-ai-v3-release-97343fa/src/pilot/telegram-readonly.mjs`; it is currently active. Blind copying the tracked template could revert to an older Git checkout or authorize the wrong target. **Never install the template unchanged.** Actual operator unit and signed private policy remain authoritative.
- Mitigation: label the template historical/NOT INSTALLABLE until parameterized reviewed replacement, with fail-closed release/config gate.

### P1 — source/runtime versions require explicit mapping
- Canonical dev at f53205f, origin `feature/v3-home-agent` matched at start of audit; V2 running checkout is 32b5299; historic V3 checkout is a7fc446; immutable V3 active release code is 97343fa.
- Similar branch names DO NOT mean an identical runtime; preserve them until exact rollback/dependency audit. Do not git pull inside running checkout.

### P2 — root historical experiments clutter navigation
- Root `list-models.mjs`, `test-deepseek.mjs`, `test-gemini.mjs`, `test-lite.mjs`, `test-openrouter-tools.mjs`, `test-openrouter.mjs`, and `smoke-auto-safe.mjs` have no tracked references from outside docs by basename in the audited branch. They are **archive candidates**, not proven unused by operator cron/manual workflows. `smoke-auto-safe.mjs` can affect devices; never run during cleanup.
- Root `bot.mjs` is also a possible old monolith; **IMPORTANT** actual `src/index.mjs` imports `src/telegram/bot.mjs`, NOT root `bot.mjs`. Basename grep matches that import even though it does not import the root monolith. Verify shell/unit/manual references before any eventual move.
- `config/pilots/kitchen-review.json` and `kitchen-policy-deny.json` are referenced by `test/v3-kitchen-pilot-review.test.mjs`; keep as historical offline test fixtures. They do not grant production access.
- Legacy names `kitchen-*` in active V3 source reflect older pilot naming; do not mass rename until imports and rollback-tested release are ready.

### P2 — documentation has long append-only history
- `docs/TODO.md` and `docs/CHAT-HANDOFF.md` contain old unchecked entries superseded by actual later live acceptance. This is easy to misread. Keep append-only history but put an authoritative compact `CURRENT-STATE.md` / project map at top and link the dated audit.
- Many `GATE-*`, `REVIEW-*`, ADR files are historical evidence, not safe delete candidates without backlink/source usage analysis.

### P2 — release artifact accumulation
- Existing release dirs `rs-home-ai-v3-release-7d9bab5`, `-920585d`, `-97343fa` each occupy roughly 64 MB. Some are retained rollback candidates. Disk savings possible after rollback retention review, **not** permission for immediate deletion.

## Remote branches (GitHub confirmed)
| Branch | Observed ref | Assessment |
|---|---|---|
| `feature/v3-home-agent` | f53205f before this audit | Current development, KEEP |
| `main` | 3bfa386 | Baseline, KEEP |
| `refactor/v2` | 0ea2232 | V2 lineage, KEEP pending migration |
| `review/gate-e-target-snapshot-hardening-20261009` | 6a761ba | Strong archive/delete candidate **after review**: GitHub compare shows it 113 commits behind V3, 0 ahead. No unique commits relative to V3 by this comparison; confirm PR state/tag/branch protections before deleting. |

GitHub compare `main...feature/v3-home-agent`: diverged; 512 ahead, 1 behind. **Do not fast-forward/overwrite main without examining its unique change.** Compare `refactor/v2...feature/v3-home-agent`: V3 492 ahead, 0 behind. These numbers are audit-time snapshots and change with future commits.

## Prioritized safe actions
1. Warn loudly on deploy template and establish canonical versioned deployment template review.
2. Keep `docs/PROJECT-MAP.md` and short current-state pointer authoritative; move history to archive only with backlinks, not bulk deletion.
3. After checking GitHub PR/protection and provenance, archive/close review branch; no remote deletion in this audit.
4. Confirm operator/manual/cron usage of historical root scripts, then separate historical experiments under `scripts/legacy/` in a dedicated reviewed commit with tests. Never move `src/index.mjs` or active runtime source on assumptions.
5. Retain at least verified working release and suitable rollback before pruning artifacts; do not touch private SQLite or secrets.

## Not verified
- Whether root scripts are used outside tracked source (shell aliases, crontab, third-party automation).
- Branch protection or associated PRs for stale review branch.
- Full suite performance and all tests for any prospective source move; this audit alone is not evidence a move is safe.
