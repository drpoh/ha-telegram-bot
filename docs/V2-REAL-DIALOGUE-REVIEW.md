# V2 real-dialogue review — acceptance scenarios
Date: 2026-10-15. Source: owner-provided conversation transcript. **Transcript is reported assistant output, not authoritative HA tool traces**. Never copy household data, tokens or conversation DB into GitHub.

## Existing functions to preserve
1. Read-only multi-search with requested exact columns; never make HA writes or substitute a prohibited overview call.
2. Entity-id lookup and relevant related entities; distinguish exact match from related matches.
3. Read-only room capability questions and current lighting states.
4. HA temperature state requests and natural Russian reporting.
5. Local AI scenes: capture, activate, list, delete. Keep same scene ownership and HA vs local scene semantics.
6. Follow-up resolution and clarification: ambiguous plural scene deletion must clarify, ordinal selection of a listed item must work once clarified.
7. Time-bound lighting requests must have actual scheduling/acknowledgment proof before promising future restoration.
8. Anomaly scans must distinguish disabled, unavailable, ignored/not loaded, truly failing automations; ground figures in a fresh relevant HA read and explain source/limitations.

## Observed issues / hypotheses requiring offline reproduction
- Searches 'ванная' and 'сауна' returned same ten results including unrelated Louder diagnostic sensors; may reflect relevance ranking, list limits or overlapping area aliases. Do not assume HA itself is broken.
- Exact ID search for WLED returned related segment entities, potentially useful, but output must clarify exact vs expanded matches.
- Saying 'включены индикаторные светодиоды' can conflate device activity with user-controllable room lights. Identify categories explicitly.
- Local scenes work, but 'первую' after scene list + intervening message may not reliably retain an ordered reference; a clarification is safer than acting on an uncertain target.
- 'выключи свет ... на 1 минуту' got only 'выключен'. Transcript cannot verify timer creation/restoration: treat as possible missing timed intent, never claim fulfilled if only immediate service succeeded.
- 'более 700 недоступных сущностей и автоматизаций' appears ungrounded without tool evidence, and mixes distinct categories.

## Golden acceptance (behavioral, no live HA writes)
- Preserve all functioning flows above; tests must not encode speculative tool outcomes as facts.
- Read-only requests: verify no `ha_call_service`, scene mutator or other HA writes and respect explicit tool bans.
- Two searches in order return separately labeled results, correct format; relevance or pagination should be reported, not fabricated.
- Scene CRUD tested with mocked HA and local fixture DB; 'удали их' ambiguous => ask; 'первую' => refer to previously listed immutable ordered scene name and only authorized target.
- Timed request => schedule with tested mechanism or clearly say the timed part was not done; never imply automatic turn-on without evidence.
- System anomaly summary => count by source/status, give examples, distinguish benign disabled/ignored entities.
- Temperature readings derive from current state and are not treated as permanent memory.
- No regression of Gemini/OpenRouter fallback, HA-MCP permissions, scene behavior, controlled-device pronouns, memory retention, action verification.

## Priority
P0: timed lighting intent handling + anomaly fact-grounding (trustworthiness).
P1: search fidelity and read-only/tool restrictions.
P1: ordinal scene reference/clarification.
P2: optional memory archive, without changing active 40-message context.

## Boundary
Never touch production V2 service, files, config, Git or DB. Develop only separate DEV branches, use focused offline tests with visible progress and one full regression per material milestone, no feature removal.
