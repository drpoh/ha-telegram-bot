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

## Проверка нескольких кухонных light.* только чтением (DEV)

После безопасной синхронизации DEV оператор может вручную запустить из корня репозитория:

```sh
node scripts/manual/v3-kitchen-lights-readonly-preflight.mjs --readonly --operator-approved
```

Скрипт через существующий ограниченный `ha_get_state` reader читает **только семь** ранее выбранных сущностей кухни. Отдельно сообщает ON/OFF/unknown; недоступность не является OFF. Он не запускает Telegram poller и не посылает команды устройствам, не подтверждает физическое соответствие, полноту инвентаря комнаты или права на управление. Запускать только вручную; не подключать к CI, systemd или автоматическому расписанию. При неполном чтении код выхода 1 — ожидаемый диагностический результат.

## Полная HA-MCP инвентаризация световых сущностей — только ручное чтение

По запросу владельца (2026-10-13) список для диагностики **не ограничен 19 прежними кандидатами**. Чтение доступных HA `light.*` через существующий проверяющий модуль `summarizeDiscoveredLights` (включая скрытые сущности):

```sh
node scripts/manual/v3-all-lights-readonly-inventory.mjs --readonly --operator-approved
```

Скрипт делает **один** read-only вызов `ha_search`, домен строго `light`, лимит 500, без Telegram и без записи в HA/Git. В новых DEV-сборках также печатается `ALL_LIGHTS_REVIEW_BUCKETS` — простая группировка по **имени** `light.browser_mod_` и прочим ID с разбивкой UNKNOWN; это не достоверный тип устройства, не HA-registry и не разрешение на переключение. Печатает только entity ID, ON/OFF/UNKNOWN и ограниченный тип причины для неизвестных (`unavailable`, `unknown`, `other_state`), не выводит токены, имена людей, URLs или подробные MCP ошибки. `LIGHT_ENTITY light.foo unknown unavailable` может быть следствием физического отключения, но само по себе не доказывает причину. Виртуальные, дублированные и `browser_mod` сущности **не получают разрешений на управление**.

Если HA возвращает неполную выдачу, пагинацию, неверный формат, превышение 500 или ошибку — `ALL_LIGHTS_INVENTORY=unverified_or_incomplete` / `read_failed` и код 1. Такой результат **не** разрешает считать список полным. Повторное или bulk-чтение живого HA — только с согласия оператора; никогда не запускать это автоматически.
