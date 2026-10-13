# Документация RS Home AI

> **Начните с [CURRENT-STATE.md](CURRENT-STATE.md).** Только этот файл определяет актуальную сводку; прошлые тесты и даты в остальных файлах — свидетельства, а не подтверждение текущего состояния.

## Быстрый маршрут

| Цель | Читать |
| --- | --- |
| Что работает, что заблокировано и что дальше | [CURRENT-STATE.md](CURRENT-STATE.md) |
| Продолжить разработку в новом чате | [development/HANDOFF.md](development/HANDOFF.md) → [TODO.md](TODO.md) → [AGENTS.md](../AGENTS.md) |
| Разобраться с каталогами Pi, релизами и ветками | [PROJECT-MAP.md](PROJECT-MAP.md) → [PI-REPOSITORY-LAYOUT-PLAN.md](PI-REPOSITORY-LAYOUT-PLAN.md) |
| Узнать границы безопасности и принятую архитектуру | [home-agent-v3-strategy.md](home-agent-v3-strategy.md) → [ARCHITECTURE.md](ARCHITECTURE.md) → [ADR-HA-INDEPENDENCE.md](ADR-HA-INDEPENDENCE.md) |
| Установить / обслуживать | [INSTALL.md](INSTALL.md), [V3-OPERATIONS.md](V3-OPERATIONS.md), [BACKUP-RESTORE.md](BACKUP-RESTORE.md) |
| Проверить один из Gates | [GATE-B-ACCEPTANCE.md](GATE-B-ACCEPTANCE.md), [GATE-B-PROGRESS-CHECKPOINT.md](GATE-B-PROGRESS-CHECKPOINT.md), [V3-MVP-OPERATIONAL-ACCEPTANCE.md](V3-MVP-OPERATIONAL-ACCEPTANCE.md) |
| Увидеть историю решений | [WORKLOG.md](WORKLOG.md), [PROGRESS.md](PROGRESS.md), [документ-аудит](DOCUMENTATION-AUDIT-2026-10-13.md) |

## Разделы по назначению

- [Архитектура и ADR](architecture/README.md)
- [Оператор / Raspberry Pi / systemd](operator/README.md)
- [Разработка и короткий handoff](development/README.md)
- [Карта приёмки Gates](gates/README.md)

Разделы пока содержат **ссылки на существующие файлы**, без переименования путей и ломания истории. Инструмент `scripts/docs/check-active-markdown-links.mjs` проверяет активные документы и локальные ссылки без сетевых запросов; он запускается в offline CI.

## Ответственность файлов

- **CURRENT-STATE.md** — единственный обновляемый документ о состоянии DEV / STAGE / PROD и Gates. Факты сопровождаются датой проверки.
- **TODO.md** — только открытые задачи с приоритетами; закрытые milestones — в WORKLOG или архиве.
- **development/HANDOFF.md** — передача контекста в новый чат (≤150 строк), без истории и дублируемой таблицы статуса.
- **WORKLOG.md** — исторический подробный журнал; не использовать как источник текущих состояний.
- **CHAT-HANDOFF.md** — **старый исторический handoff**, оставлен по прежнему пути до безопасного перемещения на этапе 2.
- **AGENTS.md** — правила безопасности и разработки в корне репозитория.
- **ADR** — не удаляются и не переписываются задним числом.

## История и Gates

Датированные документы `REVIEW-*`, `V3-*-2026-10-*.md`, `GATE-*.md` и `PROGRESS.md` остаются на исходных путях до проверки ссылок/ссылочных контрактов на следующем этапе. Их старые выводы не являются новым разрешением на HA-записи или развёртывание.

## Порядок дальнейшей миграции

Этап 1: этот индекс, единый CURRENT-STATE, короткий HANDOFF, активный TODO. Этап 2: группировка после автоматической проверки ссылок и потребителей путей. Этап 3: архив и обзорные Gate B/C/D/E. Этап 4: автоматические проверки в CI. Никаких массовых перемещений и production-изменений.
