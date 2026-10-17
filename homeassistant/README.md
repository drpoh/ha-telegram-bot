# RS Home AI DEV – Home Assistant Conversation integration (preview)

This is **source code only**. Not deployed to HA. The active local Assist pipeline must remain untouched.

- Source: `homeassistant/custom_components/rs_home_ai_dev/`.
- Intended installation location on Home Assistant Green: `/config/custom_components/rs_home_ai_dev/`.
- Requires separate HA config entry, local DEV Pi URL `http://192.168.31.124:3312`, and the existing private DEV `HTTP_API_TOKEN`. Do **not** commit, print, or paste this secret into chat. HTTP without TLS is acceptable only on a protected local network.
- The integration forwards speech to the authenticated DEV `/ask`, returns text for Assist TTS, and does **not** change ESPHome, Whisper, Piper or HA-MCP.
- SECURITY NOTE: `/ask` currently has no verified per-speaker identity, and HTTP callers are not Telegram sessions. Full commands reach the same AI policy, but **voice confirmation is not yet implemented or security-tested**. Never claim equivalent confirmed-action authorization. Do not select this agent on M5Stack until that flow is audited.
- Next gates: compile Python sources, run Node regressions, check HA 2026.10.1 Conversation Entity signature in live environment, integration load, read-only query, action policy and confirmation tests. Deploy only to DEV and keep original fully local Assist pipeline as rollback.
