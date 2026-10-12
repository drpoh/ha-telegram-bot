const SAFE_FIELDS = new Set(["source", "action", "entity_id", "risk", "policy", "outcome", "status", "reason", "verification"]);

export function sanitizeTraceData(data = {}) {
  const clean = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (SAFE_FIELDS.has(key) && value !== undefined) clean[key] = value;
  }
  return clean;
}

export function traceDecision(stage, data = {}, { logger = console.log } = {}) {
  const clean = sanitizeTraceData(data);
  logger(`TRACE ${String(stage || "UNKNOWN").toUpperCase()} →`, clean);
  return clean;
}
