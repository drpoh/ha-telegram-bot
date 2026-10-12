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
