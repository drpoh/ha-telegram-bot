# RS Home AI V3 — только открытые задачи

> **CURRENT TOP PRIORITIES 2026-10-14: COMPLETED owner-approved hotfix production e902efeb -> 2fbee8f with rollback, one V3 process, V2 unchanged; full Pi Node20 ARMv7 offline tests 176 files / 673 assertions PASS; release integrity 441/441; live Telegram kitchen 0 on / 4 off / 0 unknown and sauna 27.875 C. PENDING: one short live Telegram overview, request tambour on, then /cancel on current hotfix (do not require repeated physical /confirm); check reboot persistence when naturally possible; review/integrate PR #142 into DEV source without broad promotion; proceed source-only bounded conversational followup on existing DEV router. Physical identity of kitchen and any HA kitchen writes remain DENIED; owner approval required to expand writes. Historical TODOs below were written before release and do not override this checkpoint.**

> **Актуальное состояние и проверенные версии:** [CURRENT-STATE.md](CURRENT-STATE.md). Этот файл содержит только **ещё не завершённые** работы. Результаты пройденных тестов и закрытые пункты — [WORKLOG.md](WORKLOG.md) и [архив TODO до этапа 1](archive/TODO-snapshot-before-phase1-2026-10-13.md).
>
> Приоритеты обновлены 2026-10-13. Systemd read-only: V3 `active`, ExecStart в `rs-home-ai-v3-release-9dd5964`; V2 `active`. Это не доказательство SHA содержимого, Telegram API или recovery.

## P0 — полезное безопасное управление светом

- [ ] **Gate D — статические зависимости всех трёх архивов проверены, функциональный rollback всё ещё OPEN:** активный `9dd5964`, основной резерв `c6a9812` и исторический `97343fa` дали `DEPENDENCIES=PASS_STATIC`/`LEGACY_DEPENDENCIES=PASS_STATIC` через read-only `npm ls --offline`. Для legacy `97343fa` побайтово совпали **3/3** выбранных Git blobs: `package.json`, `package-lock.json`, `src/pilot/telegram-readonly.mjs`. `RELEASE_COMMIT=MISSING` в старой копии не исправлять задним числом. Полный Git-tree, зависимости в памяти, реальное восстановление и Telegram token-level polling ещё не проверены. Следующий этап: существующие read-only Telegram команды `/status`, `/sauna` в действующем V3; не запускать новый poller и не переключать свет.
- [ ] **Identity:** привязать `light.kukhnia_svet` к exact HA entity, устройству, области и физическому контуру; проверить риск дублей/виртуальных ламп.
- [ ] После успешного read-only `light.kukhnia_svet=off` (снимок 2026-10-13) проверить через **HA UI entity registry** точные `entity_id`, integration/platform, связанное device и area; затем сопоставить с независимым подтверждением физического контура без переключения. При отсутствующей device/area ссылке оставить блокировку. Telegram `/lightcheck` остаётся source-only до отдельного release.
- [ ] После подтверждения первой физической идентичности проверять остальные контуры по актуальному HA registry, а не старому списку 19 кандидатов. Исторические 10 unavailable уже не являются текущим списком неисправностей; не переносить их в разрешённый action scope и не приравнивать `unavailable` к `off`.
- [ ] Подготовить отдельно утверждаемую минимальную физическую capability/долговременную запись подтверждения для одного exact ID с rollback; сохранить старое поведение `light.tambur_svet_l1`. Source-only `/newlight` **не даёт разрешения** на реальный сервисный вызов.
- [ ] Только после explicit owner approval и release gate: один контролируемый реальный тест ON/verification/OFF/verification через Telegram `/confirm`, отказные сценарии и возможность отката. Никаких массовых комнатных переключений или автоматического разрешения из LLM.

- [ ] **Identity review — после очистки HA**: последний полный пользовательский Template был **27 `light.*` (9 ON / 13 OFF / 5 UNKNOWN)**, но после него удалены два несуществующих ID: `light.svet_kukhni` и `light.sonoff_1000d78a79`. Не считать их живыми проблемами и не вычислять новый полный счет без повторного снимка. `Switch as X` ранее подтвердил 7 ID; проверить точную привязку `light.kukhnia_svet` к контуру и `light.spalnia` через HA registry. Browser Mod и `light.ves_svet_2` не авторизовать для физических операций. Проверить возможные зависимости удалённых ID в автоматизациях/дашбордах отдельно, только чтением.
- [ ] **Gate D Telegram transport — проверенная область и остаток:** владелец подтвердил работу `/status` (journal available), `/confirm` без ожидающего запроса (отказ), `/sauna` (88.625 °C, ready) и **трёх естественных read-only фраз** в уже работающем pinned V3 `9dd5964`: сауна 89 °C/готова; выбранные 4 световых HA entity 0 ON/4 OFF/0 UNKNOWN; тамбур off. **Остаток:** global/token-level poller uniqueness, функциональный rollback, полная integrity зависимостей и контролируемый выпуск DEV kitchen status. Не запускать второй poller, не переключать HA, не расширять физический scope.

- [ ] **Gate D — release candidate PR #134**: обновлённый exact SHA `e902efeb923a2090ca0d188e92d1ccdc28d1627e` на pinned `9dd5964` имеет 7 изменённых файлов (6 из исходного release scope + **одна тестовая корректировка**, без дополнительных runtime-прав). Независимая GitHub Actions verification PR #139 **SUCCESS** на literal candidate SHA: Node 20.20.2, focused 4/4, полный 176 test files / 672 assertions / 0 failures, unchanged consent entrypoint bytes. Source-only artifact `11867150164` checksum-verified, expires 2026-10-28. **Это не прямой CI-status PR #134 и не Pi ARMv7-проверка.** Открыто: isolated Pi Node20 syntax + focused regression, exact Git files/marker/installed dependencies, token-level one-poller proof, functional rollback drill, отдельное owner approval до promotion. V2/V3/HA не менять.

