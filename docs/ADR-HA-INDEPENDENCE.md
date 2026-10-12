# ADR — Home Assistant availability independent of AI agent

Status: **Accepted architectural invariant** (2026-10-08)

Home Assistant Green is the system of record and controls the physical home. The Raspberry Pi AI/Telegram agent is an **optional client**, not a controller required for normal HA operations.

## Requirements
- HA, native dashboards, Zigbee2MQTT, existing automations, thermostat/sauna logic and local control remain usable when the AI agent, Raspberry Pi, LLM, Telegram, HA-MCP or network bridge stops.
- AI agent deployment, upgrade, restart and rollback must not restart HA or modify HA's core integrations, automation files, or service configuration. No system-critical HA control loop may depend on an AI response.
- AI unavailability must be fail-isolated. Do not queue stale device-changing requests for automatic replay after reconnection; fresh user intent, authorization, HA discovery and state preconditions must be required.
- Keep separate systemd/process lifecycle and data storage, least privilege and explicit approval for any HA-side changes. Optional bridges may be unavailable without affecting existing HA control.
- Verify failures: terminate AI process, sever MCP/LLM connection, reboot Raspberry Pi (only in an approved maintenance test), and validate HA native UI, existing automations and device control independently. **Do not run disruptive live tests without owner authorization.**
- A production acceptance gate must include a tested stop/start and rollback procedure proving HA functions remain independent. Explicitly inventory any possible residual dependencies before go-live.

## Current evidence and limitations
This document records a requirement, not proof from a live outage test. Current agent tests are isolated mocks; no production service restart or HA actuation was performed to validate operational independence. Existing HA configuration must be audited for accidental dependence before declaring this acceptance test complete.
