# v3 Home AI Agent Architecture

v3 evolves the existing v2 Telegram + AI + HA-MCP agent without replacing its working core.

The project is intended to become a reusable Home Assistant agent for other users. The maintainer's home is a reference/test deployment, not the product model. Core logic must avoid installation-specific entity IDs, room names, language assumptions and device brands; deployment-specific policy, entity mappings and preferences belong in configuration.

## Flow
Input (Telegram/voice/API)
-> Conversation Agent
-> Context Builder
-> Decision Engine
-> Policy Engine
-> Preconditions
-> HA-MCP
-> Home Assistant
-> Verification
-> Learning/Memory
-> Audit/Evaluate/Adapt

## Context Builder
Builds a small relevant context from:
- recent conversation
- current Home Assistant state
- home/device facts
- recent controlled entities
- relevant behavioral memory
- aggregated history/statistics

It must prefer relevance over dumping all available data into the model.

State facts used for decisions must be classified as live, recent, stale or unknown. If stale state could change a state-changing decision, refresh it before execution.

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

Actions also have an impact class: R0 read-only, R1 low-impact comfort, R2 meaningful comfort/energy, R3 access/charging/high-impact control, R4 security/safety-critical or destructive. Risk class and autonomy level are separate.

## Preconditions, idempotency and budget
Before execution, relevant assumptions are revalidated against sufficiently fresh HA state. Failed preconditions prevent execution and force re-evaluation or downgrade.

Every state-changing logical action must support deduplication so retries or repeated model tool calls cannot accidentally execute it twice. Autonomous execution also has deterministic rate/cooldown limits; repeated failures or abnormal loops reduce or pause autonomy.

## Verification and learning
After an action, query HA again and distinguish confirmed, pending, failed and unknown outcomes. Pending or unknown verification does not cause an automatic retry of the state-changing service. A rapid manual reversal is an override signal. Learning may reduce confidence or autonomy, but permissions only increase through explicit deterministic configuration.

## Rollout
Phase 1: documentation/interfaces.
Phase 2: history/context.
Phase 3: memory retrieval and learning.
Phase 4: decision engine in suggest-only mode.
Phase 5: allowlisted autonomous non-critical actions.
