# RS Home AI V3 — текущее состояние

> **Единственная актуальная сводка проекта.** Данные об устройствах — снимок на момент проверки, не текущие состояния. Исторические записи в других документах не обновляют эту сводку автоматически.
>
> **Последняя проверка владельца, 2026-10-13:** Raspberry Pi DEV `npm test` — **209 тестовых файлов, 766 проверок, 0 ошибок**. Ручной live **HA-MCP read-only** preflight четырёх естественных вопросов — **4/4 complete, `TELEGRAM_QUESTIONS_READONLY=PASS`**, без Telegraf poller, LLM и HA writes. Это НЕ Telegram API/end-to-end и НЕ развертывание V2/V3 production. Последний полный HA Template (27 `light.*`) исторический, до удаления двух несуществующих сущностей. Активный V3 `ExecStart` ранее указывал на release с именем `9dd5964`, но фактическая целостность релиза ещё не проверена.

## 1. Что подтверждено

| Возможность | Статус | Основание и границы |
| --- | --- | --- |
| Pi DEV исходники / тесты | ✅ Выполнено владельцем, версия Pi не выведена отдельно | Более поздний запуск `npm test`: **206 файлов, 747 проверок, 0 ошибок** после синхронизации ветки с PR #113; отдельного `git rev-parse` в том выводе нет. Ранее на `5380a75` пройдено 202/737/0. GitHub CI новой кухонной версии необходимо проверять отдельно |
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
| Telegram V3 / подтверждение | ⚠️ Runtime путь подтверждён; поведение не тестировалось | `systemctl --user show`: **active**, ExecStart указывает на `.../rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`. Предыдущее ограничение пилота `light.tambur_svet_l1` историческое; новый Telegram live-тест не проводился |
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
| V3 production | Отдельный закреплённый release, user-systemd | **active**; ExecStart `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`; SHA содержимого не перепроверен |
| Rollback | Исторически `97343fa` | Проверить путь/наличие перед любым использованием |
| V2 production | `/home/drpoh/ha-telegram-bot` | `ha-telegram-bot.service` **active** (read-only systemd); путь ExecStart, API и runtime SHA не перепроверены |
| Historical V3 | `/home/drpoh/rs-home-ai-v3` | Не изменять; связан с Gate D |
| Home Assistant Green | Независимый контроллер устройств | Продолжает работать при остановке RS Home AI |

**Разрешение исторического противоречия:** системный `ExecStart` теперь достоверно указывает на каталог релиза **`9dd5964`**, а не `c6a9812`. Фактический Git SHA содержимого каталога и механизм восстановления ещё не перепроверены. Никакого автоповышения DEV → production.

## 3. Gates

| Gate | Состояние | Главный незакрытый пункт |
| --- | --- | --- |
| A | ⚠️ Историческая база | Не приравнивать старое принятие к новой версии |
| B | **OPEN** | Физическая идентичность, доверенная HA-registry привязка и отдельно разрешённое управление новыми светильниками |
| C | ⚠️ Частичный offline | Реальная fault/recovery проверка независимо от mock |
| D | ⚠️ Read-only runtime path + active подтверждены | V3 `ExecStart` → `9dd5964`-named release, V2 active. Проверка SHA содержимого, single-poller invariant, recovery и rollback остаётся |
| E | **OPEN** | Реальный голосовой цикл и безопасные подтверждения |

Подробности критериев: [Gate B](gates/GATE-B.md) · [Gate C](gates/GATE-C.md) · [Gate D](gates/GATE-D.md) · [Gate E](gates/GATE-E.md). Это не отдельный источник актуального статуса.

## 4. Постоянные правила безопасности

- HA Green сохраняет самостоятельную работу независимо от Raspberry Pi.
- LLM предлагает, но **не авторизует** действия. `Observe → Reason → Policy → Act → Verify → Learn`.
- State-changing действия требуют детерминированной политики, exact entity identity, нужного режима допуска, подтверждения и проверки результата.
- Learning не может автоматически повысить автономность; `AUTO_SAFE` возможен только по явно утверждённому allowlist.
- Замки, охрана, разрушительные настройки и другие критичные действия — `CONFIRM` или `DENY`, не самовольное выполнение.
- Не запускать второй Telegram poller и не модифицировать production при документационном обновлении.
- Не считать `unavailable` эквивалентом `off`; исключить `light.browser_mod*` из управления.

## 5. Следующие приоритеты

1. После **4/4 live HA-MCP read-only PASS** перейти к Gate D: только чтением проверить фактические V2/V3 ExecStart, `RELEASE_COMMIT` активного pinned V3, целостность git-archive-содержимого относительно указанного SHA, rollback path и single-poller статус; никаких рестартов/promote без отдельного owner approval.
2. Четыре присутствующие кухонные HA-сущности **уже live-прочитаны** в DEV (1 ON / 3 OFF / 0 UNKNOWN); следующий шаг — подтверждение точного физического контура `light.kukhnia_svet` (Switch as X) через HA registry и независимое сопоставление без включений. После удаления двух несуществующих `light.*` уточнить судьбу `light.spalnia` в HA UI. Не выдавать устаревшие снимки 27/38 за текущий инвентарь.
3. Подготовить строго ограниченный, отдельно согласованный первый реальный тест нового света; никаких разрешений из одного только Telegram текста.
4. Завершить Gate B/C/D acceptance без новых инфраструктурных велосипедов (systemd, HA-MCP, Assist, ESPHome).
5. По состоянию GitHub API на 2026-10-13: 66 веток, 50 совпадающих по SHA merged PR head относительно DEV (только предварительные кандидаты на удаление), 3 открытых PR с базой `main`; ни одна ветка не удалялась. Сначала проверить permanent DEV/release refs и защиту, затем чистить только повторно проверенные временные головы PR. Поддерживать короткий handoff и безопасные CI-правила документации.

[Активный TODO](TODO.md) · [Короткий HANDOFF](development/HANDOFF.md) · [Навигация](README.md).

## 6. Документы и подтверждения

[Индекс](README.md) · [Правила агента](../AGENTS.md) · [Карта проекта](PROJECT-MAP.md) · [История/журнал](WORKLOG.md) · [Аудит 71 Markdown-файла](DOCUMENTATION-AUDIT-2026-10-13.md) · [Чтение 19 кандидатов](V3-NEW-LIGHTS-REAL-READ-2026-10-12.md).

**Правило обновления:** после стабильного milestone обновлять здесь только фактически подтверждённые пункты вместе с датой/источником; подробные события — в WORKLOG/архиве. Не выдавать GitHub SHA за установленный Pi SHA.
