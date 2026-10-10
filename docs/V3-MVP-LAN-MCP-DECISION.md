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
