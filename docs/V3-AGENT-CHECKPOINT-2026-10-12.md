# RS Home AI V3 — agent handoff checkpoint (2026-10-12)

**This short checkpoint overrides older dated claims in long journals; no older history is deleted.** Read together with `AGENTS.md`, `docs/CURRENT-STATE.md`, `docs/TODO.md`, `docs/CHAT-HANDOFF.md`, and `docs/WORKLOG.md`.

## Owner-confirmed scope
- Develop **new `light.*` lighting only**, excluding **all** `light.browser_mod*` without exceptions. Sensors and `switch.*` deferred. No automatic changes to HA area/entity/device registries.
- Existing Home Assistant must continue working with V3 stopped; **no new physical write targets** without explicit owner authorization.
- Canonical DEV Git branch `feature/v3-home-agent`; Raspberry Pi checkout `/home/drpoh/projects/rs-home-ai-dev`. Active production remains immutable `9dd5964`; previous rollback `c6a9812` retained. No promotion or changes to system services.
- Reuse official HA/HA-MCP, ESPHome and systemd. Free-only agent collaboration (Jules); maintain small PRs based on **DEV**, never stale `main`.

## Verified evidence
- HA Template export contained 38 `light.*`, from which 19 additional candidates were recorded in `src/home/new-light-candidates.mjs`. Four earlier `light.*` were already pilot read targets.
- The owner ran two live Pi DEV manual HA-MCP read-only diagnostics. The second run (after fixing transient connection failure) returned **ON 2, OFF 7, unavailable 10**, all 19 exact IDs read, no service calls. Ten specific unavailable IDs are documented in `docs/V3-NEW-LIGHTS-REAL-READ-2026-10-12.md`. Cause of an earlier connection failure is *unproven*; a HA reboot is plausible, not confirmed.
- PRs #63, #64, #66, #67, #68, #70, #71 have passed their exact-head CI and merged. PR #73 (offline room view, **not** Telegram/live read permission) passed exact-head CI and merged as `e11b0bef9ef50b1bc25b2c08ec28dd1cefd20e5d`.
- `src/home/new-light-area-summary.mjs` only presents **fresh results passed into it** and explicitly labels coverage as 19 selected HA entities, not the whole home or fixture count.
- Jules issue #72 was acknowledged by the bot but no completion PR was linked in its comments as of this review. Older Jules PRs #56, #65, #69 target stale `main` with ~439 files; **do not merge**. Reuse any useful test changes only as a separately reviewed tiny DEV PR.

## Next concrete tasks
1. Obtain the narrowed Jules tests-only PR based on `feature/v3-home-agent` or cherry-pick only the tested minimal subset manually. CI for exact PR HEAD mandatory.
2. Diagnose ten `unavailable` lights by **native HA read-only entity/device registry** (and integration status) before labeling them stale, duplicate or physically dead. Do not delete or repair HA records without a separate decision.
3. Verify available nine new lighting entries, their actual physical circuits and potentially duplicate `light.*` aliases. Record per-ID evidence and HA areas. Do not silently broaden MCP live read allowlist.
4. Once reviewed, integrate bounded fresh per-room status into DEV read-only command behind tested per-entity allowlist. Physical writes remain restricted to existing tamboor flow.
5. Keep `docs/TODO.md` + handoff updated after each verified merged milestone. Avoid chronological bloat in short agent instructions; leave full history in WORKLOG/archive.

## Repo hygiene
- **Do not force push or prune unknown/working branches**. Before deleting any branch, verify no open PR uses it, commits are merged/reachable, and user has not designated it historical. GitHub branch cleanup is independent from deleting files on Raspberry Pi.
- No duplication of historical HA snapshots into runtime caches. Never commit credentials or full private entity export.
- GitHub Actions CI alone does not prove Pi ARMv7 or HA availability; only owner-provided runtime evidence does.
