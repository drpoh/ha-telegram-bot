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

1. **Pi owner 2026-10-13:** DEV offline `npm test` 391 syntax files/212 isolated test files/785 assertions/0 failures, компактный однострочный прогресс принят. Gate D pinned source `9dd5964`: **437/437** Git blob bytes + executable bits PASS. Local running V2/V3 процессам соответствуют ожидаемые entrypoint (V2 PID 927, V3 PID 3713; observed 1+1, no duplicates). Live HA-MCP natural questions 4/4 complete без Telegram/HA writes.
2. **Теперь все три релизные папки прошли статическую проверку `npm ls --offline`:** действующий `9dd5964`, основной rollback `c6a9812`, legacy `97343fa`. Для `97343fa` отдельно **3/3 Git blob hashes PASS** (package.json, package-lock.json, src/pilot/telegram-readonly.mjs). Старый `RELEASE_COMMIT` отсутствует, это не доказательство неисправности и не повод писать marker. Только выбранные файлы прошли Git comparison, не весь tree.
3. **Следующий практический шаг:** пользователь отправляет **только** `/status` и `/sauna` **в уже работающий приватный чат V3 Telegram-бота** и сообщает два ответа; это read-only команды pinned production `9dd5964`. Не запускать новую Telegram polling-сессию, не делать restart, не использовать `/confirm` и не переключать HA. После проверки отдельно планировать release/promote с owner approval.
4. **Gate D остаётся OPEN:** `PASS_STATIC` не доказывает node_modules integrity в памяти, фактический rollback или token-level Telegram polling uniqueness; Gate B физической идентичности `light.kukhnia_svet` также OPEN.

## Правила завершения итерации

- Выделить проверенный факт, источник, дату и пределы доказательства.
- Держать актуальную сводку **только в CURRENT-STATE**; обновить TODO (открытые дела), здесь изменить лишь next step, подробный лог — в WORKLOG.
- Не переносить/удалять исторические файлы, пока статический поиск ссылок и CI не подтвердят безопасность.
