# RS Home AI v3 operations (Raspberry Pi)

## Isolation
- Dedicated checkout: `/home/drpoh/rs-home-ai-v3` (branch `feature/v3-home-agent`).
- Dedicated user systemd service: `rs-home-ai-v3.service`; runs as `drpoh`.
- Dedicated private configuration: `/home/drpoh/.config/rs-home-ai-v3` (0700); tokens and local approved policy must never enter Git.
- v2 service `ha-telegram-bot.service` is independent and must not be restarted by v3 procedures.
- V3 dependencies are installed privately with `npm ci --omit=dev --ignore-scripts`; no v2 `node_modules` symlink remains.

## Automatic startup
`loginctl show-user drpoh -p Linger` should return `yes`.
The v3 user service is enabled at `default.target`, waits for network, and restarts on failure with 8-second delay, limited to 5 attempts in 120 seconds.

## Operator commands
Use `systemctl --user status rs-home-ai-v3.service` from an ordinary interactive drpoh login; or set `XDG_RUNTIME_DIR=/run/user/1000` and `DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus` in a non-login remote shell.
- Stop / immediate rollback: `systemctl --user stop rs-home-ai-v3.service`
- Start: `systemctl --user start rs-home-ai-v3.service`
- Disable startup: `systemctl --user disable rs-home-ai-v3.service`
- Logs (if journal available): `journalctl --user -u rs-home-ai-v3.service -n 50 --no-pager`

## Safety
V3 controls only `light.led_kukhnia` after trusted Telegram confirmation, pinned private operator policy, and fresh registry validation. If V3 is stopped or fails, HA Green and v2 continue independently. Do not copy secrets or put private MCP path in logs/docs.

## Real resilience test — 2026-10-08
- Installed private v3 dependencies with `npm ci --omit=dev --ignore-scripts`; shared v2 `node_modules` symlink was removed.
- Restarted only the v3 systemd user service: active; v2 systemd service remained active.
- Terminated the supervised v3 Node process with SIGKILL. After the configured restart delay, systemd showed `ActiveState=active`, a new MainPID and `NRestarts=1`; v2 service remained active.
- Full Raspberry Pi host reboot was later authorized and completed on 2026-10-08; see below.

## Real host reboot verification — 2026-10-08
- Raspberry Pi rebooted at 23:29:59 EEST. v2 system service automatically active from 23:30:18; v3 user service automatically active from 23:30:22. Both units were enabled.
- V3 Telegram `/status` replied after reboot. Read-only HA-MCP `ha_get_state` for `light.led_kukhnia` returned `off`; no device action was performed by this check.
- Desktop Commander Remote initially stayed offline after reboot: it had been running manually. Created separate user `desktop-commander-remote.service` (enabled with `Restart=always`, using the pinned cached package and Node 22 executable). Stopped the original manual agent, then confirmed Remote connection remained online through the new service; v2 and v3 stayed active.
- Full reboot verification of the **new Desktop Commander service** has not yet been performed. Treat it as a remaining test, not a passed gate. Its cached `npx` executable path may need maintenance after npm cache cleanup.
- Neither Home Assistant Green nor physical device entities were modified during these operations.

## Night unattended read-only checks — 2026-10-08
- After the 23:29:59 EEST host boot, `ha-telegram-bot.service`, `rs-home-ai-v3.service` and `desktop-commander-remote.service` all reported active. The last two were enabled; `drpoh` linger was enabled.
- Remote Desktop Commander returned online and accepted new commands after detaching the manual process. No second host reboot had been done to verify its *boot-time* activation.
- V3 isolated test suite: `npm test`, 92 test files, 360 assertions, 0 failed files. Log: `/tmp/rs-v3-night-tests.log` (transient local file).
- Read-only HA-MCP `ha_get_state` for `light.led_kukhnia`: `off`, with `isError=false` and process exit code 0. No physical switching.
- Private configuration permissions: directory 0700, Telegram token and private MCP URL 0600, Desktop Commander device credential file 0600.
- Raspberry Pi system remained sufficiently available for read-only checks; v2 reported active during testing. No change to HA Green or v2 was made.
- A later read-only follow-up was completed on 2026-10-09; see the results below.

