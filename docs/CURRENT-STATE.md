# RS Home AI V3 — current state (2026-10-12)

**This is the short operational entry point.** Read this first, then [AGENTS](../AGENTS.md), [PROJECT-MAP](PROJECT-MAP.md), [TODO](TODO.md) and [HISTORY-STAGE-AUDIT](V3-HISTORY-STAGE-AUDIT-2026-10-12.md). `CHAT-HANDOFF.md` and `WORKLOG.md` are chronological evidence, not a substitute for current status. Earlier paragraphs can be superseded; prefer the newest verified checkpoint. Do not delete history to shorten navigation.

## Source of truth and environment isolation

| Environment | Actual role | Last verified / restriction |
| --- | --- | --- |
| GitHub `feature/v3-home-agent` | V3 DEV source branch, not production | 4 branch refs after owner cleanup; no open PRs at audit |
| Pi `/home/drpoh/projects/rs-home-ai-dev` | Only canonical editable DEV checkout | Current local SHA and worktree status not read in this audit |
| STAGE | Disposable offline loopback mock / CI-gated immutable candidate | Owner-confirmed STAGE_PASS on Pi; **not** a deployed live stage |
| V3 production | `/home/drpoh/projects/rs-home-ai-v3-release-c6a9812` | Last owner-confirmed immutable release; verify actual systemd ExecStart before future deployment |
| V3 rollback | `/home/drpoh/projects/rs-home-ai-v3-release-97343fa` | Preserve |
| V2 production | `/home/drpoh/ha-telegram-bot` | Separate V2 system service; do not modify |
| Historical Gate D checkout | `/home/drpoh/rs-home-ai-v3` | Gate D timer dependency, **not** running V3 executable |
| Home Assistant Green | Authority for HA/device state | Must operate independently of the Pi agent |

**No deployment follows from merging to GitHub or passing CI.** Never run a second Telegram poller on production tokens. No new writes or wider room scope without independent authorization.

## Acceptance status

- **Demonstrated:** live Pi read-only `ha_get_state` sauna temperature and ready sensor; tamboor state; three corridor light entity IDs `unavailable` (`light.koridor_2`, `light.koridor_1_etazh_2`, `light.koridor_spot_2`). Existing reviewed **write** pilot remains limited to `light.tambur_svet_l1` with its existing confirmation policy.
- **Demonstrated:** GitHub offline tests and Pi offline/mock STAGE, as recorded in WORKLOG; **not** live whole-home gate acceptance.
- **Pending:** physical fixture/switch/helper/area metadata review; completed Gate B trusted registry+source+identity+policy; Gate C fault acceptance; Gate D service/recovery health evidence; Gate E voice; independent Pi up-to-date source/worktree and ARMv7 production-candidate review.
- **Next practical slice:** review actual corridor and tamboor `light.*`, `switch.*`, helper roles and HA areas read-only, classify with existing `src/decision/lighting-classification.mjs`, then make `/lights` accurate before separately approved immutable deployment.

## Navigation and non-duplication rules

- [PROJECT-MAP](PROJECT-MAP.md) — directories, ownership and release isolation.
- [TODO](TODO.md) — active tasks (newest dated section supersedes older pending entries).
- [WORKLOG](WORKLOG.md) — chronological history and evidence; append only.
- [CHAT-HANDOFF](CHAT-HANDOFF.md) — historical handoffs and latest continuation evidence; long by design.
- [LIGHT-ENTITY-REVIEW](V3-LIGHT-ENTITY-REVIEW-2026-10-12.md) — sole scoped lighting review; avoid creating a second inventory policy document.
- [GITHUB-CLEANUP](V3-GITHUB-CLEANUP-2026-10-12.md) — remote branches completed, four retained.
- [home-agent-v3-strategy](home-agent-v3-strategy.md) — invariants and Gate B/C/D/E.
- Old `V3-NEXT-STAGE-DEV-STAGE-PROD.md` describes historical mock contract and does not authorize a live stage; use this page for current release identity.

## Audit boundaries

GitHub API can check repository tree, ref counts, test workflow reports and files; it **cannot verify** Pi working tree, running systemd ExecStart, secret scope, live V2/Gate D health or real HA availability without authorized Pi output. Do not mark these verified based on source-only audit.

## Latest lighting cleanup (2026-10-12)
- Owner deleted three previously unavailable orphan entity records after review; the first was verified as obsolete yandex_station entity. The old three-ID unavailable report is historical, not a current active list.
- Source V3 /lights now reads four retained HA light-domain IDs: light.tambur_svet_l1, light.koridor, light.koridor_1_etazh, light.koridor_spot. Physical fixture identity and wider area coverage still require review. Pinned production unchanged; run the Pi scoped read preflight before any deployment.

## 2026-10-12 — Practical Russian light status merged
- PR #50 merged as `9cbb695` after successful GitHub Node 20 isolated checks. `/lights` now lists both ON and OFF labels for the same four preselected entities and supports bounded Russian OFF-light questions; no extra read/write permission or physical fixture classification. Pi new-head offline STAGE and any immutable production release remain unverified/unapproved.

## 2026-10-12 — Four-entity all-off answer (source candidate)
- Existing `/lights` summary now explicitly distinguishes all four selected entities OFF, at least one ON, and one or more unknown. This does not claim whole-house physical light status; no extra HA reads or permissions. GitHub PR CI and later Pi STAGE remain separate acceptance gates.

## 2026-10-12 — V3 production startup at 9dd5964 (Telegram smoke pending)
- Owner explicitly approved switching to immutable candidate SHA `9dd5964a4956b88227ec4002ac80ef46a186d632`. Operator confirmed systemd `ExecStart` at `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`; service `active/running`, PID 3713, started 2026-10-12 14:49 EEST. Original release `c6a9812` retained for rollback. This is startup evidence, not Telegram functional acceptance; `journalctl --user` returned no journal files. Pending private Telegram read-only and cancel→confirm smoke before marking release accepted. No V2 or HA device write operation reported.

## 2026-10-12 — Telegram V3 post-switch real smoke (partial acceptance)
- Owner screenshot at 16:39–16:40 EEST demonstrates actual production Telegram replies on approved 9dd5964 deployment: `/status` journal ready; empty `/confirm` missing; `/sauna` 28.4375 °C not ready (85 °C); `/light` tamboor on; `/lights` four selected HA entities (on 1/off 3/unknown 0); Russian «Какой свет выключен?» and «Весь ли свет выключен?» successfully routed. Pending explicit pending-intent → `/cancel` → `/confirm` regression; do not mark full acceptance yet.
