# V3 read-only light MVP — immutable production release gate (2026-10-12)

**Preparation only; NO permission to deploy.** GitHub code is not the running bot. Last owner-confirmed V3 production: immutable `c6a9812`; previous rollback: `97343fa`. V2 and Gate D are independent and must remain untouched.

## Scope accepted so far
- Latest owner-confirmed Pi live read-only preflight: `READONLY_PREFLIGHT=PASS`, sauna and tamboor complete; selected four lights: one on, three off, none unknown. This preflight ran before the newest PR #50/#51 source changes; repeat after Pi DEV sync.
- **Exactly four scoped HA `light.*` entities:** `light.tambur_svet_l1`, `light.koridor`, `light.koridor_1_etazh`, `light.koridor_spot`. The deleted `light.koridor_2`, `light.koridor_1_etazh_2`, `light.koridor_spot_2` are NOT to be queried. Four HA entities are not proof of four physical fixtures or whole-house coverage.
- Read-only Telegram routes: `/sauna`, `/light`, `/lights` and the currently recognized exact Russian questions. Existing tamboor-only write pilot, private-chat restriction, confirmation/policy/journal remain unchanged. Do not grant writes to corridor lights.

## Pi DEV and immutable candidate checks — no production changes
Read-only inspection first (do not paste secrets or private URLs):

```bash
cd /home/drpoh/projects/rs-home-ai-dev
git status --short --branch
git rev-parse HEAD
git ls-remote origin refs/heads/feature/v3-home-agent
cat ~/.local/state/rs-home-ai-dev-automation/latest.txt
systemctl --user status rs-home-ai-dev-check.timer --no-pager
systemctl is-active ha-telegram-bot.service
systemctl --user is-active rs-home-ai-v3.service
systemctl --user show rs-home-ai-v3.service -p FragmentPath -p ExecStart -p WorkingDirectory -p ActiveState --no-pager
systemctl --user show rs-gate-d-health.service rs-gate-d-alerts.service -p Id -p Result -p ExecMainStatus --no-pager
```

Do NOT force-pull a dirty checkout. The installed approved pull-only 6-hour DEV timer may fast-forward canonical DEV and prepare an immutable candidate after an exact SHA GitHub CI gate. A timer being scheduled does not prove a run passed. Record actual `latest.txt` `status`, `stage`, `exit_code`, SHA, and matching candidate `RELEASE_COMMIT`. If no matching latest candidate has been prepared, stop; investigate DEV run failure without bypassing its CI gate or changing production.

For a synchronized, clean canonical DEV and a candidate whose source commit matches the verified GitHub branch HEAD, run the existing **offline/mock** acceptance only using documented candidate smoke entry points, not a Telegram poller. `npm test` may be run in the canonical DEV shell when safe; do not weaken ownership-security tests for the systemd namespace. GitHub x64 CI does not substitute for Pi ARMv7 smoke.

Real HA acceptance is a **separate, explicitly operator-run read-only** check:
```bash
cd /home/drpoh/projects/rs-home-ai-dev
timeout 150s node scripts/manual/v3-live-readonly-preflight.mjs
```
Requires existing explicitly approved read-only LAN/MCP access. Capture only bounded `SAUNA_STATUS`, `LIGHTS_STATUS`, `TAMBOUR_STATUS`, `READONLY_PREFLIGHT`, and exact entity availability. **No service calls or bot process**. Unknown/renamed devices block acceptance; do not silently expand IDs.

## Operator production authorization (separate step)
Only after candidate exact SHA, Pi offline STAGE, scoped read acceptance, V2/V3/Gate D health, verified current systemd unit, preserved journal/credentials and rollback are documented, request separate explicit owner approval to switch to **the named exact candidate SHA**. Do not auto-deploy from GitHub, CI or DEV timer. Never start a second Telegram long poller for the existing token.

Post-switch acceptance: `/status`, `/sauna`, `/light`, `/lights`, bounded Russian light questions, then pending tamboor request → `/cancel` → `/confirm` must return missing. **No physical toggle as part of this smoke.** If failed, use the reviewed rollback to `c6a9812` under the same operator-authorized change procedure; preserve claims database and V2 service.

## Evidence currently missing
- Current Pi DEV HEAD, clean worktree and installed timer's latest exact-SHA result following PR #51 and documentation commits.
- A matching Pi ARMv7 offline STAGE candidate and new bounded live preflight for that exact checkout.
- Current service ExecStart, V2/Gate D health and owner approval for this specific immutable release.

Until these are provided: **release status = blocked / source ready; production unchanged.**
