# RS Home AI V3 — Stage 2: environment isolation and expansion gates

Status: **offline mock STAGE passed on owner Pi 2026-10-12, no physical stage/prod promotion authorized**. Current authoritative reconciliation: [V3 history/stage audit](V3-HISTORY-STAGE-AUDIT-2026-10-12.md).

## Verified baseline
- First V3 live, owner-confirmed one-light MVP completed on `light.tambur_svet_l1`: both on and off independently verified through HA-MCP, release 97343fa. No broad HA authority was approved.
- V2 bot and Home Assistant must remain independent of V3. Preserve existing V3 pinned user-service artifact, trusted policy, private credentials, SQLite claims and rollback.

## Environment contract
- `dev`: canonical `/home/drpoh/projects/rs-home-ai-dev` checkout for code, offline fixtures and CI. Never bind development tests to production HA MCP or Telegram credentials.
- `stage`: disposable local loopback `127.0.0.1` mock (`src/ops/stage-mock-ha.mjs`), no HA-MCP client/HA credentials or Telegram poller. Stage GET `/health` and `/registry` are mock-only; other routes and write HTTP methods return 403. Injected registry drop simulates a real read failure without granting authority.
- `prod`: remains existing pinned V3 service release 97343fa; exactly one Zigbee light and Telegram private `/confirm` with durable single-use claim. No automatic promotion from stage, no second poller on the same Telegram token.
- Manifests `config/environments/isolation.example.json` are **non-secret planning examples** only. `validateEnvironmentIsolation` enforces disjoint service IDs, credential refs, endpoint refs, ports and non-nested storage; it does not create resources.

## Exit gates for stage infrastructure
1. Offline tests enforce loopback-only binding, deny writes and real-HA read access, verify injected read failure, and leave no running mock process.
2. Add distinct stage-only bot identity, storage, runtime service and endpoints ONLY after separately reviewed owner authorization; never share production token, private DB or MCP credential.
3. Add deterministic multi-entity resolver and explicit registry-backed scope proof in `dev`, including ambiguous names, stale data, wrong-area, unavailable device, retry/replay and concurrent messages. All new HA capabilities default deny.
4. Independent Zigbee coordinator failure audit. Reproduce simulated delivery failures and blocked writes without toggling live household devices.
5. Promote a separately reviewed immutable artifact only after full regression, security review, rollback preflight and owner approval. Home Assistant remains functional if V3 is stopped.

## 2026-10-11 Stage 2 checkpoint
- `test/stage-mock-runtime-isolation.test.mjs` added. HTTP tests cover GET fixture identity, empty unauthorized registry, POST/service and API denial, invalid nonloopback binding and injected registry transport drop; combined focused environment suite 12/12 PASS.
- This checkpoint does **not** imply actual stage deployment, HA integration or broader physical control.
- Full `npm test` on Pi: 146 isolated files, 553 assertions, 0 failed, exit 0. Local log `/tmp/rs-v3-stage2-full-20261011.log`.

## Offline deterministic target selection (2026-10-11)
- `src/decision/v3-stage-target-resolution.mjs` validates a complete, fresh, non-paginated trusted light inventory before returning only `{status:'candidate', authorized:false}`; it cannot call HA or authorize writes.
- It demands exact name or entity ID, exact area, a unique match and an available/enabled target. Duplicates, stale/partial snapshots, cross-area names, fuzzy strings and ambiguous identical names fail closed.
- `test/v3-stage-target-resolution.test.mjs`: seven independent tests passed. A candidate still requires a separately trusted source/identity, reviewed policy, real HA state and user confirmation before ever reaching a production dispatcher. Production remains pinned at 97343fa.

## Stage mock registry integration — 2026-10-11
- Extended disposable `stage-mock-ha` `/registry` with a complete, mock-only snapshot and a fixture-only entity collection; still no HA client or service writer. Existing mock health/read and forbidden HTTP methods remain protected.
- `src/ops/stage-target-read.mjs` enforces exact loopback URL `http://127.0.0.1:<port>/`, JSON response, `environment=stage`, `mode=mock`, `authorization=false`, no redirects, 1.5 s read timeout, then returns only a non-authorizing candidate through `resolveStageLight`.
- Fixed freshness sampling to use time at receipt instead of before HTTP request; otherwise a newly generated snapshot was falsely rejected as 'from the future'. Stale source timestamps are still denied by `resolveStageLight`.
- Integration tests exercise duplicate names, exact area selection, unavailable devices, invalid remote endpoint, simulated connection drop and forged authorization. Focused test suite `node --test test/v3-stage-mock-target-read.test.mjs test/stage-mock-runtime-isolation.test.mjs test/v3-stage-target-resolution.test.mjs`: 14/14 pass, zero failures. No production writes or stage service deployment.

