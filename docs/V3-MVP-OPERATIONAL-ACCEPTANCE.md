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
