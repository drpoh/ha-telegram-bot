# Stage deployment design — NOT INSTALLED

Use **systemd user services** and the Node.js built-in HTTP stage mock. Avoid Docker/Kubernetes, extra brokers or a second Telegram poller. This folder is documentation and templates only, not operator authority.

## Environment boundary
- Dev: canonical Git checkout and offline Node test runner only.
- Stage: separate non-production service identity, independent state dir, loopback 127.0.0.1 only, empty fixture registry by default; no HA MCP URL, HA token, real Telegram token or production SQLite file.
- Prod: existing pinned user service release 97343fa remains entirely separate and unchanged.

## Proposed stage promotion gate
1. Review fixed release commit and dependencies; provision an immutable stage artifact with permissions 0700, not a symlink to dev or prod checkout.
2. Create separate `EnvironmentFile` if ever needed with stage-only dummy/mock values; never copy production `.env`, owner policy or claims DB. No Telegram poller for the initial Stage deployment.
3. Provision systemd unit with `NoNewPrivileges=yes`, `ProtectHome` reviewed against artifact path, `UMask=0077`, `Restart=on-failure`, bind mock listener only to 127.0.0.1. A service must not auto-install itself.
4. Verify no HA network or Telegram credentials in stage process environment, no colliding port or state dir, no live writes, and run fault tests before considering production promotion.
5. On failure, stop stage service and preserve V2/V3/HA. Production promotion needs a new owner-reviewed authorization and separate rollback.

## No premature deployment
The current `src/ops/stage-mock-ha.mjs` exports a test fixture lifecycle and is NOT yet a standalone supervised daemon. This runbook does not claim it can be installed as a real stage service yet. Do not reuse the old `deploy/rs-home-ai-v3.service` template (marked outdated).

## Standalone entry now available (source only)
- `scripts/stage/mock-server.mjs`: explicit mock-only entry with Node HTTP, bound `127.0.0.1` and a stage-only optional `RS_STAGE_PORT` (0 selects ephemeral). Rejects known HA/MCP/Telegram/AI credential environment variable names. Empty synthetic registry; no HA clients or Telegram poller. Refuses invalid port, supports SIGTERM/SIGINT shutdown.
- `test/stage-process-entry.test.mjs` spawns and terminates it, checks HTTP `/health`, loopback address and refusal of a Telegram token variable. This is **not installed or running persistently**; environment key checks alone are not a substitute for process isolation or permissions review.
- Separate operator review still needed before writing or enabling a systemd service, even when the standalone entry exists.

## Stage 3 review checkpoint
- `deploy/stage/stage-unit.review.txt` is a non-installable checklist, **not** a `.service` file. No live systemd modifications.
- Process subprocess checks cover loopback health and graceful SIGTERM, HA/AI/Telegram environment rejection and invalid/privileged port rejection. No hidden production credentials were copied or read.
- Closure here means **source-only mock runtime ready for separately approved provisioning**, not a deployed Stage service. Real sandboxing and isolation remain explicit deployment acceptance gates.

## Installable format, uninstalled template (2026-10-11)
- `rs-home-ai-stage.service.template` is intentionally NOT a `.service` file and still has an unresolved `__STAGE_RELEASE_DIR__`; it cannot be used without a reviewed immutable Stage artifact path.
- Template supplies standard systemd networking/privilege directives; source-only tests validate expected restraints and lack of production references.
- Before installation, render into a temporary `rs-home-ai-stage.service`, run `systemd-analyze verify`, check runtime effective directives using `systemctl --user show`, and do a live loopback/negative egress test. The host user-service manager's actual support for IPAddressDeny/Allow has **not** been accepted by merely verifying the unit syntax.
- Installation, enabling and any persistent daemon remain outside this source-only milestone pending separate authorization and runtime isolation acceptance.
