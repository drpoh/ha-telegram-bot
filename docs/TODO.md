# RS Home AI V3 — только открытые задачи

> **Актуальное состояние и проверенные версии:** [CURRENT-STATE.md](CURRENT-STATE.md). Этот файл содержит только **ещё не завершённые** работы. Результаты пройденных тестов и закрытые пункты — [WORKLOG.md](WORKLOG.md) и [архив TODO до этапа 1](archive/TODO-snapshot-before-phase1-2026-10-13.md).
>
> Приоритеты обновлены 2026-10-13. Systemd read-only: V3 `active`, ExecStart в `rs-home-ai-v3-release-9dd5964`; V2 `active`. Это не доказательство SHA содержимого, Telegram API или recovery.

## P0 — полезное безопасное управление светом

- [ ] **Runtime provenance — остаток:** V3 `ActiveState=active`, `ExecStart=.../rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`, V2 `active` подтверждены. Проверить **фактический SHA содержимого** pinned V3 release и V2 ExecStart, read-only rollback/recovery evidence и отсутствие второго poller; не менять unit.
- [ ] **Identity:** привязать `light.kukhnia_svet` к exact HA entity, устройству, области и физическому контуру; проверить риск дублей/виртуальных ламп.
- [ ] После успешного read-only `light.kukhnia_svet=off` (снимок 2026-10-13) проверить через **HA UI entity registry** точные `entity_id`, integration/platform, связанное device и area; затем сопоставить с независимым подтверждением физического контура без переключения. При отсутствующей device/area ссылке оставить блокировку. Telegram `/lightcheck` остаётся source-only до отдельного release.
- [ ] После подтверждения первой физической идентичности проверять остальные контуры по актуальному HA registry, а не старому списку 19 кандидатов. Исторические 10 unavailable уже не являются текущим списком неисправностей; не переносить их в разрешённый action scope и не приравнивать `unavailable` к `off`.
- [ ] Подготовить отдельно утверждаемую минимальную физическую capability/долговременную запись подтверждения для одного exact ID с rollback; сохранить старое поведение `light.tambur_svet_l1`. Source-only `/newlight` **не даёт разрешения** на реальный сервисный вызов.
- [ ] Только после explicit owner approval и release gate: один контролируемый реальный тест ON/verification/OFF/verification через Telegram `/confirm`, отказные сценарии и возможность отката. Никаких массовых комнатных переключений или автоматического разрешения из LLM.

- [ ] **Identity review — после очистки HA**: последний полный пользовательский Template был **27 `light.*` (9 ON / 13 OFF / 5 UNKNOWN)**, но после него удалены два несуществующих ID: `light.svet_kukhni` и `light.sonoff_1000d78a79`. Не считать их живыми проблемами и не вычислять новый полный счет без повторного снимка. `Switch as X` ранее подтвердил 7 ID; проверить точную привязку `light.kukhnia_svet` к контуру и `light.spalnia` через HA registry. Browser Mod и `light.ves_svet_2` не авторизовать для физических операций. Проверить возможные зависимости удалённых ID в автоматизациях/дашбордах отдельно, только чтением.
- [ ] **Telegram MVP acceptance**: Pi DEV **уже проверил** 4-entity kitchen read-only CLI (`complete`, 1 ON / 3 OFF / 0 UNKNOWN). Не приравнивать CLI к реально развёрнутым новым Telegram диалогам. Для end-to-end `Что со светом на кухне?` потребуется отдельно согласованный pinned V3 release и проверка единственного Telegram poller; до этого production не обновлять.

## P1 — надёжность и приемка

- [ ] Проверить существенные пробелы Gates B/C/D/E: HA registry/device-source trust, fault isolation, recovery/reboot, голос/Assist; отделять offline mock от реального HA теста.
- [ ] Пересмотреть фактический V2 runtime и актуальные команды / память / очередь без второго poller. Повторно использовать имеющиеся `src/ai/`, `src/mcp/`, `src/memory/`, `src/telegram/`, `p-queue`, а не создавать параллельную инфраструктуру.
- [ ] Формализовать безопасный DEV → offline STAGE → pinned PROD процесс с явным ручным promote и rollback; повторно проверять ExecStart, SHA, права и single-poller invariant.

## P1 — документация, безопасность и наблюдаемость

- [ ] Исторические Markdown-пути сохранять, пока есть потребители; нет необходимости продолжать массовую реорганизацию. Pi DEV документация на `5380a75` уже прошла `DOCS_CHECK=PASS files=15 links=131`.
- [ ] При необходимости подключить GitHub App ChatGPT **только для чтения** приватного репозитория диагностических отчётов. После отдельной проверки решить судьбу неудачного Tor workflow и выделенного диагностического ключа/секретов; не ломать Termux SSH.

- [ ] **GitHub настройки безопасности и чистоты** (owner UI, не код): проверить `delete_branch_on_merge` (**сейчас false**) и включить после согласования, затем проверить Secret Scanning / Push Protection в GitHub Security; не переписывать историю и не чистить вручную критичные release/rollback ветки. Отдельно рассмотреть Dependabot с ограничением частоты PR (после MVP), без auto-merge и billable функций.

## P2 — дальнейшие возможности (после P0)

- [ ] Постепенно добавить проверенные сценарии Assist/ESPHome/Atom Echo, память и безопасное обучение без автоматического повышения автономности.
- [ ] Развивать публичный QUICKSTART/CONFIGURATION/EXAMPLES только после стабилизации реального MVP; Docker оставить опциональным.

**Исторические TODO не являются автоматически открытыми задачами.** Приоритет этой версии — работающий, безопасный помощник, а не бесконечная перестройка архитектуры.
