# Operator Pi observation — 2026-10-12, 19 new lights

Owner ran DEV fast-forward to `dd901a8` and explicit manual `v3-new-lights-readonly-preflight.mjs --readonly --operator-approved`. Script output: `NEW_LIGHT_REVIEW=partial`, `on=1`, `off=8`, `unknown=10`. These are point-in-time HA-MCP reads; no evidence of authorized physical writes, live bot expansion or physical circuit identity.

Observed **ON**: `light.vykliuchatel_z_gostinaia_l3`.
Observed **OFF**: `light.kukhnia_led_niz_l1`, `light.kukhnia_svet`, `light.led_kukhnia`, `light.vykliuchatel_z_gostinaia_l1`, `light.vykliuchatel_z_gostinaia_l2`, `light.sauna_led1`, `light.wled_gledopto`, `light.tambur_svet_l2`.
Unverified **unknown**: `light.kukhnia_led_niz_l1_2`, `light.kukhnia_led_niz_l2_2`, `light.kukhnia_svet_3`, `light.podsvetka_kukhnia`, `light.liustra`, `light.podsvetka`, `light.podsvetka_2`, `light.spalnia`, `light.sonoff_1000d78a79`, `light.tambur_svet_l2_2`.

"Unknown" intentionally merges HA unknown/unavailable, MCP tool errors and malformed/entity mismatch; **do not assume absent, broken or off**. Some ON/OFF entries could be virtual or duplicate circuits. The source snapshot is evidence only and must not be used as a fresh state cache in Telegram. Every `light.browser_mod*` excluded; sensors and `switch.*` unchanged. Production stays immutable `9dd5964`, including four-light read and tamboor-only confirmed physical writes.

Next: separately review physical identity, duplicates and area for the nine readable entries, then build a new *opt-in/dev-only* read-only scoped view. Diagnose unknown entries without widening production scope. Do not treat a point-in-time state snapshot as a live state.

## HA-Housekeeper review, 2026-10-12
[bertel2020/HA-Housekeeper](https://github.com/bertel2020/HA-Housekeeper) offers built-in HA registry/device/area dependency views, unavailable vs disabled/orphaned classification, and potential-duplicate hints. It requires HA Core >=2026.8; latest locally known Core is 2026.7.x, so do not install until version/compatibility and HA backup are checked. Its admin integration also supports confirmed destructive operations; do not connect it to pilot write authorities or enable cleanup. Reuse the concepts rather than embedding another registry system.

A source-only diagnostic improvement classifies explicit failed state reads into `mcp_error`, `identity_mismatch`, `unavailable`, `unknown`, `invalid_state`, and `read_error`, while retaining aggregate UNKNOWN and zero action authority. The previous 10 UNKNOWN responses remain **undiagnosed historically**; collecting reason codes requires a new owner-approved bounded live read after CI and DEV sync.

## Second real Pi test, 2026-10-12 (after PR #71)
The owner ran the operator-only read after updating Pi. HA-MCP connection succeeded. Counts: ON=2 OFF=7 UNKNOWN=10. Each of the 10 unknown candidates returned the exact reason `unavailable`; none were reported as identity_mismatch, MCP error, read_error, or invalid_state. The original `light.tambur_svet_l2` changed OFF to ON between snapshots and is not a duplicate of historical values. This is a fresh point-in-time observation, not a persistent live cache.

The previous overall `NEW_LIGHT_FAILURE_PHASE=connection` *might* have coincided with an HA reboot, but that has **not** been established by logs. The same exact ten entities being `unavailable` in both successful surveys suggests persistent device/integration issues or duplicate legacy entries, rather than the connection problem alone. Do not auto-enroll them, remove HA entities, or interpret unavailable as OFF. Check HA entity/device/integration registry using native HA UI or read-only tools before any future source or scope changes. Jules completed #60 as PR #69 but targeted old `main` with 439 files: leave unmerged until narrowed and rebased to `feature/v3-home-agent`.
