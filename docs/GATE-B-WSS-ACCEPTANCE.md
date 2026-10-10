# Gate B — WSS transport acceptance (offline)
Date: 2026-10-09. Status: offline transport candidate verified; real HA authorization **not granted**.

## Chosen upstream implementation
Use maintained `home-assistant-js-websocket@9.7.1` and `ws@8.22.0`; avoid custom WebSocket protocol implementation. Node.js 20.19.2 and ARMv7 Raspberry Pi import tests passed. The packages were installed only in `/tmp/rs-ha-upstream-probe-20261009`, not in the application or any service unit.

## Isolated TLS + frame limit + teardown
An ephemeral self-signed `localhost` certificate with SAN was created via OpenSSL, and an HTTPS/WSS WebSocket server was bound **only** to `127.0.0.1` on a random port. The script uses `ws` client with `rejectUnauthorized:true`, explicit `ca`, `servername`, `handshakeTimeout:1000`, and `maxPayload:1024`.
Results on Pi:
- Unknown certificate rejected: PASS.
- Exact trusted CA / hostname accepted: PASS.
- Wrong hostname rejected: PASS.
- Oversized 4096-byte message rejected with `WS_ERR_UNSUPPORTED_MESSAGE_LENGTH`: PASS.
- Client socket `terminate()` transitions to closing: PASS.
No HA address, token, API, live Home Assistant service or running bot was contacted. Ephemeral certificate and key were deleted. Local reproduction script: `/tmp/rs-wss-offline.mjs` (not packaged).

## Security caveats
- Passing loopback TLS does NOT authenticate the actual HA Green certificate or endpoint.
- `maxPayload` must be configured in the actual trusted client transport; post-receive registry JSON limits do not prevent allocating large frames.
- `terminate()` proof is for `ws` test client, not for every close/reconnect behavior of official Home Assistant `Connection`. A future owner-controlled socket factory must bound connections and close/terminate on timeout.
- No current HA operator-approved dedicated identity, token, endpoint/hostname, certificate pin/trust anchor, or V3 policy grants were provided or deployed.
- Home Assistant token permissions cannot be assumed granular solely because this application makes only registry reads. Keep fixed registry request allowlist and separate credential/operator review.
- Registry queries are not atomic across the three registry types; double-read only detects observed changes.

## Live read-only acceptance prerequisites
1. Owner explicitly approves a separate read-only discovery connection, operator-owned endpoint, trust anchor, and credential deployment (not V2 token reuse).
2. Verify endpoint hostname with strict TLS and reviewed CA/pin; no `rejectUnauthorized:false`.
3. Instantiate audited upstream WS client with `maxPayload`, handshake timeout and forced socket teardown; no automatic write replay.
4. Confirm active socket and verify bounded six fixed registry reads; fail closed on drift and disconnect; never claim registry-read evidence authorizes actions.
5. Review local V3 default-deny policy and explicit scope grants separately; complete staged fail/rollback tests before any write.
Until all are complete, Gate B remains OPEN and real HA access must not be attempted.

## 2026-10-10 — Actual upstream client against local WSS (not HA Green)
- On Pi Node 20/ARMv7, instantiated real `home-assistant-js-websocket@9.7.1` `createConnection` and `createLongLivedTokenAuth` using `ws@8.22.0` with an explicitly trusted ephemeral localhost certificate, strict certificate and hostname checks, maxPayload and handshake timeout.
- Local HTTPS/WSS fixture responded to `auth_required`, `auth_ok` and only three registry list commands. Existing one-shot bridge issued exactly **six** read-only commands on one connection. Result `read_only_review`, `authorization:false`; exit 0.
- Same test without trusted CA rejected TLS before WebSocket establishment: zero authenticated WebSocket connections, zero registry calls and `authorization:false`; exit 0.
- No real HA address, token, Telegram or production code was used; certificate test data ephemeral. This tests actual upstream connection compatibility and basic TLS fail-closed behavior, **not** robust disconnection/reconnect teardown under all faults, origin of HA Green, operator credentials or signed V3 policy. Gate B OPEN.
