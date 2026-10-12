# Autonomy and Safety

## Levels
- observe — read only
- suggest — tell the user what could be done
- auto_safe — execute explicitly allowlisted non-critical action
- confirm — obtain confirmation before execution
- deny — execution prohibited

## Risk classes
- R0 — read-only observation
- R1 — selected low-impact lights/media/comfort actions
- R2 — meaningful comfort or energy changes
- R3 — access, charging or other higher-impact controls
- R4 — security, safety-critical or destructive actions

Risk class describes impact; autonomy level describes permission. They are evaluated independently.

## Principles
- least privilege by default
- policy is deterministic and outside the LLM
- wildcards require special care
- permissions never expand through learning alone
- every autonomous action is logged and verified
- confirm/deny policy is enforced before execution for explicit requests
- confirmations are scoped, one-time, exact-action, and time-limited
- verification never retries a state-changing service; stale telemetry remains pending
- user override reduces confidence for similar future decisions
- stale decision inputs are refreshed before execution when they can affect the outcome
- preconditions are checked immediately before state-changing actions
- logical actions are deduplicated so retries cannot cause duplicate execution
- autonomous actions have deterministic rate/cooldown budgets
- repeated failures or abnormal loops pause or reduce autonomy
- learning can automatically reduce autonomy, never increase permissions

## Initial rollout
Start with no autonomous actions. Run Decision Engine in shadow/suggest mode. Later allow a small set such as selected lights/WLED/media/timers after explicit review.

Security, locks, alarms and destructive configuration operations remain outside autonomous control.
