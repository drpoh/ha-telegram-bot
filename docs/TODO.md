# RS Home AI V3 — только открытые задачи

> **Актуальное состояние и проверенные версии:** [CURRENT-STATE.md](CURRENT-STATE.md). Этот файл содержит только **ещё не завершённые** работы. Результаты пройденных тестов и закрытые пункты — [WORKLOG.md](WORKLOG.md) и [архив TODO до этапа 1](archive/TODO-snapshot-before-phase1-2026-10-13.md).
>
> Приоритеты обновлены 2026-10-13. Systemd read-only: V3 `active`, ExecStart в `rs-home-ai-v3-release-9dd5964`; V2 `active`. Это не доказательство SHA содержимого, Telegram API или recovery.

## P0 — полезное безопасное управление светом

- [ ] **Gate D remaining:** pinned V3 `9dd5964` **437/437 Git bytes + exec bits PASS**, оба rollback каталога присутствуют. После PR CI и безопасного DEV `ff-only` выполнить **только чтение** `node scripts/manual/v3-runtime-readonly-preflight.mjs --readonly --operator-approved`: сверить systemd V2/V3 MainPID с реальными Node entrypoint в `/proc`, выявить локальные копии известных entrypoint. Отдельно проверить dependencies/untracked config, Telegram poller по токену, end-to-end API и recovery/rollback; **никакого restart или HA writes**. Локальный process scan не может доказать отсутствие poller на другом хосте.
- [ ] **Identity:** привязать `light.kukhnia_svet` к exact HA entity, устройству, области и физическому контуру; проверить риск дублей/виртуальных ламп.
- [ ] После успешного read-only `light.kukhnia_svet=off` (снимок 2026-10-13) проверить через **HA UI entity registry** точные `entity_id`, integration/platform, связанное device и area; затем сопоставить с независимым подтверждением физического контура без переключения. При отсутствующей device/area ссылке оставить блокировку. Telegram `/lightcheck` остаётся source-only до отдельного release.
- [ ] После подтверждения первой физической идентичности проверять остальные контуры по актуальному HA registry, а не старому списку 19 кандидатов. Исторические 10 unavailable уже не являются текущим списком неисправностей; не переносить их в разрешённый action scope и не приравнивать `unavailable` к `off`.
- [ ] Подготовить отдельно утверждаемую минимальную физическую capability/долговременную запись подтверждения для одного exact ID с rollback; сохранить старое поведение `light.tambur_svet_l1`. Source-only `/newlight` **не даёт разрешения** на реальный сервисный вызов.
- [ ] Только после explicit owner approval и release gate: один контролируемый реальный тест ON/verification/OFF/verification через Telegram `/confirm`, отказные сценарии и возможность отката. Никаких массовых комнатных переключений или автоматического разрешения из LLM.

- [ ] **Identity review — после очистки HA**: последний полный пользовательский Template был **27 `light.*` (9 ON / 13 OFF / 5 UNKNOWN)**, но после него удалены два несуществующих ID: `light.svet_kukhni` и `light.sonoff_1000d78a79`. Не считать их живыми проблемами и не вычислять новый полный счет без повторного снимка. `Switch as X` ранее подтвердил 7 ID; проверить точную привязку `light.kukhnia_svet` к контуру и `light.spalnia` через HA registry. Browser Mod и `light.ves_svet_2` не авторизовать для физических операций. Проверить возможные зависимости удалённых ID в автоматизациях/дашбордах отдельно, только чтением.
- [ ] **Telegram transport / release acceptance — ещё не проверено**: Pi DEV уже **завершил** `v3-telegram-questions-readonly-preflight.mjs` со статусом **4/4 complete, `TELEGRAM_QUESTIONS_READONLY=PASS`** (реальный HA-MCP, без Telegram poller и writes). Не повторять preflight ради документации. Следующий этап — Gate D read-only attestation V3 pinned source (`RELEASE_COMMIT` + `git archive` comparison) и V2 service ExecStart, rollback и единственный poller. Реальные Telegram сообщения / promote только после отдельного owner-approved release review.

- [ ] **V2 no-LLM fast path, production ещё не принят**: reuse V3 router в однопоточном V2 `p-queue`, exact HA `ha_get_state` для разрешённого *чтения*, private-owner Telegram; остальные запросы идут через прежний AI/Policy Engine. Код уже прошёл Pi DEV offline `npm test` **209/766/0**, но ни обновление V2 service, ни live Telegram path не выполнены. Отдельный Gate D release с сохранением текущего V2 runtime/rollback; никаких новых физических capability. GitHub CI уже выдаёт короткую сводку (#120), ещё один отчётный сервис не нужен.

## P1 — надёжность и приемка

- [ ] Проверить существенные пробелы Gates B/C/D/E: HA registry/device-source trust, fault isolation, recovery/reboot, голос/Assist; отделять offline mock от реального HA теста.
- [ ] Пересмотреть фактический V2 runtime и актуальные команды / память / очередь без второго poller. Повторно использовать имеющиеся `src/ai/`, `src/mcp/`, `src/memory/`, `src/telegram/`, `p-queue`, а не создавать параллельную инфраструктуру.
- [ ] Формализовать безопасный DEV → offline STAGE → pinned PROD процесс с явным ручным promote и rollback; повторно проверять ExecStart, SHA, права и single-poller invariant.

- [ ] **Проверить короткий однострочный прогресс в Termux** после CI и `ff-only` Pi DEV sync: `npm test` обновляет **одну короткую строку** через `\r` без ANSI и переноса текста, каждая стадия отдельно. В локальных не-TTY выводах не писать каждый 10% checkpoint; в CI сохранить краткие вехи и итог. Проверить реальное поведение Termux и сохранение SSH при ошибке.

## P1 — документация, безопасность и наблюдаемость

- [ ] Исторические Markdown-пути сохранять, пока есть потребители; нет необходимости продолжать массовую реорганизацию. Pi DEV документация на `5380a75` уже прошла `DOCS_CHECK=PASS files=15 links=131`.
- [ ] При необходимости подключить GitHub App ChatGPT **только для чтения** приватного репозитория диагностических отчётов. После отдельной проверки решить судьбу неудачного Tor workflow и выделенного диагностического ключа/секретов; не ломать Termux SSH.

- [ ] **GitHub ветки и безопасность** (GitHub API 2026-10-13): 66 веток, **50 предварительных merged-PR head-кандидатов**, совпадающих по SHA и с базой DEV; автоматическая очистка `delete_branch_on_merge=false`, постоянная DEV не защищена. Три **открытых** PR #56/#65/#69 базируются на `main`, оставить без автоматического merge или удаления. Перед очисткой повторно сверить SHA, merge status, внешние зависимости release/rollback/automation и защитить постоянные refs; затем чистить только вручную подтверждённые временные ветки. Включить поддерживаемые Secret Scanning / Push Protection после проверки GitHub UI. Dependabot без авто-merge позже, после MVP.

## P2 — дальнейшие возможности (после P0)

- [ ] Постепенно добавить проверенные сценарии Assist/ESPHome/Atom Echo, память и безопасное обучение без автоматического повышения автономности.
- [ ] Развивать публичный QUICKSTART/CONFIGURATION/EXAMPLES только после стабилизации реального MVP; Docker оставить опциональным.

**Исторические TODO не являются автоматически открытыми задачами.** Приоритет этой версии — работающий, безопасный помощник, а не бесконечная перестройка архитектуры.
