# RS Home AI V3 — только открытые задачи

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

- [ ] **Небольшой kitchen Telegram read-only релиз (Gate D):** DEV теперь содержит отдельную **offline negative regression** `test/v3-kitchen-release-readonly-boundary.test.mjs`, проверяющую exact 4 HA IDs, `unknown != off`, отсутствие выдачи `authorization/actualWrite`, запрет mixed action/question, disabled `createNewLightDispatch` и порядок owner → router → physical fallback. Прямой перенос DEV в prod **NO-GO**: GitHub diff с pinned `9dd5964` охватывает **118 коммитов/123 файла** и меняет `/newlight`, `/confirm`, `/cancel`; сначала отдельный узкий patch/candidate с неизменной старой consent boundary, GitHub CI/ Pi evidence, owner-approved one-poller rollout и rollback. Права Gate B на `light.kukhnia_svet` по-прежнему OPEN.

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
