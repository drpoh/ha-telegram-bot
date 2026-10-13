# RS Home AI V3 — текущее состояние

> **Единственная актуальная сводка проекта.** Данные об устройствах — снимок на момент проверки, не текущие состояния. Исторические записи в других документах не обновляют эту сводку автоматически.
>
> **Последняя проверка владельца, 2026-10-13:** Raspberry Pi DEV `npm test` — **391/391 syntax files, 212 test files / 785 assertions / 0 failures**. Компактный TTY прогресс подтверждён владельцем (`S [########]`, `T [########]`), без разрастания истории обновлений. Ручной **Gate D runtime read-only**: `GATE_D_RUNTIME_READONLY=PASS`, V2 `MainPID=927`, V3 `MainPID=3713`, оба ожидаемых Node entrypoint совпадают, PID различаются, **1 процесс на каждый известный entrypoint, 0 дубликатов, 0 недоступных процессов**. Отдельно ранее на Pi: **437/437 отслеживаемых Git bytes + executable bits PASS** для закреплённого V3 релиза `9dd5964a4956b88227ec4002ac80ef46a186d632`; live HA-MCP natural questions **4/4 complete**. **Новый результат read-only dependency review:** активный `9dd5964` и основной rollback `c6a9812` имеют `RELEASE_STRUCTURE=PRESENT`, `DEPENDENCIES=PASS_STATIC` по `npm ls --offline`; исторический `97343fa` **тоже прошёл `LEGACY_DEPENDENCIES=PASS_STATIC`**; `package.json`, `package-lock.json`, `src/pilot/telegram-readonly.mjs` побайтово совпали с Git commit `97343fa81b1af0c73ee2f061ed65fe1939ea488a`. `RELEASE_COMMIT` отсутствует (старый формат архива), но это не требует исправления; **полное содержимое legacy release и реальный rollback не проверены**. **Не проверены:** Telegram polling по токену, содержимое установленных пакетов, Telegram end-to-end и реальный откат. HA writes и production deployment не выполнялись.

> **Новая приёмка действующего V3 в Telegram, 2026-10-13 (ответы предоставлены владельцем):** `RSHomeAI_v3_bot` обработал `/status` (журнал доступен), `/confirm` без ожидающего действия (отказ «Нет действующего запроса для подтверждения»), `/sauna` (88.625 °C, ready, порог 85 °C) и **три естественных read-only вопроса**: «Сколько градусов в сауне?» → 89 °C, ready; «Где горит свет?» → **4 выбранные HA сущности: 0 ON / 4 OFF / 0 UNKNOWN**; «Горит ли свет в тамбуре?» → выключен. Это живое подтверждение ограниченных Telegram → pinned V3 → HA-MCP read-only маршрутов. Это **не** полная инвентаризация дома, не приёмка новой DEV кухни, не проверка глобальной уникальности Telegram poller и не работающий rollback. Никакой новой физической команды не выполнялось.

## 1. Что подтверждено

