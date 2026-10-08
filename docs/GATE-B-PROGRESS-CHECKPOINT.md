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

## Joined Telegram admission fixture

Created `v3-telegram-joined-adapter.mjs` connecting the independent Telegram message admission checks to the existing *offline* one-shot consent ledger. Verified allowlisted private-chat context, coherent actor/message identity, age guard and replay rejection before issuing a pending token. Spoofed sender, group chat, stale timestamp, direct untrusted issuance and repeated update fail closed; cancellation invalidates pending state. This is not a production authentication mechanism: the `ctx` object is test supplied, and must only come from trusted Telegraf transport code after an independent boundary review. There is no production hook, policy grant or live HA writer.

## Joined registry-change invalidation before simulated dispatch

The isolated Telegram → reviewed room scope → confirmation → mock writer chain now optionally accepts `verifyRegistryAtDispatch`. After asynchronous room discovery, but before consuming the one-shot confirmation and before any simulated write, it validates a pinned lighting-registry snapshot. A mismatch, missing evidence, exception, or invalid guard denies without dispatch. A new joined fixture covers changed device-inherited area, a changed group-member list during an in-flight verification, recovery after a fresh matching snapshot, and replay denial. This is explicitly mock-only and still requires a trusted authenticated registry source, reviewed immutable policy, proven Telegram transport, and actual audit gates before production. Existing v2 is not modified.

## Owner approval record candidate (offline, not authorization)

Added `v3-owner-approval-record.mjs`: an exact-schema candidate record pins policy SHA-256 and registry SHA-256, validates a bounded expiry (at most 24 hours), and fails closed on expired/future-dated records, any extra fields, and changed policy or inventory digests. Digest comparisons use timing-safe comparison. Even a matching record explicitly returns `authorized:false` and `owner_identity_and_protected_provenance_required`. Neither a forged JSON file nor an AI/Telegram assertion may count as approval. An independently authenticated local owner approval, tamper-resistant storage, revocation and approved action binding remain separate requirements before any real HA write. No production code, dashboard, HA configuration, bot or permissions changed.

## Approval revocation recheck — isolated

Implemented `v3-approval-revocation-guard.mjs`: re-reads a candidate approval via a read-only injected adapter with timeout, validates policy and registry digests and expiry immediately before simulated authorization consideration, and denies missing records, mutation or read failures. Even a matching candidate returns `authorized:false`, because trusted independent owner authentication and protected storage are not implemented. This module is not wired to production or the simulated service dispatcher and cannot grant HA writes. Focused checks and the complete isolated suite passed (82 files / 341 assertions). Gate B OPEN.

## Protected local approval candidate reader — offline checkpoint

Added `v3-protected-approval-reader.mjs`: a read-only approval JSON candidate reader requiring a private user-owned directory and private regular file, strict basename, bounded 4 KiB size, `O_NOFOLLOW`, and post-read inode/size/mtime verification. Symlinks, permissive files/directories and absent/invalid paths fail closed. No storage writer or owner authenticator is implemented, and even successfully read candidate data returns `authorization:false`. It is NOT production-grade trusted approval provenance: ancestor path components, path swap-and-restore races, independent attestation/approval workflow, persistent revocation and rollback resistance still need review. No actual v3 grants. Full isolated suite: 83 test files, 343 assertions passed, 0 failures.

## Anti-rollback candidate evidence — offline checkpoint

Added `v3-approval-rollback-guard.mjs`. A separately supplied checkpoint pins the exact approval record SHA-256 and monotonically reviewed revision; old/replayed revisions, unexpected new revisions, changed content, and missing or malformed checkpoints deny. This only detects relative to a separately *trusted* checkpoint. When both candidate and checkpoint can be forged, even matching evidence proves no independent owner identity or durable anti-rollback authority. No new approval or action capability exists, and no production connection is present. Focused tests 2/2; full isolated suite 84 files / 345 assertions, 0 failed. Remaining Gate B blockers: trusted separate monotonic checkpoint, authenticated owner workflow, trusted Telegram transport, authoritative live registry reader and combined audit enforcement. Gate B OPEN.