## Follow-up health check — 2026-10-09 04:05 EEST
- v2, v3 and Desktop Commander Remote: active/running and enabled; no service restarts since last start.
- HA-MCP read-only state for `light.led_kukhnia`: `off`, `isError=false`, process exit 0. No physical switching.
- Original `npm test` log: 92 test files, 360 passed assertions, 0 failed files. Original exit code was not recorded.
- No warning-or-higher journal entries for these three services since the last Raspberry Pi boot.
- Desktop Commander user unit passes systemd verification; full post-install host reboot remains untested.
- Branch `feature/v3-home-agent` matched origin at the time of inspection.
- OS issue: local console getty repeatedly attempts automatic login to missing user `pi`, generating thousands of error logs. Left unchanged pending review.
- Existing whole-home rollout gates remain open. HA Green and v2 were not modified.
- Independent repeat of `npm test` on 2026-10-09: 92 isolated test files, 360 passed assertions, 0 failed files; explicitly captured `NPM_TEST_EXIT=0` (exit 0). Local log: `/tmp/rs-v3-morning-tests.log`.

## Post-overnight stabilization review — 2026-10-09
- Confirmed root cause of Raspberry Pi console error: `/etc/systemd/system/getty@tty1.service.d/autologin.conf` sets `agetty --autologin pi`; `getent passwd pi` returns no user. `getty@tty1.service` showed thousands of restarts. Repair requires an authorized privileged edit, deferred; unrelated bot services were left unchanged.
- Read-only HA-MCP `ha_get_state(light.led_kukhnia)` again returned `off` with `isError=false`; v2, v3 and Desktop Commander remained active. No HA configuration or device state was changed.
- Focused standalone security tests passed: channel intent ledger, one-shot intent ledger, in-flight invalidation, kitchen MCP dispatch boundary, single target scope and registry capability guard.
- A seventh standalone test (`gate-c-confirmation-faults`) failed to initialize because standalone execution omitted required synthetic `TELEGRAM_BOT_TOKEN`. It **did pass** as part of the full isolated suite (92 files, 360 assertions, zero failures), whose harness supplies isolated synthetic environment variables. A follow-up standalone attempt was blocked by remote tool policy; no attempt to bypass it was made. No product regression has been established from this isolated launch error.
- Desktop Commander auto-start following an actual host reboot remains an unverified acceptance condition. Gate B authorizes only the previously approved single light with Telegram per-action confirmation; never expand physical scope without approval.

## Console autologin correction verified — 2026-10-09 05:10 EEST
- Owner disabled the invalid `pi` autologin override by renaming it to `autologin.conf.disabled`. `systemctl cat getty@tty1` no longer includes the bad override. No new `pi` login failures observed after 05:09:33 at inspection.
- v2, v3 and Desktop Commander services all remained active. `getty@tty1.service` currently reports `disabled` and `inactive`; interactive local tty1 availability is NOT confirmed and may require a separate privileged enable/start if desired. No effect on SSH was observed.

## Local console restored — 2026-10-09 05:11 EEST
- Owner ran privileged `systemctl enable --now getty@tty1.service` following removal of invalid `pi` autologin override. Verified `getty@tty1.service`: `enabled`, `active`, `NRestarts=0` and journal only shows clean startup at 05:11:16. v2, v3 and Desktop Commander remained active.
- A subsequent full isolated test run for Gate C was started in `/tmp/rs-v3-gate-c-20261009.log`; record the final result only after process exit is observed, not while running. No live physical actuation was requested.

## Gate C fault injection — 2026-10-09
- Added isolated `test/v3-kitchen-mcp-faults.test.mjs` with four scenarios: failed MCP preflight, failed service call after successful preflight, readback failure after one service call, and unavailable admission policy check.
- Focused test: 4/4 passed. All MCP calls are injected mocks: no HA-MCP network call or physical write is made by these tests.
- Verified one-shot consent cannot replay a command after failure; no second MCP write is attempted from a duplicate confirmation, and an unavailable admission guard denies without calling MCP.
- This is offline fault-injection evidence only, not proof of exactly-once delivery across a real network interruption; a real service write may have executed even when its response is lost. Never automatically retry an ambiguous write.

