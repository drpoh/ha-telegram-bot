# RS Home AI V3 — new-chat handoff

This is the FIRST document to read when resuming this project in another chat.
It is a compact navigation index, not a substitute for live repository checks.

## Canonical sources, in priority order
1. Live Pi working tree and Git status in `/home/drpoh/ha-telegram-bot`.
2. `AGENTS.md` and `docs/home-agent-v3-strategy.md`: mission and non-negotiable safety invariants.
3. `docs/TODO.md` and last dated entries of `docs/WORKLOG.md`: open work and evidence.
4. `docs/REVIEW-2026-10-09.md` and `docs/PROGRESS.md`: broader gate status (historical totals are not present-day acceptance).
5. GitHub `drpoh/ha-telegram-bot`, branch `feature/v3-home-agent`: pushed source of truth; inspect PRs and compare with live Pi before edits.

## Current verified checkpoint (2026-10-09)
- Pi working branch: `feature/v3-home-agent`; verify live HEAD and cleanliness using `git status -sb` on every new chat; dated commit IDs below are historical.
- Latest verified full isolated regression for Gate B entity identity hardening: **109 test files / 443 assertions passed / zero failures**, npm exit 0 (see latest WORKLOG entry).
- Gate B remains **OPEN** for general/home-wide actions: missing authoritative complete live HA registry, approved per-home policy, trusted end-to-end identity/action authorization, and production acceptance.
- Gate D reboot recovery and owner-received Telegram test alert passed; incident alert and tested off-device recovery remain open.
- Gate E only offline/read-only planning; no live voice authorization.
- dev/stage/prod separation has an ADR and offline tests, but is **not deployed**.
- Existing v2 and limited v3 pilots must not be restarted, reconfigured, expanded or used for real HA actuation without explicit authorization. Home Assistant Green must remain independent.
- Gate E PR #1 snapshot validation hardening **MERGED** as `8eab92b` after focused 11/11 and full isolated 109 files / 442 assertions passed. Offline only; no Assist live authorization: https://github.com/drpoh/ha-telegram-bot/pull/1

## Start-of-chat read-only checks
Run with Desktop Commander on the authorized Pi, when connected:
```
cd /home/drpoh/ha-telegram-bot
git status -sb
git log -5 --oneline
git branch -vv
sed -n '1,180p' docs/CHAT-HANDOFF.md
tail -90 docs/WORKLOG.md
sed -n '1,150p' docs/TODO.md
```
Confirm the current GitHub branch/PRs; never assume this dated checkpoint is still the latest.
Never print `.env`, access tokens, private HA URLs, DB contents or raw personal logs into chat.

## Operating protocol
- Select the next item from confirmed blockers in TODO, not conversational progress claims.
- Inspect changed files, run focused checks, then full isolated regression where appropriate.
- Log commands, counts, exit codes, branch/commit/push status and remaining caveats in WORKLOG; adjust TODO and this handoff with every stable milestone.
- Push reviewed tested changes; preserve dirty worktrees and avoid overwriting work done in another chat/session.
- Distinguish offline test passes, Gate evidence, and operator-authorized live acceptance.
- If Pi is offline, GitHub is a fallback; state that live runtime and local unpushed changes are unverified.

## Resume priority
1. Continue Gate B trusted actor/action/policy and authoritative read-only registry provenance (PR #1 has been merged; no need to redo it).
2. Continue Gate B trusted evidence and operator-policy provenance work without live HA control.
3. Complete Gate D incident evidence/backup design and Gate E authenticated read-only route only after their specific prerequisites.
