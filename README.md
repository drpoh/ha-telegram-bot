# Home Assistant Telegram AI Bot

AI-powered Telegram assistant for Home Assistant using MCP.

## 🚧 v3 Home AI Agent

Development of the next-generation Home AI Agent is in progress.

**[View v3 development progress](https://github.com/drpoh/ha-telegram-bot/blob/feature/v3-home-agent/docs/PROGRESS.md)**

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