## Gate C repeat acceptance checkpoint — 2026-10-09 05:23 EEST
- Completed the repeat isolated suite: `npm test` reported 92 test files, 360 passing assertions, 0 failed files. Test process was no longer running when inspected. Log: `/tmp/rs-v3-gate-c-20261009.log`.
- Independently re-ran `node --test test/v3-kitchen-mcp-faults.test.mjs`: 4 passed, 0 failed, shell exit 0. Includes offline MCP preflight outage, ambiguous write failure, readback timeout and policy checker outage; all mock-based and do not touch HA devices.
- v2, v3 and Desktop Commander remained active. Existing physical scope remains one kitchen light with explicit per-action Telegram confirmation.
- Still open: full post-install host reboot test of Desktop Commander and real outage semantics; no claim of exactly-once network writes. These require separate operational risk review before expanding write scope.
- Full regression after adding four fault-injection assertions: `npm test` completed with exit code 0, 93 isolated test files, 364 passed assertions and 0 failed files. Log `/tmp/rs-v3-gate-c-new-tests.log`.

## Gate D — read-only monitoring and rollback
- Run `node scripts/gate-d-healthcheck.mjs` from the v3 checkout to inspect systemd health for v2, v3 and Remote. Output is minimal JSON without any HA credentials, endpoints or messages; exit 0 when all are active/enabled with a PID, exit 1 otherwise. This checks process state, not end-to-end Telegram or MCP functionality.
- On 2026-10-09 05:25 EEST, all three units were active and enabled, with `NRestarts=0`; healthcheck exit code 0.
- If v3 behaves unexpectedly, stop **only** its service: `systemctl --user stop rs-home-ai-v3.service`. To prevent automatic startup: `systemctl --user disable rs-home-ai-v3.service`. Do not stop v2, Zigbee2MQTT, HA-MCP or HA Green. Resuming requires operator review and `systemctl --user enable --now rs-home-ai-v3.service`.
- To inspect state without disruption use `systemctl --user show rs-home-ai-v3.service -p ActiveState -p MainPID -p NRestarts`, and `systemctl is-active ha-telegram-bot.service`. The Remote user service is likewise independently controlled; it is not required for Home Assistant operation.
- `journalctl --user` on this installation has returned `No journal files were found`; do not claim absence of errors from an empty journal. Persistent, access-controlled incident logging with safe redaction remains a Gate D requirement. Avoid logging tokens, MCP private paths or chat payloads.
- Neither an unattended host reboot test of the new Remote service nor actual MCP network partition tests have been passed. Require a maintenance window and ensure local SSH recovery before a host reboot. No automatic replay of ambiguous writes.

## Gate D — scheduled private service-health records (2026-10-09)
- Implemented `scripts/gate-d-healthcheck.mjs --record` with fixed-schema JSONL output to `/home/drpoh/.local/state/rs-home-ai-v3/gate-d-health.jsonl`, mode 0600, parent mode 0700; caps at 500 samples and does not capture device states, Telegram messages, tokens, service command lines, or private MCP URLs.
- Installed separate user `rs-gate-d-health.service` (oneshot) and enabled `rs-gate-d-health.timer`, every 15 minutes. First systemd start reported `Result=success` and `ExecMainStatus=0`; timer next scheduled at 05:45:22 EEST. v2/v3/Remote services remained active and untouched.
- `test/gate-d-health.test.mjs`: 5/5 passed, simulating healthy service, stopped service, disabled service, missing PID, missing fields. No production process was killed during fault simulations.
- `journalctl --user` yields no journal files in the inspected session, whereas system journal queries can return user process entries. Do not treat missing user logs as proof of no errors. The private health journal is service-status history **only**, not full application incident logging. It does not trigger alerts or changes and cannot prove end-to-end Telegram or MCP service health.
- Installed timer/service units are local Raspberry Pi operational configuration, not part of Git; back up/migrate them separately. To stop only periodic health records: `systemctl --user disable --now rs-gate-d-health.timer`.

