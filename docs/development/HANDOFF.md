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

1. **Владелец подтвердил Pi 2026-10-13:** `npm test` **391 файлов синтаксиса / 212 тестовых файлов / 785 проверок / 0 ошибок**. Короткие индикаторы `S [########]` и `T [########]` работают в Termux в одной строке на каждый этап.
2. **Gate D local runtime read-only PASS:** V2 PID `927`, V3 PID `3713`, оба действующих Node entrypoint совпадают, PID различаются; known entrypoint counts `V2=1, V3=1, unreadable=0`, duplicates=false. Token-level Telegram polling uniqueness **не доказана**.
3. Ранее на Pi **Gate D source PASS** — 437/437 Git blobs + executable bits совпали с закреплённым V3 `9dd5964`. Оба rollback каталога присутствуют, но восстановление не выполнялось. Реальные natural-language HA-MCP чтения 4/4 complete; это не Telegram end-to-end.
4. **Следующий один безопасный шаг:** использовать встроенный `npm ls --offline --omit=dev --all` и структурный file check по [Gate D](../gates/GATE-D.md) для активного V3 и старых rollback каталогов. Проверять только наличие/согласованность установленных пакетов, не запускать Telegram/HA и не копировать секреты. Затем сформировать отдельно согласуемый план Telegram end-to-end с сохранением текущих V2 и V3.
5. **Gate B всё ещё OPEN:** `light.kukhnia_svet` Switch as X, физический контур не подтверждён; `light.svet_kukhni` и `light.sonoff_1000d78a79` удалены владельцем. Права на новые физические переключения не расширять.

## Правила завершения итерации

- Выделить проверенный факт, источник, дату и пределы доказательства.
- Держать актуальную сводку **только в CURRENT-STATE**; обновить TODO (открытые дела), здесь изменить лишь next step, подробный лог — в WORKLOG.
- Не переносить/удалять исторические файлы, пока статический поиск ссылок и CI не подтвердят безопасность.
