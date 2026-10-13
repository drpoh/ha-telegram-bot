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

1. **Владелец подтвердил Pi DEV 2026-10-13:** `npm test` **209 файлов / 766 проверок / 0 ошибок**, затем четыре естественных русских вопроса через live HA-MCP без Telegram: `TELEGRAM_QUESTIONS_READONLY=PASS`, 4/4 `complete`. Сауна 28.0625 °C, тамбур off, четыре обзорных света off, кухня: 1 on (`light.kukhnia_svet`) / 3 off. `HA_WRITE_ATTEMPTED=false`, `TELEGRAM_POLLER_STARTED=false`, physical identity unverified. Это **не** тест Telegram API или deployment.
2. GitHub DEV после PR #122: `40674b7`; V2 source использует deterministic V3 router для точных статусов без LLM в private Telegram через старый `p-queue`, но **V2 production не обновлён**. Старые вопросы и команды по-прежнему обрабатываются текущей политикой; нет новой физической capability.
3. **Gate D — подтверждено владельцем на Pi:** `RELEASE_SOURCE_STATUS=PASS`, declared SHA `9dd5964a4956b88227ec4002ac80ef46a186d632`, **437/437 tracked Git source bytes PASS**, executable bits PASS, 0 missing/modified/type/unsupported. Ранее rollback директории `c6a9812`/`97343fa` PRESENT, но не проверены как работоспособный откат. Runtime PID/ExecStart, dependencies, single Telegram poller, Telegram API — ещё не приняты; source integrity ≠ полная Gate D приёмка.
4. Только после Gate D review и **отдельного owner approval** планировать продвижение конкретной read-only версии в один действующий Telegram poller и реальную проверку текстового ответа. Никаких автоматических переключений production, вызовов HA writes или изменений systemd.
5. Gate B ещё открыт: `light.kukhnia_svet` — Switch as X, physical fixture unverified. `light.svet_kukhni` и `light.sonoff_1000d78a79` удалены владельцем; `light.spalnia` ещё требует HA registry review. По GitHub — 66 branches, открытые Jules PR в `main` отдельно; массовой очистки refs нет.

6. Текущий DEV PR добавляет **визуальный прогресс** обоих шагов `npm test` (Node syntax и isolated runner): TTY bar + %, счётчик/ошибки/секунды, в GitHub Actions sparse checkpoints и прежняя финальная сводка. После CI — только Pi DEV `ff-only` и операторский `npm test` для проверки терминального вывода; V2/V3 production не меняются.

## Правила завершения итерации

- Выделить проверенный факт, источник, дату и пределы доказательства.
- Держать актуальную сводку **только в CURRENT-STATE**; обновить TODO (открытые дела), здесь изменить лишь next step, подробный лог — в WORKLOG.
- Не переносить/удалять исторические файлы, пока статический поиск ссылок и CI не подтвердят безопасность.
