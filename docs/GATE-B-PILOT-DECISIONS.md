# Gate B owner decisions — room pilot (2026-10-08)

Owner selected: local offline policy approval on Raspberry Pi; Telegram single-command confirmations; **one room**, not whole house; separate v3 process alongside existing v2; request a new explicit owner approval before any real HA action.

## Non-negotiable deployment isolation
- Existing v2 Telegram bot keeps its current token, polling process, MCP connection and behavior. Do not restart or modify it.
- v3 must use a **distinct Telegram bot token and identity** (never two pollers using one bot token). No token or secrets in Git.
- v3 pilot must have its own process, config directory, state/ledger storage, monitoring and stop mechanism. HA Green remains independent; no HA automations, groups, entity IDs or area assignments changed.
- Begin with read-only/deny-all. All HA writers absent or disabled until an independent live-action consent after reviewed test results.

## Approval design
- Authoritative operator review is LOCAL (not a Telegram self-grant). Protect exact policy SHA-256, fresh registry fingerprint, selected room/targets and monotonic revision independently; Telegram handles only short-lived, actor-bound **per-action confirmation**, never approval of new policy scope.
- Never accept model-generated file paths, IDs, approval flags or digests. Recheck policy/registry and approval at execution. Missing, changed, expired, untrusted or unreviewed records deny.
- Current modules are offline candidates: no authenticated owner approval store or trusted HA registry ingestion has been deployed.

## Waiting for owner room selection
- Owner selected one room but **has not specified which room**. Do not pick it from historical data.
- After room selection, refresh complete registry evidence; review lights **and lighting-like switches**, physical function, disabled/unavailable state, room identity, plus exact per-action permissions. Group `light.ves_svet` remains excluded from pilot.
- Current release decision: **Gate B OPEN; production writes DENIED**. Voice/Atom Echo optional after secured Telegram pilot.
