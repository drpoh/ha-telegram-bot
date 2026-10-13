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

После снимка HA Template 2026-10-13 скрипт через существующий ограниченный `ha_get_state` reader читает **только четыре присутствовавшие сущности кухни**: `light.kukhnia_led_niz_l1`, `light.kukhnia_led_niz_l2`, `light.kukhnia_svet`, `light.led_kukhnia`. Исторический список 19 кандидатов сохранён для старых свидетельств; удалённые ранее недоступные обёртки больше не включены в ответы о кухне. `light.kukhnia_svet` подтверждён как Switch as X, но его физический контур не идентифицирован. Отдельно сообщает ON/OFF/unknown; недоступность не является OFF. Он не запускает Telegram poller и не посылает команды устройствам, не подтверждает физическое соответствие, полноту инвентаря комнаты или права на управление. Запускать только вручную; не подключать к CI, systemd или автоматическому расписанию. При неполном чтении код выхода 1 — ожидаемый диагностический результат.

## Полная HA-MCP инвентаризация световых сущностей — только ручное чтение

По запросу владельца (2026-10-13) список для диагностики **не ограничен 19 прежними кандидатами**. Чтение доступных HA `light.*` через существующий проверяющий модуль `summarizeDiscoveredLights` (включая скрытые сущности):

```sh
node scripts/manual/v3-all-lights-readonly-inventory.mjs --readonly --operator-approved
```

Скрипт делает **один** read-only вызов `ha_search`, домен строго `light`, лимит 500, без Telegram и без записи в HA/Git. В новых DEV-сборках также печатается `ALL_LIGHTS_REVIEW_BUCKETS` — простая группировка по **имени** `light.browser_mod_` и прочим ID с разбивкой UNKNOWN; это не достоверный тип устройства, не HA-registry и не разрешение на переключение. Печатает только entity ID, ON/OFF/UNKNOWN и ограниченный тип причины для неизвестных (`unavailable`, `unknown`, `other_state`), не выводит токены, имена людей, URLs или подробные MCP ошибки. `LIGHT_ENTITY light.foo unknown unavailable` может быть следствием физического отключения, но само по себе не доказывает причину. Виртуальные, дублированные и `browser_mod` сущности **не получают разрешений на управление**.

Если HA возвращает неполную выдачу, пагинацию, неверный формат, превышение 500 или ошибку — `ALL_LIGHTS_INVENTORY=unverified_or_incomplete` / `read_failed` и код 1. Такой результат **не** разрешает считать список полным. Повторное или bulk-чтение живого HA — только с согласия оператора; никогда не запускать это автоматически.

## Gate D — живые Node-процессы V2/V3 (только чтение)

После CI и безопасной синхронизации DEV оператор вручную запускает:

```sh
node scripts/manual/v3-runtime-readonly-preflight.mjs --readonly --operator-approved
```

Проверяет только локальные systemd `MainPID` и `/proc` с точными pinned V2/V3 Node entrypoints, не печатает argv или приватную среду, не читает HA и не запускает Telegram. `PASS` относится только к известным локальным entrypoint и их привязке к systemd — **не** к единственности Telegram poller по токену или end-to-end. Нет прав изменять service/HA/release.

## Gate D — побайтовая сверка исходников pinned release (только чтение)

После CI и безопасной `ff-only` синхронизации DEV:

```sh
node scripts/manual/v3-release-content-readonly.mjs --readonly --operator-approved
```

Команда использует `RELEASE_COMMIT` существующего релиза, сравнивает Git blob SHA-1 каждого tracked-файла с его байтами на диске и отдельно проверяет исполняемые биты Git. Не использует `tar --compare`, который может вернуть ложное расхождение по uid/gid/mtime/non-exec permissions. Не читает `node_modules` или частные untracked конфигурации, не запускает Telegram/HA и не изменяет файлы/systemd. `PASS` относится **только** к tracked source + exec mode, не к runtime процессу, зависимостям, возможности rollback или single poller. `UNVERIFIED` требует ручного review, ничего не исправлять автоматически.

## Естественные Telegram-вопросы — реальный HA-MCP, без запуска Telegram и AI

**После проверки GitHub CI и безопасного `ff-only` обновления DEV** вручную запустить на Pi из `/home/drpoh/projects/rs-home-ai-dev`:

```sh
timeout 150s node scripts/manual/v3-telegram-questions-readonly-preflight.mjs --readonly --operator-approved
```

Скрипт проверит четыре **фиксированных** русских вопроса: «Сколько градусов в сауне?», «Горит ли свет в тамбуре?», «Где горит свет?», «Что со светом на кухне?». Он вызывает ту же детерминированную функцию `routeV3ReadonlyQuestion`, которую использует V3 Telegram, но **не запускает Telegraf, вторую подписку/poller, Gemini или другие LLM**. Использует только ограниченные `ha_get_state` readers и напечатает четыре `TELEGRAM_QUESTION_*_STATUS` / `REPLY`.

Ожидаемое `TELEGRAM_QUESTIONS_READONLY=PASS` возможно только если все четыре ответа `complete`; при `partial` или `unavailable` вернёт код 1, не подменяя неизвестные состояния выключенными. Внешний `timeout` возвращает 124 при зависании. В обоих случаях **HA не переключается**. Это live HA-MCP **приёмка текста**, а не Telegram API/end-to-end и не разрешение release/новых физических действий. Не запускать в CI, по расписанию или из production checkout.
