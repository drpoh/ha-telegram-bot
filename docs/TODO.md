# RS Home AI V3 — active tasks (2026-10-12)

**For the one-page current plan see [CURRENT-STATE](CURRENT-STATE.md).** Earlier unchecked TODO entries are historical, not necessarily still pending; use the newest verified checkpoint below.

## Latest owner-verified checkpoint — 2026-10-12
- [x] Installed user-systemd DEV timer successfully completed `stage=complete`, `status=passed`, `exit_code=0`, SHA `b1122bdb274931b5d89e745c9ce171ac4e3addbe` at 07:10:00 UTC. Exact-SHA private GitHub Actions gate succeeded after correcting fine-grained PAT repository access. 
- [x] Owner confirmed candidate `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-b1122bd/RELEASE_COMMIT` contains that exact SHA. This is packaging proof, NOT stage execution or production acceptance.
- [x] Pi user-systemd UID mapping investigation: sandbox root ancestors `/` and `/home` map to UID 65534. Security tests remain strict; full suite runs in GitHub CI instead of inside that namespace. GitHub PR #33 suite: 169 test files / 656 assertions / 0 failed; separate Pi ARMv7 runtime smoke remains pending.
- [x] Last owner-reported active V3 production is pinned to `c6a9812`; no release promotion performed.
- [ ] Next: create offline isolated STAGE candidate smoke-validation (no Telegram poller, HA actuation, live secrets or prod state), bounded pass/fail evidence and rollback-ready operator review; never auto-promote.
- [ ] Verify DEV timer's subsequent unattended run, V2/Gate D health, and candidate Pi ARMv7 functionality independently.

## Operational baseline
- Owner-confirmed V3 production: immutable `/home/drpoh/projects/rs-home-ai-v3-release-c6a9812`, private Telegram sauna and tamboor consent/cancel validated; no new deployment approved.
- V2 system service uses `/home/drpoh/ha-telegram-bot`; Gate D enabled health/alerts timers run scripts from historical `/home/drpoh/rs-home-ai-v3`. Never move these checkout directories without migration.
- Pi DEV `/home/drpoh/projects/rs-home-ai-dev`, branch `feature/v3-home-agent` was owner-reported clean/synced to `197a1eb` before documentation PR #21 (`35af11c`). Owner subsequently said Git/health-check command block completed, but no service logs or test output was provided; do not claim their exact results.
- GitHub remote short-lived branches were reduced from 23 to 4 as independently checked before this feature PR. Keep `main`, `refactor/v2`, `feature/v3-home-agent`, Gate E review branch. Historic release builds `7d9bab5` and `920585d` were archived, with rollback `97343fa` retained.

## Next useful slice
- [ ] V3 exact read-only `/light` status and natural question for already scoped `light.tambur_svet_l1`: source-only development, mock/offline tests and Pi ARMv7 check, then new immutable release with separate owner consent. **Do not expand light registry access** without review.
- [x] Source-only bounded multi-light `/lights` overview for exact 7 tamboor/corridor IDs using existing `ha_get_state`; unknown data reported separately; NO wider write scope. GitHub offline testing pending and Pi/HA-MCP real acceptance still required. No V3 production deployment.
- [ ] Verify actual HA entity IDs and responses for all 7 lights read-only on Pi before considering release; add clear missing/renamed entity diagnosis as needed.
- [ ] Prioritize trusted simple room state/context and reuse HA Assist + ESPHome for voice. No separate voice authority or competing Telegram poller.

## Remaining acceptance / housekeeping
- [ ] Verify Gate D timers' latest *Result* and journal failures on Pi, plus V2 service active, including after historical release archives; check against actual owner output before marking healthy.
- [ ] Verify Pi DEV at current GitHub head + `npm test` before production promotion; CI on GitHub x64 does not substitute Pi validation.
- [ ] Gate B registry/source auth, Gate C restart/fault evidence, Gate D disaster recovery and Gate E voice still open. Stage is mocked. No broad HA physical control without owner-approved scope/identity gates.
- [ ] Gate E review branch can only be removed when unique work and references are assessed.

## Safety & navigation
Read `AGENTS.md`, `docs/PROJECT-MAP.md`, `docs/CHAT-HANDOFF.md`, `docs/WORKLOG.md`, `docs/home-agent-v3-strategy.md`, and `docs/V3-GITHUB-CLEANUP-2026-10-12.md`. Historical tasks are in `docs/archive/TODO-history-through-2026-10-11.md` and dated checkpoint docs. Never conflate source branch with running release; protect external credentials and SQLite journal.

