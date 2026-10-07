# AI Logic

## Control loop
1. Observe — obtain current relevant state/context.
2. Reason — produce a proposed response/action.
3. Decide — attach intent, confidence and evidence.
4. Policy — deterministic permission check.
5. Preconditions — validate fresh assumptions immediately before action.
6. Act — execute only an approved, non-duplicate action through HA-MCP.
7. Verify — re-read state/result without repeating the state-changing service.
8. Remember — record outcome, failure or user override.
9. Audit/Evaluate/Adapt — evaluate verified behavior over time and only reduce autonomy automatically.

## Important rule
The LLM proposes. The Policy Engine authorizes.

## Proactive behavior
Proactive decisions should initially run in suggest-only/shadow mode. Promote a behavior to auto_safe only after explicit user permission and sufficient testing.

## Uncertainty
When context is ambiguous, prefer asking, suggesting or doing nothing over guessing. Never infer safety permission from frequency of past behavior.