## Gate D full host reboot acceptance — 2026-10-09 05:33 EEST
- Owner rebooted Raspberry Pi: `uptime -s` changed to 2026-10-09 05:33:00, and boot ID changed compared with pre-reboot. HA Green was not restarted.
- Auto-start verified after host reboot: system `ha-telegram-bot.service` active (PID 927); user `rs-home-ai-v3.service` active (PID 971); `desktop-commander-remote.service` active (PID 969, started 05:33:23). All were enabled and healthcheck returned `ok:true`, zero supervisor restarts.
- Remote device reported Online and subsequently accepted actual ChatGPT remote shell commands without a manually launched remote process. Remote restoration initially lagged boot by roughly 104 seconds (service reported Online at 05:34:44).
- `rs-gate-d-health.timer` active after boot; successful earlier run at 05:35:09, next due at 05:50:09. `getty@tty1` active. Read-only HA-MCP `ha_get_state(light.led_kukhnia)` returned `off`, `isError=false`, exit 0; no physical write.
- **Passed:** full host reboot and auto-recovery of v2, v3, Desktop Commander Remote, timer and read-only MCP client. **Not proven:** network exactly-once semantics for write failures, complete operational incident logs or automatic alerts. Preserve current single-light permission boundary.

## Gate D — health state transitions, 2026-10-09
- Added deterministic read-only outage/recovery transition classification for v2/v3/Remote health snapshots. Records only service name, UTC time, `unhealthy` or `recovered` in private `/home/drpoh/.local/state/rs-home-ai-v3/gate-d-events.jsonl`, bounded to 200 entries. No Telegram messages, secret file reads, HA writes or automated service restarts are implemented by this logic.
- 9/9 focused tests passed including outage, recovery, healthy repeat, and initial snapshot cases; live read-only health check returned `ok:true` after installation. Scheduled systemd timer uses the updated script on its next invocation.
- Incident journal tracks process state transitions only. Persisted notifications to a user-controlled channel and end-to-end heartbeat monitoring still need separate review; an incident might go unnoticed if the monitoring timer itself fails.

## Gate D — Telegram incident notification timer (2026-10-09)
- Added `scripts/gate-d-telegram-alerts.mjs` and pure alert formatting/deduplication helpers with 3 passing focused tests. It only reads fixed-schema private event records and existing private v3 Telegram token/user files; it never calls HA-MCP or writes to HA.
- Installed and enabled separate user `rs-gate-d-alerts.service` and `rs-gate-d-alerts.timer` on Raspberry Pi. Runs every 15 minutes; initial service completed successfully with no queued events. `--send` is required for delivery; without it the script is dry-run. The unit configuration exists only on the Pi, not in Git.
- Fixed-text notifications contain service (`v2`, `v3` or `remote`), event (`unhealthy` or `recovered`), and timestamp. Delivery attempts are marked before network requests and not automatically retried after ambiguous network failure, preventing automated duplicate notifications at the cost of potentially missed alerts. Attempts journal is private.
- No synthetic Telegram alert has been sent and actual delivery is **not yet verified**. The timer does not independently detect a failure of its own monitoring process, and process health is not Telegram/MCP end-to-end health. Treat these as remaining Gate D acceptance limitations.
- To disable only alerts: `systemctl --user disable --now rs-gate-d-alerts.timer`. Leave `rs-home-ai-v3.service` and v2 untouched.

## Gate D Telegram transport smoke test — 2026-10-09
- Sent exactly one explicitly marked test notification using the existing v3 Telegram bot credentials to the already approved private chat, without generating a fake incident event or changing any HA state.
- Telegram `sendMessage` API returned HTTP 200, accepted=true. Receipt by the user's Telegram client was not independently verified; user may confirm receipt.
- Prior to test, Gate D dry-run found zero pending incident events and read-only health check showed v2, v3 and Remote all active. Do not mistake this smoke test for validation of end-to-end detection of a real process outage, which remains to be tested.

## Gate D Telegram receipt and Gate E read-only kickoff — 2026-10-09
- Owner independently confirmed receipt of the one explicitly marked Gate D Telegram smoke-test notification. Delivery channel is accepted for this test; no real service outage was induced. Monitoring still checks process state rather than end-to-end behavior and has no independent watchdog for timer failures.
- Current health snapshot: v2/v3/Remote active; Gate D timers active, with no pending incident messages. No physical HA calls.
- Began Gate E with `test/v3-assist-gate-e-security.test.mjs` (4/4 passed): voice transcripts cannot claim verified speaker identity, unknown/forged satellites denied, high-risk intents denied, reviewed low-risk intents remain `review` only and never authorize HA actuation.
- Atom Echo/Assist is not connected to live v3 dispatch. Live voice actions remain deferred pending authenticated transport, authoritative HA registry binding, explicit owner-approved voice confirmation protocol and independent authorization. Existing Telegram per-action confirmation and one-light limit remain unchanged.

