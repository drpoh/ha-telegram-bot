# Architecture References

These projects are design references, not automatic dependencies. Re-check current upstream license before copying any implementation.

## hass-agent-llm
Reference concepts: memory extraction, context providers, retrieval of relevant memory, testing patterns.

## Extended OpenAI Conversation
Reference concepts: exposing Home Assistant Recorder/history to an LLM and bounded time-range queries.

## Letta
Reference concepts: working vs persistent/archival memory and agent-managed context.

## Mem0
Reference concepts: memory lifecycle, fact extraction, relevance retrieval.

## HA-MCP
Reference concepts: MCP interface to Home Assistant and least-privilege/policy boundaries.

## home-assistant-mcp-agent
Reference concepts: modular MCP integrations, environment-based secrets and user memory patterns.

## Rule
Prefer independently implementing the needed concept in this repository. If code is copied or adapted, document source, version/commit, license and required attribution.
