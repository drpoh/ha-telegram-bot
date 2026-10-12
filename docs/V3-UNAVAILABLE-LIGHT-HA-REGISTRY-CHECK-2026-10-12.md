# Owner diagnostic — 10 unavailable lighting entities

Latest operator Pi read-only result (2026-10-12): 19 new candidates, ON 1, OFF 8, **10 unavailable**. Room summary worked. All `light.browser_mod*` excluded. Do not treat unavailable as OFF; no HA deletion or permission widening.

To classify these 10 using **built-in Home Assistant Template** without installing Housekeeper, open **Developer Tools → Template**, paste the Jinja below, and return the output. It requests current state, assigned area, linked device presence and model/manufacturer only. It does not request attributes, credentials, addresses, automation contents, or any action:

```jinja2
{% set ids = [
 'light.kukhnia_led_niz_l1_2',
 'light.kukhnia_led_niz_l2_2',
 'light.kukhnia_svet_3',
 'light.podsvetka_kukhnia',
 'light.liustra',
 'light.podsvetka',
 'light.podsvetka_2',
 'light.spalnia',
 'light.sonoff_1000d78a79',
 'light.tambur_svet_l2_2'
] %}
{% for e in ids %}
{% set d = device_id(e) %}
{{ e }} | state={{ states(e) }} | area={{ area_name(e) or 'Без комнаты' }} | device={{ 'linked' if d else 'none' }} | manufacturer={{ device_attr(d,'manufacturer') if d else '-' }} | model={{ device_attr(d,'model') if d else '-' }}
{% endfor %}
```

A `linked` device is **not** proof of a physical fixture or working integration; `none` is **not** proof the light was removed (some template/group entities lack a device). Empty manufacturer/model is normal for many integrations. Verify source/integration and physical identity separately in HA entity settings before inclusion in production. Never modify Home Assistant entity, device or area registries automatically.

Scope of this checkpoint: **only new light candidates**; sensors, `switch.*`, and `light.browser_mod*` deferred. Existing 4-light V3 pilot reads, sauna reads and tamboor-only confirmed writes remain unchanged.
