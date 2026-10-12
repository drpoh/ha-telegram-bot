# V3 /light + /lights immutable candidate gate — 2026-10-12

This is a **PREPARATION** checklist, not permission to restart a service. Current live V3 is immutable `c6a9812`; previous known-good release `97343fa` is retained. Separate V2 system service and Gate D timers are independent and must not be touched.

## Mandatory Raspberry Pi evidence before candidate

```bash
cd ~/projects/rs-home-ai-dev
git status -sb
git fetch origin feature/v3-home-agent
git merge --ff-only origin/feature/v3-home-agent
npm test
systemctl is-active ha-telegram-bot.service
systemctl --user is-active rs-home-ai-v3.service
systemctl --user show rs-home-ai-v3.service -p ExecStart -p WorkingDirectory -p ActiveState --no-pager
systemctl --user show rs-gate-d-health.service rs-gate-d-alerts.service -p Id -p Result -p ExecMainStatus --no-pager
systemctl --user list-timers --all --no-pager | grep rs-gate-d
```

Stop if `git status` shows local modifications or `npm test` fails. Do **not** equate an enabled timer with a successful last execution; inspect its result and timestamps.

## Scope / read-only acceptance

Review `src/home/light-overview.mjs` and `src/pilot/kitchen-mcp-client.mjs`. Seven exact `ha_get_state` IDs: `light.tambur_svet_l1`, `light.koridor`, `light.koridor_2`, `light.koridor_1_etazh`, `light.koridor_1_etazh_2`, `light.koridor_spot`, `light.koridor_spot_2`. Sensor IDs for sauna remain unchanged. `ha_call_service` **must remain limited to** `light.tambur_svet_l1`, `light.turn_on` / `light.turn_off` with the existing confirmation/journal/policy.

Verify these seven entities against actual trusted HA-MCP read-only responses; no write calls, real switch tests or second Telegram bot process in preflight. `/lights` describes **only seven selected lights**, not the whole house. Unknown/mismatched states are unknown, not off.

## Packaging (no production changes)

After full Pi test success and exact ID/scope review:

```bash
cd ~/projects/rs-home-ai-dev
bash scripts/prepare-v3-release-candidate.sh
```

The script enforces clean canonical branch and exact origin HEAD, archives source at one immutable commit, installs locked prod dependencies and checks V3 pilot, sauna, lamp and overview JS syntax. It refuses an existing target; leaves systemd, credentials, SQLite claims and the old release alone.

## Explicit production switch approval required

Before promotion, record actual unit `FragmentPath`, `ExecStart`, `WorkingDirectory` and backup; preserve `c6a9812` as rollback. Avoid concurrent Telegram pollers and treat Gate B/C wider actions as unapproved. Ask owner explicitly to approve switching from `c6a9812` to the **exact candidate SHA**. After switch, smoke-test `/status`, `/sauna`, `/light`, `/lights`, and cancel→confirm without physical write; rollback at once on regression. Do not promote merely because CI passes.
