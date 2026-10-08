# Lighting commissioning: separate Home Assistant dashboard

Prototype: `dashboards/lighting-commissioning.yaml`. Dedicated independent dashboard; existing Home/System/dashboard storage files must not be altered.

Current stage: read-only discovery text and a native Entities card (which **does have manual toggles**). Do not treat that card as non-interactive. No blink/flash or AI grants are implemented. It presents dynamic group membership, inventory questions, and entity states.

## How to install after operator review
In Home Assistant, Settings → Dashboards → Add dashboard → New dashboard; title «Регистрация освещения», URL `lighting-commissioning`, admin-only. Open the new dashboard, edit, open raw configuration editor, paste the YAML from `dashboards/lighting-commissioning.yaml`, save. Existing dashboards remain untouched.

Never directly overwrite `/config/.storage/lovelace*` or require HA restart. Confirm browser rendering, template updates and entity availability before treating as ready. Physical identify controls are a separate gated phase and will not be added without device-specific safety review.

## Identification plan (offline prototype)

Pure offline candidate `src/commissioning/light-identify-plan.mjs` plans 2-second toggles for `light.koridor_2` up to 10 seconds, including a final best-effort restore instruction. It never executes a service call, has no timer or stop controller, and is not embedded in the dashboard. A real executor requires operator consent, verified capabilities, exclusive locking, cancellation and failure-safe restoration. Full isolated regression: 75 files, 327 passing assertions, 0 failures.
