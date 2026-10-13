# Оператор / Raspberry Pi / systemd

Этот раздел предназначен для безопасных действий на Pi. **Ссылки ведут на существующие документы; ничего не переносилось**.

- [Карта каталогов, DEV и закреплённых runtime](../PROJECT-MAP.md)
- [План владения каталогами Pi](../PI-REPOSITORY-LAYOUT-PLAN.md)
- [Эксплуатация V3](../V3-OPERATIONS.md)
- [Установка](../INSTALL.md)
- [Резервное копирование и восстановление](../BACKUP-RESTORE.md)
- [Ручные проверки на Pi](../../scripts/manual/README.md)
- [DEV/STAGE/PROD и release gate](../V3-NEXT-STAGE-DEV-STAGE-PROD.md)
- [Действия по безопасности и релизам](../V3-LIGHTS-RELEASE-GATE-2026-10-12.md)

Проверяйте текущий `ExecStart` через systemd **перед** любым изменением runtime. Никогда не совмещайте два Telegram poller и не меняйте Home Assistant Green ради реорганизации документов. [Текущий статус](../CURRENT-STATE.md).
