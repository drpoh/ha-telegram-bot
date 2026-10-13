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

1. **Владелец подтвердил на Pi 2026-10-13:** `npm test` 391 syntax files / 212 test files / 785 assertions / 0 errors; однострочный Termux прогресс работает. Live HA-MCP natural Russian questions 4/4 complete. **Gate D source** — 437/437 Git blobs/exec bits pinned `9dd5964` PASS. **Gate D local runtime** — V2 MainPID 927, V3 3713, оба точные entrypoints, без известных локальных дубликатов.
2. **Gate D dependency inventory (новый операторский вывод):** active `9dd5964` и основной резерв `c6a9812`: `RELEASE_STRUCTURE=PRESENT`, `DEPENDENCIES=PASS_STATIC` через `npm ls --offline`; исторический второй резерв `97343fa`: `RELEASE_STRUCTURE=UNVERIFIED`. Это НЕ повреждение исходного коммита: GitHub tree `97343fa81b1af0c73ee2f061ed65fe1939ea488a` содержит оба package-файла и V3 `src/pilot/telegram-readonly.mjs`. Локальный состав каталога пока не известен; ничего не удалять и не устанавливать.
3. **Следующий минимальный диагностический шаг:** выполнить из [Gate D](../gates/GATE-D.md) один shell read-only осмотр `97343fa`, печатающий только тип/наличие известных файлов и факт соответствия префикса `RELEASE_COMMIT`, без содержимого/токенов. Установить точную причину `UNVERIFIED`. Затем owner может проверить **уже запущенный V3 Telegram** существующими read-only `/status` и `/sauna` в чате; новый poller не запускать, V2/V3 не перезапускать.
4. **Release Gate D остаётся открыт:** статический `npm ls` не проверяет содержимое SDK, восстановление и Telegram polling по токену. Новый DEV Telegram не развернут. Любые новые физические write-capabilities, отдельный restore/release требуют explicit owner approval. Gate B `light.kukhnia_svet` физически не подтверждён.

## Правила завершения итерации

- Выделить проверенный факт, источник, дату и пределы доказательства.
- Держать актуальную сводку **только в CURRENT-STATE**; обновить TODO (открытые дела), здесь изменить лишь next step, подробный лог — в WORKLOG.
- Не переносить/удалять исторические файлы, пока статический поиск ссылок и CI не подтвердят безопасность.
