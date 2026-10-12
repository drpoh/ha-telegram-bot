# Manual integration tests — real device effects

These scripts invoke the live Home Assistant agent and may issue `ha_call_service` to switch actual lights. They also attempt restoration, which can fail if Home Assistant or connectivity fails.

- `smoke-living-room-auto-safe.mjs`
- `smoke-living-room-isolation.mjs`

**Do not run as part of `npm test`, CI, or unattended background jobs.** Run only after explicitly confirming the affected devices, a backup/restore plan, safe conditions, and an authorized operator's approval.

Both scripts now enforce two independent opt-in conditions: an explicit `HA_ALLOW_LIVE_SMOKE` environment value and `--live-ha-approved` CLI flag. These checks are necessary but not sufficient to guarantee safe actuation. These files were preserved from previously unfinished work, not validated for safe actuation in this cleanup.
