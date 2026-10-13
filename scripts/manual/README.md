# Manual integration tests — real device effects

> **Verified 2026-10-13:** The Pi operator ran the existing `v3-live-readonly-preflight.mjs` (PASS) and `v3-new-lights-readonly-preflight.mjs --readonly --operator-approved` (19 candidates, 9 responsive, 10 unavailable). Both are read-only; the second returns a nonzero exit code for a partial survey. No new live actuation authorized. See [current state](../../docs/CURRENT-STATE.md).


These scripts invoke the live Home Assistant agent and may issue `ha_call_service` to switch actual lights. They also attempt restoration, which can fail if Home Assistant or connectivity fails.

- `smoke-living-room-auto-safe.mjs`
- `smoke-living-room-isolation.mjs`

**Do not run as part of `npm test`, CI, or unattended background jobs.** Run only after explicitly confirming the affected devices, a backup/restore plan, safe conditions, and an authorized operator's approval.

Both scripts now enforce two independent opt-in conditions: an explicit `HA_ALLOW_LIVE_SMOKE` environment value and `--live-ha-approved` CLI flag. These checks are necessary but not sufficient to guarantee safe actuation. These files were preserved from previously unfinished work, not validated for safe actuation in this cleanup.

## Точечная проверка нового света — только чтение

После отдельной безопасной синхронизации DEV на Pi оператор может вручную вызвать:

```sh
node scripts/manual/v3-single-light-readonly-preflight.mjs --readonly --operator-approved light.kukhnia_svet
```

Команда делает **один** запрос HA-MCP `ha_get_state` только для ID из заранее зафиксированного списка 19 кандидатов. Не запускает Telegram poller, не меняет свет и не доказывает физическую идентичность, device/area. `unknown`/`unavailable` дают неполный результат и не равны OFF. Не запускать из CI или по расписанию.
