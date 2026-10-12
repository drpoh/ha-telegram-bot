# Gate B — scoped kitchen live pilot result (2026-10-08)

## Verified
- Owner approved physical on/off testing of `light.led_kukhnia` with Telegram per-action confirmation.
- V3 Telegram bot was independently launched on Raspberry Pi; v2 systemd service remains active.
- Owner reported light physically turned on after command and `/confirm`; independent read-only HA-MCP state check returned `on`.
- Owner reported light physically turned off after command and `/confirm`; independent read-only HA-MCP state check returned `off`.
- Policy is outside Git with pinned digest and guarded current HA registry check; only one MQTT light in kitchen is authorized.
- Isolated suite before live activation: 92 files, 360 assertions, zero failed files.

## Scope and remaining hardening
This closes the **single-device live Gate B pilot**, not authorization for all kitchen lights or whole-home control. No general voice interface or autonomous AI actions have been enabled.
- Production lifecycle hardening: managed process/supervision, crash recovery, logging, and operator rollback are a separate follow-up.
- The current MCP service retains its server-side privileges: local scope enforcement is a client-side guard, not a dedicated least-privilege HA token.
- Maintain explicit Telegram confirmation, deny-by-default on policy/registry failure, and do not alter the v2 runtime.
- Preserve current HA entity IDs and avoid changing Home Assistant configuration for this pilot.
