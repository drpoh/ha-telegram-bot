# Fresh Installation

This guide is intentionally hardware-neutral and suitable for a replacement Raspberry Pi or Linux mini-PC.

## Prerequisites
- Linux
- Git
- Node.js 20+
- reachable Home Assistant
- working HA-MCP endpoint
- Telegram bot credentials
- at least one configured AI provider

## Install
Clone the repository, select the stable project branch/tag, install dependencies and create local configuration:

    git clone <repository-url>
    cd ha-telegram-bot
    npm install
    cp .env.example .env

Fill in .env locally. Never commit it.

## Validate
Run:

    npm run check
    npm test

Then verify HA-MCP connectivity and start:

    npm start

## Production service
Use a service manager (normally systemd) so the bot starts after reboot and restarts on failure. Keep the service file free of embedded secrets; load configuration from the protected local environment file.

## Restore state
If migrating an existing installation, restore only documented runtime state/backups after installing the same compatible application version. See MIGRATION.md and BACKUP-RESTORE.md.

## Acceptance test
Before enabling autonomous behavior verify:
- Telegram/API input works
- AI provider responds
- HA-MCP search/read works
- one explicitly safe test entity can be controlled
- state is verified after the action
- memory/database is writable
- tests pass
