# GitHub branch cleanup checkpoint — 2026-10-12

Owner performed guarded remote deletion following 2026-10-11 branch audit. GitHub connector subsequently independently listed **exactly four** remote branches: `feature/v3-home-agent`, `main`, `refactor/v2`, and `review/gate-e-target-snapshot-hardening-20261009`. Previous inventory was 23 branches; 19 short-lived PR branch refs were removed. Historical merged PRs and squash commits remain in GitHub. Note: this documentation PR temporarily creates an additional branch until merged and separately deleted.

Pi V3 active immutable release remains `c6a9812` per latest owner-provided systemd state and Telegram live smoke tests; this GitHub cleanup does not deploy or change running services. Older `7d9bab5` and `920585d` releases were moved to archive by owner; `97343fa` remains rollback. V2 checkout and historical Gate D checkout must remain intact because Gate D health and alert timers were enabled and reference `/home/drpoh/rs-home-ai-v3`.

Remaining safety checks before closing infrastructure cleanup:
- Verify recent Gate D timer executions completed successfully (not merely enabled/active) and V2 service is active.
- Reconcile the Gate E review branch at a separate decision point. Do not delete unmerged work.
- Fast-forward Pi DEV from GitHub after this documentation commit and run `npm test`. Never update immutable production release as part of DEV sync.
- Prefer user-facing V3 capabilities over further infrastructure restructuring.

## 2026-10-12 — New 27-branch cleanup review (GitHub live inventory)

