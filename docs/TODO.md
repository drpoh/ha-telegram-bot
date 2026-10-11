# RS Home AI V3 — active tasks (2026-10-12)

## Operational baseline
- Owner-confirmed V3 production: immutable `/home/drpoh/projects/rs-home-ai-v3-release-c6a9812`, private Telegram sauna and tamboor consent/cancel validated; no new deployment approved.
- V2 system service uses `/home/drpoh/ha-telegram-bot`; Gate D enabled health/alerts timers run scripts from historical `/home/drpoh/rs-home-ai-v3`. Never move these checkout directories without migration.
- Pi DEV `/home/drpoh/projects/rs-home-ai-dev`, branch `feature/v3-home-agent` was owner-reported clean/synced to `197a1eb` before documentation PR #21 (`35af11c`). Owner subsequently said Git/health-check command block completed, but no service logs or test output was provided; do not claim their exact results.
- GitHub remote short-lived branches were reduced from 23 to 4 as independently checked before this feature PR. Keep `main`, `refactor/v2`, `feature/v3-home-agent`, Gate E review branch. Historic release builds `7d9bab5` and `920585d` were archived, with rollback `97343fa` retained.

## Next useful slice
- [ ] V3 exact read-only `/light` status and natural question for already scoped `light.tambur_svet_l1`: source-only development, mock/offline tests and Pi ARMv7 check, then new immutable release with separate owner consent. **Do not expand light registry access** without review.
- [ ] After confirming single-lamp read behaves correctly in Telegram, design an explicitly bounded multi-light read-only overview using HA-MCP, protect ambiguous names; no write permissions added.
- [ ] Prioritize trusted simple room state/context and reuse HA Assist + ESPHome for voice. No separate voice authority or competing Telegram poller.

## Remaining acceptance / housekeeping
- [ ] Verify Gate D timers' latest *Result* and journal failures on Pi, plus V2 service active, including after historical release archives; check against actual owner output before marking healthy.
- [ ] Verify Pi DEV at current GitHub head + `npm test` before production promotion; CI on GitHub x64 does not substitute Pi validation.
- [ ] Gate B registry/source auth, Gate C restart/fault evidence, Gate D disaster recovery and Gate E voice still open. Stage is mocked. No broad HA physical control without owner-approved scope/identity gates.
- [ ] Gate E review branch can only be removed when unique work and references are assessed.

## Safety & navigation
Read `AGENTS.md`, `docs/PROJECT-MAP.md`, `docs/CHAT-HANDOFF.md`, `docs/WORKLOG.md`, `docs/home-agent-v3-strategy.md`, and `docs/V3-GITHUB-CLEANUP-2026-10-12.md`. Historical tasks are in `docs/archive/TODO-history-through-2026-10-11.md` and dated checkpoint docs. Never conflate source branch with running release; protect external credentials and SQLite journal.