## P1 — надёжность и приемка

- [ ] Проверить существенные пробелы Gates B/C/D/E: HA registry/device-source trust, fault isolation, recovery/reboot, голос/Assist; отделять offline mock от реального HA теста.
- [ ] Пересмотреть фактический V2 runtime и актуальные команды / память / очередь без второго poller. Повторно использовать имеющиеся `src/ai/`, `src/mcp/`, `src/memory/`, `src/telegram/`, `p-queue`, а не создавать параллельную инфраструктуру.
- [ ] Формализовать безопасный DEV → offline STAGE → pinned PROD процесс с явным ручным promote и rollback; повторно проверять ExecStart, SHA, права и single-poller invariant.



## P1 — документация, безопасность и наблюдаемость

- [ ] Исторические Markdown-пути сохранять, пока есть потребители; нет необходимости продолжать массовую реорганизацию. Pi DEV документация на `5380a75` уже прошла `DOCS_CHECK=PASS files=15 links=131`.
- [ ] При необходимости подключить GitHub App ChatGPT **только для чтения** приватного репозитория диагностических отчётов. После отдельной проверки решить судьбу неудачного Tor workflow и выделенного диагностического ключа/секретов; не ломать Termux SSH.

- [ ] **GitHub ветки и безопасность** (GitHub API 2026-10-13): 66 веток, **50 предварительных merged-PR head-кандидатов**, совпадающих по SHA и с базой DEV; автоматическая очистка `delete_branch_on_merge=false`, постоянная DEV не защищена. Три **открытых** PR #56/#65/#69 базируются на `main`, оставить без автоматического merge или удаления. Перед очисткой повторно сверить SHA, merge status, внешние зависимости release/rollback/automation и защитить постоянные refs; затем чистить только вручную подтверждённые временные ветки. Включить поддерживаемые Secret Scanning / Push Protection после проверки GitHub UI. Dependabot без авто-merge позже, после MVP.

## P2 — дальнейшие возможности (после P0)

- [ ] Постепенно добавить проверенные сценарии Assist/ESPHome/Atom Echo, память и безопасное обучение без автоматического повышения автономности.
- [ ] Развивать публичный QUICKSTART/CONFIGURATION/EXAMPLES только после стабилизации реального MVP; Docker оставить опциональным.

**Исторические TODO не являются автоматически открытыми задачами.** Приоритет этой версии — работающий, безопасный помощник, а не бесконечная перестройка архитектуры.

- [ ] **Остаток Pi Gate D для PR #134:** на изолированном worktree Pi (когда доступ восстановится) проверить exact SHA `e902efeb923a2090ca0d188e92d1ccdc28d1627e`, Node20/ARMv7, синтаксис и offline regression без второго poller/HA writes. Статические Node20 x64 GitHub tests уже **PASS**, не повторять их ради количества прогонов.
- [ ] **Остаток release Gate D:** проверить staging package / Node dependencies на Pi, рабочий `9dd5964` и основной rollback `c6a9812`, global/token-level Telegram poller uniqueness, репетицию восстановления без нового polling клиента и подготовить one-poller cutover. Только с отдельным owner approval разрешён реальный systemd switch. Исходный source-only artifact GitHub истекает 2026-10-28, при необходимости перевыпустить на том же pinned SHA.

## Reuse First — уточнения после проверки Perplexity, 2026-10-13

- [ ] **После Gate D kitchen release review:** найти реальную точку хранения контекста pinned V3 и построить один чистый, read-only тестируемый vertical slice «Что со светом в тамбуре? — А в коридоре?» на существующих `src/context/builder.mjs`, строгом `src/home/strict-area-resolver.mjs` и exact `ha_get_state`. Не интерпретировать местоимение как write-authorization и не включать новые лампы.
- [ ] До context promotion проверить isolation по доверенным `user_id/chat_id`, инвалидацию по TTL/restart, ambiguous aliases, неизвестную цель и stale HA states. Отдельно проверить `src/home/entity-resolver.mjs` (first `includes` match) и не допускать вывода из него сразу в физический `ha_call_service`.
- [ ] Добавить в существующие `node:test` точечный golden-набор русских **read-only** запросов (точное/неоднозначное помещение, неизвестное устройство, `unavailable`, transport error, cross-chat). Не вводить новый test framework.
- [ ] После готового текстового read-only MVP проверить уже установленные Assist/Whisper/Piper/ESPHome возможности для voice input/response на offline/isolated пути; сначала без изменения HA pipeline/production. `conversation.process` может **выполнять действия** — не использовать его как обход Policy Engine.
- [ ] Snapshots + «верни как было» и расширение action allowlist оставить после Gate B physical identity, policy/confirmation и согласованного release. Не внедрять Mem0, векторную БД, Mastra, LangGraph, Vercel AI SDK, новый SQLite schema или второй Telegram poller по одной только рекомендации Deep Research.

- [ ] Перед stage/prod контекстных follow-ups: отдельные Pi Node20/ARMv7 offline tests, authenticated session cross-chat, stale/restart/read-only HA-MCP verification, готовый rollback; никакого Telegram second poller и HA writes. Состояния `light.koridor*` — три выбранные HA сущности, не полный физический коридор.
