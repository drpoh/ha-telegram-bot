# Git branch cleanup — 2026-10-16

## Inventory and decision
GitHub search returned **at least 68 branches** with pagination cursor; not a full proof of branch count. Many 2026-10-13/14 V3 feature/docs/verification/proposal branches appear temporary by naming, but names are not evidence that their commits have been preserved.

**Must preserve:** main; refactor/v2; baseline/v2-pristine-20261014; baseline/v2-running-32b5299; feat/v2-safe-ai-scene-authorization-20261015; any branch used by Pi worktrees/services, any PR head, any branch with unique unmerged history. Preserve feature/v3-home-agent and release proposals until dependency audit.

**Current reality:** production V2 is live from /home/drpoh/ha-telegram-bot. Current isolated V2.1 DEV: /home/drpoh/projects/rs-home-ai-scene-test, user service rs-home-ai-rc3.service. Never fetch/merge/reset or prune branch refs in production working tree.

## Steps before deleting ANY remote branch
1. Capture **all** branches (including paginated search results) and all open PR heads.
2. From the isolated DEV clone/worktree, enumerate `git worktree list --porcelain`, `git branch -r`, `git branch --contains <sha>`, `git log --left-right --cherry-pick --oneline main...candidate`, `git merge-base --is-ancestor candidate preserved-target`.
3. Identify actual live service paths, including older V3 services, without stopping or editing any service. Do not confuse branch with currently detached worktree SHA.
4. A branch can be deleted only when a preserved ref contains all its commits (or an explicit archive tag/branch is created), it is not protected, has no active worktree or open PR, and a rollback reference is documented.
5. Make one small batch deletion and re-check references; do not run global prune on the production checkout. Cleanup should preserve history, not rewrite it.

## Branch cleanup status
- Inventory: started via GitHub search. **No GitHub remote branches deleted** during this review.
- GitHub connector exposes branch search but no delete-ref action. Deleting remotely requires another authorized supported interface; never imply that searching branches removed them.
- Next: review candidates and dependencies before proposing safe deletions; do not request owner to paste a broad `git push --delete` command prematurely.

## Verified first cleanup — 2026-10-16

Pi confirmed three branch tips are ancestors of `feature/v3-home-agent` and are not checked out in worktrees; GitHub open PR query returned none. User successfully removed via authenticated SSH push (HTTPS password authentication failed):

- `docs/v3-owner-telegram-live-smoke-pass-20261013`
- `feature/v3-newlight-command-routing-rebased-20261013`
- `release-proposal/v3-kitchen-base-9dd5964`

Reported remote branches: 68 before → expected 65 after these deletions. Verify by `git ls-remote --heads github | wc -l` before further cleanup.

**Git remote caution:** DEV `github` is HTTPS (suitable for fetch), `origin` points to `/home/drpoh/ha-telegram-bot` (production checkout). For authenticated cleanup use an explicit `git@github.com:drpoh/ha-telegram-bot.git` target; never push/fetch/merge through `origin` to perform DEV updates. Preserve protected and unique-history branches.

## Next checkpoint — 65 branches verified from GitHub

GitHub branch search on 2026-10-16 now returns exactly **65** names after the three verified deletions. All remaining earlier audit candidates were marked UNMERGED relative to `main` and `feature/v3-home-agent`; this alone does not justify deletion. Preserve feature branch for active DEV, main/refactor and baseline branches, PR heads, and distinct histories.

**Archival design before deleting unique branches:** keep a single immutable, dated snapshot of remote branch tips (name + full SHA), and a durable Git-reachable preservation ref that contains every would-be-deleted tip. A simple `git bundle` on Pi by itself does **not** preserve reachability on GitHub. Before deletion confirm archive ref exists on GitHub, its commit ancestry includes each candidate SHA, and that no PR or worktree uses the branch. Keep snapshot for restoring original names. Archive should contain only Git metadata/history (no accidental production secrets) and never alter main/V2/DEV code.

A large multi-parent archive merge can preserve all histories using `git commit-tree` with the tree of a known safe baseline, but this is an advanced operation: validate in an isolated temporary repo/worktree and verify parent/reachability before using. Do not perform blanket deletion or assume the V3 branch includes all work.

## Verified local backup checkpoint (owner report, 2026-10-16)

- `~/projects/rs-home-ai-git-audit/branches-before-cleanup.txt`: 65 live GitHub head SHA/name pairs.
- `~/projects/rs-home-ai-git-audit/branches-backup.bundle`: verified complete Git history; 68 included tracking refs because 3 deleted branches remained in local refs. Git bundle integrity verified successfully. Local backup alone is not an off-device preservation guarantee.
- Next create an immutable archive commit on an isolated archive branch whose parents are **all 65 snapshotted GitHub branch tip commits**; retain the mapping in the archive commit message and local manifest. Archive commit's tree may equal main while its parent pointers preserve histories; never merge this archival ref into main or production. Verify remote archive branch and ancestry before deleting anything else. Do not use origin remote, which points to production checkout.

## Remote historical archive verified by owner

- `archive/branch-history-20261016` was successfully created on GitHub via authenticated SSH.
- Owner reported `ARCHIVE=VERIFIED` and `PRESERVED_BRANCH_TIPS=65`; validation checked the remote archive SHA and ancestry of all 65 tips from refreshed `branches-before-cleanup.txt`.
- Archive contains historical Git objects, not a production deploy branch. **Never merge the archive into main or any product branch.**
- Snapshot file at `~/projects/rs-home-ai-git-audit/branches-before-cleanup.txt`; bundle at `~/projects/rs-home-ai-git-audit/branches-backup.bundle`.
- Branch cleanup must still exclude active heads, open PR heads and protected branches, verify exact remote tip SHA and archive ancestry immediately before deletion. Preserve the named V2/V3 baseline and release-proposal heads by default until individually reviewed.

## PR-safe pruning review

Owner ran an archival ancestry review against the verified 65-tip GitHub archive. Some `CANDIDATE` branches are **open PR heads**, so ancestry alone is not deletion authorization. Preserve all open PR heads automatically, including docs/v2-copy-baseline-20261015 (#192), docs/v2-evolution-primary-20261014 (#191), feat/ha-registry-live-event-watch-20261014 (#188), feat/v3-readonly-room-lights-20261014 (#190), fix/v3-kitchen-read-scope-e902efeb-20261014 (#142), and older V3 test/follow-up PR heads.

For deletion, additionally require an exact match of tip SHA to the 65-branch snapshot, ancestry in the archive commit, no checked-out worktree, and no open PR. Re-check against live GitHub just before push; use per-ref SHA leases to block races. Maintain V2/V3 baseline, release-proposal, feature/v3-home-agent, main/refactor, active DEV and archive.
