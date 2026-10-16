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
