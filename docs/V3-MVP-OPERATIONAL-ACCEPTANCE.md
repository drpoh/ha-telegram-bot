# V3 MVP — operational acceptance evidence (2026-10-10)

Status: **BLOCKED — no deployment or live HA action performed**.
Scope: a single, operator-approved kitchen light `light.led_kukhnia`, Telegram V3 only.
Evidence collected through read-only metadata inspection on the Raspberry Pi; no secrets read, no device commands.

## Verified Pi observations

- Canonical development checkout: `feature/v3-home-agent` at `96745bb`, clean at inspection.
- Dedicated live V3 checkout: `/home/drpoh/rs-home-ai-v3`, at `a7fc446`; this is NOT the current tested dev commit.
- Separate live v2 checkout: `/home/drpoh/ha-telegram-bot`, at `32b5299`.
- v2 system service: active (systemctl is-active).
- V3 user service: `ActiveState=active`, `SubState=running`, MainPID 971 at inspection with the correct user DBus runtime scope. These observations are *not* proof of connectivity or healthy HA control.
- Operator policy file exists: `~/.config/rs-home-ai-v3/kitchen-operator-policy.json`, permissions 0600, owner drpoh.
- **Policy file SHA256 equals pinned hash** `32843f881dbca7a24f205ac6a678b67463486033c581d859ac764b0c54c1091f` (hash comparison only). This proves bytes match dev expectation, not that policy grants are appropriate or that HA origin/entity are trusted.
- **BLOCKER:** `/home/drpoh/.local/state/rs-home-ai-v3/claims.db` does NOT exist. The new dev pilot deliberately refuses writes when this pre-provisioned independent ledger is missing.
- No real HA registry queried here. Current light identity, HA transport source, TLS and permission grants remain **unverified**.

## Minimal operational path to release

1. Operator reviews and approves exact `light.led_kukhnia`, permitted `light.turn_on` / `light.turn_off`, user/chat, source endpoint, restricted credential and allowed test window. If this cannot be authenticated, **do not proceed**.
2. Prove source and complete exact entity+device+area identity with a read-only authenticated Home Assistant session; capture only sanitized evidence, never secret material.
3. In an explicitly approved deployment procedure, provision separate 0700 state directory and 0600 SQLite claims DB using the established `createGateCExecutionJournal` schema. It must survive version rollback, and must NOT be reset/overwritten. Preserve previous service release. Run `inspectV3PilotStorage` before pilot promotion.
4. Review `feature/v3-home-agent` delta against `a7fc446` and operator-sign the exact commit for promotion, with immutable release SHA and explicit rollback instructions. **Do not pull in live checkout as a shortcut.**
5. After specific approval, run bounded one-device Telegram `/confirm` acceptance; verify final state through authenticated HA readback and ensure uncertain outcomes never automatically retry. Leave v2 running and HA Green independently operable.
6. Approve release only after real acceptance. Until then both Gate B live trust and Gate C/D operational acceptance remain OPEN.

## Go/no-go

NO-GO at 2026-10-10 inspection: independent journal missing; reviewed current HA identity, real test authorization and operational deployment approval absent. No live service or device modified during evidence collection.

## 2026-10-10 — Operator-requested completion: durable journal provisioned
- User explicitly requested closure of all MVP blocks. On Pi, invoked the existing operator-only `provisionV3PilotJournal` against `/home/drpoh/.local/state/rs-home-ai-v3/claims.db`, outside `/home/drpoh/rs-home-ai-v3` rollback checkout. Result `created`; immediately checked `inspectV3PilotStorage` => `ready:true`, `reason:storage_preflight_passed`; file owner `drpoh`, mode 0600. No existing ledger was overwritten or reset. **Storage block closed.**
- Still-unmet release blockers: authenticated HA-MCP network/credential policy and verified webhook client migration (the current direct HTTP 0.0.0.0:9584 is not a trusted release transport), audited production checkout promotion (live a7fc446 vs dev 1528e86), real Telegram `/confirm` acceptance/readback and release signoff. Live v2 `32b5299` and V3 remained active; no uncontrolled physical action performed.
- The user request to finish does not establish that an in-use Home Assistant service can safely be rebound or that broad HA-MCP write-tool credentials are least-privileged. Do not silently change `ha_mcp_tools.bind_host`; use staged webhook validation first.

## 2026-10-10 — Current production promotion review after LAN option
- Dev HEAD 490b31d and live dedicated pilot HEAD a7fc446 were compared: **67 files changed, 2,988 insertions, 27 deletions**. Live v2 and V3 services both active; external claims.db remains 0600. This is not a low-risk hotfix; directly promoting the entire dev branch without isolated stage and operator review is NOT an acceptable shortcut.
- Focused endpoint tests 4/4 and node syntax pass. `lanMvp` is opt-in and its policy intentionally rejects execution until real network restriction and credential review are provided; no acceptance flags are set. Do not fake the flags to satisfy the constructor.
- Next safe release step: create an isolated, non-running V3 release candidate from the reviewed dev commit with offline Telegram + MCP fixtures and rollback manifest; review the delta, then separately authorize the actual live cutover and one-light confirmed on/off acceptance. Existing MCP working for other tools is not proof the stricter V3 release gates pass.

## 2026-10-10 — Final requested live rollout precheck
- User explicitly requested three actions: verify existing HA-MCP scope, switch live V3 with rollback, and real Telegram `/confirm` acceptance. Reverified source via HA config entry: `ha_mcp_tools` has `bind_host=0.0.0.0`, TCP 9584, webhook auth `ha_auth`. Pi is directly attached to HA network at 192.168.31.94; V3 MCP URL mode 0600 and operator policy SHA remains `32843f881dbca7a24f205ac6a678b67463486033c581d859ac764b0c54c1091f`.
- Crucial automated preflight: `inspectKitchenMcpEndpoint(activeUrl).allowed=false`, while `inspectKitchenLanEndpoint(activeUrl)` denies `lan_acceptance_missing`. Thus **tested candidate 72616d0 cannot dispatch via current LAN URL without falsifying network/credential approval**, and live promotion now would give the appearance of completion while leaving execution denied.
- MCP currently exposes broad write tools, not separately verified per-device HA grants. Client's exact single-light allowlist and original Telegram actor protection are necessary but cannot be substituted for independently authenticated MCP source/access control.
- The real Telegram request and `/confirm` must originate from owner chat. Sending a synthetic Telegram event to silently authorize a physical command is prohibited. No user-originated confirmed action exists in this session.
- Live V3 remained `a7fc446`, user service active PID 971, v2 active. Candidate-v2 is protected at `/home/drpoh/projects/rs-home-ai-v3-candidate-v2`, pinned `72616d07f1a2850bc977a16d301034aafe5671c2`, 144/550 full regression PASS. Rollback is simply to retain/restore live service WorkingDirectory `/home/drpoh/rs-home-ai-v3`; do not delete or overwrite outside checkout claims.db.
- **Decision: no production cutover and no light actuation.** Require verified MCP permission/transport release and a genuine owner Telegram `/confirm` before claiming acceptance. No false GO.
