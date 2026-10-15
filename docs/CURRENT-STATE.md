# V2 Evolution — current verified state

Updated: 2026-10-15. This is the **single current project status** for the new V2 development copy, not a report about V3.

## Baseline
- Working V2 original: `/home/drpoh/ha-telegram-bot`, Git commit `32b5299ccc0b6db22ebb67c415ba6ab1d78ab97b`, clean at owner check; `ha-telegram-bot.service` reported `active`. Do not edit, restart or deploy automatically.
- Independent development copy: `/home/drpoh/projects/rs-home-ai-v2-running-copy` at the same source commit, clean. `npm test` passed: 124 files / 498 assertions / 0 failed.
- DEV local-only SQLite snapshot: `data/bot.db`, 118784 bytes, 7 tables, `PRAGMA integrity_check=ok`; permissions dir 0700 and database 0600. Snapshot is not synchronized with production.
- DEV `.env` absent; dependencies installed. No second Telegram polling process or live HA integration was tested.
- Older `baseline/v2-pristine-20261014` from `refactor/v2` is **not** identical to the running V2 source. Preserve it, do not mistake it for the live baseline.
- Existing V3 research branch and running V3 pilot remain separate and untouched.

## Owner-approved product strategy
Improve the **existing V2** in small, testable steps; do not build or promote V3 as its replacement. Prioritize observed UX and reliability issues while retaining V2's effective Gemini/tool calling, memory and conversational handling. Reuse only useful, independently reviewed V3 components. Preserve HA Green independence, single Telegram poller and explicit deployment/rollback approval.

## Immediate next work
1. Audit V2 AI agent, MCP tool permissions/error handling, memory lifetime and logging **offline**.
2. Identify one useful or measurable improvement; add focused regression tests in isolated DEV.
3. Compare against unchanged baseline before proposing a separately approved rollout.

## Safety boundaries
Never commit `.env`, database contents, raw HA audit JSON, tokens or conversation memory. Treat development database as private. No production action, HA writes or service changes without explicit separate authorization. This source-only documentation update does **not** constitute a live DEV functional test.

## Owner workflow instruction (2026-10-15)
Continue self-sufficient DEV/GitHub work without prompting the owner for routine acknowledgments; batch unavoidable Pi operations. Full regression on DEV MCP-logging patch confirmed 125 files/502 assertions/0 failures, exit code 0 at 1f1098c, production service still active. Do not rerun the full suite for documentation-only edits. No production modifications or feature reductions.
