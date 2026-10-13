import { createProposal } from "./types.mjs";
import { checkVerifiedAreaDecision } from "./verified-area-decision.mjs";
import { AUTONOMY_LEVELS, evaluatePolicy } from "../policy/engine.mjs";

export const DECISION_OUTCOMES = Object.freeze({
  OBSERVE: "observe",
  SUGGEST: "suggest",
  APPROVE: "approve",
  CONFIRM: "confirm",
  DENY: "deny",
});

function outcomeForPolicy(result) {
  if (result.level === AUTONOMY_LEVELS.AUTO_SAFE && result.allowed !== true) {
    return DECISION_OUTCOMES.DENY;
  }

  switch (result.level) {
    case AUTONOMY_LEVELS.AUTO_SAFE:
      return DECISION_OUTCOMES.APPROVE;
    case AUTONOMY_LEVELS.CONFIRM:
      return DECISION_OUTCOMES.CONFIRM;
    case AUTONOMY_LEVELS.DENY:
      return DECISION_OUTCOMES.DENY;
    case AUTONOMY_LEVELS.OBSERVE:
      return DECISION_OUTCOMES.OBSERVE;
    case AUTONOMY_LEVELS.SUGGEST:
    default:
      return DECISION_OUTCOMES.SUGGEST;
  }
}

export function decide(proposalInput = {}, policy = {}, { areaEvidence = null } = {}) {
  const proposal = createProposal(proposalInput);
  const policyResult = evaluatePolicy(proposal, policy);
  const areaScope = areaEvidence === null
    ? { allowed: true, status: "not_applicable" }
    : checkVerifiedAreaDecision({
        ...areaEvidence,
        toolName: proposal.action,
        args: proposal.args,
      });

  return {
    proposal,
    policy: policyResult,
    areaScope,
    outcome: areaScope.allowed ? outcomeForPolicy(policyResult) : DECISION_OUTCOMES.DENY,
    executable:
      areaScope.allowed === true &&
      policyResult.allowed === true &&
      outcomeForPolicy(policyResult) === DECISION_OUTCOMES.APPROVE,
    decidedAt: new Date().toISOString(),
  };
}
