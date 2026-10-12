# Repository maintenance — 2026-10-11

Status: **read-only branch audit completed; deletion pending explicit execution capability**. Scope limited to GitHub repository branch hygiene and documentation; Raspberry Pi runtimes, pinned artifacts and private credentials are excluded.

## Source of truth

- Integration branch: `feature/v3-home-agent`. Keep `main` and `refactor/v2` (legacy V2).
- GitHub search returned 11 branches before this maintenance branch was created (12 with this short-lived review branch).
- GitHub PRs #2–#8 were squash-merged into `feature/v3-home-agent`, with passing offline CI. Their head branches still exist on GitHub.
- Because these merges used **squash**, the PR heads appear *diverged* in commit ancestry and cannot be judged obsolete by `git branch --merged`. Do not use ancestry-only mass deletion.

## Branch disposition

| Branch | Decision | Evidence |
| --- | --- | --- |
| `main` | KEEP | default/baseline; do not delete |
| `refactor/v2` | KEEP | existing V2 lineage |
| `feature/v3-home-agent` | KEEP | canonical V3 dev integration |
| `chore/github-ci-offline-review-20261011` | DELETE after PR verification | PR #2 squash-merged |
| `test/gate-c-light-read-cooperative-abort-20261011` | DELETE after PR verification | PR #3 squash-merged |
| `fix/gate-c-pilot-inflight-guard-20261011` | DELETE after PR verification | PR #4 squash-merged |
| `docs/sync-gates-and-github-ci-20261011` | DELETE after PR verification | PR #5 squash-merged |
| `test/gate-c-durable-journal-process-replay-20261011` | DELETE after PR verification | PR #6 squash-merged |
| `test/gate-c-chain-and-stage-readiness-20261011` | DELETE after PR verification | PR #7 squash-merged |
| `test/stage-loopback-write-denial-20261011` | DELETE after PR verification | PR #8 squash-merged |
| `review/gate-e-target-snapshot-hardening-20261009` | PRESERVE pending owner review | GitHub comparison shows current V3 ahead by 151 commits and zero behind, so this historical branch adds no ancestry-unique commits to current V3. Confirm no external consumers or local references before removal. |

## Safe deletion protocol

1. Confirm each target branch is the head of its associated **merged** PR and no additional commits were added after PR merge. Verify by comparing the branch head SHA to PR head SHA; do not treat squash-divergence as evidence of unmerged work.
2. Check branch protection/rulesets and active automation references. Never delete the three keep branches.
3. Delete only the seven named merged-PR branches, individually, via GitHub UI's merged-PR **Delete branch** control or approved Git client.
4. If an expected head SHA changed since inspection, stop for that branch and re-review.
5. Do not delete `review/gate-e-target-snapshot-hardening-20261009` on ancestry evidence alone; preserve until explicit external references review.
6. After deletion, list branches again, record resulting counts and update TODO/HANDOFF.

No supported connected GitHub action currently exposes remote branch deletion; **do not claim remote deletion without separate verification**.

## Refactoring and reuse-first boundaries

- Before consolidation, map duplicated source behavior, imports, runtime entrypoints, tests and deployment consumers. Avoid renaming `kitchen-*` and moving `src/decision/` as cosmetic cleanup.
- Prefer installed SDK transport capabilities and Node AbortSignal only after verifying actual cancellation semantics; do not confuse caller timeout with socket cancellation.
- Use existing SQLite journal, Home Assistant Assist, ESPHome, systemd and GitHub Actions instead of new infrastructure.
- Preserve full Gate B and Gate C deny-by-default behavior and Raspberry Pi ARMv7 compatibility checks.
- Stage remains loopback mock only; no installation, production permission expansion or live HA tests without separate approval.

## Next maintenance boundary

GitHub branch cleanup and read-only dependency audit can occur **now**. Source refactoring should follow Raspberry Pi DEV fast-forward after clean status verification. Physical runtime folder and old release deletion must wait for Stage acceptance, backup/rollback and current effective systemd ExecStart verification.