## Gate E isolated read-only route — 2026-10-09
- Implemented offline-only `src/decision/v3-assist-readonly-route.mjs` which validates a trusted device-only Assist envelope and a complete fresh reviewed satellite registry binding. Strictly rejects all HA write/config tools and out-of-scope entity ID forms.
- Even a valid `ha_get_state` request yields **review** (`target_registry_authorization_required`), not an MCP call, because satellite-area verification does not independently authorize the requested entity. No voice endpoint or live Assist-to-v3 wiring has been deployed.
- 4/4 isolated Gate E route tests passed after supplying a fake, deliberately non-callable test read client. This explicitly confirms no network or HA operation is performed. Full isolated regression remains to be run before any production changes.

## Gate E independently verified read-target fixture — 2026-10-09
- Added offline-only `v3-assist-target-registry.mjs`: requires a fresh, complete entity registry snapshot with exactly one available, non-disabled `light.*` target, matching the independently verified satellite area and a non-empty device ID. Incomplete/stale/duplicate/wrong-area/unknown entries fail closed.
- `v3-assist-readonly-route.mjs` now checks both satellite and entity registry evidence before returning a **review plan**, and still never calls HA-MCP or actuates HA. Neither fixture snapshot is treated as live authoritative HA evidence; live adapter and target authorization remain unimplemented.
- Focused tests: 9/9 passed across target registry and route (including cross-area rejection). Full standard suite is a follow-up; no v2/v3 runtime restart.

## Gate E entity registry acquisition contract — 2026-10-09
- Added offline-only `acquireAssistEntityRegistry`: accepts an injected read-only registry reader, demands complete/non-paginated fresh entity inventory, consistent count, unique IDs, explicit area and device IDs, valid boolean availability/disabled values and light-only scope; fails closed on malformed data and transport exceptions.
- Focused tests 4/4 passed; not deployed into the running Assist pipeline or Telegram v3 service. This module trusts the supplied `complete` metadata for fixture validation; a **real** adapter still must independently establish HA authority, count scope, registry origin, and immutable provenance. Do not infer live authorization from a successful fixture.
- Await the full `npm test` result started earlier before claiming complete regression acceptance. No real HA actuation or restart was performed.

## Gate E complete entity-registry acquisition contract — 2026-10-09
- Previous full regression after independent target verification completed with 99 test files / 393 assertions / zero failures; final process no longer running. Log: `/tmp/rs-gate-e-target-regression-20261009.log`.
- Added offline `v3-assist-target-reader.mjs`: a read-only injected registry reader must prove complete, unpaginated, fresh entity registry data with matching entity count and unique typed records; otherwise it fails closed. No network adapter, Assist ingress or HA write is installed.
- Four focused reader tests passed. `ha_search` or a filtered entity subset is **not** accepted as a full authoritative registry. Next step is to inspect actual HA-MCP capabilities and confirm an authoritative complete registry source exists before attempting live voice reads.
- Live read-only MCP `listTools` capability inspection found `ha_get_device`, `ha_get_entity`, `ha_get_entity_exposure`, `ha_get_overview`, `ha_list_floors_areas`, `ha_search`, and `ha_set_area_or_floor`. There was no dedicated full entity-registry listing capability in this tool inventory. `ha_set_area_or_floor` is mutating and was NOT called. This is a capability inventory only; no target registry data was inferred.
- Next: assess whether separately verified targeted `ha_get_entity` can support a narrow read-only voice status path without claiming complete room scope; keep whole-room and physical control blocked until authoritative registry completeness and policy are available.

## Gate E `ha_get_entity` targeted registry assessment — 2026-10-09
- Live read-only MCP schema confirms `ha_get_entity` accepts an exact `entity_id` or mutually exclusive `unique_id` with optional filters; `ha_get_state` remains a separate read call. Only `ha_get_entity(light.led_kukhnia)` was inspected, no service writes.
- Response shape is `{success,entity_id,entity_entry}`. This particular entity has a device ID and stable unique ID, but `entity_entry.area_id` is **null**. Area may be inherited from its device, so this response alone cannot establish authoritative area membership. Never infer area from friendly names or model transcript.
- Added `v3-assist-entity-lookup.mjs` with 4 passing focused tests; exact entry, enabled state, stable identifiers and explicit area are required. Missing/inherited area fails closed pending separately verified device registry binding. No live voice read or actuator path was deployed.

