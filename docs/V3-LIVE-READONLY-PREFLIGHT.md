# Live read-only HA-MCP preflight (operator initiated only)

Purpose: verify **existing** narrow V3 read-only access to sauna temperature/ready, the selected seven lights, and tamboor. The script uses the existing pilot MCP client, only `ha_get_state` with fixed IDs. It does not start Telegram, change HA, write settings, or promote a release.

Only run directly on authorized Pi, **outside** the user-systemd DEV sandbox that intentionally hides production MCP endpoint credentials:

```bash
cd ~/projects/rs-home-ai-dev
node scripts/manual/v3-live-readonly-preflight.mjs
```

The script prints bounded summary texts and `READONLY_PREFLIGHT=PASS` only if all entities resolve; otherwise `PARTIAL_OR_FAILED`, without printing private config. No raw MCP payloads, tokens, or URLs are logged. Exit 1 means acceptance incomplete, not a reason to restart production. Use a terminal-level timeout (e.g. `timeout 150s node ...`) if network issues are suspected.

**Acceptance rules:** all statuses `complete`; actual entity IDs match fixed scope, no unexpected unknown states; sauna readiness threshold 85 °C; no `ha_call_service`. This is read-only behavior evidence only; separate operator approval is mandatory before any release. `/lights` is limited to seven selected targets, not all house lights. `c6a9812` remains active unless separately changed.