## 2026-10-12 — Lights candidate preflight
- Prepared release gate `docs/V3-LIGHTS-RELEASE-GATE-2026-10-12.md`; immutable candidate packaging now syntax-checks both light modules. User Pi full test and actual HA-MCP seven-ID acceptance are **not yet provided**; production V3 `c6a9812` unchanged. V2/Gate D runtime result remains unconfirmed. Owner approval is required for any systemd switch.

## 2026-10-12 — DEV automation (installed and first successful run confirmed)
- [x] Added narrow user-systemd pull-only DEV timer, guarded fast-forward, Pi test, separate immutable candidate directory, lock, protected status and explicit prod isolation; see `docs/V3-DEV-AUTOMATION-2026-10-12.md`.
- [x] One-time DEV timer installation and first successful run confirmed by owner (07:10 UTC, SHA b1122bd). Continue verifying subsequent unattended timer executions and invariant protections.
- [ ] Direct ChatGPT→Pi remains blocked by Desktop Commander remote-call quota (0% left when last checked). No public SSH/webhook or remote-shell bot fallback approved.

## 2026-10-12 — Offline STAGE candidate smoke (source pending CI/Pi)
- [x] Implement bounded on-demand offline candidate smoke using existing loopback mock; verify immutable SHA, GET /health, GET /registry with authorization:false, denial of writes. Integrated into candidate preparation after CI, no stage daemon or production deployment.
- [x] Owner verified ARMv7 Pi offline STAGE smoke: 2026-10-12T07:56:27Z, SHA 46ce492033fb6c830a37ef95ba6efdb3ed632470, status=passed, stage=complete, exit_code=0; last-stage.log reports STAGE_PASS with identity/health/registry/deny. This accepts the OFFLINE MOCK contract only, not live HA integration or production deployment.
- [ ] Independent runtime fault/rollback review before any production promotion. No automatic deployment.

## Next immediate practical goal
- [ ] Offline-tested Russian read-only questions for scoped lights and sauna; test safe handling of unknown/unavailable readings. Reuse existing `src/home/sauna-status.mjs`, `light-overview.mjs`, `src/pilot/telegram-readonly.mjs`. No new poller, secrets, broad actuation or prod restart without approval.

## 2026-10-12 — Russian read-only question routing (source only)
- Added pure bounded Russian question classifier for existing sauna temperature/ready, seven selected lights and tamboor light; unsupported questions never fall into write intent. No new authority or live deployment.
- [ ] GitHub CI, Pi candidate STAGE, and owner-approved real read-only HA acceptance before prod promotion.

## 2026-10-12 — Live read-only preflight tool
- [x] Added operator-only explicit HA-MCP read smoke script (sauna/7 scoped lights/tambour), no service calls or bot. CI proof pending; Pi real response not yet verified.
- [ ] Run once with operator consent on Pi, capture bounded statuses (not credentials); unresolved/unknown identities fail acceptance without allowing new action scopes.

## 2026-10-12 — Owner live HA-MCP read results
- [x] Real sauna read complete: 27.125 °C, not ready (<85 °C); tamboor read complete: on.
- [ ] Seven-light overview partial: 1 on, 3 off, 3 unknown (`light.koridor_2`, `light.koridor_1_etazh_2`, `light.koridor_spot_2`). No rename/removal or broader control approved; diagnose actual HA read errors before changing scope.

## Lighting classification checkpoint 2026-10-12
- [x] Actual Pi live HA-MCP: three fixed light IDs returned `unavailable`; sauna and tamboor complete. Owner clarified switches/auxiliary entities may be mixed with actual lamps.
- [x] Reuse existing lighting-classification schema. Added bounded individual state inventory for seven scoped IDs, no registry discovery or actuation.
- [ ] Obtain HA's actual area, physical-purpose and `switch.*` aliases via reviewed source; classification must not be guessed from a `light.*` ID.

## 2026-10-12 — reconciled active phase (supersedes older unchecked checkpoints)
- [x] Historical audit reconciled production c6a9812, verified mock STAGE, live Pi HA-MCP and the three unavailable entities; see docs/V3-HISTORY-STAGE-AUDIT-2026-10-12.md.
- [ ] NEXT: scoped authoritative HA entity metadata for physical light/switch/helper classification in corridor/tambour; no guessed aliases or authorization changes.
- [ ] Then tested bounded /lights summaries, fresh exact-SHA candidate, ARMv7/CI and separate owner-approved promotion. Gate B/C/D/E wider acceptance OPEN.

