# RS Home AI V3 — active tasks (2026-10-12)

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