| Возможность | Статус | Основание и границы |
| --- | --- | --- |
| Однострочный прогресс `npm test` | ✅ Pi Termux принят оператором | `S [########] 391/391 100% 67s` и `T [########] 212/212 100% 164s` — один компактный ряд на стадию; 391 syntax files/0 failures, 212 test files/785 assertions/0 failures. Строка промежуточного прогресса перезаписывалась на месте. Дополнительных зависимостей нет |
| Pi DEV исходники / тесты | ✅ Pi operator evidence 2026-10-13 | Последний `npm test`: **391 syntax files, 212 isolated files, 785 assertions, 0 failures** после DEV PR #126. Вывод не содержит отдельного `git rev-parse`; точный локальный DEV HEAD не следует угадывать |
| HA-MCP чтение | ✅ Проверено на Pi | `READONLY_PREFLIGHT=PASS`, 2026-10-13: сауна 28 °C, порог 85 °C; 4 световые сущности — 1 ON / 3 OFF |
| Новые светильники: чтение | ⚠️ Частично | 19 проверены; **2 ON, 7 OFF, 10 unavailable**; `NEW_LIGHT_REVIEW=partial`; прочитанные сущности ≠ подтверждённые физические светильники |
| Новые светильники: включение/выключение | 🔒 Не разрешено | Код DEV не выдаёт нового физического допуска; требуются проверка идентичности, отдельное разрешение и release gate |
| Точечное чтение `light.kukhnia_svet` | ✅ Live HA-MCP read-only на Pi | Владелец запустил `v3-single-light-readonly-preflight.mjs` на DEV `5380a75`: **SINGLE_LIGHT_STATUS=complete**, **SINGLE_LIGHT_STATE=off**, **PHYSICAL_IDENTITY=unverified** (2026-10-13). Это снимок состояния HA, не проверка device/area/физического контура, не Telegram production и не разрешение управления |
| Естественные вопросы о кухонном свете | ⚠️ DEV script live-tested; Telegram production not changed | Владелец выполнил ручную проверку 7 выбранных `light.*`: **ON 0 / OFF 3 / UNKNOWN 4**, `partial`; неизвестные: `light.kukhnia_led_niz_l1_2`, `light.kukhnia_led_niz_l2_2`, `light.kukhnia_svet_3`, `light.podsvetka_kukhnia`. Причины неизвестности этим выводом не установлены; физическое отключение — гипотеза, не факт. Все команды управления новыми лампами остаются заблокированы |
| Полный список `light.*` для диагностики | ✅ Live Pi read-only inventory; физическая идентичность не проверена | Владелец: **`ALL_LIGHTS_READONLY_STATUS=partial`, 38 найденных `light.*` (5 ON / 16 OFF / 17 UNKNOWN)**. `partial` из-за неизвестных состояний, не из-за усечения списка: скрипт требует полный ответ `ha_search`. **Три UNKNOWN имеют префикс `light.browser_mod_`**; ещё 14 UNKNOWN не имеют его. Префикс — ориентир для классификации, не проверка физической природы остальных 35 сущностей. Причина 16 `unavailable`/одного `unknown` не доказана, питание могло быть отключено, но это гипотеза. Нет новых разрешений |
| Уточнение из нативного HA Template (позднее 2026-10-13) | ✅ Read-only owner evidence; ID без registry proof | **38 `light.*`: 9 ON / 13 OFF / 16 UNKNOWN** в отдельный момент времени. Из 16 UNKNOWN: 2 `browser_mod`, **11 с `device_attr(model)` содержащим ссылку `| light.*` на другую сущность**, 3 требуют самостоятельной проверки (`light.sonoff_1000d78a79`, `light.spalnia`, `light.svet_kukhni`). Среди прочего — 4 Browser Mod, 3 ESPHome status LED, whole-house group и иные нефизические/служебные сущности. Связь в строке model — только признак возможной обёртки, не подтверждение `switch_as_x` или физической цепи. При обнаружении ссылок не расширять action allowlist |
| Последняя HA Template + Switch as X диагностика | ✅ Read-only owner evidence; Gate B OPEN | После обновления **27 `light.*`: 9 ON / 13 OFF / 5 UNKNOWN**. Остаток UNKNOWN: Browser Mod `light.browser_mod_635bb8a2_ae2afdad_screen`, whole-house wrapper `light.ves_svet_2`, `light.sonoff_1000d78a79`, `light.spalnia`, `light.svet_kukhni`. **Switch as X: ровно 7 ID** — `light.koridor`, `light.koridor_1_etazh`, `light.koridor_spot`, `light.kukhnia_svet`, `light.vykliuchatel_z_gostinaia_l1/l2/l3`. Десять ранее недоступных связанных записей и одна старая Browser Mod screen уже отсутствуют в последнем списке состояний, но причины удаления и возможные зависимости не проверены. Физическое соответствие и write permissions не подтверждены |
| Новая Pi-проверка кухни (после PR #116) | ✅ Реальный HA-MCP read-only PASS, не Telegram prod | Пользователь выполнил `v3-kitchen-lights-readonly-preflight.mjs` после DEV обновления: **`KITCHEN_READONLY_STATUS=complete`, 4 ID: 1 ON (`light.kukhnia_svet`), 3 OFF, 0 UNKNOWN**, `PHYSICAL_IDENTITY=unverified`. Владелец удалил как несуществующие `light.svet_kukhni` и `light.sonoff_1000d78a79`; эти ID больше не считать актуальными неисправными светильниками. Нет нового HA Template полного списка после удаления; последний 27-entity снимок — исторический. Физическое управление новыми устройствами заблокировано |
| Read-only Telegram natural-route DEV acceptance | ⚠️ Только offline PR/CI до Telegram релиза | Отдельный pure router для текстовых вопросов «Что со светом на кухне?», про сауну, тамбур и 4 выбранных света: проверяется на fake HA-MCP без запуска Telegraf/poller. Меняет только source `bot.on('message')`, не обработчики `/confirm`/`/cancel`, не физический allowlist. Пройденное на Pi ранее **CLI** (4 сущности 1 ON / 3 OFF) не доказывает реальные ответы нового Telegram-кода в production; требуется ручной Gate D release |
| Естественные вопросы — реальный HA-MCP, 4/4 | ✅ Pi DEV live read-only PASS; Telegram end-to-end не проверен | Оператор запустил `v3-telegram-questions-readonly-preflight.mjs --readonly --operator-approved`: `SAUNA=complete` (**28.0625 °C**), `TAMBOUR=complete` (**off**), `LIGHTS=complete` (**0 ON / 4 OFF** выбранных ID), `KITCHEN=complete` (**1 ON: `light.kukhnia_svet`; 3 OFF / 0 unknown**). `TELEGRAM_QUESTIONS_READONLY=PASS`, `TELEGRAM_POLLER_STARTED=false`, `HA_WRITE_ATTEMPTED=false`, `PHYSICAL_IDENTITY=unverified`. Четыре ответа проверены по HA-MCP, но Telegram transport/pinned production всё ещё требует Gate D release |
| Gate D: живые процессы V2/V3 | ✅ Pi read-only PASS (bounded scope) | `GATE_D_RUNTIME_READONLY=PASS`; V2 PID **927**, V3 PID **3713**, `SERVICE_PIDS_DISTINCT=true`, оба `MAIN_ENTRYPOINT_MATCH=true`, локальные known-entrypoint counts **V2=1, V3=1, unreadable=0**, duplicates false. Token-level Telegram polling uniqueness **false/unverified**, installed deps/recovery не проверены. Никакого restart/HA write |
| Telegram V3 / подтверждение | ✅ Реальная owner Telegram приёмка pinned V3, строго read-only | Бот ответил на `/status`, на `/confirm` без pending запроса отказал; `/sauna` → **88.625 °C** / ready. Естественные вопросы в этом же чате: сауна **89 °C** / ready (85 °C threshold); четыре *выбранных* световых HA entity **0 ON / 4 OFF / 0 UNKNOWN**; тамбур off. Это Telegram transport, авторизация owner для этих ответов и HA-MCP чтение, не развёртывание новой DEV кухни, не разрешение физического управления |
| V2 exact read-only fast path | ✅ Входит в прошедшие Pi DEV тесты; V2 prod без изменений | Исходники reuse V3 router с exact `ha_get_state`, private-owner gating и старой `p-queue` покрыты общим **Pi DEV `npm test` 209/766/0**. Неопознанные запросы и команды остаются на старом AI + Policy Engine. Это НЕ подтверждает, что новый V2 Telegram код запущен или испытан в production; требуется отдельный approved release |
| Telegram V2 / HTTP API | ⚠️ Service active; API не проверен | `systemctl is-active ha-telegram-bot.service` → `active` (2026-10-13). Отдельный runtime; API и ответы Telegram не тестировались |
| Policy Engine / подтверждения | ✅ Offline DEV тесты | Нет доказательства, что новые сценарии развернуты в активном production |
| Память / очередь / `/debug` / `/newlights` | ✅ DEV исходники и тесты | Изменения PR #90–#94 на `6f6e694`; не означает включение в production |
| Автономные действия (AUTO_SAFE) | 🔒 Новых прав нет | Нельзя расширять allowlist по данным LLM или только из исходного кода |
| Whisper/Piper / ESPHome голос | ⚠️ Интеграции существуют | V3 voice Gate E не принят |
| Docker | ✅ Опциональные конфиги | На Pi production использует systemd; не запускать параллельный Telegram poller |
| Приватный диагностический отчёт | ✅ Ручная доставка | Pi `REPORT=sent` в private `drpoh/rs-home-ai-private-reports#1`, comment #6141220575; **без расписания**; GitHub-подключение ChatGPT не имеет права чтения (404) |
| Multi-user | ❌ Не подтверждено | Политику доступа не расширять |

## 2. Среды и версия production

| Среда | Назначение | Ограничение |
| --- | --- | --- |
| DEV | `/home/drpoh/projects/rs-home-ai-dev`, ветка `feature/v3-home-agent` | Единственный изменяемый рабочий каталог |
| STAGE | Offline mock / CI-gated immutable candidate | Не является работающей HA-инсталляцией |
| V3 production | Отдельный закреплённый release, user-systemd | Ранее `active`, main PID `3713` и точный V3 Node entrypoint verified; путь `.../rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`. **437/437** tracked bytes/exec bits PASS, `RELEASE_STRUCTURE=PRESENT`, `DEPENDENCIES=PASS_STATIC`. Это не проверяет содержимое node_modules или Telegram API |
| Rollback | `c6a9812` основной; `97343fa` исторический дополнительный | Для `c6a9812` и `97343fa` локальный `npm ls --offline` вернул **PASS_STATIC**. Для `97343fa` также 3/3 выбранных tracked Git blobs **PASS** (`package.json`, `package-lock.json`, V3 entrypoint). Исторический `RELEASE_COMMIT=MISSING` не является повреждением; **полный архив не аттестован, рабочий rollback не выполнялся** |
| V2 production | `/home/drpoh/ha-telegram-bot` | `ha-telegram-bot.service` **active**; операторский `/proc` snapshot подтвердил ожидаемый V2 Node entrypoint и `MainPID=927`, отдельно от V3. Telegram API, secret identity и installed dependencies не проверены |
| Historical V3 | `/home/drpoh/rs-home-ai-v3` | Не изменять; связан с Gate D |
| Home Assistant Green | Независимый контроллер устройств | Продолжает работать при остановке RS Home AI |

**Разрешение исторического противоречия:** системный `ExecStart` теперь достоверно указывает на каталог релиза **`9dd5964`**, а не `c6a9812`. Фактический Git SHA содержимого каталога и механизм восстановления ещё не перепроверены. Никакого автоповышения DEV → production.

## 3. Gates

| Gate | Состояние | Главный незакрытый пункт |
| --- | --- | --- |
| A | ⚠️ Историческая база | Не приравнивать старое принятие к новой версии |
| B | **OPEN** | Физическая идентичность, доверенная HA-registry привязка и отдельно разрешённое управление новыми светильниками |
| C | ⚠️ Частичный offline | Реальная fault/recovery проверка независимо от mock |
| D | ⚠️ Gate D OPEN; pinned Telegram + source/runtime/deps read-only PASS | Pinned V3 `9dd5964`: owner Telegram `/status`, `/confirm` без pending (отклонён), `/sauna`, **3/3** поддерживаемых русских вопросов — PASS; HA-MCP read-only, область света только 4 выбранных ID. Ранее source Git **437/437**, local V2/V3 runtime PASS, static npm tree 3/3 релизных каталогов PASS; historical rollback `97343fa` **3/3 выбранных** Git blobs. Осталось: release/rollback drill, token-level cross-host poller uniqueness, проверка новых DEV Telegram функций |
| E | **OPEN** | Реальный голосовой цикл и безопасные подтверждения |

Подробности критериев: [Gate B](gates/GATE-B.md) · [Gate C](gates/GATE-C.md) · [Gate D](gates/GATE-D.md) · [Gate E](gates/GATE-E.md). Это не отдельный источник актуального статуса.

## 4. Постоянные правила безопасности

- В DEV принят [короткий playbook инженерных практик](development/ENGINEERING-PRACTICES.md), адаптация Matt Pocock/ECC только на уровне процесса (repro → TDD → dual-axis review → Gate D evidence); **никаких skills/harness/hooks/packages на Pi не ставили**. Первичный source-only review кухни: весь DEV build **NO-GO** к прямому production-promotion из-за изменения consent entrypoint; отдельный read-only patch/review необходим.

- HA Green сохраняет самостоятельную работу независимо от Raspberry Pi.
- LLM предлагает, но **не авторизует** действия. `Observe → Reason → Policy → Act → Verify → Learn`.
- State-changing действия требуют детерминированной политики, exact entity identity, нужного режима допуска, подтверждения и проверки результата.
- Learning не может автоматически повысить автономность; `AUTO_SAFE` возможен только по явно утверждённому allowlist.
- Замки, охрана, разрушительные настройки и другие критичные действия — `CONFIRM` или `DENY`, не самовольное выполнение.
- Не запускать второй Telegram poller и не модифицировать production при документационном обновлении.
- Не считать `unavailable` эквивалентом `off`; исключить `light.browser_mod*` из управления.

## 5. Следующие приоритеты

1. **Read-only Telegram Gate D acceptance пройдена для текущего pinned V3:** `/status`, `/sauna`, `/confirm` без pending и три естественных русских запроса с HA-MCP выполнены в уже работающем чате. Не повторять ради документации. **Следующее полезное изменение — отдельный review безопасного DEV → pinned V3 read-only rollout**, прежде всего kitchen status: офлайн source-тесты, проверка кандидата, неизменность action allowlist/confirmation, один Telegram poller, чёткий возврат к `9dd5964`. Стадию переключения production не начинать без отдельного owner approval.
2. Четыре присутствующие кухонные HA-сущности **уже live-прочитаны** в DEV (1 ON / 3 OFF / 0 UNKNOWN); следующий шаг — подтверждение точного физического контура `light.kukhnia_svet` (Switch as X) через HA registry и независимое сопоставление без включений. После удаления двух несуществующих `light.*` уточнить судьбу `light.spalnia` в HA UI. Не выдавать устаревшие снимки 27/38 за текущий инвентарь.
3. Подготовить строго ограниченный, отдельно согласованный первый реальный тест нового света; никаких разрешений из одного только Telegram текста.
4. Завершить Gate B/C/D acceptance без новых инфраструктурных велосипедов (systemd, HA-MCP, Assist, ESPHome).
5. По состоянию GitHub API на 2026-10-13: 66 веток, 50 совпадающих по SHA merged PR head относительно DEV (только предварительные кандидаты на удаление), 3 открытых PR с базой `main`; ни одна ветка не удалялась. Сначала проверить permanent DEV/release refs и защиту, затем чистить только повторно проверенные временные головы PR. Поддерживать короткий handoff и безопасные CI-правила документации.

[Активный TODO](TODO.md) · [Короткий HANDOFF](development/HANDOFF.md) · [Навигация](README.md).

## 6. Документы и подтверждения

[Индекс](README.md) · [Правила агента](../AGENTS.md) · [Карта проекта](PROJECT-MAP.md) · [История/журнал](WORKLOG.md) · [Аудит 71 Markdown-файла](DOCUMENTATION-AUDIT-2026-10-13.md) · [Чтение 19 кандидатов](V3-NEW-LIGHTS-REAL-READ-2026-10-12.md).

**Правило обновления:** после стабильного milestone обновлять здесь только фактически подтверждённые пункты вместе с датой/источником; подробные события — в WORKLOG/архиве. Не выдавать GitHub SHA за установленный Pi SHA.

## GitHub source-only review PR #134 — 2026-10-13 (НЕ DEPLOY)

Внешняя повторная проверка GitHub compare `9dd5964a4956b88227ec4002ac80ef46a186d632...cdcfdcdaeeec408fa89001e578639b9144b1a7e1`: **ahead 6 / behind 0**, 6 файлов, **186 additions / 0 deletions**. Только два добавления в `src/pilot/telegram-readonly.mjs` (импорт и отдельный `kitchen_review` read-only route); существующие consent, `/confirm`, `/cancel`, authorization, `pilot.request`, physical dispatch, `bot.launch` не изменены по diff. Кухня: только четыре фиксированные сущности, `unknown` не трактуется как `off`, физическая идентичность открыта. На SHA кандидата GitHub API вернул **0 workflow runs / 0 statuses**, поэтому **CI NOT RUN**. Raspberry Pi сообщил online, но удалённое выполнение команд недоступно из-за месячного лимита Desktop Commander: **никаких новых Pi, Node 20/ARMv7, offline runtime или Telegram-проверок не выполнено**. Аудит оставлен в [PR #134](https://github.com/drpoh/ha-telegram-bot/pull/134). **NO-GO для production** до offline Pi evidence, CI exact SHA, независимого consent regression и отдельного Gate D approval/rollback. Работающий `9dd5964` не изменён.
