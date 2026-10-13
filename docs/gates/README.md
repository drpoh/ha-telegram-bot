# Gates — критерии и доказательства

> **Единственный источник текущего статуса:** [CURRENT-STATE](../CURRENT-STATE.md#3-gates). Файлы ниже описывают приемочные критерии и ссылки на доказательства; не являются самостоятельным решением о допуске к производственным действиям.

| Gate | Краткий план приёмки |
| --- | --- |
| B — trusted actions | [GATE-B.md](GATE-B.md) — entity/device/area, Policy, consent, ограниченное реальное переключение |
| C — failure isolation | [GATE-C.md](GATE-C.md) — fail-closed, сеть/LLM/MCP/replay/recovery |
| D — operations | [GATE-D.md](GATE-D.md) — systemd ExecStart, изоляция V2/V3, rollback и восстановление |
| E — voice | [GATE-E.md](GATE-E.md) — Assist/ESPHome/Whisper/Piper, Policy и голосовое подтверждение |
| A / исторический MVP | [V3 MVP acceptance](../V3-MVP-OPERATIONAL-ACCEPTANCE.md) |

Старые датированные отчёты `docs/GATE-*.md`, `docs/V3-*.md` сохранены по исходным путям. Никогда не трактовать давние результаты тестов как сегодняшнее подтверждение production или право управлять новой сущностью.