## Stage snapshot revalidation and concurrency (2026-10-11)
- Pure `v3-stage-target-revalidation.mjs` requires two independently complete/fresh registry snapshots, reselects exact entity in same area, compares immutable device ID and still returns `authorized:false`. Rejects target replacement, disappearance, stale data, newly unavailable/disabled target and ambiguous original request. This is an offline gate only, not connected to production execution.
- Existing intent ledger stress test: 20 concurrent attempts on the same token consume at most one; another actor cannot claim, and a newer intent invalidates an older one.
- Branches verified read-only with `git ls-remote --heads`: main, refactor/v2, feature/v3-home-agent and review/gate-e-target-snapshot-hardening-20261009. Development HEAD is tracking origin. Live V2 checkout 32b5299 and retained V3 checkout a7fc446 are intentionally older; active V3 systemd uses immutable release 97343fa. No runtime checkout should be bulk-updated to match development.

## Stage simulated confirmation — 2026-10-11
- `src/ops/stage-consent-simulation.mjs` uses the already reviewed 60-second one-shot intent ledger and a second exact entity/device/area check at confirmation. It never imports a real MCP/HA client, receives no production credentials and returns `authorized:false, actualWrite:false` even when successful.
- Offline tests reject cross-actor claims, expired/replayed tokens, device replacement, disappearance, unavailable targets and stale registry; concurrent confirmation has at most one successful *simulation*. No actuator was touched.
- The project navigation source of truth is now `docs/PROJECT-MAP.md`. Retained V2 and historic V3 checkouts, active pinned release and canonical dev source are explicitly differentiated; no moving or renaming of live files was attempted.

## Stage 2 closeout gate (2026-10-11)
- `stage-batch-http-simulation` tests added for expired intent, forged/nonmatching actor and stale clock/failure conditions; combined HTTP test 6/6 PASS. Earlier linked mock batch tests and pure identity/replay gates remain in repository.
- Next phase uses existing Node.js HTTP server and systemd user service, without new orchestrator. Deployment design `deploy/stage/README.md` is documentation only; stage process, credentials and systemd unit not installed. Owner authorization is required before installing any persistent stage service.

## 2026-10-12 — Current stage acceptance priorities
- Owner-confirmed DEV -> exact-SHA GitHub CI -> immutable candidate b1122bd at 07:10 UTC, status=passed, stage=complete, candidate RELEASE_COMMIT matched full SHA.
- Active V3 production remains pinned to c6a9812 (older 97343fa references above are historical). STAGE is still mock-only; no independent installed stage environment and no production switch.
- NEXT: reuse existing loopback mock and Node test facilities for disposable offline candidate smoke: verify SHA, safe start/stop and error cleanup, health/read-only behavior, forbidden writes, no real HA or prod credentials, deterministic bounded results. Verify on Pi ARMv7 before proposing promotion.
- New stage service credentials or actual production promotion require distinct explicit owner approval, rollback preflight and preservation of HA independence, active V2 and V3 services. Candidate creation alone grants no authorization.

## Automated candidate STAGE smoke (2026-10-12 source change)
- Minimal reuse-first stage verification lives in scripts/automation/stage-smoke.mjs and executes AFTER immutable candidate packaging. The 30-second timeout runs only the candidate's existing stage-mock-ha module bound to 127.0.0.1 ephemeral port.
- Checks exact candidate RELEASE_COMMIT SHA, mock health/registry with authorization:false, and HTTP 403 on write/state endpoints. Status remains stage_smoke on failure; last-stage.log stored privately in DEV automation state. No new systemd units, credentials, Telegram poller, HA-MCP or production promotion.
- GitHub CI proof and Pi ARMv7 smoke must be independently observed before calling this stage accepted. This test is an offline mock contract, NOT verification of real HA behavior, physical entity policy or release approval.
