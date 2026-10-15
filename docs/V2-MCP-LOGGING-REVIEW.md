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
