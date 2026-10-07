export function createProposal({
  action = null,
  args = {},
  reason = "",
  confidence = 0,
  evidence = [],
  policyKey = null,
} = {}) {
  return {
    action,
    args,
    reason,
    confidence: Math.max(0, Math.min(1, Number(confidence) || 0)),
    evidence: Array.isArray(evidence) ? evidence : [],
    policyKey,
    createdAt: new Date().toISOString(),
  };
}
