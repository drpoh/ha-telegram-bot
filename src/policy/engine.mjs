export const AUTONOMY_LEVELS = Object.freeze({
  OBSERVE: "observe",
  SUGGEST: "suggest",
  AUTO_SAFE: "auto_safe",
  CONFIRM: "confirm",
  DENY: "deny",
});

export const ACTION_SOURCES = Object.freeze({
  USER_EXPLICIT: "user_explicit",
  AUTONOMOUS: "autonomous",
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

export function enforceActionSource(
  decision,
  source = ACTION_SOURCES.AUTONOMOUS
) {
  if (source === ACTION_SOURCES.USER_EXPLICIT) {
    return {
      authorized: true,
      source,
      reason: "Explicit user command",
    };
  }

  return {
    authorized: decision?.executable === true,
    source: ACTION_SOURCES.AUTONOMOUS,
    reason: decision?.executable
      ? "Autonomous action approved by policy"
      : `Autonomous action blocked: ${decision?.outcome || "no decision"}`,
  };
}
