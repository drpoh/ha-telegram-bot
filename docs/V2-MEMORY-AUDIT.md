# V2 memory and context audit (source-only) — 2026-10-15

Audited **running-source snapshot** `32b5299`; no production service or file was modified.

## Confirmed implementation
- `src/memory/conversation.mjs`: short conversation window of 40 messages, persisted to `conversation` SQLite table. New writes delete rows outside this window. This is a **retention limit**, not a SQLite database-size limit.
- `src/memory/devices.mjs`: volatile memory of the most recent successful HA entity search; excludes unavailable/unknown devices, intended to resolve follow-ups without repeated searches.
- `src/memory/operational.mjs`: stores the last 50 action records under the `operationalActions` key; entity-specific context returns up to 3 records by default.
- `src/db/database.mjs`: generic `memory` key-value table and SQLite WAL mode. SQLite expands automatically; adding disk capacity does not extend conversation memory.
- `src/ai/prompt.mjs`: explicit referent resolution, never replay previous commands, retain existing scene and controlled-device behavior.

## Key risk and improvement plan
The conversation module **deletes old dialogue messages** on each insert. Increasing the window to 100/200 would retain more but also feed a bigger history to the LLM, increasing latency, prompt cost and possible stale device references. Avoid changing this constant without measuring actual quality and latency.

Prefer optional **archive + context retrieval** later, protected by tests for existing device follow-ups, scenes, room scope, history and action permissions; do not move, reduce or truncate any of these capabilities. First write offline regression scenarios around the existing behavior and collect baseline. Never copy private conversation text into GitHub.

## Validated evidence and remaining gate
Owner-provided focused privacy test: 1 file, 4 assertions, zero failures on isolated DEV. Earlier 124-file, 498-assertion successful run was prior to branch checkout. Owner said the later full validation was done but did not supply results; therefore **full regression on PR #194 remains unverified** by the project record. Obtain only final summary lines plus HEAD, not secrets or verbose output.

## Non-negotiable workflow
Running V2 `~/ha-telegram-bot` and its systemd service remain untouched. Work exclusively in isolated DEV/GitHub branches; progress bar for all test invocations; short focused test while iterating, full test before merge. No feature reductions.
