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

Никаких `restart`, `enable`, изменения unit или `git pull` в runtime по результатам этого документа.

## Исторические источники

[Операции](../V3-OPERATIONS.md) · [review 2026-10-09](../REVIEW-2026-10-09.md) · [план окружений](../ADR-DEV-STAGE-PROD.md) · [карта каталогов](../PROJECT-MAP.md).
