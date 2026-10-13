# RS Home AI V3 — короткий handoff

> **Перед продолжением обязательно прочитайте [CURRENT-STATE](../CURRENT-STATE.md).** Там находится актуальный статус; здесь только точка продолжения работы. Старый [CHAT-HANDOFF](../CHAT-HANDOFF.md) сохранён как история.

## Цель

Практический русскоязычный домашний ассистент: Telegram, HA Assist, M5Stack/ESPHome; естественная речь, контекст и память; безопасное управление через HA-MCP. **Reuse First:** systemd, HA-MCP, Home Assistant Assist, ESPHome и готовые библиотеки вместо своей инфраструктуры.

## Где работать

- Репозиторий: `drpoh/ha-telegram-bot`.
- **Изменяемый исходный код:** ветка `feature/v3-home-agent`, Raspberry Pi `/home/drpoh/projects/rs-home-ai-dev`.
- **Не менять автоматически:** `/home/drpoh/ha-telegram-bot` (V2 runtime), `/home/drpoh/rs-home-ai-v3` (Gate D), immutable V3 production, HA Green, токены, systemd live unit.
- GitHub main — отдельная базовая ветка, **не** DEV-релиз. Для отдельного изменения работать в PR → CI → merge в DEV; Pi синхронизировать только через чистый worktree + `ff-only`.
- Docker необязателен; один Telegram poller; STAGE — offline/mock без доступа к HA writes.

## Подтверждение и ограничения

- Последние **подтверждённые пользователем** результаты Pi и реального HA-MCP см. в [CURRENT-STATE](../CURRENT-STATE.md), не переписывать здесь числа и состояния.
- Новые `light.*` только read-only до точной физической идентификации, отдельного допуска и release gate. `light.browser_mod*` исключены. `unavailable` ≠ `off`.
- Read-only `ExecStart` V3 проверен: **active** `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`; V2 system service **active**. Папка с `9dd5964` в имени не подтверждает Git SHA её содержимого; recovery/rollback и Telegram live-поведение не проверялись.
- Ручная отправка диагностики из Pi в private `drpoh/rs-home-ai-private-reports#1` уже сработала. GitHub connector ChatGPT не имеет чтения private repo; токены не выводить/не копировать.
- Никогда не смешивать source tests, Pi offline mock, live HA read, Telegram live write и физическую проверку: разные уровни доказательства.

## Непосредственный следующий шаг

1. По последнему HA Template владельца (2026-10-13) **27 `light.*`, 9 ON / 13 OFF / 5 UNKNOWN** после обновления; `integration_entities('switch_as_x')` подтвердило **7 конкретных световых ID**, включая `light.kukhnia_svet`. Данные снимка и остаток Gate B — в [CURRENT-STATE](../CURRENT-STATE.md) и [Gate B](../gates/GATE-B.md).
2. В DEV источник естественных вопросов о кухне обновлён с устаревших 7 до **4 присутствующих HA ID** (`light.kukhnia_led_niz_l1/l2`, `light.kukhnia_svet`, `light.led_kukhnia`). В отдельно выделенный `ha_get_state` reader добавлен только exact ID `light.kukhnia_led_niz_l2`. Исторические 19 review candidates и action policy не изменять.
3. Владелец уже выполнил live read-only kitchen CLI после PR #116: **complete, 4 сущности, 1 ON (`light.kukhnia_svet`), 3 OFF, 0 UNKNOWN**, physical identity unverified. Два несуществующих ID (`light.svet_kukhni`, `light.sonoff_1000d78a79`) удалены в HA; последний полный список 27 ID был до удаления. **Никакой новой Telegram production acceptance пока нет.**
4. Реальное физическое соответствие Switch as X `light.kukhnia_svet` **не подтверждено**. Из ранее неизвестных **`light.spalnia`** остаётся целью registry review; Browser Mod и `light.ves_svet_2` не используются как физические цели. Удалённые два ID не диагностировать как существующие. Новые физические действия — DENY до явного согласования.
5. PR #118 (GitHub DEV `cf3edd9`) объединил протестированный V3 read-only natural router; реальный Telegram pilot ещё не развернут. Следующее GitHub DEV изменение **использует тот же router в V2** для exact read-only вопросов внутри прежней `p-queue`, только в частном Telegram чате владельца; при остальных вопросах старый AI+Policy Engine. Не тянуть новый AI SDK и не создавать второй poller.
6. После exact PR CI / Pi DEV offline тестов никаких изменений pinned V2/V3 production без отдельного согласованного release, read-only проверки SHA активного `...release-9dd5964`, V2 ExecStart и rollback. GitHub API видит 66 веток: сначала защищать постоянные ref, затем выборочный cleanup merged head-веток, без автоудаления runtime refs.

## Правила завершения итерации

- Выделить проверенный факт, источник, дату и пределы доказательства.
- Держать актуальную сводку **только в CURRENT-STATE**; обновить TODO (открытые дела), здесь изменить лишь next step, подробный лог — в WORKLOG.
- Не переносить/удалять исторические файлы, пока статический поиск ссылок и CI не подтвердят безопасность.
