# Lighting commissioning: separate Home Assistant dashboard

Prototype: `dashboards/lighting-commissioning.yaml`. Dedicated independent dashboard; existing Home/System/dashboard storage files must not be altered.

Current stage: read-only discovery text and a native Entities card (which **does have manual toggles**). Do not treat that card as non-interactive. No blink/flash or AI grants are implemented. It presents dynamic group membership, inventory questions, and entity states.

## How to install after operator review
In Home Assistant, Settings → Dashboards → Add dashboard → New dashboard; title «Регистрация освещения», URL `lighting-commissioning`, admin-only. Open the new dashboard, edit, open raw configuration editor, paste the YAML from `dashboards/lighting-commissioning.yaml`, save. Existing dashboards remain untouched.

Never directly overwrite `/config/.storage/lovelace*` or require HA restart. Confirm browser rendering, template updates and entity availability before treating as ready. Physical identify controls are a separate gated phase and will not be added without device-specific safety review.

## Identification plan (offline prototype)

Pure offline candidate `src/commissioning/light-identify-plan.mjs` plans 2-second toggles for `light.koridor_2` up to 10 seconds, including a final best-effort restore instruction. It never executes a service call, has no timer or stop controller, and is not embedded in the dashboard. A real executor requires operator consent, verified capabilities, exclusive locking, cancellation and failure-safe restoration. Full isolated regression: 75 files, 327 passing assertions, 0 failures.

## Offline identification state machine

Added `src/commissioning/light-identify-controller.mjs`, a pure state machine with no HA client, no actual timers, no auto-executor and no production authorization. It models one exclusive pending identification session for `light.koridor_2`, explicit operator approval parameter, 2-second alternating command descriptions, maximum 10-second deadline, fail/stop transitions requiring a restoration instruction, and no catch-up toggles after scheduling stalls. Restoration is **best effort only**; real timers, authenticated controls, device readback and power-failure recovery are NOT implemented. Existing dashboard remains unchanged. Full isolated suite: 76 test files, 329 passing assertions, 0 failed.

## Installed static demonstration UI — 2026-10-08

On HA Green, deployed the standalone **no-service-call** browser simulation to `/config/www/lighting-commissioning/index.html`. SHA-256 matched repository file `4ffce813088ea16eb2c1fb5f90f1c7cca478c3c08f095a9f6c716884f1f6e0eb`. It shows Identify (demo), Stop, and Confirm with room and description inputs. It uses only local browser state and localStorage, does not contact Home Assistant or approve an AI policy, and is intentionally not a genuine physical identification. Real identify remains blocked.

The dashboard YAML includes an iframe card to `/local/lighting-commissioning/index.html`. The existing live storage-mode dashboard was **not modified**; the owner must add that iframe card through the dashboard editor and verify it displays. No HA restart is necessary. No other files under `/config` were altered.
