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
Prefer maintained upstream libraries for commodity transport and tooling, but adapt development **practices** without importing whole agent frameworks. Implement only project-specific decision/policy logic. For copied or adapted source code, document source, pinned version/commit, license and attribution. No external workflow installation without deliberate dependency and security review.


## Reuse of engineering practices — 2026-10-13

Selected **ideas only**, with no installed agents/harness/hooks and no copied files:

- [Matt Pocock / skills](https://github.com/mattpocock/skills) (MIT; reviewed main `49dd158d1076134a641b33efb035946536778336`): reproduce bugs before changing code, TDD at public interfaces, PR review of spec and standards, short retrospectives.
- [affaan-m / ECC](https://github.com/affaan-m/ECC) (MIT; reviewed main `b92f181b3b748d1abbc2afd94af6aa7d8c8fca29`): MCP package reference pinning/static review, security trust boundaries, local evidence-based release audit.

How our existing Node/test/CI/Gate B–E workflow uses those ideas is documented in [ENGINEERING-PRACTICES](development/ENGINEERING-PRACTICES.md). Their examples are **not production policy or permission to execute code**. If upstream content is copied in the future, verify the exact upstream license/commit and attribution at that time.

## Engineering decision process (2026-10-08)

Every external pattern requires a short ADR or design note recording **problem, alternatives, decision, risks, test evidence and rollback**. Benchmark external implementations instead of importing whole agents, especially on Raspberry Pi 3 (ARMv7, ~1 GiB RAM).

| Reference / standard | Pattern to evaluate | Local decision |
|---|---|---|
| [Home Assistant backups](https://www.home-assistant.io/common-tasks/general/) | Archive lifecycle, scheduled backups and test restores | Treat HA Green backup as a **separate** system from the Raspberry Pi bot. Do not copy or restore HA data through this bot. |
| [MCP authorization security](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/authorization/security-considerations.mdx) | Credential audience, no token forwarding, bounded permissions | Keep credentials out of Git and logs; do not confuse a tool schema or user confirmation with actual action authorization. |
| [OWASP AI Agent Security](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html) | Least privilege, human oversight, tool-input validation, prompt injection testing | Treat LLM-provided entity IDs and policy choices as untrusted; test fail-closed behavior and malicious tool proposals. |
| Existing project references above | Memory retrieval, small modular components, read-only state collection | Adopt ideas selectively and document their failure cases; no dependency or copied code without license and compatibility review. |

For each meaningful new feature: ADR -> explicit threat model -> offline regression tests -> read-only acceptance -> code review -> production change only after owner approval. Prefer reliable, deterministic code over expanding prompts. Record external source URL, checked date, applicable license, and whether code was copied (normally: no). Re-check upstream material and licenses when implementation begins.