## 2026-10-12 — Remote Git branch housekeeping
- [x] Audited 27 current GitHub branch refs and PR #22–#44: 23 disposable heads (21 merged, two closed duplicate doc PRs); closed duplicate PR #43. See docs/V3-GITHUB-CLEANUP-2026-10-12.md.
- [ ] Owner-run exact-ref remote deletion and **post-delete GitHub verification remain pending** (no remote delete capability in this connector). Retain 4 named branches, including Gate E review; preserve local Pi runtime/release checkouts.

## 2026-10-12 — Verified remote branch cleanup (supersedes earlier pending entries)
- [x] Owner deleted 24 temporary GitHub remote refs; independently verified exactly 4 retained: main, refactor/v2, feature/v3-home-agent, Gate E review.
- [ ] Gate E review branch retained pending separate assessment; do not delete just to reduce count.
- [ ] Resume read-only HA metadata review for real light/switch/helper identity before improving /lights; no production change.

## 2026-10-12 — Source integrity audit
- [x] GitHub structural inventory: complete tree, 4 remote branches, 0 open PRs, no symlinks. Corrected contradictory V3 directory ownership and old production version guidance. Added short docs/CURRENT-STATE.md; history preserved.
- [ ] Verify Pi canonical DEV checkout status/head against GitHub; effective V3 systemd ExecStart/rollback path; V2/Gate D last executions. GitHub connector cannot independently attest to those runtime facts.
- [ ] Audit actual HA physical lighting vs switch/helper entities read-only before changing the /lights schema; retain fail-closed scopes.

## 2026-10-12 — Latest Pi operational confirmation
- [x] Owner verified V2 active; V3 active from immutable c6a9812; Gate D health/alerts last exit success (0), last ran 13:17:17 EEST, next 13:32:17. No prod mutation.
- [ ] Verify Pi DEV fast-forward completed (last owner observed e231afb vs fetched origin 115c6b3); inspect automation latest.txt outcome separately from timer triggers (last DEV timer 12:13:16 EEST).

## 2026-10-12 — Practical light identity evidence
- [x] Owner confirmed exact-SHA Pi DEV STAGE PASS `f4acd114c10f2c8883e433cd71ca4c60f173d278` at 10:33:23 UTC (status passed, stage complete, exit 0). Pi DEV also clean and synced at f4acd11 on last report. No prod deployment.
- [x] Added review-only fixed-scope HA friendly-name display for existing seven `ha_get_state` targets. No new MCP permissions or physical type inference.
- [ ] Owner-run revised preflight to collect friendly names/state; then cross-check actual switch/helper and area metadata in HA before changing /lights semantics. Do not treat friendly_name as physical proof.

## 2026-10-12 — Physical light identity verification
- [x] Owner confirmed seven HA states/names from live HA-MCP; 3 returned unavailable and two share names with off counterparts. Same friendly_name is not proof of duplicate physical circuits.
- [x] Source /lights text adjusted to count selected HA entities, not seven lamps; unknown entities named by exact IDs. CI and Pi release acceptance separate.
- [ ] Verify entity integration/device/area and switch/helper identity in HA UI or reviewed registry; then map to existing lighting-classification module. No broader writes.

## 2026-10-12 — Deleted Yandex-derived lighting records
- [x] Owner deleted unavailable HA entity records light.koridor_2, light.koridor_1_etazh_2 and light.koridor_spot_2 (first identified as orphan of yandex_station). No automatic HA deletion by this project.
- [x] V3 read-only allowlist and /lights source narrowed from 7 to 4 existing light-domain IDs; negative test ensures deleted IDs never queried.
- [ ] Verify all four live HA-MCP reads via revised preflight and actual role/area before claiming physical-light inventory; no prod promotion without owner release gate.

## 2026-10-12 — Scoped four-light live read acceptance achieved
- [x] Owner real Pi HA-MCP preflight: sauna complete, tamboor complete, four retained light IDs all available; `READONLY_PREFLIGHT=PASS` (on 1/off 3/unknown 0).
- [x] PR #49 four-target source and regression tests passed GitHub CI and merged `0a0d024`.
- [ ] Check exact new HEAD Pi CI-gated offline STAGE, then owner-review immutable candidate and rollback before deploying /lights and Russian read-only routing to V3 production. Existing prod c6a9812 unchanged.
- [ ] Later verify physical room/fixture classification to broaden coverage; four-domain-entity status is not whole-house inventory.

