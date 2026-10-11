# GitHub branch cleanup checkpoint — 2026-10-12

Owner performed guarded remote deletion following 2026-10-11 branch audit. GitHub connector subsequently independently listed **exactly four** remote branches: `feature/v3-home-agent`, `main`, `refactor/v2`, and `review/gate-e-target-snapshot-hardening-20261009`. Previous inventory was 23 branches; 19 short-lived PR branch refs were removed. Historical merged PRs and squash commits remain in GitHub. Note: this documentation PR temporarily creates an additional branch until merged and separately deleted.

Pi V3 active immutable release remains `c6a9812` per latest owner-provided systemd state and Telegram live smoke tests; this GitHub cleanup does not deploy or change running services. Older `7d9bab5` and `920585d` releases were moved to archive by owner; `97343fa` remains rollback. V2 checkout and historical Gate D checkout must remain intact because Gate D health and alert timers were enabled and reference `/home/drpoh/rs-home-ai-v3`.

Remaining safety checks before closing infrastructure cleanup:
- Verify recent Gate D timer executions completed successfully (not merely enabled/active) and V2 service is active.
- Reconcile the Gate E review branch at a separate decision point. Do not delete unmerged work.
- Fast-forward Pi DEV from GitHub after this documentation commit and run `npm test`. Never update immutable production release as part of DEV sync.
- Prefer user-facing V3 capabilities over further infrastructure restructuring.
