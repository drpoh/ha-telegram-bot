# V3 MVP — selected LAN HA-MCP route (2026-10-10)

Owner selected **existing LAN HA-MCP**, without dedicated SSH tunnel. This supersedes tunnel deployment as the immediate MVP path, **not the authorization, replay or verification requirements**.

## Actual read-only evidence
- Raspberry Pi `eth0` source address **192.168.31.124** routes directly to HA **192.168.31.94** (private LAN).
- HA MCP listens on **0.0.0.0:9584**, i.e. its network listener is broader than just Pi.
- Runtime `mcp-url` file owner drpoh / mode 0600. Existing scheme is HTTP; payload and private endpoint path intentionally not logged.
- SSH operator-approved read-only HA registry previously confirmed exactly one MQTT `light.led_kukhnia`, approved historical device ID/unique ID and area. Existing MCP SDK supported `ha_get_state`, but server exposes `ha_call_service` too.
- Existing dev `kitchen-mcp-endpoint-policy` rejects non-loopback HTTP by design. **Do not loosen the validator merely because the private LAN is reachable.**

## Minimal acceptable controls before LAN operation
1. Verify LAN administration boundary and HA network address, preferably with a DHCP reservation and LAN separation. Restrict the port to **192.168.31.124 -> 192.168.31.94 TCP/9584**, denying other ingress at the router/HA host/add-on proxy. Verify the rule actually blocks access from a separate unapproved source. A Wi-Fi/LAN HTTP connection remains unencrypted, even with an IP allowlist.
2. Review HA-MCP credential privileges and confirm separate operator-owned permission/policy for single-light writes. MCP listing a write tool is **not** permission for the V3 agent to call it.
3. Introduce a separately reviewed, environment-specific LAN exception to the **dev** MCP client only once (1) and (2) are verified; deny all unrelated hosts, URL credentials, redirects and tool/entity substitution. Don't disable the default fail-closed path.
4. Provision immutable external SQLite claim journal with 0600 permissions in a separate approved release step. Preserve it on rollback; verify `inspectV3PilotStorage`.
5. Perform independent read-only acceptance through the deployed LAN policy, then owner-authorized one-light on/off confirmation, fresh readback and rollback review. Keep Telegram v2 and HA Green independent.

## Immediate release assessment
**NO-GO**: no evidence yet of source-specific TCP/9584 access enforcement or independent credential scoping. The owner chose the architectural LAN option, not a waiver of security controls or automatic permission to operate devices. No live network/HA/pilot changes were performed.

## 2026-10-10 — HA-side listener ownership read-only investigation
- Reconfirmed TCP 9584 listens on 0.0.0.0. HA's `ha apps` CLI is present; available Docker container name/port listings did not identify a dedicated MCP container matching port 9584. An HA add-on-specific source allowlist cannot yet be asserted or safely changed.
- Safe next action is to identify the authoritative listener process/configuration using HA Supervisor/app details and existing HA-MCP installation instructions, then restrict its bind address or enforce explicit source filtering by a tested network control. Changing 0.0.0.0 to 127.0.0.1 would **break direct-LAN V3**, so do not do so as a shortcut.
- Do not use a client-only IP check as proof of server-side protection. Keep the default-deny client and existing V2/V3 services unchanged until a verified network rule and credential boundaries are established.

## 2026-10-10 — HA listener process attribution follow-up
- HA host `/proc/net/tcp` confirms a listening TCP socket on 0.0.0.0:9584 with inode 8244936. Its restricted SSH/add-on PID namespace exposes only ~17 processes, so `netstat -p` could not attribute the host socket to a process.
- BusyBox fuser and lsof/netstat from restricted HA SSH namespace did not identify a responsible process. Docker lists ~22 running containers; no container declares a published port 9584 and no obvious `mcp`-named container. Multiple add-ons use host networking, so published-port inspection is insufficient to assign ownership.
- **No ownership proven; no firewall or container settings modified.** Need a supported HA Supervisor/add-on inventory or authenticated host-process view before changing server bind/firewall behavior. Separate router/access-control rule remains a possible operator-managed alternative.

## 2026-10-10 — Router path feasibility correction
- Pi network eth0 is 192.168.31.124/24, default gateway 192.168.31.1; `ip route get 192.168.31.94` selects **direct eth0, without via gateway**. HA and Pi therefore communicate at L2 within the same /24. An ordinary gateway-only routed firewall cannot be assumed to filter their traffic, nor traffic from other clients on this LAN.
- Router administration responds HTTP 200 and HTTPS 200 on 192.168.31.1, identifying only `nginx` in HTTP Server metadata; brand/model, authenticated administration permissions and same-subnet isolation/ACL features have not been established. No login or setting changes made.
- Suitable controls are **switch/Wi-Fi client isolation or bridge ACL that explicitly filters intra-LAN traffic**, distinct VLANs routed through an ACL-capable firewall, or server-side HA-MCP restriction/proxy. Client-side endpoint validation alone is insufficient. If no such supported feature exists, don't rely on router port-forward/firewall rules to protect MCP 9584.
- Before changing production, test both Pi->HA MCP TCP/9584 accepted and an independent unauthorised same-LAN device->HA MCP TCP/9584 rejected; ensure other HA and v2 connections remain intact. Do not apply blanket client isolation if it breaks required HA device discovery. Gate stays NO-GO until proven.
