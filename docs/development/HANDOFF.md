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
3. **Первая минимальная release proposal создана, но не развёрнута:** [PR #134](https://github.com/drpoh/ha-telegram-bot/pull/134), голова `release-proposal/v3-kitchen-readonly-20261013`, база `release-proposal/v3-kitchen-base-9dd5964` (pinned Git SHA `9dd5964`). Diff: 6 файлов, импорт + read-only Telegram branch — ровно **2 добавленные строки** в существующем entrypoint, плюс DEV bounded summary и two helpers, одна строка kitchen classifier, 1 offline `node:test`. Ничего из новых `/newlight`, `/confirm`, `/cancel`, consent/journal/poller DEV не переносится. **Release PR открыт и НЕ ПРОВЕРЕН CI:** единственный `pull_request.branches` workflow слушает DEV. Следующий шаг — read-only isolated checkout/worktree и `node --test` offline на Pi по [Gate D](../gates/GATE-D.md); затем реальный отдельный release review. Никогда не merge/активировать PR #134 без CI/owner-approved rollback/single-poller; текущий 9dd5964 остаётся активным.
4. **Не закрывать Gate D целиком:** functional rollback не испытывался, token-level Telegram poller uniqueness на иных хостах не доказана, installed dependency bytes не аттестованы. Gate B по физической идентичности `light.kukhnia_svet` всё ещё OPEN; HA Green, V2/V3 production и systemd не изменять в ходе DEV документирования.

## Правила завершения итерации

- Выделить проверенный факт, источник, дату и пределы доказательства.
- Держать актуальную сводку **только в CURRENT-STATE**; обновить TODO (открытые дела), здесь изменить лишь next step, подробный лог — в WORKLOG.
- Не переносить/удалять исторические файлы, пока статический поиск ссылок и CI не подтвердят безопасность.

## Дополнение 2026-10-13 — независимый source-only review PR #134

GitHub DEV HEAD подтверждён `c0dd10048d3d64ad7ef1b7b0d5c16406c9c351a1`. PR #134 по-прежнему открыт, `head=cdcfdcdaeeec408fa89001e578639b9144b1a7e1`, `base=9dd5964a4956b88227ec4002ac80ef46a186d632`, GitHub compare ровно 6 файлов / 186 добавлений / 0 удалений, существующий consent/actor/launch unchanged in source diff. Workflow runs/statuses для candidate HEAD **0/0**, CI не запускался. Pi online, но Desktop Commander monthly quota не позволяет выполнить команды; Pi tests не проводились. Подробная независимая рецензия — комментарий к [PR #134](https://github.com/drpoh/ha-telegram-bot/pull/134). Следующий шаг: offline Pi isolated worktree на точном candidate SHA, Node 20 checks, consent regression, затем exact-SHA CI и Gate D release planning. Не merge и не deploy без подтверждений.

## Handoff дополнение — внешний Deep Research, проверен 2026-10-13

Отчёт Perplexity `export_7780787100989724748.md` принят как **список гипотез**, а не подтверждение текущей реализации: сам Perplexity репозиторий не прочитал. GitHub DEV `c0dd10048d3d64ad7ef1b7b0d5c16406c9c351a1` уже содержит SQLite conversation, context builder, entity/area resolver, strict-area resolver, policy, durable confirmations/journal, read-only router. Приоритет **не меняется**: сначала exact-SHA PR #134 offline CI/Pi + Gate D, затем безопасный read-only контекст «А в коридоре?» через existing code; не создавать новый framework или DB. `conversation.process` способен выполнять физические действия; strict policy обязателен. Для details см. новые записи CURRENT-STATE/TODO/WORKLOG. Production и HA не менялись.

## DEV контекстная функция (PR #137, 2026-10-13)

Реализован in-memory exact-scope read-only follow-up: «Что со светом на кухне?» → «А в коридоре?» (ровно 3 уже существующих обзорных ID), «А на кухне?», «А в тамбуре?». Внешний test PR source HEAD `6d39916818a575c0f113d6d340076d659dfae042` прошёл GitHub offline Node20 CI **395 syntax / 214 files / 794 assertions / 0 failures**; подтверждена только offline DEV реализация. **PR #137 merged → DEV SHA `4d79c8795ce6a105b32afcd17bea10dd1a72c58b`; финальный PR head `71054ed3497bb7ba00ced240d44884fe92510ec6` GitHub CI PASS: 395 syntax / 214 test files / 796 assertions / 0 failures.** Pi/runtime не изменены. Это дополнительный полезный DEV этап, но приоритет release остаётся у отдельного [PR #134](https://github.com/drpoh/ha-telegram-bot/pull/134): без его exact-SHA Pi/CI/rollback Gate D он не готов к переключению.
