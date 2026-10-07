# v3 Home AI Agent Architecture

v3 evolves the existing v2 Telegram + AI + HA-MCP agent without replacing its working core.

## Flow
Input (Telegram/voice/API)
-> Conversation Agent
-> Context Builder
-> Decision Engine
-> Policy Engine
-> HA-MCP
-> Home Assistant
-> Verification
-> Learning/Memory

## Context Builder
Builds a small relevant context from:
- recent conversation
- current Home Assistant state
- home/device facts
- recent controlled entities
- relevant behavioral memory
- aggregated history/statistics

It must prefer relevance over dumping all available data into the model.

## Memory layers
1. Working/conversation memory — recent dialogue.
2. Home/device memory — stable facts about areas, entities and preferences.
3. Behavioral memory — observed patterns, corrections and user overrides.
4. Operational memory — actions, verification results and failures.

SQLite remains the initial lightweight store. Search/retrieval interfaces should permit a future vector backend without changing the agent API.

## History
A History Analyzer obtains requested HA history/statistics, normalizes it and produces compact facts/features. Raw high-volume Recorder data should not be inserted directly into prompts.

## Decision Engine
Produces a proposed action plus reason, confidence and evidence. It does not have authority to execute an action.

## Policy Engine
Deterministically classifies proposed actions as observe, suggest, auto_safe, confirm or deny. Policy is evaluated outside the LLM.

## Verification and learning
After an action, query HA again and record success/failure. A rapid manual user reversal is recorded as an override signal. Learning may adjust suggestions/confidence, but must not silently expand permissions.

## Rollout
Phase 1: documentation/interfaces.
Phase 2: history/context.
Phase 3: memory retrieval and learning.
Phase 4: decision engine in suggest-only mode.
Phase 5: allowlisted autonomous non-critical actions.
