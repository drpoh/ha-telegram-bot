# RS Home AI V3 — только открытые задачи

> **Актуальное состояние и проверенные версии:** [CURRENT-STATE.md](CURRENT-STATE.md). Этот файл содержит только **ещё не завершённые** работы. Результаты пройденных тестов и закрытые пункты — [WORKLOG.md](WORKLOG.md) и [архив TODO до этапа 1](archive/TODO-snapshot-before-phase1-2026-10-13.md).
>
> Приоритеты обновлены 2026-10-13. Systemd read-only: V3 `active`, ExecStart в `rs-home-ai-v3-release-9dd5964`; V2 `active`. Это не доказательство SHA содержимого, Telegram API или recovery.

## P0 — полезное безопасное управление светом

- [ ] **Runtime provenance — остаток:** V3 `ActiveState=active`, `ExecStart=.../rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`, V2 `active` подтверждены. Проверить **фактический SHA содержимого** pinned V3 release и V2 ExecStart, read-only rollback/recovery evidence и отсутствие второго poller; не менять unit.
- [ ] **Identity:** привязать `light.kukhnia_svet` к exact HA entity, устройству, области и физическому контуру; проверить риск дублей/виртуальных ламп.
- [ ] После успешного read-only `light.kukhnia_svet=off` (снимок 2026-10-13) проверить через **HA UI entity registry** точные `entity_id`, integration/platform, связанное device и area; затем сопоставить с независимым подтверждением физического контура без переключения. При отсутствующей device/area ссылке оставить блокировку. Telegram `/lightcheck` остаётся source-only до отдельного release.
- [ ] После подтверждения первой физической идентичности — аналогично остальные **восемь** ранее отвечавших сущностей; каждую проверять независимо. **Десять unavailable** оставить вне физического управления до read-only анализа registry/integration.
- [ ] Подготовить отдельно утверждаемую минимальную физическую capability/долговременную запись подтверждения для одного exact ID с rollback; сохранить старое поведение `light.tambur_svet_l1`. Source-only `/newlight` **не даёт разрешения** на реальный сервисный вызов.
- [ ] Только после explicit owner approval и release gate: один контролируемый реальный тест ON/verification/OFF/verification через Telegram `/confirm`, отказные сценарии и возможность отката. Никаких массовых комнатных переключений или автоматического разрешения из LLM.

- [ ] **Identity review — HA Template snapshot 2026-10-13**: новый снимок тех же 38 сущностей дал 9 ON / 13 OFF / 16 UNKNOWN. Среди UNKNOWN — 2 Browser Mod, **11 с `model` вида `… | light.some_entity`** (возможная виртуальная обёртка), и три без такой ссылки: `light.sonoff_1000d78a79`, `light.spalnia`, `light.svet_kukhni`. Проверить `integration_entities('switch_as_x')`, exact Registry Integration/platform, device/area и источник, прежде чем считать лишними. `light.svet` ссылается на `light.kukhnia_svet_2`, отсутствующий в последнем списке states — особенно проверить entity registry. Ничего не удалять или переименовывать без отдельной инвентаризации зависимостей.
- [ ] Для кухонного read-only natural-question MVP пересмотреть 7 статически выбранных сущностей только после registry review: 4 прежних UNKNOWN подтверждены позже как `unavailable`, каждый имеет ссылку на другой свет в `model`; не объявлять их отдельными физическими лампами. Проверить отсутствовавший ранее в 19-кандидатном списке доступный `light.kukhnia_led_niz_l2`. Любое расширение read-only списка строго отдельно от write policy и production. Не запускать второй Telegram poller.

## P1 — надёжность и приемка

- [ ] Проверить существенные пробелы Gates B/C/D/E: HA registry/device-source trust, fault isolation, recovery/reboot, голос/Assist; отделять offline mock от реального HA теста.
- [ ] Пересмотреть фактический V2 runtime и актуальные команды / память / очередь без второго poller. Повторно использовать имеющиеся `src/ai/`, `src/mcp/`, `src/memory/`, `src/telegram/`, `p-queue`, а не создавать параллельную инфраструктуру.
- [ ] Формализовать безопасный DEV → offline STAGE → pinned PROD процесс с явным ручным promote и rollback; повторно проверять ExecStart, SHA, права и single-poller invariant.

## P1 — документация, безопасность и наблюдаемость

- [ ] Исторические Markdown-пути сохранять, пока есть потребители; нет необходимости продолжать массовую реорганизацию. Pi DEV документация на `5380a75` уже прошла `DOCS_CHECK=PASS files=15 links=131`.
- [ ] При необходимости подключить GitHub App ChatGPT **только для чтения** приватного репозитория диагностических отчётов. После отдельной проверки решить судьбу неудачного Tor workflow и выделенного диагностического ключа/секретов; не ломать Termux SSH.

## P2 — дальнейшие возможности (после P0)

- [ ] Постепенно добавить проверенные сценарии Assist/ESPHome/Atom Echo, память и безопасное обучение без автоматического повышения автономности.
- [ ] Развивать публичный QUICKSTART/CONFIGURATION/EXAMPLES только после стабилизации реального MVP; Docker оставить опциональным.

**Исторические TODO не являются автоматически открытыми задачами.** Приоритет этой версии — работающий, безопасный помощник, а не бесконечная перестройка архитектуры.
