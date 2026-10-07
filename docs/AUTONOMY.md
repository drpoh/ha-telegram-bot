# Autonomy and Safety

## Levels
- observe — read only
- suggest — tell the user what could be done
- auto_safe — execute explicitly allowlisted non-critical action
- confirm — obtain confirmation before execution
- deny — execution prohibited

## Principles
- least privilege by default
- policy is deterministic and outside the LLM
- wildcards require special care
- permissions never expand through learning alone
- every autonomous action is logged and verified
- user override reduces confidence for similar future decisions

## Initial rollout
Start with no autonomous actions. Run Decision Engine in shadow/suggest mode. Later allow a small set such as selected lights/WLED/media/timers after explicit review.

Security, locks, alarms and destructive configuration operations remain outside autonomous control.
