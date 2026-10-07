# AI Logic

## Control loop
1. Observe — obtain current relevant state/context.
2. Reason — produce a proposed response/action.
3. Decide — attach intent, confidence and evidence.
4. Policy — deterministic permission check.
5. Act — execute only an approved action through HA-MCP.
6. Verify — re-read state/result.
7. Learn — record outcome, failure or user override.

## Important rule
The LLM proposes. The Policy Engine authorizes.

## Proactive behavior
Proactive decisions should initially run in suggest-only/shadow mode. Promote a behavior to auto_safe only after explicit user permission and sufficient testing.

## Uncertainty
When context is ambiguous, prefer asking, suggesting or doing nothing over guessing. Never infer safety permission from frequency of past behavior.
