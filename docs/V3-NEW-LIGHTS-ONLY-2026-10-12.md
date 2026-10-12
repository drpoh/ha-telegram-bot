# New light-only inventory checkpoint — 2026-10-12

Owner instructed: ignore **all** `light.browser_mod*` and focus **only** on additional `light.*` devices at this stage. No new sensors, switches or general domains should be enrolled in the V3 pilot.

The owner-supplied Home Assistant Template export contains 38 `light.*` entries. Four are already in production read-only overview: `light.tambur_svet_l1`, `light.koridor`, `light.koridor_1_etazh`, `light.koridor_spot`. Four `light.browser_mod*` display/screen entries are **excluded in full**, including the sauna panel.

`src/home/new-light-candidates.mjs` is a source-only candidate inventory (19 additional IDs) sorted across kitchen, living room, bedroom, corridor, sauna and entrance based on owner export labels. These are **unverified HA entities**, not verified physical fixtures. No new HA reads/writes are authorized simply by recording them. Existing MCP client still allows only four light entities plus two sauna sensors for reads, and confirmed tamboor-only writes. No production/runtime/poller change.

The following source entries were intentionally deferred from the new-candidate list:
- `light.kukhnia_led_niz_l2`: friendly name marks it "не используется".
- `light.louder_esp32_s3_louder_esp32_s3_led`, `light.sauna_m5stack_echo_status_led`, `light.sauna_sauna_te_sauna_status_led`: device indicators.
- `light.ves_svet`, `light.ves_svet_2`: overlapping whole-home groups.
- `light.a1_03900d5b1812713_chamber_light`, `light.dukhovka_light`: equipment/appliance lights, not general room lighting.
- `light.svet`, `light.svet_kukhni`, `light.tambur_svet_l1_2`: potential aliases or duplicate circuits; inspect exact device/entity source before adding. All source IDs remain in export and no HA entity is disabled or deleted.

Next gate: read-only availability and identity/area verification for 19 candidates using official HA entity/device/area registries or bounded operator preflight, establish physical versus virtual/duplicate identity, then build the expanded view in DEV and test unknown handling. Owner must separately authorize any additional physical writes. Never automatically copy the entire HA list into write policy.

## Operator-only read-only diagnostic (source PR pending)
The separate script `scripts/manual/v3-new-lights-readonly-preflight.mjs` explicitly requires `--readonly --operator-approved`, connects to the already reviewed HA-MCP LAN endpoint, sends only `ha_get_state` for the 19 declared candidate IDs, and prints bounded entity ID + state without raw MCP contents. It never modifies the running pilot's MCP allowlist, issues a service call or launches a Telegram poller. The owner may decide whether to run it after Pi DEV CI-gated sync; it is **not an automatic action**. Partial/unavailable results require further review. Real source, physical circuit, duplicates and precise room remain unverified even when state reads complete.
