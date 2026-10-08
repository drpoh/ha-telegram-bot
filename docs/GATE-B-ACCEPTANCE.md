# Gate B — release gate and evidence (2026-10-08)

**Status: OPEN / NOT ACCEPTED.** Isolated passing tests must not be confused with a release decision.

## Completion requirements
| Criterion | Current evidence | Status |
|---|---|---|
| Channel-neutral original request, identity and consent ledger | Pure envelope + channel/Telegram ledgers and fixtures | PARTIAL: no authenticated production ingress |
| Exact action ↔ permission ↔ original intent, no self-authorization | Tool boundary, trusted area and mock dispatcher | PARTIAL: components not a single trusted live chain |
| Independently reviewed per-home policy | Deny-all default, strict operator policy schema | PARTIAL: strict offline loader exists; no approved home policy or protected production provenance |
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

## 2026-10-08 — Verified MCP client interface

Read-only source inspection of `src/mcp/client.mjs` and `src/mcp/tools.mjs` confirms the runtime uses a generic MCP client and exposes `ha_search`, `ha_get_state` and `ha_get_overview` to the model. These do not prove full device-registry membership, stable device IDs and device-to-area mapping. Current production-ready registry adapter remains **unsupported**; do not substitute entity searches. Local loader exists in isolation; production-grade provenance, owner approval and integrated enforcement remain open. No HA state changes were attempted.

## 2026-10-08 — Local policy loader checkpoint

A constrained offline JSON loader now validates filenames, canonical directory containment, symlink rejection, unsafe writable file modes, file size and strict policy schema. Focused 2/2 passed. It returns `parsed_not_operator_approved`, never grants execution; permissions still require owner's separate review and trusted process control. Full directory ownership/TOCTOU defenses and operator authorization still require security review before production.

## 2026-10-08 — Gate B reconciliation and next security checkpoint

Verified branch `feature/v3-home-agent` at `b0075fa` (308-assertion documentation checkpoint). The offline policy parser/loader is implemented; this does **not** approve any entity, grant a live capability, close Gate B, or authorize deployment. The loader currently canonicalizes the configured root and target, checks basename/containment, rejects symlink final paths and group/world-writable target files, caps size to 64 KiB, and validates a deny-default light-only `confirm` schema.

**Outstanding security checks before claiming trusted provenance:** verify trusted root and every parent component ownership and write permissions; prevent filesystem swap/TOCTOU between checks and file open (descriptor-based open/fstat where supported); treat file contents as unapproved even after parsing; require out-of-band owner approval of exact policy digest/version and trusted identity; ensure any policy mutation revokes pending authorization; prohibit LLM/Telegram/Assist-supplied paths, privilege levels or grants. Reject missing, stale, changed or ambiguous sources. Make no automatic fallback to v2 allowlists.

**Next isolated regression gate:** add fault cases for writable parent directories, final path replacement races, symlinked directory components, directory changes between validation and read, malformed JSON, unknown keys, oversized files, invalid entity/service entries, empty grants and identity mismatches. Only then design a common channel-neutral envelope + reviewed policy + complete registry-backed scope + confirmation + single-use dispatcher proof. Agent/HA/Telegram restart, live actuation, and gate acceptance remain prohibited without explicit approval.

## 2026-10-08 — Isolated policy-loader verification on Raspberry Pi 3

At branch commit `ec8cbd1`, the offline loader's 4 focused Node tests passed (4/4, exit 0). Full repository syntax check completed successfully on Node v20.19.2. For a clean detached worktree at `/tmp/ha-gateb-verify`, the existing test runner initially could not open `data/bot.db`, because its schema source depends on a local runtime file; missing modules and required config variables also blocked the first two runs. For the final run, a **schema-only** disposable SQLite database, linked read-only use of existing installed node modules, and deliberately dummy offline credentials plus an unreachable loopback MCP URL were supplied. Result: **69 isolated test files, 310 passing assertions, 0 failed files, exit 0**. No production process restart, no HA actuation, no live MCP commands, no database contents copied.

The test harness's dependency on a production SQLite schema and required dummy environment should be replaced with committed sanitized fixtures as separate follow-up. Security limitations remain: parent directory provenance, descriptor-based directory resolution, strict race resistance, approved policy digest/owner identity, registry completeness and joined intent-to-execution proof. **Gate B remains OPEN; no authorization to deploy or actuate.**

## 2026-10-08 — Standalone SQLite test fixture checkpoint

The test runner no longer reads the local production `data/bot.db` schema. Its schema-only source is the committed `test/fixtures/bot-schema.sql`, with `ai_scene_entities.scene_id` referencing the current `ai_scenes` table (the local historical database exposed `ai_scenes_old`). Every test file still gets a fresh temporary database and it is removed after the run. On Raspberry Pi 3, Node 20.19.2, using dummy environment variables, unreachable loopback MCP URL and the existing dependency installation, the isolated suite returned **69 test files, 310 passing assertions, zero failed files, exit 0**. No production credentials or HA writes were used.

Remaining: verify reproducibility on a truly clean dependency installation/CI runner, and separate the fixture from any future production schema evolution. Gate B stays OPEN.

## 2026-10-08 — Explicit offline test environment

The isolated test runner now constructs a minimal child-process environment rather than copying `process.env`. It supplies placeholder Telegram and Gemini credentials, a loopback MCP URL at an unreachable port, isolated HOME/TMPDIR and a fresh schema-only SQLite database per test file. Raspberry Pi 3 / Node 20.19.2 isolated run: **69 files, 310 passing assertions, 0 failed, exit 0**. It still relies on existing installed npm modules; clean-install/CI reproducibility remains unverified. No production deployment, live HA actions or authorization grants. Gate B OPEN.

