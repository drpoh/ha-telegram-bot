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

## Trusted ingress and action contract comparison (2026-10-11)
| Boundary | Live pinned pilot source path | Isolated joined chain | Implication |
|---|---|---|---|
| Actor origin | Telegram handler validates owner and private chat before `createKitchenDryrunConsent` request | `normalizeV3Command` accepts only authenticated Telegram transport through a private injected issue capability | Do not accept actor identity or `authenticated=true` from LLM/voice text; preserve trusted adapter gate |
| Approved target | Exact `light.tambur_svet_l1`, `light` domain, on/off only, checked again inside MCP dispatcher | Action envelope passes deterministic boundary and policy; offline mock dispatcher only | No shared generic selector may widen the live pilot's target allowlist |
| Confirmation | Common `createV3IntentLedger`, one-time token limited to 60s, locally keyed by actor | Common ledger and transport-bound issue, mock dispatcher validates authorization | Reuse ledger primitive; transport-specific actor verification stays separate |
| Execution | Trusted admission, persistent claim journal and HA state preflight/readback (no write retry) | In-memory mock ledger + injected simulatedWrite; no live MCP client | Do not replace durable live replay protection with fixture memory |
| Voice | Not wired to the live pilot | Reference command envelope rejects asserted voice identity | Implement voice later through native Assist and shared policy only after identity/scope review |

**Decision:** retain the currently shared intent-ledger primitive and explicit, separate trusted ingress adapters. A new universal adapter would add complexity without proving equivalent actor, identity, approval and durable claim semantics. First develop contract tests and keep live release unchanged.

## Cross-path executable contract regression (2026-10-11)
- `test/v3-cross-path-trust-contract.test.mjs` tests real dev-source pilot and offline joined implementations with deliberately isolated dependencies. Both reject untrusted actor claims, scope escalation, and dispatch without approval. Pilot dry-run consumes failed execution confirmation once; 60-second expiry and cross-actor attempts are denied. Joined chain does not receive authority from spoofed ingress and requires offline policy evidence.
- **Important non-equivalence:** a policy-denied joined-chain confirmation can remain pending for a later attempt, whereas the pilot consumes its intent before dispatch. This does not permit writes without policy, but a future unification must explicitly decide fail-closed token invalidation before production adoption. Do not claim equivalent replay semantics just because the two paths share the ledger.
- Only offline tests added; running release remains pinned at 97343fa.
