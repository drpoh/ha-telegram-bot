export function createProposal({
  action = null,
  args = {},
  reason = "",
  confidence = 0,
  evidence = [],
  preconditions = [],
  policyKey = null,
} = {}) {
  return {
    action,
    args,
    reason,
    confidence: Math.max(0, Math.min(1, Number(confidence) || 0)),
    evidence: Array.isArray(evidence) ? evidence : [],
    preconditions: Array.isArray(preconditions) ? preconditions : [],
    policyKey,
    createdAt: new Date().toISOString(),
  };
}
