# Gate B — release gate and evidence (2026-10-08)

**Status: OPEN / NOT ACCEPTED.** Isolated passing tests must not be confused with a release decision.

## Completion requirements
| Criterion | Current evidence | Status |
|---|---|---|
| Channel-neutral original request, identity and consent ledger | Pure envelope + channel/Telegram ledgers and fixtures | PARTIAL: no authenticated production ingress |
| Exact action ↔ permission ↔ original intent, no self-authorization | Tool boundary, trusted area and mock dispatcher | PARTIAL: components not a single trusted live chain |
| Independently reviewed per-home policy | Deny-all default, strict operator policy schema | BLOCKED: operator policy file and protected loader absent |
| Live complete read-only HA room/device evidence | Strict area reading fixtures, satellite snapshot completeness guard | BLOCKED: authoritative device registry capability unverified |
| Replay/cancel/expiry/race fail closed | Ledger mock tests and in-flight invalidation | ISOLATED PASS; needs joined chain regression |
| Audit trail at every decision and failure | Existing decision audit and worklog | PARTIAL: verify joined path evidence |
| No real HA actuation before approval | Isolated fixtures only | PRESERVED |

## Next permitted sequence
1. Implement trusted config loading and provenance checks while retaining zero real grants.
2. Review the exact private per-home device/lighting classification and permissions with owner; do not infer from v2 auto_safe entries.
3. Establish authenticated, complete, read-only HA device registry inventory without relying on generic entity search. If capabilities unavailable, keep satellite room decisions disabled.
4. Connect common command provenance, validated scope, policy and one-shot confirmation in a single isolated end-to-end pipeline, test failure/race cases, and inspect audits.
5. Re-evaluate Gate B. Gate C and production rollout remain separately gated; live tests and production service changes require explicit consent.

No overall readiness percentage is warranted.
