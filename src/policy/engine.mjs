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
  const entry = policy.entities?.[key] ?? policy[key];
  const level =
    typeof entry === "string"
      ? entry
      : entry?.level || policy.default || AUTONOMY_LEVELS.SUGGEST;

  const service = proposal.args?.service;
  const serviceAllowed =
    !entry?.services ||
    (typeof service === "string" && entry.services.includes(service));

  return {
    level,
    allowed:
      level === AUTONOMY_LEVELS.AUTO_SAFE &&
      serviceAllowed,
    requiresConfirmation: level === AUTONOMY_LEVELS.CONFIRM,
    serviceAllowed,
    reason: serviceAllowed
      ? `Policy level: ${level}`
      : `Service not allowed for ${key}: ${service || "unknown"}`,
  };
}

export function enforceActionSource(
  decision,
  source = ACTION_SOURCES.AUTONOMOUS
) {
  if (source === ACTION_SOURCES.USER_EXPLICIT) {
    const blockedByPolicy =
      decision?.outcome === "confirm" ||
      decision?.outcome === "deny";

    return {
      authorized: !blockedByPolicy,
      source,
      reason: blockedByPolicy
        ? `Explicit user command blocked by policy: ${decision.outcome}`
        : "Explicit user command",
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
