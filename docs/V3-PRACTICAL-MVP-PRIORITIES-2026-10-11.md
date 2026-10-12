# Practical RS Home AI priorities — 2026-10-11

## Decision: stop multiplying guard frameworks
The cross-path regression now verifies that the offline joined-chain policy denial retains its one-minute pending intent without issuing a device write. The deployed one-light Telegram pilot instead consumes its intent before dispatch. Do not unify these subtly different policies by moving production code. A denied isolated mock is not a permission to retry physical actions. Real confirmation requires durable, actor-bound consume-before-dispatch and independent authorization.

## User value: prefer existing working HA services
- **Now:** retain existing Telegram V2 for already supported lights and status queries; retain the pinned V3 one-light pilot as a separately gated experimental path. Avoid installing another bot poller or expanding its service permissions through a source-only commit.
- **Next dev feature:** add one bounded, directly useful read-only status/room query using the existing authenticated Telegram ingress and HA-MCP read APIs. Reuse V2 capabilities if already reliable. No extra server, inventory daemon, or speculative multi-agent framework.
- **Then:** validate only a small owner-approved group of lights using actual HA entity IDs and fresh readback, after real registry provenance and HA-MCP network restrictions are independently proven. Never expose a whole-house switch from generic name similarity.
- **Voice later:** route Home Assistant Assist through the same policy/confirmation boundary; do not develop a second authority path.

## Completion / gates
The **offline replay semantics review is complete**, with its focused test checked on Raspberry Pi. The next user-facing feature is not authorized for production merely by passing mock tests. Reuse the currently running HA automations and V2 until an operator-reviewed release exists. No Home Assistant change is required to close this review.
