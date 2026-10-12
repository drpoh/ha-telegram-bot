# ADR — Reuse platform capabilities before building custom infrastructure

Status: accepted as engineering direction, 2026-10-11. This is an architecture decision, not a deployment approval.

## Rule
Before writing new infrastructure, identify an existing Home Assistant, ESPHome, Assist, HA-MCP, Node.js or systemd facility. Implement only the smallest missing decision/policy adapter; do not implement alternative device registries, service supervisors, voice transports, message brokers, or automation schedulers.

| Need | Existing owner/tool | Our code boundary |
|---|---|---|
| Device state, area/entity registry, native automation | Home Assistant | Read completeness/identity evidence and deny ambiguous commands |
| HA tools and control | HA-MCP and its maintained SDK | Limit approved actions, source provenance, one-use confirmations |
| Voice I/O and wake word | Assist, Whisper, Piper, ESPHome / Atom Echo | Normalize recognized intent into the same shared decision policy |
| Telegram messaging | Telegraf | Bind trusted user/chat to command intent and confirmation |
| Process supervision, isolation and logs | systemd / journald | Minimal entrypoint and invariant health output, not custom watchdog |
| Mock HTTP and unit tests | Node.js built-in `http`, `node:test`, AbortSignal | Strict fixture contracts, fault injection, deterministic policy tests |
| Durable local facts | SQLite | Minimal validated schema for claim/audit, not new queue infrastructure |

## Build vs reuse decision gate
1. Can the platform already provide it safely, with supported lifecycle and stable API? Integrate, do not recreate.
2. If an adapter is needed, keep it pure/deterministic where possible; no direct device writes from model output.
3. Prefer one well-maintained dependency over equivalent custom networking code; verify licensing, Node/ARM compatibility, upgrade and rollback.
4. Do not add a long-running service, database, network listener or credentials solely to isolate a coding experiment.
5. Existing custom prototypes may remain for regression evidence, but production integration should consolidate rather than multiply overlapping implementations.

## Current decision
Retain the Stage mock only as a non-authorizing integration fixture. Do **not** grow it into a replacement HA-MCP or HA implementation. Do not deploy a second Telegram poller or custom process manager. Future stage systemd provisioning still requires effective network sandbox review and operator approval. Existing live V2 and pinned V3 remain untouched.

## Rationalization backlog
- Review `src/decision` for duplicate light selection and confirmation paths; consolidate behind one tested policy interface before broadening live scope.
- Check HA Assist and MCP supported capabilities before adding a voice transport implementation.
- Consolidate historical root scripts only after their external consumers are audited; preserve provenance.
