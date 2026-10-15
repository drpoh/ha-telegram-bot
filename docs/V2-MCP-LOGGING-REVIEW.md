# V2 HA-MCP logging review — 2026-10-15

## Observed at running V2 source commit 32b5299
- `src/mcp/executor.mjs` writes complete MCP request arguments for each tool call.
- Except `ha_get_history`, it logs entire tool responses with `JSON.stringify`. Search and state results can include device names, room names and attributes, potentially sensitive data.
- Memory search logging lists entity IDs, friendly names and current states; verification log includes exact entity IDs.
- The history tool already reduces its log to counters. V2 service remains unchanged.

## Proposed narrow improvement (PR #194)
- For the MCP executor only, log tool type, isError and bounded aggregate counts, without the raw payload, request arguments, entity IDs, tokens or state values.
- Keep unchanged `mcp.callTool` inputs, return values, state verification, learning and memory updates.
- Offline tests assert that sensitive names/IDs/state/token strings never appear in the new summary.
- Other modules may still log potentially private errors, decisions or messages; **this is not a full privacy audit**.
- Do not merge into or restart live V2 until isolated Pi tests pass and the owner approves a separate deployment/rollback step.

## Validation to complete
1. Check syntax and full offline `npm test` on the isolated V2 dev copy using a reviewed DEV branch.
2. Check no raw request/response dumps remain in this MCP executor.
3. Confirm no changes to Telegram polling, Home Assistant actions, credentials, database contents or service files.
4. Record exact head hash and tests, then update CURRENT-STATE, TODO, WORKLOG and HANDOFF on the V2 documentation branch.

The documentation PR #192 targets the exact V2 source baseline and must not be merged into a V3 release branch.

## Test workflow update (2026-10-15)
Owner requirement: always show a simple progress bar and avoid unnecessary full-suite runs during development. The isolated runner now prints a 20-cell completion bar and accepts an optional filename substring, e.g. `node scripts/run-isolated-tests.mjs mcp-log-summary`. Continue to run `npm test` in the DEV copy as a full gate before merge. No running V2 code/config/service or live DB modified. The owner-provided `124 files / 498 assertions` result is from the old local checkout and does NOT validate this branch; await fresh focused/full results. SQLite size scales automatically; the V2 40-message history cap is a separate product design choice and must not be changed until behavior/limits are tested.

## Non-regression contract (owner requirement)
- Running V2 source checkout, its local Git remotes, credentials, service and SQLite database are strictly read-only. No deploying, running a second Telegram poller, or copying production secrets.
- Never remove or reduce behavior: Telegram, natural-language responses, AI tool routing, HA-MCP calls, conversation and device memory, room context, history, action verification, scenes and safety guards must remain functional.
- Every automated test invocation should show a simple progress bar. Use the filtered isolated runner for local iteration; full-suite tests are mandatory before merge/release, not after every small edit.
- The local V2 clone may have a filesystem `origin`. Keep that remote unchanged and add a separate `github` remote pointing at the GitHub repository only in the isolated DEV checkout.
- Increasing SQLite **database capacity** is unnecessary because the file grows as needed. Increasing retained conversation context is a distinct feature requiring independent regression and token-budget testing; preserve the present 40-message policy until such a change is proved better.
- New branch PR #194 is **not** verified on Pi yet. The last owner-provided `124 / 498 / 0` run predates the branch checkout and its test count does not cover the new test.

## Focused test evidence (owner, 2026-10-15)
On the isolated Raspberry Pi development checkout, `node scripts/run-isolated-tests.mjs mcp-log-summary` reported a completed 100% progress bar, 1 test file, 4 assertions and 0 failed files. Full regression suite on this branch still pending. Owner requests fewer interruptions: group read-only audits and full-suite checks into a single operator command whenever safe. Production V2 remains off limits.
