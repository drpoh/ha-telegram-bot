import { classifyRisk } from "./risk.mjs";

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
  const domain = proposal.args?.domain || proposal.action?.split(".")?.[0];
  const risk = classifyRisk({ domain, service, stateChanging: proposal.action !== null, riskOverride: entry?.risk });
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
    risk,
    preconditions: Array.isArray(entry?.preconditions)
      ? structuredClone(entry.preconditions)
      : [],
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


export function applyBehaviorDowngrade(decision, signal = {}) {
  if (
    decision?.policy?.level !== AUTONOMY_LEVELS.AUTO_SAFE ||
    decision?.outcome !== "approve" ||
    signal?.should_reduce_autonomy !== true
  ) {
    return decision;
  }

  return {
    ...decision,
    policy: {
      ...decision.policy,
      level: AUTONOMY_LEVELS.SUGGEST,
      allowed: false,
      reason: `Behavioral downgrade after ${signal.corrections || 0} corrections`,
      behavioralDowngrade: true,
    },
    outcome: "suggest",
    executable: false,
    behavioralSignal: signal,
  };
}
