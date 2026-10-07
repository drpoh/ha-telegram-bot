export const AUTONOMY_LEVELS = Object.freeze({
  OBSERVE: "observe",
  SUGGEST: "suggest",
  AUTO_SAFE: "auto_safe",
  CONFIRM: "confirm",
  DENY: "deny",
});

export function evaluatePolicy(proposal, policy = {}) {
  if (!proposal?.action) {
    return { level: AUTONOMY_LEVELS.OBSERVE, allowed: false, reason: "No action proposed" };
  }

  const key = proposal.policyKey || proposal.action;
  const level = policy[key] || AUTONOMY_LEVELS.SUGGEST;

  return {
    level,
    allowed: level === AUTONOMY_LEVELS.AUTO_SAFE,
    requiresConfirmation: level === AUTONOMY_LEVELS.CONFIRM,
    reason: `Policy level: ${level}`,
  };
}
