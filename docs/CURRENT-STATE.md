# RS Home AI V3 — текущее состояние

> **Единственная актуальная сводка проекта.** Данные об устройствах — снимок на момент проверки, не текущие состояния. Исторические записи в других документах не обновляют эту сводку автоматически.
>
> Проверено владельцем: **2026-10-13** · Raspberry Pi DEV `feature/v3-home-agent` на `5380a75`, `npm test`: **202 тестовых файла, 737 проверок, 0 ошибок**, `DOCS_CHECK=PASS files=15 links=131` (вывод пользователя). Это подтверждает Pi DEV source/tests, **не production deployment**. GitHub PR #106–#108 включены в эту версию. Новый read-only вывод владельца `systemctl --user show` подтверждает `ActiveState=active` и точный исполняемый путь `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`; `systemctl is-active ha-telegram-bot.service` → `active`. Имя папки **не** доказывает SHA содержимого релиза; рестарт/recovery и фактическое поведение runtime не тестировались.

## 1. Что подтверждено

| Возможность | Статус | Основание и границы |
| --- | --- | --- |
| Pi DEV исходники / тесты | ✅ Проверено | На `5380a75` пользователь запустил `npm test`: **202 файла, 737 проверок, 0 ошибок**; Markdown **15 файлов / 131 ссылка PASS**. Состояние `git status` и отдельный live read в этом выводе не показаны |
| HA-MCP чтение | ✅ Проверено на Pi | `READONLY_PREFLIGHT=PASS`, 2026-10-13: сауна 28 °C, порог 85 °C; 4 световые сущности — 1 ON / 3 OFF |
| Новые светильники: чтение | ⚠️ Частично | 19 проверены; **2 ON, 7 OFF, 10 unavailable**; `NEW_LIGHT_REVIEW=partial`; прочитанные сущности ≠ подтверждённые физические светильники |
| Новые светильники: включение/выключение | 🔒 Не разрешено | Код DEV не выдаёт нового физического допуска; требуются проверка идентичности, отдельное разрешение и release gate |
| Точечное чтение `light.kukhnia_svet` | ✅ Live HA-MCP read-only на Pi | Владелец запустил `v3-single-light-readonly-preflight.mjs` на DEV `5380a75`: **SINGLE_LIGHT_STATUS=complete**, **SINGLE_LIGHT_STATE=off**, **PHYSICAL_IDENTITY=unverified** (2026-10-13). Это снимок состояния HA, не проверка device/area/физического контура, не Telegram production и не разрешение управления |
| Естественные вопросы о кухонном свете | ⚠️ Только GitHub DEV, offline до проверки | Новый строго ограниченный путь для вопросов «Какой свет на кухне?» / «Что со светом на кухне?» читает только 7 заранее выбранных kitchen `light.*` через отдельный HA-MCP read-only клиент; не утверждает, что это все физические светильники, не разрешает переключения. Это ещё не развернуто и не протестировано на Pi |
| Telegram V3 / подтверждение | ⚠️ Runtime путь подтверждён; поведение не тестировалось | `systemctl --user show`: **active**, ExecStart указывает на `.../rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`. Предыдущее ограничение пилота `light.tambur_svet_l1` историческое; новый Telegram live-тест не проводился |
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

1. Сохранить подтверждённую systemd-привязку V3 `9dd5964`-named release и V2 `active`; отдельно проверить Git SHA содержимого и recovery/rollback read-only, не трогая runtime.
2. После успешного live `ha_get_state` сопоставить `light.kukhnia_svet` с HA entity registry, device, area, integration и конкретным физическим светильником. Проверить совпадения/виртуальные группы без переключения, затем остальные восемь отвечающих кандидатов.
3. Подготовить строго ограниченный, отдельно согласованный первый реальный тест нового света; никаких разрешений из одного только Telegram текста.
4. Завершить Gate B/C/D acceptance без новых инфраструктурных велосипедов (systemd, HA-MCP, Assist, ESPHome).
5. Поддерживать короткий handoff, список открытых задач и безопасные CI-правила документации.

[Активный TODO](TODO.md) · [Короткий HANDOFF](development/HANDOFF.md) · [Навигация](README.md).

## 6. Документы и подтверждения

[Индекс](README.md) · [Правила агента](../AGENTS.md) · [Карта проекта](PROJECT-MAP.md) · [История/журнал](WORKLOG.md) · [Аудит 71 Markdown-файла](DOCUMENTATION-AUDIT-2026-10-13.md) · [Чтение 19 кандидатов](V3-NEW-LIGHTS-REAL-READ-2026-10-12.md).

**Правило обновления:** после стабильного milestone обновлять здесь только фактически подтверждённые пункты вместе с датой/источником; подробные события — в WORKLOG/архиве. Не выдавать GitHub SHA за установленный Pi SHA.
