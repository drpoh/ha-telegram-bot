# Home Assistant Telegram AI Bot

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

## GitHub branches and release boundaries

- `main`: baseline; does not contain all V3 work.
- `refactor/v2`: legacy/current-bot development lineage; preserve running v2.
- `feature/v3-home-agent`: active V3 engineering branch, **not a production release**.
- `review/gate-e-target-snapshot-hardening-20261009`: separate Gate E review work; do not assume it is merged.
- The branches do not represent installed dev/stage/prod environments. See [2026-10-10 audit](docs/REVIEW-2026-10-10.md) and [environment ADR](docs/ADR-DEV-STAGE-PROD.md).

## Raspberry Pi filesystem safety

**Two checkout paths from the same repository are used by different running units.** Do not treat either as a disposable clone. See [filesystem and migration plan](docs/PI-REPOSITORY-LAYOUT-PLAN.md) and use `node scripts/audit-pi-layout.mjs` for a read-only inventory before changing paths.

## Development status and handoff

- [Current open tasks](docs/TODO.md)
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
