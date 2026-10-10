# V3 MVP MCP trusted-transport gate — 2026-10-10

Status: **NO-GO.** This is an operator runbook, not authority to modify the active pilot.

## Current observations (Pi, metadata-only)
- V3 pilot URL is **non-loopback HTTP**. Existing dev policy explicitly rejects it; the active pilot still uses the old connection settings.
- No local TCP listener on port **9584** during inspection; no dedicated MCP/SSH tunnel user unit found. An SSH agent is not a tunnel.
- `ssh -G homeassistant.local` shows `StrictHostKeyChecking ask`; this alone does not prove a reviewed/pinned host key.
- Live V3 user service remains active. No SSH connection, HA registry query, device command, or service restart performed.

## Fastest safe route (operator review required)

Use a separately configured, restricted **SSH local-forward** from the Pi to the existing HA-MCP listener, instead of introducing a new TLS reverse proxy. A loopback HTTP endpoint is safe **only while the local endpoint is demonstrably backed by an authenticated SSH tunnel to the approved HA host**. URL allowlisting alone is insufficient.

1. Verify HA SSH server host key fingerprint out-of-band and pin it in an owner-managed known_hosts file. Reject unknown/changed keys (StrictHostKeyChecking=yes); never use accept-new/no for unattended release.
2. Verify HA-MCP actual listening address, allowed read tools and credentials through the approved HA administration workflow. Ensure the forward destination on HA is localhost/restricted and that other hosts cannot access the Pi's forwarded port.
3. In a separate, reviewed user-systemd tunnel service, use SSH with `-N -T -L 127.0.0.1:<dedicated_port>:127.0.0.1:<approved_HA_MCP_port>`, `ExitOnForwardFailure=yes`, a pinned known_hosts and least-privilege SSH identity. Do not run an exploratory tunnel against production automatically.
4. Verify the loopback listener belongs to the approved tunnel process, distinguish endpoint health from HA authentication, and perform a single scoped read-only MCP state query under controlled supervision. No `ha_call_service` during Gate B.
5. Update only the V3 pilot's secret-owned MCP URL to `http://127.0.0.1:<dedicated_port>/<reviewed_path>` after isolated acceptance. Review the complete endpoint URL including path and expected MCP server identity; never follow unreviewed redirects.
6. Reconfirm the approved `light.led_kukhnia` entity registry + device registry + area, operator-reviewed policy and independent claim journal. Only then request authorization for bounded live on/off acceptance and separate release.
7. Failure or loss of SSH tunnel must leave the V3 pilot unable to write; no retry of an uncertain action. V2 and Home Assistant Green remain independent.

## What is still missing

- Operator-attested HA host key and authorised SSH identity/source.
- A configured, running, authenticated dedicated loopback forward and verified MCP server identity.
- A real trusted HA registry read for the candidate exact light.
- Independent protected `claims.db` provisioned with operator authorization.
- Separately authorized one-light actuation acceptance and rollback sign-off.

Do not upgrade `Gate B` or `Gate C` to PASS from an offline test or a local listener alone.

## 2026-10-10 additional read-only acceptance evidence
- SSH `BatchMode=yes`, `StrictHostKeyChecking=yes` succeeded with the Pi's pre-existing `known_hosts` record. Stored local fingerprints (still require out-of-band owner verification): ED25519 `SHA256:fkIMHj61cYOe+RSDSKWkR89kQM9MFoQZlSEnJdpZirw`, RSA `SHA256:IlVBP8CcNZdlJP7+G/r/F8YS0psZfvRZ+IwG+rPlrCI`.
- HA host reports listener `0.0.0.0:9584` (this is potentially exposed to LAN; restrict network ingress as part of owner-managed hardening). It is not bound to HA loopback, though forwarding destination can be loopback.
- Authenticated SSH read-only registry inspection found exactly one `light.led_kukhnia`, `mqtt` platform, enabled; expected device ID, unique ID, single device, and kitchen area all match developer admission expectations. This is point-in-time metadata, not live write approval.
- An **ephemeral** strict-host-key SSH tunnel `127.0.0.1:19584` -> HA `127.0.0.1:9584` passed a TCP probe and was immediately stopped; subsequent `ss` showed no listener. This proves temporary forwarding, NOT authenticated MCP tool capabilities or production tunnel availability.
- Still NO-GO: host key not independently attested by operator, HA-MCP tool identity/rights not accepted, standalone persistent tunnel not installed, claims journal missing, no approved real actuation.
