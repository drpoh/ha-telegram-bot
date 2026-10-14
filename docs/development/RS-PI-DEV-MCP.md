# RS Pi DEV MCP — private, opt-in bootstrap (2026-10-14)

**Status:** source-only, not installed, not connected to ChatGPT, not deployed. Never auto-start or modify Pi production, Home Assistant, systemd or tokens.

## Purpose and scope

Reuse the project's existing `@modelcontextprotocol/sdk` and Node.js 20. The operator launches
`node scripts/manual/rs-pi-dev-mcp-readonly.mjs` **only in the canonical DEV checkout**
`/home/drpoh/projects/rs-home-ai-dev`. This is a stdio MCP server with two tools:

- `dev_git_status`: read branch, commit, tracked dirty-count (no filenames exposed).
- `dev_read_document`: read a single exact allowlisted public project Markdown document (16k chars max).

No shell tool, generic filesystem API, file modifications, push/pull, HA/MCP services or tokens.
A symlink resolving outside DEV is rejected. The path is fixed even if an environment variable tries
to select another workspace. Only the existing GitHub DEV branch carries this bootstrap.

## Preferred private connection: Secure MCP Tunnel

1. In ChatGPT web → Plugins → + → Add custom MCP server, choose **Tunnel**. Do **not** select
   No authentication with a public endpoint. Before proceeding, check your workspace has access to
   a tunnel and confirm Platform account billing/permissions. A ChatGPT subscription does **not**
   automatically include free Platform API usage.
2. In [Platform tunnel settings](https://platform.openai.com/), create/select a tunnel with
   `Tunnels Read + Manage`; associate it with the **same personal ChatGPT workspace**.
   For runtime use, restrict privileges to `Tunnels Read + Use`.
3. Install the supported `tunnel-client` binary from the official Platform instructions and
   keep keys private. From the canonical DEV checkout, use its quickstart to configure
   a **local stdio command** pointing at `node scripts/manual/rs-pi-dev-mcp-readonly.mjs`.
   Do not paste API keys, token values, tunnel credentials or command output containing them into chat.
4. Run `tunnel-client doctor --profile <your-profile> --explain`; then run the profile.
   Check readiness in its local UI. Avoid setting up a persistent service until owner approval.
5. In ChatGPT create a custom plugin named `RS Pi DEV (read-only)`, Connection → Tunnel,
   select the matching tunnel, complete authentication/security review and install.
   First call `dev_git_status` and compare its commit with remote DEV. Then test
   `dev_read_document` on `docs/CURRENT-STATE.md`.
6. Only after the read-only path works and the user authorizes narrower write tools,
   design and review a separately gated DEV writer. Read-only success is **not** permission
   to modify production or HA.

**Do not** open a direct Pi port to the public internet or rely on a public tunnel with no auth.
If no Secure MCP Tunnel entitlement appears or it has fees, stop and assess a different private
connector or transport; never silently switch to unauthenticated public hosting.

References:
- [OpenAI custom MCP server](https://developers.openai.com/api/docs/guides/custom-mcp-server)
- [OpenAI Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels)
