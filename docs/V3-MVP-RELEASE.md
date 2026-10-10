# V3 MVP — frozen release scope (2026-10-10)

Status: **development only / NOT RELEASED**. User approved a sharply reduced MVP scope.

## Only delivery goal
Telegram (trusted actor, original request) → AI parsing (untrusted) → one operator-approved **light** → deterministic reviewed policy → immutable confirmation → durable no-replay claim → HA-MCP one command → fresh state readback → audit. Existing V2 stays active and HA Green independent.

Existing pilot candidate `light.led_kukhnia` is a **candidate**, not authorization or proof the entity still exists. Owner chooses and approves the actual test device. Never derive grants from assistant text or this document.

## Must-pass release gates
1. Independent authenticated Telegram actor/chat ingress and bound original intent.
2. Verified operator-owned HA transport origin and read scope; no model-provided evidence.
3. Operator-reviewed dedicated V3 policy granting **only one exact entity/service**; default deny all others.
4. Confirmation binds user/chat/action and rejects replay, expiry, cancellation, replacement.
5. Durable external claim ledger outside any rollback tree; inaccessible/missing ledger denies all writes.
6. Bounded actual MCP tool request, unknown outcome never retries, fresh readback and truthful reply.
7. HA remains functional without AI/Pi, documented versioned rollback, operator-approved controlled one-device acceptance.
8. Explicit deployment approval after evidence; use separate V3 pilot and preserve live V2.

These requirements are tracked conservatively by the pure **non-authorizing** `src/ops/v3-mvp-release-gate.mjs` checklist. Passing a caller-provided checklist does NOT enable any runtime tool.

## Defer to V3.1 / later
- Voice/Atom Echo/Assist, generic multiroom bulk targeting, auto_safe decisions, long-term memory and learning, Recorder analytics, local LLM/multiple AI providers.
- Persistent three-service dev/stage/prod installation, elaborate deployment automation or auto rollback.
- Additional protocol micro-fixtures once the narrow end-to-end test is sufficient.
- Automatic stale-registry refresh for many rooms; explicitly block any target except a single reviewed exact entity.

## Fast implementation route
1. Reuse existing `src/pilot/kitchen-mcp-dispatch-boundary.mjs`, pending confirmation, trusted policy and upstream MCP SDK; **do not rewrite the stack**.
2. Validate operator-owned, current HA origin and a separate read-only identity; review candidate light and dedicated policy. This is Gate B approval, not an offline test.
3. Inject approved restricted MCP call adapter behind already enforced hard release switch. Keep journal external and fail closed. Run one end-to-end mock and negative test suite.
4. Separately authorize one controllable light for a single on/off acceptance. Verify HA state and operational independence. Record exact source, reviewer, outcomes and rollback.
5. Tag immutable release after owner sign-off. Stage can be an ephemeral isolated fixture rather than another persistent service.

## No silent scope changes
No production service restarts, new tokens, HA device calls, Git merges or actual deployment from generic 'continue'. No proof of real identity, HA provenance or approval has been presented yet; Gate B/Gate C operational acceptance remain OPEN.
