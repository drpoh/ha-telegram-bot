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

1. GitHub DEV PR #104–#108 объединены. Владелец подтвердил на Pi `5380a75`, **202/737/0** в `npm test`, `DOCS_CHECK=PASS files=15 links=131`. Новый `/lightcheck` и CLI source/offline проверены, в production не развёрнуты; live HA-MCP read ещё не показан. Исторические документы не переносить без необходимости.
2. Из оставшегося Gate D: проверить фактический Git SHA содержимого активного pinned V3 каталога, V2 ExecStart и recovery/rollback, без перезапуска сервисов.
3. Pi DEV `5380a75`: владелец подтвердил **live read-only** `light.kukhnia_svet=off`, `SINGLE_LIGHT_STATUS=complete`, `PHYSICAL_IDENTITY=unverified`. Следующий шаг — вручную прочитать в HA UI entity / device / area / integration и сверить с физическим контуром; не переключать и не запускать второй Telegram poller. `/lightcheck` остаётся source-only до отдельного release.
4. Новый GitHub DEV PR добавляет строго ограниченные русские вопросы о 7 выбранных сущностях кухни через отдельный MCP read-only reader. До CI/Pi проверки и явного release gate не считать, что Telegram production это поддерживает; обновлять только DEV. После identity review подготовить узкий confirmed action path — новых физических включений нет.
5. Сверяться с [активным TODO](../TODO.md) и [правилами агента](../../AGENTS.md). Вести малые PR с CI; обновлять текущий статус только после проверенного milestone.

## Правила завершения итерации

- Выделить проверенный факт, источник, дату и пределы доказательства.
- Держать актуальную сводку **только в CURRENT-STATE**; обновить TODO (открытые дела), здесь изменить лишь next step, подробный лог — в WORKLOG.
- Не переносить/удалять исторические файлы, пока статический поиск ссылок и CI не подтвердят безопасность.
