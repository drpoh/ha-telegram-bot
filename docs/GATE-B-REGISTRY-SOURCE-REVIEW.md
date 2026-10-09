# Gate B: dedicated HA registry source review — 2026-10-09

Status: BLOCKED for production authorization. Review is deliberately read-only.

## Code-level inventory
- `src/mcp/tools.mjs` exposes generic `ha_search` and `ha_get_overview` clients; neither is a documented complete device/entity/area registry snapshot with stable IDs and trusted source guarantees.
- `src/decision/v3-registry-capability-guard.mjs` refers to `ha_device_registry_snapshot` as a proposed capability, not a currently validated adapter.
- `src/decision/v3-registry-source-contract.mjs` validates claimed metadata in offline fixtures only. An AI, request argument, or untrusted transport can forge these flags; no successful contract check grants permission.

## Acceptance prerequisites for a future read-only adapter
1. Inspect the installed HA-MCP server's documented authenticated registry API and service version; if unavailable, build a separately reviewed read-only adapter under dedicated credentials.
2. Retrieve entity, device and area registry snapshots from one trusted authenticated HA source with demonstrably complete, consistent pagination or atomic snapshot semantics; all count and cursor fields must match.
3. Bind origin to a configured endpoint and protected credentials outside model input, with service identity checks and a provenance record. Reject source substitution.
4. Verify freshness, stable entity/device/area IDs, disabled/unavailable members, duplicates and mid-read version drift using offline faults before integrating the shared policy engine.
5. Require explicit operator review and separate signed or permission-protected per-home policy. Registry validity cannot grant actuation.
6. Preserve Home Assistant Green independence; no production HA write, service restart or new credentials without owner approval.

Next: inspect actual installed server capabilities and version using sanitized read-only diagnostics, then implement and test a source-specific adapter. Do not use generic `ha_search` as a substitute.

## Live read-only capability discovery (2026-10-09)
- An independent MCP client connected to the configured HA-MCP transport on Raspberry Pi and called **only** `listTools()` twice; no HA entity reads or write tools invoked. The server advertised **53 tools**.
- `ha_get_device`: supports list pagination (`limit` 1..200, `offset`), optional `detail_level=full`, filtering by area/integration, and single-device lookups. Schema does **not** promise atomic global snapshot or generation/version consistency between pages.
- `ha_get_entity`: resolves exact entity IDs or stable unique IDs; its exposed schema is not an unfiltered complete entity-registry listing API.
- `ha_list_floors_areas`: provides floor/area lists and counts, but does not bind their version atomically to the device and entity pages.
- `ha_search` can enumerate entity-registry matches with pagination, `include_hidden=true`, but is a search surface; its schema does not guarantee all entities, stable membership, or consistency with device lists during concurrent HA mutations.
- No advertised `ha_device_registry_snapshot` tool. A standalone dedicated source is still needed for Gate B evidence, or upstream must offer documented consistent snapshot semantics verified independently.
- Do not interpret `ha_get_device`/`ha_search` pagination support as transactional completeness; mixed-time pages and registry mutation require explicit detection. Also require operator-controlled credentials and trusted endpoint binding.

## Home Assistant native WebSocket alternative (2026-10-09)
- Official Home Assistant Core exposes `config/entity_registry/list`, `config/device_registry/list` and `config/area_registry/list`, which directly list registry records. Unlike `ha_search`, these are not search result pages. See Home Assistant developer WebSocket documentation and current Core registry handlers.
- **Important:** calls are three distinct operations; they do not constitute one atomic read across registries. Consider repeated two-pass read and canonical digest comparison to detect observed drift, but even identical passes do not prove that no mutation occurred between calls.
- The 2026.9 device registry introduces child devices; a collector must retain parent/child relations and effective area semantics, not assume all devices have the same fields.
- A future adapter must authenticate the configured Home Assistant WebSocket endpoint, protect the token outside model context, bound memory/time/record count, verify read-only request allowlist, and reject malformed cross-registry links. Do not expose generic WebSocket commands to AI.
- Added offline-only `v3-registry-double-read.mjs` with two-pass stable digest checks. It never authorizes actions; source authenticity and snapshot atomicity remain unproven.

