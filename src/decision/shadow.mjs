import { decide } from "../decision/engine.mjs";

export function isStateChangingToolCall(name, args = {}) {
  return (
    name === "ha_call_service" &&
    typeof args.domain === "string" &&
    typeof args.service === "string" &&
    typeof args.entity_id === "string"
  );
}

export function proposalFromToolCall(name, args = {}, context = {}) {
  if (!isStateChangingToolCall(name, args)) return null;

  return {
    action: `${args.domain}.${args.service}`,
    args: { ...args },
    reason: context.reason || "LLM proposed Home Assistant service call",
    confidence: context.confidence ?? 0,
    evidence: Array.isArray(context.evidence) ? context.evidence : [],
    policyKey: args.entity_id,
  };
}

export function shadowEvaluateToolCall(
  name,
  args = {},
  policy = {},
  context = {}
) {
  const proposal = proposalFromToolCall(name, args, context);
  if (!proposal) return null;

  const decision = decide(proposal, policy);

  return {
    mode: "shadow",
    ...decision,
    wouldExecute: decision.executable,
    executedByShadow: false,
  };
}

export function logShadowDecision(shadow) {
  if (!shadow) return;

  console.log("SHADOW →", {
    action: shadow.proposal.action,
    entity_id: shadow.proposal.args.entity_id,
    outcome: shadow.outcome,
    level: shadow.policy.level,
    wouldExecute: shadow.wouldExecute,
    executedByShadow: false,
  });
}
