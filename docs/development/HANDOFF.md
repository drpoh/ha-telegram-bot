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
- Read-only `ExecStart` V3 проверен: **active** `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`; V2 system service **active**. Побайтовая проверка active `9dd5964` **437/437 tracked source+exec PASS**, owner Telegram `/status`, `/sauna` и 3 русских read-only запроса тоже PASS; **реальный rollback и token-level polling uniqueness не проверены**.
- Ручная отправка диагностики из Pi в private `drpoh/rs-home-ai-private-reports#1` уже сработала. GitHub connector ChatGPT не имеет чтения private repo; токены не выводить/не копировать.
- Никогда не смешивать source tests, Pi offline mock, live HA read, Telegram live write и физическую проверку: разные уровни доказательства.

## Непосредственный следующий шаг

1. **Owner live Telegram acceptance, 2026-10-13:** pinned V3 `9dd5964`, уже работающий private `RSHomeAI_v3_bot`. `/status` сообщил доступный защищённый журнал; `/confirm` без ожидающего запроса ответил «Нет действующего запроса для подтверждения»; `/sauna` → **88.625 °C**, готова, порог 85 °C. Следом **три естественных вопроса** Telegram: «Сколько градусов в сауне?» → **89 °C / готова**, «Где горит свет?» → **0 ON/4 OFF/0 UNKNOWN среди 4 выбранных ID**, «Горит ли свет в тамбуре?» → **off**. Это живая read-only цепочка Telegram → pinned V3 → HA-MCP, не полный свет в доме.
2. **Предыдущие Pi gates:** DEV `npm test` 391 syntax files, 212 test files/785 assertions/0 failures, прогресс в одной строке; pinned `9dd5964` source 437/437 Git bytes + executable bits PASS; local V2/V3 active & known entrypoints distinct, 1+1 (нет локальных дубликатов). Три release директории (`9dd5964`, `c6a9812`, `97343fa`) прошли статический `npm ls --offline`; legacy `97343fa` 3/3 выбранных Git blobs совпадают. `RELEASE_COMMIT` отсутствует лишь у исторической сборки.
3. **Следующий практический Gate D шаг:** существующий playbook Matt Pocock/ECC адаптирован в [ENGINEERING-PRACTICES](ENGINEERING-PRACTICES.md) без установки агентов. Добавлена offline-отрицательная проверка `test/v3-kitchen-release-readonly-boundary.test.mjs` для `Что со светом на кухне?`: ровно 4 HA entity, unknown не OFF, mixed command/question не приводит к action, `createNewLightDispatch({releaseEnabled:false})` не вызывает MCP даже при фиктивном approval, Telegram владелец проверяется раньше маршрута и маршрутизатор раньше physical fallback. Всё это **DEV-only CI evidence**. Сравнение pinned `9dd5964` vs DEV `39b4fce`: 118 коммитов / 123 файла. Не переносить DEV целиком, сначала безопасно выделить кухонный read-only срез без изменения `/confirm` и journal, затем отдельный reviewed release/rollback и owner approval.
4. **Не закрывать Gate D целиком:** functional rollback не испытывался, token-level Telegram poller uniqueness на иных хостах не доказана, installed dependency bytes не аттестованы. Gate B по физической идентичности `light.kukhnia_svet` всё ещё OPEN; HA Green, V2/V3 production и systemd не изменять в ходе DEV документирования.

## Правила завершения итерации

- Выделить проверенный факт, источник, дату и пределы доказательства.
- Держать актуальную сводку **только в CURRENT-STATE**; обновить TODO (открытые дела), здесь изменить лишь next step, подробный лог — в WORKLOG.
- Не переносить/удалять исторические файлы, пока статический поиск ссылок и CI не подтвердят безопасность.
