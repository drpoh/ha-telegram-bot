# ADR — Accelerated Gate B delivery (2026-10-09)

Status: Accepted for **development workflow only**. No deployment or new authorization.

## Problem
The critical end-to-end authorization blocker has not been closed, despite many separately tested offline registry transport fixtures. Full serial Pi checks are expensive after each microchange.

## Decision
1. Deliver vertical slices of the existing channel-neutral intent, trusted actor provenance, immutable candidate action, operator-reviewed policy, confirmation, read-only verified scope and audit chain. Keep `authorization:false` until an independently verified authorization source and full chain are tested.
2. Reuse Home Assistant's maintained `home-assistant-js-websocket` as the **candidate** official client, plus a maintained Node WebSocket implementation if needed, rather than extending mock socket protocol indefinitely. Keep HA-MCP as primary action interface. First evaluate package exports, compatible Node 20/ARMv7 versions, license, authentication, reconnection, TLS endpoint binding and rollback. Do not install or connect before this evaluation.
3. Gate B acceptance follows `docs/home-agent-v3-strategy.md`. Native HA registry calls are distinct and non-atomic; two-pass consistency is only drift detection. Keep local lighting classification protected and reviewed.
4. Run focused tests while editing, end-to-end isolated tests for each vertical slice, full `npm test` at stable commit/push. Offload full CI to GitHub Actions only with least-privilege permissions and explicit workflow review; keep Pi smoke/compatibility verification.

## Alternatives
- Continue homegrown WebSocket: more bespoke complexity with no authorization advantage; stop expansion except safety fixes.
- Import another full AI agent: risky control-boundary changes, extra Pi resource use, uncertain licenses; reject.
- Relax policy checks: unacceptable; reject.

## Threats and constraints
Prompt injection; spoofed actor/speaker; replay/replacement of a pending request; fabricated TLS or registry claims; mixed-time registry lists; malicious MCP tool proposals; stale entity IDs; accidental production deployment. Deny closed, preserve actor/action bindings and protect HA Green independence. No new privileges from read-only data or LLM output.

## External references
- https://github.com/home-assistant/home-assistant-js-websocket (Apache-2.0; reviewed as candidate on 2026-10-09; no code copied)
- https://developers.home-assistant.io/docs/api/websocket/ (native protocol; reviewed 2026-10-09)
- Existing `docs/REFERENCES.md` and `docs/GATE-B-REGISTRY-SOURCE-REVIEW.md`.

## Rollback
This milestone changes documentation only. Revert its commit if workflow direction is unsuitable. Subsequent dependency/integration work must be separate, feature-flagged, reviewed and non-deployed until Gate B acceptance.
