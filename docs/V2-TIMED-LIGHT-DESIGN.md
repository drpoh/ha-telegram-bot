# Timed lighting intent — DEV-only exploratory implementation

Date: 2026-10-15. Owner example: "выключи свет в гостиной на 1 минуту" returned "Свет в гостиной выключен". Tool audit was unavailable, so there is **no proof** that a 60-second restoration was scheduled.

This branch adds ONLY a pure Russian-language intent detector. It does not call HA, set timers, create automations, or change the agent. It distinguishes duration phrase `на N` from delayed-start `через N`; these two forms must NOT be treated as equivalent when an actual scheduler is implemented.

## Safety requirements for future functional implementation
- Use existing Home Assistant-native script/timer/automation mechanisms instead of inventing a second scheduler.
- Explicit authorized target, correct area, precondition and control policy checks required.
- Record/read initial state, define effect of repeated or interrupted commands, reboot, manual overrides, and unavailable devices.
- Verify scheduling and later action before declaring duration fulfilled; otherwise clearly state that only immediate action occurred.
- Do not infer acceptance from intent detection alone. No new actions wired in on this branch.

## Critical baseline parity conflict
At source commit `32b5299`, `src/scenes/tools.mjs` explicitly blocks `ai_scene_capture`, `ai_scene_run` and `ai_scene_delete`. However the owner's provided V2 dialogue reports all three operating successfully. **Do not change the scene tools or claim parity until the difference between actual runtime and source snapshot is explained.** This is a priority acceptance blocker for any future V2 deployment, not authorization to inspect or modify the live service.

## Validation
No Pi tests run yet for this branch. Add test fixture to existing isolated runner; run one focused test with progress when combining several code improvements, then full test only for major milestone. V2 production remains untouched.
