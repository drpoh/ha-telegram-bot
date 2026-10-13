# Gate B — доверенное управление Home Assistant

**Текущий вердикт и дата проверки — только в [CURRENT-STATE](../CURRENT-STATE.md#3-gates).** Этот документ описывает критерии, доказательства и границы; изменение исходников не является допуском к физическим действиям.

## Требуется для приёмки

1. Аутентифицированный владелец и исходное намерение; подтверждение привязано к **точному** действию и истекает по времени.
2. Доверенный HA device/area registry и независимая проверка соответствия `entity_id` конкретному устройству/контуру.
3. Утверждённый локальный policy allowlist: нет самовыданных прав из LLM, истории или текста Telegram.
4. Безопасный путь `OBSERVE → REASON → POLICY → ACT → VERIFY → LEARN`, журнал решений, защита от повторов/гонок/отмен.
5. Отдельное одобрение release и ограниченного реального ON/OFF; подтверждение после фактического переключения, возможность rollback.
6. Сохранение режима `DENY` по умолчанию; десять недоступных кандидатов не считать выключенными и не регистрировать автоматически.

## Доказательства и границы

- DEV offline тесты и опциональный `/newlight` код проверяют правила, **не** работающий production.
- Ручной Pi `v3-new-lights-readonly-preflight.mjs` прочитал 19 кандидатов; доступность девяти `light.*` не устанавливает их физическую идентичность.
- Ручное чтение всех доступных для HA-MCP поиска `light.*` (включая скрытые) вернуло 38 ID: **5 ON / 16 OFF / 17 UNKNOWN**. Три UNKNOWN имеют `light.browser_mod_`-префикс (потенциальные UI-сущности), 14 других UNKNOWN остаются неразобранными. Это проверенная полнота одного ответа `ha_search`, **не** доказательство, что все 38 — физические светильники или что disabled entities входят в state inventory. Для физических разрешений ничего не изменилось.
- Существовавший узкий пилот `light.tambur_svet_l1` **не** разрешает остальные контуры.
- Начальная проверка: ручной Pi HA-MCP read-only для `light.kukhnia_svet` завершился `complete`, `state=off`, `physical_identity=unverified` (владелец, 2026-10-13). Это не выполнение Gate B и не допуск к записи.
- Для следующего шага используйте **HA Settings → Devices & services → Entities**: найдите exact `light.kukhnia_svet`, проверьте **integration/platform**, **связанное Device**, **Area** (отдельно для entity и device), а также нет ли группы, виртуального alias или дублирующей сущности. Наличие только friendly name недостаточно. Если linked device отсутствует, не придумывать device_id.
- Физическую идентичность подтверждать отдельно по известной схеме/маркировке/наблюдению владельца; **без ручного ON/OFF в рамках этой проверки**. Не переносить данные registry напрямую в исполняемый allowlist.

### Быстрая проверка связи Entity → Device → Area без новых API-ключей

Через **Home Assistant → Инструменты разработчика → Шаблон (Template)**, вручную, только чтение; использовать стандартные функции HA, не создавать интеграции и не менять сущности:

```jinja
{% set ids = [
  'light.kukhnia_led_niz_l1',
  'light.kukhnia_led_niz_l2',
  'light.kukhnia_svet',
  'light.led_kukhnia'
] %}
{% for id in ids %}
{{ id }} | state={{ states(id) }} | area={{ area_name(id) or 'none' }} | device={{ device_name(id) or 'none' }} | model={{ device_attr(id, 'model') or 'none' }}
{% endfor %}
```

Это **только сведения HA** о присутствующих состояниях, area и связанном device. Отсутствие device/area и совпадающие friendly names требуют ручного анализа в **Settings → Devices & services → Entities/Devices**, включая название интеграции. Disabled entries могут не попасть в state inventory, а group/template entity может не иметь физического device. Уровень Gate B не повышать только по выводу шаблона; не раскрывать serial/identifiers и не отправлять полный registry в публичный GitHub.

### Уточнение из HA Template (владелец, 2026-10-13)

В более позднем снимке `states.light` находится **38 сущностей: 9 ON, 13 OFF, 16 UNKNOWN/unavailable**. Предыдущий поиск HA-MCP дал в другой момент **5/16/17**. Это разные моменты наблюдения, не несовпадение реестра.

Среди текущих **16 UNKNOWN**:
- 2 `browser_mod` screen — не физические контуры управления;
- **11 потенциально производных/дублирующих световых сущностей**: в `device_attr(entity_id,'model')` после `|` указана другая `light.*` сущность. Это **не доказанная** ссылка в HA entity registry и не достоверная принадлежность к `switch_as_x`;
- **3 без явного `| light.*`**: `light.sonoff_1000d78a79` (device model D1R1), `light.spalnia` и `light.svet_kukhni` (device не найден в Template) — требуют отдельного изучения.

Предположительные связи для проверки в HA UI, а не для автоматического удаления или управления:

| Недоступный alias (кандидат) | Ссылка в model на другой HA ID |
| --- | --- |
| `light.kukhnia_led_niz_l1_2` | `light.kukhnia_led_niz_l1` |
| `light.kukhnia_led_niz_l2_2` | `light.kukhnia_led_niz_l2` |
| `light.kukhnia_svet_3` | `light.kukhnia_svet` |
| `light.podsvetka_kukhnia` | `light.led_kukhnia` |
| `light.liustra` | `light.vykliuchatel_z_gostinaia_l2` |
| `light.podsvetka` | `light.vykliuchatel_z_gostinaia_l1` |
| `light.podsvetka_2` | `light.vykliuchatel_z_gostinaia_l3` |
| `light.svet` | `light.kukhnia_svet_2` **нет в `states.light`** последнего снимка |
| `light.tambur_svet_l1_2` | `light.tambur_svet_l1` |
| `light.tambur_svet_l2_2` | `light.tambur_svet_l2` |
| `light.ves_svet_2` | `light.ves_svet` (whole-house group) |

Другие нефизические цели (не допускать к массовому световому действию): 4 `light.browser_mod_*` в последнем Template, status LED устройств Louder/Atom Echo/Sauna_TE, виртуальная whole-house группа `light.ves_svet`. Наличие комнатной area/device ещё **не** доказывает конкретный физический контур. `light.dukhovka_light` и Bambu chamber light — устройства, но не автоматически комнатное освещение.

**Проверить вероятные Switch as X через стандартные HA функции, без нового MCP-протокола и без каких-либо записей:**

```jinja
{% set ids = integration_entities('switch_as_x') %}
Switch-as-X total entries: {{ ids | count }}
{% for id in ids | sort %}
{% if id.startswith('light.') %}
{{ id }} | state={{ states(id) }} | device={{ device_name(id) or '-' }} | model={{ device_attr(id, 'model') or '-' }}
{% endif %}
{% endfor %}
```

`integration_entities('switch_as_x')` читает список сущностей зарегистрированной интеграции и **не** является прямым доказательством физического устройства. Если список пустой либо не включает подозрительные `light.*`, проверить их **Settings → Devices & services → Entities** (Integration, Device, Area) и **Helpers**, не переименовывать и не удалять. Последующий список распознанных физических устройств должен быть отдельным человеческим review-документом, не permission allowlist. Не публиковать содержимое приватных registry identifiers/serials в GitHub.

### Последний HA Template после обновления — 27 сущностей (2026-10-13)

Владелец получил в более позднем снимке **27** `states.light`: **9 ON / 13 OFF / 5 UNKNOWN**. По сравнению с предыдущими 38 ID **исчезли 10 недоступных дополнительных связанных представлений** и один прежний Browser Mod screen. Это изменение относится к инвентарю `states.light`; оно **не доказывает**, что все зависимости уже исправлены, что интеграции здоровы или что отсутствующие ID удалены из entity registry.

`integration_entities('switch_as_x')` независимо показало ровно **7** текущих световых ID:

- `light.koridor`, `light.koridor_1_etazh`, `light.koridor_spot`
- `light.kukhnia_svet`
- `light.vykliuchatel_z_gostinaia_l1`, `light.vykliuchatel_z_gostinaia_l2`, `light.vykliuchatel_z_gostinaia_l3`

Это проверенное происхождение из **Switch as X**, а не доказательство семи ламп или соответствия конкретной нагрузке. Основные каналы могут представлять выключатели; физическая привязка сохраняет статус **unverified**. Не переносить перечисленные ID в write allowlist автоматически.

**Пять UNKNOWN:** `light.browser_mod_635bb8a2_ae2afdad_screen` (UI), `light.ves_svet_2` (связанный с whole-house group), `light.sonoff_1000d78a79` (device D1R1), `light.spalnia` и `light.svet_kukhni` (device не показан в Template). Последние три требуют отдельной проверки наличия интеграции/registry и физических контуров. `unavailable` не доказывает отсутствие питания.

Для **read-only ответов по кухне** текущий операторский инвентарь из четырех присутствующих ID: `light.kukhnia_led_niz_l1`, `light.kukhnia_led_niz_l2`, `light.kukhnia_svet`, `light.led_kukhnia`. Оба LED channel находятся под одним устройством `2 channel dimmer` — не считать их двумя разными физическими модулями, не утверждать, что это полный свет комнаты, и не давать автоматически права. Исторический список 19 кандидатов оставлен как документ предыдущего наблюдения.

### Точное определение исходного выключателя для `light.kukhnia_svet` (без включений)

По HA Template от владельца `light.kukhnia_svet` находится в комнате **Кухня**, device **Кухня свет**, model **Wall switch module**, а `integration_entities('switch_as_x')` подтверждает принадлежность к **Switch as X**. Эти поля **не устанавливают**, какой конкретно физический контур управляется исходным switch.

Самый быстрый безопасный путь через готовый UI Home Assistant:

1. **Settings → Devices & services → Helpers**: найдите helper, создавший `light.kukhnia_svet` (Switch as X / «Change device type of a switch»), и **просмотрите** исходный `switch.*` entity. Ничего не редактируйте.
2. **Settings → Devices & services → Entities**: найдите **точно** `light.kukhnia_svet` и исходный switch entity, сверьте Integration, Device и Area. Убедитесь, что helper не указывает на группу, другой helper либо устаревший entity.
3. Сопоставьте исходный выключатель с известным физическим контуром по маркировке/схеме или подтверждённому наблюдению владельца. **Не посылайте `turn_on`/`turn_off` и не повышайте write scope** на основании только helper/registry.

Для `light.spalnia` (ранее `unavailable`, HA Template не показывал device) отдельно проверить точный Entity Registry и платформу. Два других старых UNKNOWN (`light.svet_kukhni`, `light.sonoff_1000d78a79`) **удалены владельцем как несуществующие** и не должны фигурировать как актуальные неисправные устройства. Полный инвентарь после удаления ещё не проверялся; ранее подсчитанные 27 и 38 — исторические снимки.

## Продолжение

[Первичные критерии Gate B](../GATE-B-ACCEPTANCE.md) · [Решения](../GATE-B-PILOT-DECISIONS.md) · [История физического допуска](../V3-LIGHTS-RELEASE-GATE-2026-10-12.md) · [19 read-only кандидатов](../V3-NEW-LIGHTS-REAL-READ-2026-10-12.md).
