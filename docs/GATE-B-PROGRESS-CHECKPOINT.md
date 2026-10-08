# Gate B progress and strategy checkpoint — 2026-10-08 evening

## Goal alignment
Keep Home Assistant Green and the existing Telegram bot v2 fully autonomous/functional when AI v3 is off. Build Telegram (and later optional voice) → trusted channel adapter → language intent → complete current HA scope → independently reviewed deny-default policy → actor-bound confirmation → audited, verified action. No entity ID renaming, dashboard reinstall, hidden app writes or activation without separate authorization.

## Verified complete / protected
- Temporary commissioning dashboard source and runtime static assets were cleaned up separately; user removed HA dashboard/resources in UI.
- 293 devices, 17 areas, 2,889 entities, 45 light entities from fresh read-only registry. 12 removed lights were Browser Mod screen pseudo-entities; all critical named Gate B IDs remain.
- Owner-defined phrase «Выключи весь свет» targets HA group `light.ves_svet` specifically; not `light.ves_svet_2`.
- Security controls have working isolated fixtures: original request/action congruence, fail-closed scopes, replay/cancel, one-shot consent, group identity, mock service fault/readback, digest-pinned candidate that never auto-approves.

## Outstanding release blockers (not green)
1. Authoritative scope adapter in the *live joined path*: validated device→area inheritance, registry completeness and change invalidation. SSH read-only evidence is available, but not wired into a trusted production adapter.
2. Owner-reviewed pinned, immutable per-home grant + independent approval record (none currently authorizes writes).
3. Trusted authenticated Telegram ingress boundary; synthetic Telegram context is forgeable.
4. Integrated policy/registry/transport fault audits and live writer/readback design, followed by explicit owner-controlled deployment gates.
5. Voice via Atom Echo is optional **after** secure Telegram core; deferred without blocking the current work.

## Decision and next concrete step
**Gate B OPEN — no live v3 actions.** Next implement isolated current-registry-snapshot normalization and change-digest verification, with tests for Browser Mod removals, changed names, effective area inheritance, and whole-house group member mutation. Preserve fail-closed behavior; do not grant on a successful offline test. Continue trusted ingress and owner policy review only after these regressions are stable.

## Registry drift proof — offline implementation

Added pure `v3-registry-drift-check.mjs` to normalize `light.*` entity registry identity (name, platform, disabled flag), effective area with device inheritance, and exact HA Group `light.ves_svet` membership into a deterministic SHA-256 evidence fingerprint. Snapshot verification denies missing expected pins, changes in names/areas/availability exclusions, removals of display-only Browser Mod pseudo-lights, and group member changes; missing device references, duplicate lights, invalid area IDs, wrong group platform and incomplete inputs fail closed. **This is not wired to a live authorization path and never returns a grant.** The module currently expects caller-supplied registry arrays and separate group members: verifying trusted authenticated acquisition, freshness and independent approvals is still required before production use.