## 2026-10-12 — Russian OFF-light read-only detail (PR #50)
- [x] Source-only four-entity /lights now lists OFF labels as well as ON labels; unknown HA responses remain explicit and fail closed. Added explicit Russian OFF-light questions and isolated tests. No additional entity scope, commands, physical fixture assertion, polling process or runtime change.
- [ ] Verify exact PR #50 CI and merge only on success; then Pi DEV exact-HEAD offline STAGE before separately authorized immutable production release.

## 2026-10-12 — PR #50 acceptance checkpoint (supersedes its pending CI item)
- [x] PR #50 merged as `9cbb69536cb599527652130a504a8c5ab6f33aa7`; GitHub `Offline Node checks` Node 20 isolated suite completed successfully on head `6989fe3`.
- [ ] Confirm Pi DEV fast-forward to merged exact SHA, offline STAGE PASS and separate owner-approved immutable release gate before Telegram production receives this feature.

## 2026-10-12 — PR #51 accepted
- PR #51 merged as `d7aad8c` after GitHub Node 20 offline CI succeeded on exact head `668a357`. Four selected lights: all OFF vs any ON vs unknown is now explicit and read-only. Pi ARMv7 DEV/STAGE unverified; production not changed. Next: exact-SHA Pi candidate gate and owner-approved release.

## 2026-10-12 — Owner-approved V3 startup, final acceptance pending
- [x] Owner approved and executed V3 switch to immutable `9dd5964` candidate. systemd confirmed exact ExecStart, `active/running`, PID 3713 at 14:49 EEST; previous `c6a9812` rollback kept.
- [ ] Telegram smoke `/status`, `/sauna`, `/light`, `/lights`, Russian questions; cancel→confirm must return missing with no physical action. Roll back to `c6a9812` if regression. User journal reports `No journal files were found`; do not infer bot protocol success from active state alone.

## 2026-10-12 — Real Telegram smoke evidence
- [x] Owner screenshot confirms V3 9dd5964 `/status`, empty `/confirm`, `/sauna`, `/light`, `/lights` and two Russian lighting queries replied with consistent data.
- [ ] Complete requested light intent → `/cancel` → `/confirm` missing, without physical write. Then close production functional acceptance and develop question-specific concise responses in DEV only.

## 2026-10-12 — Production confirmed-action live acceptance (owner Telegram transcript)
- Operator requested `Включи свет в тамбуре`, received pending exact `light.tambur_svet_l1` + explicit `/confirm` prompt; `/confirm` returned `Home Assistant подтвердил состояние светильника после команды.` Repeated for OFF, again verified by HA response. This proves confirmed on/off flow for existing authorized target, but independent physical observation and request→`/cancel`→`/confirm` regression are not yet supplied. No broader authority established. Active V3 release last observed `9dd5964`, rollback `c6a9812` preserved.

## 2026-10-12 — Live cancel response verified; replay check pending
- Owner Telegram transcript: request `Включи свет в тамбуре` created exact-target pending confirmation; `/cancel` replied `Запрос отменён.` No subsequent `/confirm` output yet: cancellation response verified, invalidated-token replay rejection still pending. No new device write authorized.

## 2026-10-12 — V3 9dd5964 Telegram MVP functional acceptance complete
- Owner-provided live Telegram transcript confirms pending `light.tambur_svet_l1` request → `/cancel` = `Запрос отменён.` → `/confirm` = `Нет действующего запроса для подтверждения.` Previous private-chat smoke passed `/status`, `/sauna`, `/light`, `/lights`, Russian lighting questions, and separately user-confirmed ON/OFF with `/confirm` and HA verified-state replies. This closes **scoped Telegram functional acceptance** only; broader policy/security gates, physical-light classification, fault/recovery tests and voice remain open. Existing production SHA `9dd5964`, no new deployment or permissions. Next: concise question-specific Russian answers and scoped context in DEV via CI without production changes.

## 2026-10-12 — CHECKPOINT: scoped Telegram MVP accepted
- [x] Production V3 immutable `9dd5964` functional acceptance: status, sauna, four-light reads, Russian lighting requests, confirmed tamboor ON/OFF and cancel→confirm rejection. Rollback `c6a9812` retained.
- [x] GitHub audit found seven merged short-lived PR heads (#46–52), 11 branches total; exact names documented in V3-GITHUB-CLEANUP-2026-10-12.md.
- [ ] Remove seven verified merged remote PR refs in an operator-controlled step and independently confirm only four remain. Do not delete local/runtime files without reference audit.
- [ ] Check Pi DEV worktree SHA and fetch latest documentation commits using clean fast-forward. DO NOT repin running immutable V3 production for DEV docs.
- [ ] Next feature: concise Russian responses and bounded conversational context in DEV only; test/CI before a separately approved release.