## Gate E inherited device area verified — 2026-10-09
- Live HA-MCP read-only `ha_get_entity(light.led_kukhnia)` had null entity `area_id` and a nonempty `device_id`. `ha_get_device` using that exact ID returned a `device` record, `area_id=kukhnia` and `entity_count=6`; no physical action was sent. Device response key is `device.device_id` (not `device.id`).
- Added `v3-assist-device-area.mjs`: a narrow entity-to-device area verification fixture that checks exact linked device ID, entity availability flags and reviewed expected area; missing/conflicting membership fails closed. It returns registry binding evidence, **not authorization**.
- Four focused tests passed. This does not authenticate voice provenance or prove full room inventory. A full regression and integration with live trusted adapters remain open.

## Gate E targeted state inspection fixture — 2026-10-09
- Added `v3-assist-target-state.mjs`, an isolated injected-callback path that validates the exact `ha_get_entity` response, exact linked `ha_get_device` identity and effective room, then calls only the injected `ha_get_state` reader for one `light.*` entity. Refuses mismatches, unknown/unavailable states and read exceptions; returns `authorization:false` even for observed state.
- Five focused tests passed, verifying read order, no read after room mismatch, no cross-entity state reuse and fail-closed behavior. This is **not** a live Assist endpoint or fully authenticated transport; the injected read callbacks must be independently limited to read-only operations before production use. No HA control call was made.
- Live production readiness and room-wide scope Gate B are still open. A full isolated test run after this change remains outstanding.

## Gate E real read-only target-chain acceptance — 2026-10-09
- Most recent full `npm test` after the target-state fixture: 103 isolated test files, 410 assertions passed, zero failed files. Log `/tmp/rs-gate-e-target-state-20261009.log`; final process exited before this review.
- Performed an explicitly allowlisted **read-only** HA-MCP run for `light.led_kukhnia` with expected HA area `kukhnia`: `ha_get_entity` → `ha_get_device` → `ha_get_state` (one call each). Result: `status=observed`, `state=off`, `areaId=kukhnia`, `authorization=false`.
- No HA service calls, physical changes, production bot wiring, Atom Echo integration or service restarts. This demonstrates only one known entity's targeted state read; voice-source authentication and general area scope still blocked.

## Gate E Assist ingress offline provenance/replay fixture — 2026-10-09
- Added `v3-assist-ingress-guard.mjs`, an **offline-only** voice event guard using reviewed satellite ID, trusted-caller `transportVerified`, one-time event ID, TTL and bounded replay memory. Rejects unknown satellites, spoofed speaker identity, replay, expired/future events and capacity exhaustion fail-closed. Five isolated tests passed.
- Critical limitation: `transportVerified` is a caller-supplied assertion in this fixture, **not cryptographic proof**. Only a future trusted local Assist transport adapter can supply it. The replay ledger is in-memory, resets on restart, and is not an authorization/confirmation store. These shortcomings bar production use and all voice actions until separately designed and accepted.
- No live Atom Echo ingress, no service restart, no Home Assistant actuation. Full `npm test` regression still required for this change.

## Gate E fixed-source trusted-channel seam — 2026-10-09
- Previous full regression after ingress guard: 104 isolated files, 415 assertions passed, zero failures.
- Added `v3-assist-trusted-channel.mjs`, an **offline-only seam** binding the reviewed satellite ID in constructor configuration rather than trusting IDs or authentication flags in the event payload. Rejects extra payload keys, replayed/stale IDs and unsupported identity claims. Four focused tests passed.
- Security boundary remains OPEN: callers capable of constructing this seam are assumed trusted; the seam **does not authenticate network requests, establish a cryptographic device identity, or survive process restarts for replay prevention**. Live Assist ingress, Home Assistant writes and physical device control are not enabled. Before live use, implement verified ingress transport, durable replay defense and separate owner acceptance.
