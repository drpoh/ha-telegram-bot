# V2 local AI scenes — source and behavior audit (2026-10-15)

Owner-provided real dialog demonstrates creating, activating, listing, deleting, and recreating local named scenes (e.g. "Вечер"). Treat this as a **must-preserve existing product capability**, though chat text alone is not a verified HA tool trace.

## Source paths and exact branch discrepancy
- GitHub `refactor/v2` `src/scenes/tools.mjs` routes `ai_scene_capture` -> `captureAiScene`, `ai_scene_run` -> `runAiScene`, `ai_scene_list` -> `listAiScenes` and `ai_scene_delete` -> `deleteAiScene`.
- GitHub **running source snapshot** `32b5299`, `src/scenes/tools.mjs`, instead responds `scene_operation_not_authorized` to capture/run/delete. Only list is accessible through that route. The V3 feature branch also has this block.
- Therefore the user's scene-successful conversation and the tracked running-source snapshot **are not conclusively equivalent** for scene mutations. Possible alternate runtime paths or historical timing must not be assumed without evidence. Do not deploy a branch that would remove owner-observed functionality.
- The store and manager still exist at `32b5299`, so data structures and restoration code survive even though the tool route blocks those operations.

## How the working legacy mechanism was built
- `src/scenes/capture.mjs`: resolve actual HA area; search up to 100 lights in area; fail if truncated; read each light's HA state; capture brightness within 0–255; refuse empty scenes and duplicate normalized names.
- `src/scenes/store.mjs`: SQLite tables `ai_scenes`, `ai_scene_entities`, area-scoped unique normalized names, list/read/create/delete. Local AI scenes are **not** HA `scene.*`.
- `src/scenes/manager.mjs`: restore light state and brightness. Supports stored `media_player`, `select`, `input_select` entities as allowed domains, but capture currently collects **lights only**. Manager validates all stored entity domains before acting.
- `src/home/area-resolver.mjs`: finds exact area or unique partial match; ambiguous names yield null. Owner's sauna/bathroom overlap deserves explicit area identity tests.

## Gaps to address in DEV, not production
1. **Parity first**: prove whether user-facing successful scene CRUD comes from different historical revision, alternative path, or incomplete source-to-runtime evidence. Preserve user behavior, data and safety; never simply bypass the current authorization block.
2. **Security**: a future route for scene capture/run/delete must implement verified area/scope, authorization, side-effect policy and individual action verification consistent with the regular agent.
3. **State fidelity**: capture only light on/off and brightness; color, effects, transition, segments and future scene options aren't captured. Restoration should not promise full lighting fidelity before implementation.
4. **Partial apply**: manager validates domains first, but then applies sequentially; runtime failure can leave partially applied scene. Need explicit feedback, not false success.
5. **Ordinal references**: list is sorted by area/name; user commands `первую` need a stable scoped list context and clarification on ambiguity, especially for delete.
6. **DB safety**: all scene data remain in DEV SQLite snapshot; never copy them into GitHub or touch live scene records.

## Golden acceptance cases
- Capture "Вечер" in an area containing 2 lights -> read both and persist their on/off + supported brightness; no unrelated area.
- List returns name and quantity for current area.
- Activate restores only stored allowed entities, respects authorization and reports partial failures.
- Delete requires exact target or unambiguous scoped reference, only deletes local scene not HA `scene.*`.
- Ambiguous area or pronoun => clarification, not guessing or deleting.
- Existing user-facing successful workflows must remain available in any approved future release.

This audit is read-only source analysis. No production changes; no new tests run. Full regressions only once at a meaningful milestone with progress.

## Pi inventory verified by owner (2026-10-15)
- The **running** systemd service has a valid PID and process cwd `/home/drpoh/ha-telegram-bot`; Git commit `32b5299`, service active.
- Both production and isolated DEV `src/scenes/tools.mjs` include `scene_operation_not_authorized`; capture/run/delete route calls are absent.
- Production modules `src/scenes/capture.mjs`, `manager.mjs`, `store.mjs` are present.
- Production database contains **1** row in `ai_scenes`, **3** rows in `ai_scene_entities`. Counts only, no private scene names or contents accessed.
- Both checkouts have 0 non-ignored untracked files. This does **not** exclude ignored private files or other deployment assets.
- `config/lighting-classification.local.json` was absent in production.

**Conclusion:** current running code has a blocked direct AI-scene tool entry point, despite preserved local scene records. Prior successful conversational transcript may refer to earlier runtime or an unverified alternate dispatch; never assume the current live path can mutate scenes. This is a release parity blocker. Restoring via old unguarded `refactor/v2` dispatcher is not acceptable; implement and test safety authorization in isolated DEV before proposing any deployment. No production modifications.
