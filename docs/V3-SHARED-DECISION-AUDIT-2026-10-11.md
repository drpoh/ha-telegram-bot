# Stage / live V3 decision-path audit — 2026-10-11

## Actual import and execution boundaries
- Running pilot entry is `src/pilot/telegram-readonly.mjs` from separately pinned production release `97343fa`; its trusted local path uses `createKitchenDryrunConsent`, the operator-reviewed MCP dispatch boundary, live admission and protected claim journal. Despite old `kitchen-*` names the approved physical target is `light.tambur_svet_l1`.
- `src/pilot/kitchen-dryrun-consent.mjs` and offline `src/decision/v3-isolated-joined-chain.mjs` both use the existing `createV3IntentLedger`; their actor provenance and dispatch contracts differ and must not be swapped by name similarity.
- Stage-only `src/ops/stage-consent-simulation.mjs`, `stage-batch-consent.mjs` and `stage-batch-http-simulation.mjs` reuse pure `resolveStageLight`, the same intent-ledger primitive, but return `authorized:false`, `actualWrite:false`. They import no actual HA client or pilot dispatcher.
- `src/decision/confirmed-action-gate.mjs` is explicitly a reference offline confirmation gate; it is NOT evidence that the pinned pilot imports it. `v3-stage-target-revalidation.mjs` is a pure fixture helper, not authorization.

## Decision: share contracts, do not hot-swap running execution
1. Reuse the maintained HA/MCP/Assist transport and common immutable actor/action/identity primitives; preserve distinct trusted adapter boundaries for each ingress.
2. Consolidate only pure, proven-equivalent policy functions using incremental contract tests. Never pass synthetic Stage `authorized:false` candidates into the live action dispatcher or treat a mock as authoritative registry data.
3. Retain pinned pilot behavior and permissions until an independently tested immutable release, real registry-provenance verification, operator-reviewed allowlist, rollback and explicit owner promotion approval.
4. Keep tests that verify Stage consent imports have no live dispatch dependency and the pilot entry has no Stage mock dependency. Tests cannot by themselves prove runtime sandbox isolation.

## Outstanding work
- Build a precise comparison of source/actor and action-envelope invariants between `kitchen-dryrun-consent` and `v3-isolated-joined-chain` before extracting a shared contract.
- Stage production-target expansion is NOT authorized by this review; live coverage remains a single approved light.
- Plan Assist channel reuse through Home Assistant's native pipeline; avoid bespoke voice transport.