## 2026-10-08 — Offline policy content digest

The offline loader now optionally accepts a caller-supplied lowercase SHA-256 digest and compares it to the exact bytes read from its opened file descriptor using timing-safe comparison. It exposes the observed SHA-256 for subsequent out-of-band owner review. Invalid or mismatched digests fail closed. **Digest matching is not approval** and the caller may not source the expected digest from an LLM, Telegram or Assist message. No production path uses this as a grant.

Verification: loader-specific 5/5 passed; isolated suite 69 test files, 311 assertions passed, 0 failed files, exit 0, dummy credentials and unreachable MCP. Remaining: trusted approved digest store, parent directory and directory-swap defenses, owner identity and authorization linkage. Gate B OPEN.

## 2026-10-08 — Parent-directory permission checks

The offline loader now walks parent directory components, rejects symlink components, unsafe writable ancestors, and ancestors not owned by root or the current process UID. It permits root-owned sticky directories (e.g. /tmp) for isolated tests; that exception is not a substitute for protected private policy storage. The file and immediate directory retain their stricter checks. Validation is path-based and remains subject to directory replacement races; no production authorization follows from this check.

Focused regression: 6/6 tests passed. Entire isolated suite: **69 files, 312 passing assertions, 0 failed, exit 0**. Gate B OPEN, no live HA writes.

## 2026-10-08 — Post-read source identity recheck

The offline policy loader now re-stats the final policy path, verifies its device/inode against the opened file, re-resolves the policy directory, and rechecks every recorded ancestor device/inode after reading. Detected substitutions fail closed. This is defense-in-depth only: pathname checks can still be bypassed by a swap-and-restore race, so descriptor-relative directory traversal or another independently reviewed source-integrity mechanism remains mandatory before live approval.

Focused regression: 6/6; full isolated suite: 69 files, 312 assertions passing, 0 failed, exit 0. No HA actuation or production changes. Gate B OPEN.

## 2026-10-08 — Minimal joined offline chain (priority acceleration)

Created `src/decision/v3-isolated-joined-chain.mjs` combining trusted-source envelope validation, actor-bound intent issuance, original text/action storage, strict light-only tool perimeter, live-scope verification adapter, one-shot confirmation ledger and simulated readback. This module is **isolated only** and does not import any live service writer, cannot authorize an agent-supplied source identity, and is not wired into v2 or production v3. New tests reject unverified sources, actor mismatch, stale/unsafe commands, unverified live evidence, token replacement, cancellation and replay. A positive end-to-end mock runs exactly one simulated write with verified readback.

Focused joined tests: 3/3. Entire suite: **70 files, 315 passed assertions, 0 failed, exit 0** on Raspberry Pi 3, offline fixture environment.

**Remaining Gate B acceptance blockers:** replace externally injected test policy with the owner-approved pinned and protected local policy; establish authoritative complete HA registry-backed scope; move source identity/actor issuance into a trusted authenticated channel adapter rather than accepting caller statements; test alternate-tool and concurrent races through this precise joined chain. Do not treat any mock as production authorization. Gate B remains OPEN.

## 2026-10-08 — Issuance-time command/action agreement

The isolated joined chain now rejects a candidate action at issuance when original Russian light-on/off intent does not match its requested service. In particular, a user-requested turn-on can no longer create a pending turn-off confirmation. It remains a test-only ingress with caller-provided transport authentication, **not production proof of identity**. Focused joined tests 3/3; isolated suite 70 files, 315 passing assertions, no failed files, exit 0. No HA writes. Gate B OPEN.

## 2026-10-08 — Isolated ingress issuance boundary

The joined offline chain's public `issue()` now fails closed regardless of any caller-provided `authenticated:true`, actor, or source fields. An injected transport-owned `telegramIngress` factory alone receives the private `issueVerified` closure and can expose `issueFromTransport`. In tests the injected adapter is deliberately synthetic; **this is not proof of real Telegram authenticity**. No live transport or service writer is connected and the module must not enter production with a caller-controlled ingress factory. Joined focused tests 3/3; full isolated tests 70 files, 315 assertions, 0 failures, exit 0. Gate B OPEN pending actual trusted transport validation and approved local policy/registry provenance.

## 2026-10-08 — Telegram transport ingress fixture

Added an **offline-only** Telegram ingress adapter factory that extracts the user ID, chat ID, original text and timestamp from a coherent Telegram context, checks the allowlisted user, and rejects mismatched message/chat identities, bot commands, stale timestamps and mismatched requested service. Additional model-supplied `actorId` and `authenticated` parameters are not accepted as authority. The adapter must only be called inside a transport-authenticated Telegraf handler; arbitrary objects resembling Telegram updates can be forged by an untrusted caller, so this is **not** production identity verification.

Focused test 1/1; isolated suite **71 files, 316 passing assertions, 0 failed, exit 0**, with no live Telegram integration or HA writes. Gate B OPEN pending trusted integration boundaries, operator approval and registry completeness.

## 2026-10-08 — Gate B final adjudication checkpoint

Integrated synthetic Telegram ingress -> action/actor ledger -> trusted-light area mock -> one-shot confirmation -> simulated MCP write -> state readback. Test 2/2 in Telegram fixture; isolated suite **71 files, 317 passing assertions, zero failed, exit 0**. Formal itemized decision: `docs/GATE-B-DECISION-2026-10-08.md`. **Owner-home Gate B NOT ACCEPTED**: no approved real-home policy or complete read-only device registry provenance; mock Telegram context is forgeable outside the trusted handler; combined source/audit fault gates remain. Do not switch production.