A later GitHub check found **27 remote branches**: 4 retained permanent/review refs plus **23 PR-specific stale branches**. Temporary branches accumulated from PR #22–#44 after the earlier cleanup. These are GitHub refs, not Pi working trees or production artifacts. Verification used the repository's PR collection, matching every stale branch by exact head name:
- **21 squash-merged PRs:** #22–#41 and #44, excluding #42 and #43 (precisely 21); the merged content is on `feature/v3-home-agent` and historical PR commits remain available.
- **Two closed, unmerged duplicate documentation PRs:** #42 and #43. Both duplicated the already-reviewed light inventory and classification guidance in `docs/V3-LIGHT-ENTITY-REVIEW-2026-10-12.md` and `docs/V3-HISTORY-STAGE-AUDIT-2026-10-12.md`. #43 was explicitly closed in this audit; #42 had been closed previously.
- **Retain** `main`, `refactor/v2`, `feature/v3-home-agent`, `review/gate-e-target-snapshot-hardening-20261009` (review branch is 0 ahead of V3 but retain pending usage audit; don't mistake behind commits for safe deletion).

No live HA, Pi environment, systemd release or rollback directories were touched. GitHub connector permits inspection and PR management but does not expose a remote-branch deletion operation; Desktop Commander is quota-blocked. **Deletion still requires owner executing a reviewed `git push origin --delete` from the canonical Pi DEV checkout.** Do not describe branches as deleted before observing GitHub after this step.

### Controlled operator deletion (after this documentation PR merges)

Run on canonical Pi DEV, not V2 or production checkout. The explicit list intentionally excludes protected branches and Gate E review. A new short-lived branch created for this documentation PR is included so that the count returns to four.

```bash
cd ~/projects/rs-home-ai-dev || exit 1
test "$(git branch --show-current)" = feature/v3-home-agent || exit 1
case "$(git remote get-url origin)" in
  git@github.com:drpoh/ha-telegram-bot.git|https://github.com/drpoh/ha-telegram-bot.git) ;;
  *) echo 'Unexpected origin; STOP'; exit 1 ;;
esac
git fetch origin feature/v3-home-agent || exit 1
git merge --ff-only origin/feature/v3-home-agent || exit 1
git push origin --delete \
  docs/v3-history-stage-reconciliation-20261012 \
  docs/v3-lighting-inventory-plan-20261012 \
  docs/v3-pi-stage-accepted-20261012 \
  docs/v3-stage-handoff-reconcile-20261012 \
  feat/automated-dev-validation-20261012 \
  feat/v3-candidate-offline-stage-20261012 \
  feat/v3-light-inventory-review-20261012 \
  feat/v3-live-readonly-preflight-20261012 \
  feat/v3-natural-readonly-intents-20261012 \
  feat/v3-reviewed-light-inventory-20261012 \
  feat/v3-verified-ci-candidate-20261012 \
  feature/v3-bounded-light-overview-20261012 \
  feature/v3-tambour-light-read-20261012 \
  fix/dev-automation-test-diagnostics-20261012 \
  fix/dev-check-fetch-diagnostics-20261012 \
  fix/dev-git-system-ssh-config-20261012 \
  fix/dev-tests-trusted-tmp-20261012 \
  fix/pi-test-temp-path-audit-20261012 \
  fix/secure-dev-tmp-ancestor-20261012 \
  fix/v3-ci-gate-repository-runs-20261012 \
  fix/v3-readonly-light-diagnostics-20261012 \
  fix/v3-readonly-preflight-imports-20261012 \
  ops/v3-lights-candidate-readiness-20261012 \
  docs/v3-branch-cleanup-20261012
git ls-remote --heads origin
```

Stop if origin URL is unexpected, branch is not `feature/v3-home-agent`, or fast-forward fails. The deletion command is destructive to *remote refs*, not history; always verify the exact list before executing. If any branch changed after this audit, inspect it before deletion, rather than assuming contents remain merged. Do not run `git branch -D`, force-push, prune Pi checkouts, or clean runtime directories as part of this step.

After operator confirmation, re-query GitHub and record the real remaining branch count. No new redundant cleanup document should be created.

## 2026-10-12 — Cleanup completed and independently verified
- Owner reported execution of reviewed remote deletion. GitHub connector immediately re-listed **exactly four** refs: `main`, `refactor/v2`, `feature/v3-home-agent`, `review/gate-e-target-snapshot-hardening-20261009`. 24 temporary refs gone, including the cleanup PR #45 head; no unmerged active work deleted.
- PR #42 and #43 were closed as duplicate inventory documentation; authoritative inventory remains `docs/V3-LIGHT-ENTITY-REVIEW-2026-10-12.md`. Merged PR history remains accessible.
- No production release, HA, runtime checkout or service changes were made by this GitHub remote-ref cleanup. Gate E branch retained pending review.

## 2026-10-12 — Post-release temporary branch audit (not yet deleted)
- GitHub branch query: **11 refs**. Keep `main`, `refactor/v2`, `feature/v3-home-agent`, `review/gate-e-target-snapshot-hardening-20261009`.
- Seven temporary remote branches from PR #46–52 verified *merged=true, closed*: `docs/v3-integrity-truth-20261012`, `feat/v3-light-readonly-identity-20261012`, `fix/v3-lights-entity-truth-20261012`, `fix/v3-remove-deleted-ha-light-entities-20261012`, `feature/v3-russian-light-status-detail-20261012`, `feature/v3-bounded-all-lights-off-answer-20261012`, `docs/v3-four-light-release-gate-20261012`.
- Their GitHub PR histories and merged content remain preserved; **remote refs not deleted by this checkpoint**. Before remote deletion inspect exact ref SHA and open PR state again, then delete only these seven using a reviewed command. No local `git clean`, branch force-delete, Pi release folder removal or historical documentation removal.

## 2026-10-12 — Owner-confirmed cleanup of PR #46–52 refs
- Operator safely fast-forwarded canonical Pi DEV from `9dd5964` to `75e23bdef51857987f63f364cd884f3cf3d7a711` (six docs only), validated exact SHA of seven PR heads, and ran `git push origin --delete` for those seven refs. Subsequent `git ls-remote --heads origin` printed exactly four retained refs: `feature/v3-home-agent` `75e23bd`, `main` `3bfa386`, `refactor/v2` `0ea2232`, `review/gate-e-target-snapshot-hardening-20261009` `6a761ba`. No Pi files, production service or Git history were deleted; scoped release `9dd5964` remains immutable. Next is read-only Pi filesystem/systemd dependency inventory before proposing archive or removal.

## 2026-10-12 — Pi filesystem cleanup audit: inventory only
- Owner Pi `find`/`du`/systemd inspection confirms production via user drop-in `90-release-9dd5964.conf`, executable inside `~/projects/rs-home-ai-v3-candidates/rs-home-ai-v3-release-9dd5964`; base unit still points to `c6a9812` rollback. V2 `/home/drpoh/ha-telegram-bot`, Gate D `/home/drpoh/rs-home-ai-v3`, DEV `/home/drpoh/projects/rs-home-ai-dev`, reserve `97343fa` are all protected.
- Five older siblings in candidates: `b1122bd`, `e231afb`, `46ce492`, `ed27051`, `f4acd11`; standalone old folders: `rs-home-ai-v3-candidate`, `rs-home-ai-v3-candidate-v2`, `rs-home-ai-v3-release-968748d`. **Candidates for further dependency audit only. No deletion or moving authorized yet.** Candidate parent totals 383 MB including ACTIVE prod; standalone candidates/release each about 64 MB. Archived `920585d` and `7d9bab5` total ~127 MB and may be referenced by old systemd backups: retain.
- Pi DEV observed clean at `75e23bdef51857987f63f364cd884f3cf3d7a711` before this doc-only GitHub update. Current GitHub and Pi DEV may therefore differ by this checkpoint commit. Verify timers, scripts, symlinks, manifests and process open-file dependencies before any file removal.

## 2026-10-12 — Pi obsolete-build cleanup completed (owner evidence)
- Owner ran the reviewed guarded deletion and reported `CLEANUP=PASS`. Eight directories removed: five old candidate siblings `b1122bd`, `e231afb`, `46ce492`, `ed27051`, `f4acd11`, plus standalone `rs-home-ai-v3-candidate`, `rs-home-ai-v3-candidate-v2`, `rs-home-ai-v3-release-968748d`. Each previously measured ~64M, estimated ~512 MiB freed (df rounded: avail 43G→44G, used 22%→21%).
- Before deletion, exact-target directory and production ExecStart validation succeeded. After deletion both `rs-home-ai-v3.service` user and `ha-telegram-bot.service` system remained `active`, all eight target paths absent. Retained active `9dd5964` child inside shared candidate parent, `c6a9812`, `97343fa`, Gate D historical checkout, V2 checkout, archives, and private state. Disk figures approximate; no byte-accurate measurement provided.
- Documentation-only GitHub update creates a new DEV commit beyond owner's last shown `75e23bd`; next safe Pi sync is clean-worktree fetch + ff-only; do NOT redeploy immutable production for documentation.