## Offline bounded native WebSocket request adapter
- Added `src/decision/v3-ha-registry-read-adapter.mjs`, injectable transport only. The only requests it constructs are `config/entity_registry/list`, `config/device_registry/list`, and `config/area_registry/list` (two passes). No URL, token, WebSocket client, AI transport or live HA access is present in the module.
- Each response must be an array with a bounded record count; duplicate/invalid identity, mismatching two-pass hashes, unknown entity device/area, missing child parent and parent cycles fail closed. A global timeout bounds the promise wait, but **does not cancel a request already in progress**; a production transport must enforce cancellation, payload byte size, connection concurrency and TLS/endpoint verification independently.
- Even a stable result returns `ready:false`, `authorization:false` and `read_only_review`. Identical reads are not an atomic HA snapshot and do not prove the authenticated source. All Gate B live authorization and operator policy blockers remain open.
- Focused tests use injected fixtures only, never a real Home Assistant. No running services modified.

## Protected endpoint configuration preflight (2026-10-09)
- Added `v3-ha-registry-endpoint-policy.mjs` as a **pure, offline configuration check**. It rejects plaintext `ws:`, URL credentials, query or fragment injection, incorrect WebSocket path, and missing operator configuration/protected-secret/TLS-pin declarations.
- **Important:** caller-provided `tlsPinned:true` is a declaration, not cryptographic pin validation. Never accept model-provided flags as authorization or pass them unverified into a live transport. Real TLS verification, host/IP resolution, token permissions and endpoint ownership must be enforced by the transport and reviewed separately.
- No HA connection or credentials are used. The accepted result is `configuration_review_only` with `authorization:false`.

## Offline WebSocket protocol fixture
- `v3-ha-registry-ws-frames.mjs` is a frame state-machine only, with fixed registry-list command allowlist and request/result ID matching. It rejects invalid handshake, failed auth, invalid result, malformed JSON and oversized frames.
- It must never be mistaken for a production client: receipt of a simulated `auth_ok` frame is not proof of server authentication; real transport still requires a protected token, validated TLS server identity, bounded timeouts, byte limits and operator-owned configuration.

## Injected offline WebSocket transport harness
- `v3-ha-registry-ws-client.mjs` exercises simulated authentication and only the fixed three read-only registry-list operations against an injected mock socket. Requests are paired with response IDs, and timeout/disconnect/rejected auth close the fixture and deny.
- This is not a deployable HA connection. It does not create or authenticate a WebSocket, verify TLS pinning, protect or load a real access token, verify remote source identity, or cancel hung underlying I/O. `auth_ok` from a mock is not cryptographic verification. No production usage until separately reviewed and authorized.

## Offline credential-injection fixture
- `v3-ha-registry-secret-boundary.mjs` shows a test-only dependency-injection lifecycle with validation and socket closure. Its trusted `performRead` callback receives the secret, so it is only safe when **all** callbacks are operator-controlled trusted code. It is not proof of protected file permission, TLS identity, or transport credential security.

## Local protected secret file prototype
- `v3-ha-registry-secret-file.mjs` reads only an absolute-path regular file, rejects symlinks, non-owner UID, group/other access and invalid size, and verifies the opened inode. It uses fixture-only tests and is not wired to HA.
- This is not a completed production security audit: parent directory path components and attacker-writable ancestors must also be verified before allowing real credentials. TLS endpoint identity and secret privilege scoping remain separate blockers.

## Ancestor directory validation (offline)
- Secret-file fixture now checks parent-directory ownership, symlink components and unsafe writable modes, except sticky shared system directories such as `/tmp` for tests. The path traversal is not an atomic openat sequence and should not be trusted against concurrent attacker-controlled renames. Deploy only using a fixed privileged path with independent operator review.
