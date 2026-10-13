# Home Assistant Telegram AI Bot

> **V3 DEV checkpoint, 2026-10-13:** `feature/v3-home-agent` at `6f6e694` was tested on Raspberry Pi (198 isolated test files, 726 assertions, zero failures). Real read-only HA-MCP checks passed, including a separate 19-light inspection (9 readable / 10 unavailable). **No additional physical light control is enabled by these tests.** See [CURRENT-STATE](docs/CURRENT-STATE.md) and [documentation audit](docs/DOCUMENTATION-AUDIT-2026-10-13.md). Production is pinned independently; do not run a second Telegram poller.


AI-powered Telegram assistant for Home Assistant using MCP.

## Features

- Telegram interface
- HTTP API
- Home Assistant integration via HA-MCP
- AI tool calling
- Conversation and device context
- AI model fallback
- Request queue

## Requirements

- Node.js 20+
- Home Assistant
- HA-MCP
- Telegram bot
- AI provider

## Installation

Clone the repository and install dependencies:

    npm install

Create configuration:

    cp .env.example .env

Start:

    npm start

## Where to start

**New documentation entrypoint:** [docs/README.md](docs/README.md) → [single CURRENT-STATE](docs/CURRENT-STATE.md) → [short HANDOFF](docs/development/HANDOFF.md) → [open TODO](docs/TODO.md). Historical `docs/CHAT-HANDOFF.md` is preserved but no longer the recommended entrypoint.


See the [structure index](docs/STRUCTURE-INDEX.md) for file ownership, logical module groups and safe cleanup candidates.

**Current directory, source, active runtime and Git branches are different things.** Read [Project map](docs/PROJECT-MAP.md) before editing files or comparing service versions. The running V3 pilot is a pinned release artifact, not the historical `~/rs-home-ai-v3` checkout.

## GitHub branches and release boundaries

- `main`: baseline; does not contain all V3 work.
- `refactor/v2`: legacy/current-bot development lineage; preserve running v2.
- `feature/v3-home-agent`: active V3 engineering branch, **not a production release**.
- `review/gate-e-target-snapshot-hardening-20261009`: separate Gate E review work; do not assume it is merged.
- The branches do not represent installed dev/stage/prod environments. See [2026-10-10 audit](docs/REVIEW-2026-10-10.md) and [environment ADR](docs/ADR-DEV-STAGE-PROD.md).

## Raspberry Pi filesystem safety

Development checkout: `/home/drpoh/projects/rs-home-ai-dev` (separate clone, no production tokens). Do not develop directly in either running bot service directory.

**Two checkout paths from the same repository are used by different running units.** Do not treat either as a disposable clone. See [filesystem and migration plan](docs/PI-REPOSITORY-LAYOUT-PLAN.md) and use `node scripts/audit-pi-layout.mjs` for a read-only inventory before changing paths.

## Development status and handoff

- [Current open tasks](docs/TODO.md) (prior log: [historical archive](docs/archive/TODO-history-through-2026-10-11.md))
- [Session worklog](docs/WORKLOG.md)
- [v3 strategy and release gates](docs/home-agent-v3-strategy.md)
- [Longer-term progress](docs/PROGRESS.md)
- [Manual smoke tests](scripts/manual/README.md) — **may operate real Home Assistant devices**

The v3 feature branch is not a production release. Do not deploy simply because unit tests pass.

## Development

Syntax check:

    npm run check

Tests:

    npm test

## Security

Store all credentials in `.env`.
Never commit API keys, Telegram tokens or private MCP URLs.

## License

MIT

Reference-only Raspberry Pi resource and repository snapshot: [docs/raspberry-pi-reference-2026-10-08.md](docs/raspberry-pi-reference-2026-10-08.md). This is informational and does not authorize deployment.


## Optional Docker deployment (not enabled on the Pi)

The Raspberry Pi currently uses systemd and its own persistent data. Docker is an
**alternative**, not a second bot to start alongside the running Telegram poller.

```sh
cp .env.example .env
# Add Telegram, Gemini and HA-MCP credentials locally. Never commit .env.
docker compose config
docker compose build
# Stop the old Telegram poller using a separately reviewed migration plan BEFORE:
# docker compose up -d
```

Compose binds HTTP to **127.0.0.1:3000**, not to all network interfaces.
HA-MCP must be reachable from the container: `localhost` in an MCP URL
refers to the container, not to the Raspberry Pi host. Explicitly configure a
reachable, authorized MCP URL and protect it from untrusted networks. State in
`data/` and local files is not automatically persistent across container
recreation; add explicitly approved volumes before a live migration. No
Docker rollout is approved by committing these files.

## Minimal configuration

See [`.env.example`](.env.example), with `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_ALLOWED_USER_ID`, `GEMINI_API_KEY`, `MCP_URL`, and
`HTTP_PORT=3000`. Use the already-authorized Home Assistant MCP
server/endpoint; do not expose HA-MCP publicly.

## Example interaction (illustrative, not a live screenshot)

```text
You: Какая температура в сауне?
Bot: Температура сауны: … °C.

You: Включи свет в тамбуре
Bot: Цель: light.tambur_svet_l1. Для выполнения отправьте /confirm.
You: /confirm
Bot: Home Assistant подтвердил новое состояние. (only if verified)
```

Screenshot illustrations should only be added once privately captured,
reviewed and scrubbed of Telegram IDs, tokens, home addresses, and HA URLs.

## Architecture

The current entrypoint is `src/index.mjs`, not one 640-line
`bot.mjs`.

The repository root is intentionally small. Old `test-*.mjs` provider experiments and `list-models.mjs` are already archived under [`scripts/legacy/`](scripts/legacy/README.md) and are **not** part of `npm test`. Root `bot.mjs` remains as a historical monolith until external consumers are audited; root `smoke-auto-safe.mjs` may operate real devices and must never be run as a cleanup check. Production services run from separately pinned paths. Telegram lives in `src/telegram/`, AI in `src/ai/`, MCP
in `src/mcp/`, memory in `src/memory/`, queueing in
`src/utils/queue.mjs`, and HTTP in `src/api/`. Prefer incremental
refactoring to duplicating these modules. The v3 pilot uses a separately
pinned release with strictly bounded device permissions.

See [live-light acceptance and modernization tasks](docs/TODO.md).
