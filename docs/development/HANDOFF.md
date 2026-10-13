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
3. После PR CI и безопасной DEV `ff-only` синхронизации на Pi вручную выполнить `npm test` и `node scripts/manual/v3-kitchen-lights-readonly-preflight.mjs --readonly --operator-approved`; не запускать второй Telegram poller или DEV как production.
4. Реальное физическое соответствие Switch as X `light.kukhnia_svet` **не подтверждено**. Три UNKNOWN `light.sonoff_1000d78a79`, `light.spalnia`, `light.svet_kukhni` требуют отдельного HA registry review. Новые физические действия — DENY до явного согласования.
5. Из Gate D остаётся read-only проверка SHA активного `...release-9dd5964` и V2 ExecStart; нельзя автоматически переключать pinned production. После milestone — обновить только CURRENT-STATE/TODO/HANDOFF; подробности — в WORKLOG.

## Правила завершения итерации

- Выделить проверенный факт, источник, дату и пределы доказательства.
- Держать актуальную сводку **только в CURRENT-STATE**; обновить TODO (открытые дела), здесь изменить лишь next step, подробный лог — в WORKLOG.
- Не переносить/удалять исторические файлы, пока статический поиск ссылок и CI не подтвердят безопасность.
