# Migration to a New Raspberry Pi or Server

## Goal
Rebuild from GitHub rather than copying an unknown old installation.

## Before migration
1. Record the running Git commit/tag.
2. Back up .env securely.
3. Back up runtime databases/memory using BACKUP-RESTORE.md.
4. Record service configuration and HA-MCP connectivity settings.
5. Do not put secrets into GitHub.

## New host
Install Linux, Git and Node.js 20+, clone the repository, checkout the recorded stable version and run npm install.

Restore .env with restrictive permissions, then restore the compatible runtime backup.

Run:

    npm run check
    npm test

Start interactively first and verify AI + HA-MCP. Only then enable the system service.

## Cutover
Do not run two Telegram consumers using the same bot token unless the architecture explicitly supports it. Stop the old instance, start the new one, perform acceptance tests, then enable autonomous features.

## Hardware upgrade
The architecture must allow AI provider/model and memory backend to change independently. Moving from Raspberry Pi to a stronger server must not require changing Home Assistant or HA-MCP.
