# RS Home AI V3 — current state (2026-10-13)

## Verified owner checkpoint — 2026-10-13 (supersedes older operational summaries)

- **Canonical Pi DEV:** clean fast-forward `163fc89` → `6f6e694` (`feature/v3-home-agent`); Node.js `v22.23.3`; `npm ci --ignore-scripts` in DEV; `npm test`: **198 isolated test files, 726 passed assertions, 0 failed files**; `git status --short` empty.
- **Live HA-MCP read-only:** `SAUNA_STATUS=complete`, temperature **28 °C**, ready threshold **85 °C**; `LIGHTS_STATUS=complete` (four selected entities: **1 ON, 3 OFF**); `TAMBOUR_STATUS=complete`, `light.tambur_svet_l1=on`; `READONLY_PREFLIGHT=PASS`. Corridor `light.koridor`, `light.koridor_1_etazh`, `light.koridor_spot` were OFF. These are dated readings, not live state cache.
- **Manual new-light read:** `NEW_LIGHT_REVIEW=partial`, `NEW_LIGHT_COUNTS={"on":2,"off":7,"unknown":10}`; exact ten returned `unavailable`. ON: `light.kukhnia_led_niz_l1`, `light.kukhnia_svet`; seven other responsive targets were OFF. Nine readable **entity IDs**, not nine physically identified/approved circuits. No `ha_call_service`, no widened authority, no `light.browser_mod*`.
- **Private diagnostics:** one manual outbound HTTPS report reached private GitHub Issue `drpoh/rs-home-ai-private-reports#1` comment `6141220575`. No recurring sender; ChatGPT GitHub connector returns 404 for this private repository and cannot verify its content. The public `main` reporter bug was fixed in PR #102. Do not copy private diagnostics into public GitHub Issues.
- **Runtime caution:** Production V3, V2, Gate D and Home Assistant were not deployed or restarted in this phase. Historical documentation conflicts over the precise active V3 immutable release (`c6a9812` vs `9dd5964`); verify systemd `ExecStart` read-only before any release statement or deployment. Tests and operator output are not evidence of production promotion.
- **Next blocker:** exact HA device/area and physical fixture identity for `light.kukhnia_svet`, then separately authorized real actuation gate. Do not request a physical switch test before the operator explicitly approves.
- **Audit:** [Documentation inventory and consistency review](DOCUMENTATION-AUDIT-2026-10-13.md).

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

## 2026-10-12 — Production confirmed-action live acceptance (owner Telegram transcript)
- Operator requested `Включи свет в тамбуре`, received pending exact `light.tambur_svet_l1` + explicit `/confirm` prompt; `/confirm` returned `Home Assistant подтвердил состояние светильника после команды.` Repeated for OFF, again verified by HA response. This proves confirmed on/off flow for existing authorized target, but independent physical observation and request→`/cancel`→`/confirm` regression are not yet supplied. No broader authority established. Active V3 release last observed `9dd5964`, rollback `c6a9812` preserved.

## 2026-10-12 — V3 9dd5964 Telegram MVP functional acceptance complete
- Owner-provided live Telegram transcript confirms pending `light.tambur_svet_l1` request → `/cancel` = `Запрос отменён.` → `/confirm` = `Нет действующего запроса для подтверждения.` Previous private-chat smoke passed `/status`, `/sauna`, `/light`, `/lights`, Russian lighting questions, and separately user-confirmed ON/OFF with `/confirm` and HA verified-state replies. This closes **scoped Telegram functional acceptance** only; broader policy/security gates, physical-light classification, fault/recovery tests and voice remain open. Existing production SHA `9dd5964`, no new deployment or permissions. Next: concise question-specific Russian answers and scoped context in DEV via CI without production changes.

## CONTROL CHECKPOINT — 2026-10-12, production Telegram MVP accepted
- **Live V3 source identity:** immutable release SHA `9dd5964a4956b88227ec4002ac80ef46a186d632`, executed from `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs` via user systemd override; owner observed active/running (PID 3713 at 14:49 EEST). Preserve `c6a9812` as first rollback and `97343fa` as older reserve.
- **Functional acceptance complete (owner Telegram evidence):** `/status`, `/sauna`, `/light`, `/lights`, exact Russian lighting questions, confirmed on/off `light.tambur_svet_l1` with HA-state-verified bot replies, and pending request → `/cancel` → `/confirm` rejected as missing. No new room write scope; whole-house lighting is NOT claimed. Broader Gate B/C/D/E security, recovery and voice acceptance remain separate.
- **CI/ARMv7:** GitHub PR #52 completed CI, owner showed exact-SHA DEV/STAGE `status=passed`, `stage=complete`, `exit_code=0`; owner read-only HA preflight `READONLY_PREFLIGHT=PASS` on four scoped entities. These predate subsequent documentation-only GitHub commits; do not demand a production reinstall merely to match DEV HEAD.
- **GitHub branch audit:** live branch enumeration shows 11 refs: four retained (`main`, `refactor/v2`, `feature/v3-home-agent`, `review/gate-e-target-snapshot-hardening-20261009`) and seven temporary PR heads #46–52. All seven PRs independently verified `merged=true`. Remote heads NOT YET DELETED. GitHub source/documentation sync does NOT imply Pi local DEV has fetched latest commits.
- **Cleanup boundary:** preserve live V3 candidate, `c6a9812`, `97343fa`, V2 checkout, Gate D historical checkout, private token/journal/HA runtime, and historical docs. No automatic source deletion, branch deletion or filesystem cleanup until exact dependency and pointer inspection. Next functional work is brief Russian context-specific replies in isolated DEV.

## 2026-10-12 — Pi obsolete-build cleanup completed (owner evidence)
- Owner ran the reviewed guarded deletion and reported `CLEANUP=PASS`. Eight directories removed: five old candidate siblings `b1122bd`, `e231afb`, `46ce492`, `ed27051`, `f4acd11`, plus standalone `rs-home-ai-v3-candidate`, `rs-home-ai-v3-candidate-v2`, `rs-home-ai-v3-release-968748d`. Each previously measured ~64M, estimated ~512 MiB freed (df rounded: avail 43G→44G, used 22%→21%).
- Before deletion, exact-target directory and production ExecStart validation succeeded. After deletion both `rs-home-ai-v3.service` user and `ha-telegram-bot.service` system remained `active`, all eight target paths absent. Retained active `9dd5964` child inside shared candidate parent, `c6a9812`, `97343fa`, Gate D historical checkout, V2 checkout, archives, and private state. Disk figures approximate; no byte-accurate measurement provided.
- Documentation-only GitHub update creates a new DEV commit beyond owner's last shown `75e23bd`; next safe Pi sync is clean-worktree fetch + ff-only; do NOT redeploy immutable production for documentation.
