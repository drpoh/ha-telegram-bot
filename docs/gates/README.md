# Gates — карта приёмки

Текущие краткие статусы **только** в [CURRENT-STATE](../CURRENT-STATE.md#3-gates). Ссылки ниже — подробные исторические критерии и результаты; статусы из старых текстов нельзя считать текущей приёмкой.

| Gate | Подробности | Что ещё проверять |
| --- | --- | --- |
| A / MVP | [V3 MVP acceptance](../V3-MVP-OPERATIONAL-ACCEPTANCE.md) | Отличать прошлую приёмку от текущего runtime |
| B / trusted action | [Gate B acceptance](../GATE-B-ACCEPTANCE.md), [решения](../GATE-B-PILOT-DECISIONS.md), [light release](../V3-LIGHTS-RELEASE-GATE-2026-10-12.md) | Device/area identity, approved execution and real HA verification |
| C / fault isolation | [Stage audit](../V3-HISTORY-STAGE-AUDIT-2026-10-12.md), [общая стратегия](../home-agent-v3-strategy.md) | Отдельная реальная fault/recovery проверка, не mock |
| D / operating resilience | [Operations](../V3-OPERATIONS.md), [Gate D related review](../REVIEW-2026-10-09.md) | Active systemd SHA и повторная recovery проверка |
| E / voice | [Voice/Assist architecture](../ARCHITECTURE.md), [стратегия](../home-agent-v3-strategy.md) | Реальный голосовой цикл и подтверждение |

Ни один Gate не может расширять физические действия из одного только CI или read-only опроса.
