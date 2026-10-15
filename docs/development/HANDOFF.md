# V2 Evolution — short handoff

**Read first:** [CURRENT-STATE](../CURRENT-STATE.md) -> [AGENTS](../../AGENTS.md) -> [TODO](../TODO.md) -> [ROADMAP](../ROADMAP.md). Old [CHAT-HANDOFF](../CHAT-HANDOFF.md) documents historical V3 work and is not the active V2 handoff.

## Mission
Preserve the working V2 as the primary assistant. Improve only the independent V2 development copy after proving specific benefit. No V3 replacement, second Telegram poller, production restart, secrets migration or automatic deployment.

## Verified baseline
Pi original and DEV code commit `32b5299`. DEV clean, dependencies installed, 124 offline tests / 498 assertions passed, SQLite backup integrity OK (7 tables), `.env` not copied, original V2 service active. Runtime feature equivalence of the isolated copy is **not** yet verified. See CURRENT-STATE for full evidence and boundaries.

## Next safe action
Review the existing V2 `src/ai/agent.mjs`, prompt, `src/mcp/executor.mjs`, memory modules and offline tests. Focus first on privacy-safe logging, bounded failures and context regressions without altering working user behavior. Prepare a small DEV-only PR, pass CI, then request separately approved Pi checks. Do not launch `npm start`/`npm run dev` in copy.

## Source / history boundaries
V2 original: `~/ha-telegram-bot` (read-only operational reference). V2 DEV: `~/projects/rs-home-ai-v2-running-copy`. V3 research: `~/projects/rs-home-ai-dev`, distinct branch. Github is source of truth; local DB and secrets never enter GitHub.

## Owner workflow preference (2026-10-15)
If the next work can be completed via GitHub or safe offline analysis without the owner's intervention, keep working rather than stopping to ask for permission or a routine acknowledgment. Batch Pi-only commands when truly necessary. Avoid repeated full test suites: focused tests during iteration, full regression once at meaningful milestone, always with a progress bar. Production V2 is strictly off limits; preserve every existing feature.
