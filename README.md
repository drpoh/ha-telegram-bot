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
