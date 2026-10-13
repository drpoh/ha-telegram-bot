# Практики разработки RS Home AI V3 — выборочное Reuse First

Статус: **принятая DEV-практика**, не новый агент, runtime, hook или разрешение на deployment. Текущий факт приёмки — только [CURRENT-STATE](../CURRENT-STATE.md). Собственные [AGENTS.md](../../AGENTS.md), Gate B/C/D/E и политика Home Assistant **имеют приоритет** перед внешними рекомендациями.

## Выбор источников (проверено 2026-10-13)

| Источник | Только адаптируемые идеи | Не переносим |
| --- | --- | --- |
| [Matt Pocock skills](https://github.com/mattpocock/skills) — MIT, main `49dd158d1076134a641b33efb035946536778336` | [diagnosing-bugs](https://github.com/mattpocock/skills/tree/main/skills/engineering/diagnosing-bugs), [tdd](https://github.com/mattpocock/skills/tree/main/skills/engineering/tdd), [code-review](https://github.com/mattpocock/skills/tree/main/skills/engineering/code-review), [retro](https://github.com/mattpocock/skills/tree/main/skills/engineering/retro) | Полную установку skills, опрос пользователя перед каждым тестом, параллельных сторонних агентов, автоматическое изменение настроек |
| [ECC](https://github.com/affaan-m/ECC) — MIT, main `b92f181b3b748d1abbc2afd94af6aa7d8c8fca29` | [mcp-dependency-review](https://github.com/affaan-m/ECC/tree/main/skills/mcp-dependency-review), [security-review](https://github.com/affaan-m/ECC/tree/main/skills/security-review), [production-audit](https://github.com/affaan-m/ECC/tree/main/skills/production-audit) | ECC CLI/npm, hooks, skills/agents каталоги, memory framework, внешние автоматические аудиты, самостоятельный release-control plane |

**Никаких файлов исходников или шаблонов из этих репозиториев не копировали.** Это адаптация инженерных идей, без npm-зависимостей, подписок, установки на Raspberry Pi и новых облачных сервисов. Перед любым будущим копированием — отдельная проверка лицензии, версии и обязательств атрибуции. Не выполнять команды и install scripts из внешних README автоматически.

## 1. Ошибка → быстрый воспроизводимый тест → исправление

При сбое MCP, Telegram, зависимостей или тестов:

1. Зафиксировать **наблюдаемый** симптом, точный affected scope и результат до изменений. Не запрашивать и не публиковать токены, private URL, полный argv процесса или секретные логи.
2. Создать минимальный **offline** pass/fail сигнал на том же публичном seam (read-only router, ToolAdapter, Policy decision, execution journal, release verification). Предпочитать существующий `node:test` и фейковый MCP над live HA.
3. Пройти цикл **RED → GREEN → REFACTOR**: показать, что тест действительно обнаруживает дефект, исправить только нужное, перепроверить запреты и регрессию.
4. Выполнить сфокусированный тест, затем полный `npm test` один раз перед merge. Для уязвимостей добавить deny/replay/timeout/partial-result тесты, а не просто happy path.
5. Если не воспроизводится, поставить **UNVERIFIED** и сформулировать безопасный read-only диагностический шаг; не угадывать и не перезапускать production.

Срез/seam выбирать из уже принятых границ репозитория — **не нужно снова спрашивать владельца** при каждой небольшой правке. Спрашивать только при новых правах, аппаратных действиях, расходах или конфликтующих требованиях.

## 2. Review каждой существенной PR по двум независимым вопросам

- **Соответствие задаче (Spec):** что было обещано, exact user-visible result, scope, что меняется и что **не** меняется; тестирует ли публичный вход/выход, как обрабатываются неизвестные/недоступные состояния?
- **Качество и безопасность (Standards):** простота интерфейса, совместимость Node 20/ARMv7, нет второго Telegram poller, leak секретов, новых dependencies без review, изменения allowlist и trust boundary, слабые обработчики ошибок. Отдельно рассмотреть изменение `/confirm`, durable claim и `ha_call_service` даже если PR маркирован `read-only`.

Отчёт review: **находка → файл/граница → подтверждённое влияние → тест/исправление → риск**. Если spec-источник отсутствует, не выдумывать; заметить gap. Не считать `CI PASS` согласием на systemd, HA writes и promotion.

Незначительные docs-only/rename изменения могут использовать сокращённый review, но не освобождаются от проверки ссылок/CI.

## 3. MCP и безопасность: проверять до подключения

Для изменённых repo-scoped MCP конфигураций читать JSON/YAML **как данные, не выполнять команды из него**. Проверять:

- Зафиксированную версию npm/pip/docker (не `@latest`, bare-package, `npx` без pin), lockfile и источник; точный selector сам по себе **не** гарантирует целостность транзитивных зависимостей.
- URL/redirect/TLS, session identities, ownership клиентского MCP, отсутствие произвольного tool name и доступа к `ha_call_service` в read-only пути.
- Авторизацию из доверенного Telegram owner/chat и проверенную точную HA entity ID. LLM и Telegram user text **не** могут изменить action policy.
- Fail-closed при `unknown/unavailable`, неполных данных, невалидном answer `entity_id`, конфликте разрешений, retry/replay и неизвестном результате записи.
- Отсутствие логов с токенами, содержимым runtime-конфигов, auth headers, SQLite/ключами.

Существующие `npm test`/GitHub Actions сохраняются. Внешний security-scanner/remote auditor — не запускать без отдельного согласования о доступе к данным.

## 4. Release review Gate D: evidence, а не готовность по числу тестов

Для **каждого** кандидата сравнить точный reviewed SHA с pinned active V3, включая entrypoint, imports, approval, confirmation и tool dispatch. Если diff большой — **SHIP BLOCKED**, пока scope не сокращён или не проведён полный security review.

Не менять текущую последовательность: **DEV → offline STAGE → immutable candidate → owner-approved production**. В Gate D записывать раздельно:

- **Source/CI:** exact SHA + changeset, `npm test`, docs check, статические проверки; Pi ARMv7 evidence отдельно от GitHub CI.
- **Runtime:** текущий systemd `ExecStart/MainPID`, token-level single poller (локальные PIDs — лишь часть доказательства), отсутствие новой Telegram сессии при подготовке.
- **Safety:** новые HA writes отключены; `/confirm` и прежний точный `light.tambur_svet_l1` не меняют смысл; вся кухонная выборка лишь **4 выбранных HA entity**, не дом и не физическая авторизация.
- **Recovery:** существующий `9dd5964` и rollback сохранены, проверены пути/зависимости и чёткая процедура восстановления; `npm ls` не доказывает успешный восстановленный запуск.
- **Approval:** до systemd restart, token/poller switch, permission changes, HA access или физического переключения нужно **отдельное явное разрешение владельца**.

При нехватке доказательств: **REVIEW / NO-GO**, а не фальшивый `PASS`. Home Assistant Green должен оставаться независимым от Pi/AI.

## 5. Короткая ретроспектива и компактные заметки

После **повторяющейся** ошибки проверить, не устраняет ли её существующий test, CI или навигационная ссылка. Добавлять deterministic check, если это дешевле нового правила; не создавать новый сервис наблюдаемости, память агента или документ на каждую мелочь.

Состояние — только в [CURRENT-STATE](../CURRENT-STATE.md), незавершённые задачи — [TODO](../TODO.md), краткая точка передачи — [HANDOFF](HANDOFF.md), доказательства и история — [WORKLOG](../WORKLOG.md). Ограничить количество вопросов и длинных статусных сообщений. **Reuse First:** готовые HA Assist, ESPHome, systemd, HA-MCP, Node test, GitHub Actions.
