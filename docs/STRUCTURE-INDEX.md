# RS Home AI — structure and ownership index

Reviewed 2026-10-11. This is a navigation aid, **not** permission to rename, delete or deploy. Start with [PROJECT-MAP](PROJECT-MAP.md), [TODO](TODO.md), [CHAT-HANDOFF](CHAT-HANDOFF.md) and [AGENTS](../AGENTS.md). For the evidence behind safe cleanup, see [PROJECT-AUDIT](PROJECT-AUDIT-2026-10-11.md).

## Code grouped by responsibility (logical grouping; paths remain unchanged)

| Responsibility | Existing paths | Ownership / caution |
|---|---|---|
| Running legacy V2 | `src/index.mjs`, `src/ai/`, `src/telegram/`, `src/mcp/`, `src/home/`, `src/memory/` | `npm start` enters V2; do not assume root `bot.mjs` is in service use |
| Pinned one-light V3 pilot | `src/pilot/` | Actual live release is separate, pinned at `97343fa`; source changes here are NOT automatically live |
| Deterministic policy and evidence | `src/decision/` | 77 small modules covering registry, confirmation, approval, Assist and experiments; **do not mass-move**, imports and regression references span modules |
| Mocked stage exercises | `src/ops/`, `scripts/stage/`, `test/stage-*` | Fixture-only; cannot authorize real HA writes |
| Offline contract checks | `test/` and `scripts/run-isolated-tests.mjs` | Full `npm test` includes syntax checking; no live-device smoke |
| Reviewed operational tools | `scripts/audit-pi-layout.mjs`, other `scripts/` | Inspect entrypoints before execution; `scripts/manual/` may contact real devices |
| Old experiments | `scripts/legacy/`, root `bot.mjs`, `smoke-auto-safe.mjs` | Archived model experiments already grouped; root files **remain intentionally** pending external consumer checks |
| Configuration / service guidance | `config/`, `deploy/`, `docs/` | Examples, not live secrets or installable units. `deploy/rs-home-ai-v3.service` is historical and unsafe to install |

### `src/decision/` logical clusters (no physical moves)
- **Intent and confirmation:** `v3-command-envelope`, `v3-intent-ledger`, `v3-channel-intent-ledger`, `confirmed-action-gate`, `pending-confirmation`, `v3-telegram-*`.
- **Inventory, entity matching, provenance:** `v3-registry-*`, `v3-ha-registry-*`, `v3-stage-target-*`, `area-*`, `v3-satellite-*`.
- **Approval and execution:** `v3-approval-*`, `v3-operator-*`, `v3-owner-*`, `v3-gate-c-*`, `v3-tool-boundary`, `v3-isolated-*`.
- **Assist/voice experiments:** `v3-assist-*` and `v3-isolated-assist-adapter` — no live voice authorization.
- **Older lighting/area experiments:** `lighting-*`, `verified-area-*`, `live-area-lighting`, `bathroom-*`, `named-light-switch`, `agent-area-guard`.

## Documentation grouped by role
- **Current operational truth:** `PROJECT-MAP.md`, `TODO.md`, `CHAT-HANDOFF.md`, `WORKLOG.md`, `V3-NEXT-STAGE-DEV-STAGE-PROD.md`, `V3-OPERATIONS.md`.
- **Architecture and durable decisions:** `ADR-*.md`, `ARCHITECTURE.md`, `home-agent-v3-strategy.md`, `V3-SHARED-DECISION-AUDIT-2026-10-11.md`.
- **Review/history:** `GATE-*`, `REVIEW-*`, `PROGRESS.md`, `PROJECT-AUDIT-*`, `docs/archive/`. Older milestones are historical evidence, not current permissions.
- **Setup and operator guidance:** `INSTALL.md`, `USER-GUIDE.md`, `BACKUP-RESTORE.md`, `V3-MVP-*`.

## Cleanup disposition
1. **Safe now:** this index, explicit links from entrypoints and concise documentation pointing to authoritative current state. No module or fixture relocation.
2. **Later after static and external-consumer audit:** move root `bot.mjs` and `smoke-auto-safe.mjs` to an appropriate historical/manual location, updating every reference and proving no cron, service or human entrypoint depends on their location.
3. **Later after import-map and representative integration tests:** consider physically grouping `src/decision/` by ingress, registry, approval and execution. Reduce duplicate behavior only when source-trust and replay contracts are equivalent. Prioritize smaller additions over large refactors.
4. **Never clean solely for aesthetics:** pinned releases, operator policy, claims databases, secrets, backups, Git history/branches, shared Home Assistant services and preserved V2 checkout. Use an explicit, separately approved retention/promotion plan first.

Dependency evidence: [decision graph audit](V3-DECISION-DEPENDENCY-AUDIT-2026-10-11.md) — all 77 decision modules have incoming static references, with 76 directly tested; physical deletion is not justified.

No reduction in source file count is claimed: this milestone reduces navigation ambiguity without risking the active safety boundary.
