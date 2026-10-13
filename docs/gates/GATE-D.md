# Gate D — служба, перезапуск и восстановление

**Текущий статус — только в [CURRENT-STATE](../CURRENT-STATE.md#3-gates).** Исторические отчёты не подтверждают сегодняшнюю привязку `ExecStart`.

## Критерии

1. Только read-only подтвердить фактические `ExecStart`, состояние и закреплённые SHA V3/V2; не угадывать между `c6a9812` и `9dd5964`.
2. Проверить различие между DEV, offline STAGE, historical Gate D checkout и immutable production.
3. Проверить перезапуск по systemd, сохранение единственного Telegram poller, независимость HA Green и V2, доступность rollback.
4. Контролировать целостность артефактов/конфигурации, восстановление после сбоя, уведомления и доступность логов без чувствительных данных.
5. Повторный живой тест только по явному отдельному плану с восстановлением; наличие прошлых reboot/SIGKILL логов не освобождает от свежего evidence.

## Безопасная read-only проверка

```sh
systemctl --user show rs-home-ai-v3.service -p LoadState -p ActiveState -p ExecStart
systemctl is-active ha-telegram-bot.service
systemctl --user is-active rs-home-ai-v3.service
```

**Свидетельство 2026-10-13:** оператор подтвердил `ActiveState=active`; `ExecStart` V3 указывает на `/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964/src/pilot/telegram-readonly.mjs`; `ha-telegram-bot.service` → `active`. Это доказывает исполняемый путь/состояние systemd при проверке, **не** проверяет Git SHA файлов, единичность poller, API и восстановление. Итоговый Gate D остаётся частичным.

Никаких `restart`, `enable`, изменения unit или `git pull` в runtime по результатам этого документа.

## Следующий операционный шаг: проверка источника pinned release только чтением

Реальный live HA-MCP preflight четырёх естественных вопросов пройден на **Pi DEV** 2026-10-13 (`TELEGRAM_QUESTIONS_READONLY=PASS`; `npm test` 209/766/0). Это **не** доказывает, что этот код работает в Telegram production. Перед любым release/prod-изменением оператор вручную проверяет:

```bash
# Запуск от обычного пользователя drpoh; не меняет systemd, файлы и HA.
systemctl --user show rs-home-ai-v3.service \
  -p ActiveState -p MainPID -p ExecStart --no-pager
systemctl show ha-telegram-bot.service \
  -p ActiveState -p MainPID -p ExecStart --no-pager

dev=/home/drpoh/projects/rs-home-ai-dev
release=/home/drpoh/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964

if [ -d "$release" ] && [ ! -L "$release" ] &&
   [ -f "$release/RELEASE_COMMIT" ]; then
  declared="$(head -n 1 "$release/RELEASE_COMMIT")"
  if [[ "$declared" =~ ^[0-9a-f]{40}$ ]] &&
     git -C "$dev" cat-file -e "$declared^{commit}" 2>/dev/null; then
    echo "RELEASE_DECLARED_COMMIT=$declared"
    # tar -d compares the tracked source archive with the on-disk release,
    # without writing files. Extra node_modules/RELEASE_COMMIT are not checked.
    if (set -o pipefail; git -C "$dev" archive --format=tar "$declared" |
        tar --compare -f - -C "$release" >/dev/null 2>&1); then
      echo "RELEASE_TRACKED_SOURCE_MATCH=PASS"
    else
      echo "RELEASE_TRACKED_SOURCE_MATCH=FAIL_OR_UNVERIFIED"
    fi
  else
    echo "RELEASE_DECLARED_COMMIT=UNVERIFIED"
  fi
else
  echo "RELEASE_PATH_OR_MARKER=UNVERIFIED"
fi

for old in \
  /home/drpoh/projects/rs-home-ai-v3-release-c6a9812 \
  /home/drpoh/projects/rs-home-ai-v3-release-97343fa; do
  if [ -d "$old" ] && [ ! -L "$old" ]; then
    echo "ROLLBACK_DIRECTORY_PRESENT=$(basename "$old")"
  else
    echo "ROLLBACK_DIRECTORY_MISSING_OR_LINK=$(basename "$old")"
  fi
done
```

Запуск блока только читает Git objects, release-файлы и метаданные systemd; **не запускает Telegram, `npm install`, restart, HA-MCP, `ha_call_service` и не создаёт или переключает release**. Команды исполняются вручную без `exit 1`, чтобы ошибка не разрывала SSH. `RELEASE_TRACKED_SOURCE_MATCH=PASS` относится лишь к отслеживаемым Git source-файлам, а **не** к `node_modules`, приватным config/credentials, фактически загруженным в память процессам и отсутствию второго poller. Совпадение одного `RELEASE_COMMIT` без tar-compare не является доказательством целостности. Вывод `ExecStart` перед пересылкой следует проверить на наличие неожиданных секретных аргументов.

Если `ExecStart` указывает на другой путь, отсутствует `RELEASE_COMMIT`, `git archive`/compare выдаёт FAIL либо нет rollback — **Gate D остаётся открытым**, никаких автоматических изменений сервисов. После read-only evidence отдельно проверить реальные poller/rollback/Telegram API через operator-approved release plan, а не выдавать systemd `active` за end-to-end PASS.

## Исторические источники

[Операции](../V3-OPERATIONS.md) · [review 2026-10-09](../REVIEW-2026-10-09.md) · [план окружений](../ADR-DEV-STAGE-PROD.md) · [карта каталогов](../PROJECT-MAP.md).
