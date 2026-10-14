# ARMv7 Secure MCP Tunnel client build (optional)

Raspberry Pi 3: `armv7l`, Raspbian 13, 921 MiB RAM. Local source checkout
`/home/drpoh/tools/tunnel-client` at short commit `1099560` requires Go 1.27.0.
Do not install the toolchain on the production-adjacent Pi. The separate
[manual GitHub Actions workflow](../../.github/workflows/build-tunnel-armv7.yml)
checks out the exact upstream commit
`10995608eeefac930f7199bccbb146378f883de8`, cross-builds
`GOOS=linux GOARCH=arm GOARM=7 CGO_ENABLED=0` and creates a downloadable
artifact `tunnel-client-linux-armv7-1099560` with SHA256SUMS.

## Operator sequence

1. After CI merge, GitHub → Actions → **Build optional ARMv7 tunnel-client**
   → Run workflow on DEV. Do not enable any schedule or deployment.
2. Download resulting artifact onto your trusted computer, transfer it to Pi,
   and validate the SHA256 hash. Do not copy secrets through GitHub artifacts.
3. On Pi place executable in `~/tools/tunnel-client/bin/tunnel-client-armv7`;
   verify `file` reports **ELF 32-bit ARM EABI**, then run `--help`.
   A successful cross-build does not prove the binary runs on Pi.
4. Run the official `tunnel-client help quickstart` and use the actual commands
   of this version. Use an operator-entered restricted runtime key; never paste
   it to chat or save it in tracked code.
5. Start tunnel only after verifying permissions, ChatGPT plugin tunnel selection,
   and pricing. The service's zero-cost status has not been guaranteed.
6. First remote tool must be read-only `dev_git_status`. Do not install a
   permanent systemd unit, grant arbitrary shell, or open public inbound ports.

Production V3 and V2 are not touched.
