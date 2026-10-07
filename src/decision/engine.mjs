import { createProposal } from "./types.mjs";
import { AUTONOMY_LEVELS, evaluatePolicy } from "../policy/engine.mjs";

export const DECISION_OUTCOMES = Object.freeze({
  OBSERVE: "observe",
  SUGGEST: "suggest",
  APPROVE: "approve",
  CONFIRM: "confirm",
  DENY: "deny",
});

function outcomeForPolicy(result) {
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

export function decide(proposalInput = {}, policy = {}) {
  const proposal = createProposal(proposalInput);
  const policyResult = evaluatePolicy(proposal, policy);

  return {
    proposal,
    policy: policyResult,
    outcome: outcomeForPolicy(policyResult),
    executable:
      policyResult.allowed === true &&
      outcomeForPolicy(policyResult) === DECISION_OUTCOMES.APPROVE,
    decidedAt: new Date().toISOString(),
  };
}
