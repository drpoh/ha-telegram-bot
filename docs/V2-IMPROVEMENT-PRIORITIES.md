# V2 Evolution — reuse-first improvement priorities

Updated 2026-10-15; based on verified GitHub source at running V2 baseline commit `32b5299`. This is design analysis only: no Pi changes or live HA calls.

## Existing capabilities to preserve
- `src/ai/router.mjs`: Gemini primary and OpenRouter fallback, last provider state; do not replace AI router.
- `src/memory/controlled.mjs`: persistent recent controlled-device context for pronouns and follow-up commands; do not replace with dialogue search.
- `src/memory/devices.mjs`: latest resolved search results are transient; do not use for unrelated rooms.
- `src/history/tools.mjs`: sauna history and measured heating-cycle summaries; preserve and add reusable patterns only when needed.
- `src/learning/corrections.mjs`: captures reversed autonomous actions and reduces autonomy after repeated corrections; retain owner override.
- `src/memory/conversation.mjs`: 40-message in-memory context and SQLite retention. A separate archive is possible; changing this cap directly could increase provider tokens and stale state.

## Proposed value-first work
1. **Read-only memory design + baseline regressions**. Design an optional archive that stores older messages independently, but leaves existing active 40-message context and resolver untouched. Archived material must not become HA commands, tool calls or unverified state. Limit LLM retrieval by topic, freshness and user authorization. Avoid personal data in repo.
2. **Device/area resolution feedback**. Create fixture-driven offline regression cases for room switching, 'его/их', room scope and ambiguous commands before any resolver change.
3. **Provider fallback hardening**. Examine rate limit / provider error classification and bounded retries, but preserve existing Gemini -> OpenRouter behavior; do not incur extra calls by default.
4. **Learning corrections**. Test autonomy downgrade, reverse action time window and persistence before modifying model.
5. **Useful HA facts**. Extend history summarization only for explicit user requests and available HA data, beginning with electricity and sauna when requested.

## Delivery contract
No production V2 mutations, service restarts, live credentials or secondary Telegram polling. No feature removal; all existing tests remain. Use focused tests with progress during iteration; run full offline suite once per meaningful PR milestone. Batch unavoidable Pi checks. Continue autonomous GitHub/doc/DEV work without routine permission prompts. Compare improvements against baseline, record acceptance/rollback plan and owner approval before any deployment.
