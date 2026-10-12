# Zero-cost cloud AI developer for RS Home AI V3

Status: **source-side setup prepared; no Jules account connection or scheduled task has been authorized or started.** Owner requirement 2026-10-12: no new subscriptions, paid APIs, billable runners, credit purchases or surprise charges.

## Reuse-first choice and price gate

Use **Google Jules, free plan** for source-code-only background tasks. On 2026-10-12 the published free tier listed up to 15 tasks per rolling day and 3 concurrent tasks, subject to changes. Scheduled tasks and GitHub issue label `jules` are documented, but use these only after the first PR is reviewed. Do not use a paid Jules plan or fallback to billable models. Free limits are hard limits; stop until reset.

Official product and limits:
- https://jules.google/docs/
- https://jules.google/docs/usage-limits
- https://jules.google/docs/scheduled-tasks/
- https://jules.google/docs/running-tasks/

GitHub Actions on the private repo also consumes an allowance (GitHub Free listed 2,000 minutes/month and 500 MB artifacts at audit). Keep standard hosted runners and verify repo-owner billing limits so jobs pause instead of billing when free quota ends. Avoid privileged self-hosted runner or exposing home Pi. See https://docs.github.com/en/billing/concepts/product-billing/github-actions

## One-time owner OAuth setup (no GitHub secrets in chat)

1. Visit https://jules.google.com and sign in to Jules free plan with a Google account. Do not activate Google AI Pro/Ultra, a trial requiring subsequent billing, or add a payment method for this workflow.
2. Select **Connect GitHub**, authorize the Google Labs Jules GitHub App to **only** `drpoh/ha-telegram-bot`, not all repositories.
3. Select repository `drpoh/ha-telegram-bot` and explicitly choose **base branch `feature/v3-home-agent`**, not the repo default `main`.
4. The task runs in Jules's isolated cloud VM without Pi/Home Assistant private credentials or live MCP endpoints. Do not include .env, SSH secrets, personal logs, phone/chat IDs or deployment credentials.
5. After changes, Jules must publish **a new branch and PR into `feature/v3-home-agent`**, NOT merge automatically. Check GitHub Actions offline CI before merging; Pi's existing pull-only timer handles local exact-SHA validation without switching production.

## First task prompt (safe, useful vertical slice)

> Read AGENTS.md, docs/CURRENT-STATE.md, docs/CHAT-HANDOFF.md, docs/TODO.md and docs/PROJECT-MAP.md before coding. Base all work on feature/v3-home-agent. Improve concise, intent-specific *Russian read-only* Telegram answers for the existing four selected HA light entities: questions like «Какой свет выключен?» and «Весь ли выбранный свет выключен?» should answer the question directly instead of repeating the full /lights overview. Preserve the existing honest unknown/all-off/on semantics and the fact that four HA entities do not mean whole-house lights. Add offline unit/regression tests, run the repo's non-live test suite, keep Node.js 20/ARMv7 compatible, and create a PR. Never access live HA, external MCP, Telegram, or private runtime state; never change write allowlists, confirmation, service units, secrets, CI security gates, or production. Do not deploy or merge.

## After a successful first PR

- Optionally enable a **weekly**, free-tier Jules Scheduled Task for *bounded repository health review only*, with PRs proposing fixes (no dependency bulk upgrade or autonomous merge). Daily scheduled tasks risk exhausting the free quota and generating PR noise.
- Optionally label a specifically scoped GitHub Issue `jules` to delegate work; do not create broad issues like "finish project" which may waste requests.
- Review GitHub PR + isolated CI; Pi DEV exact-source offline tests run on the installed timer. Production promotion, broad HA authority and physical device changes still require separate owner approval with rollback.

## Responsibilities and exclusions

Jules: source code, offline tests, PR. GitHub: audit trail, PR CI. Raspberry Pi: read-only isolated DEV validation and immutable candidate preparation. Owner: initial GitHub authorization and separately approves any production change. Home Assistant remains independent. No agent receives Home Assistant credentials or authorization to control devices.

As capabilities and pricing can change, verify the current free-plan screen and stop on any billing request. This guide is not permission to activate a new service or deploy a release.
