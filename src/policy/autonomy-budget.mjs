import crypto from "node:crypto";

export const DEFAULT_DEDUPE_MS = 30_000;
export const DEFAULT_COOLDOWN_MS = 10_000;
export const DEFAULT_WINDOW_MS = 60_000;
export const DEFAULT_MAX_ACTIONS = 6;

const accepted = [];

function normalizeEntityIds(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(values.map((v) => String(v).trim()).filter(Boolean))].sort();
}

export function actionFingerprint({ domain, service, entity_id, service_data } = {}) {
  const stable = JSON.stringify({ domain: domain || null, service: service || null, entity_id: normalizeEntityIds(entity_id), service_data: service_data || null });
  return crypto.createHash("sha256").update(stable).digest("hex");
}

export function checkAutonomyBudget(action = {}, { now = Date.now(), dedupeMs = DEFAULT_DEDUPE_MS, cooldownMs = DEFAULT_COOLDOWN_MS, windowMs = DEFAULT_WINDOW_MS, maxActions = DEFAULT_MAX_ACTIONS } = {}) {
  const fingerprint = actionFingerprint(action);
  const cutoff = now - Math.max(windowMs, dedupeMs, cooldownMs);
  while (accepted.length && accepted[0].at < cutoff) accepted.shift();

  const duplicate = accepted.find((item) => item.fingerprint === fingerprint && now - item.at < dedupeMs);
  if (duplicate) return { allowed: false, reason: "duplicate", fingerprint, retry_after_ms: Math.max(0, dedupeMs - (now - duplicate.at)) };

  const ids = normalizeEntityIds(action.entity_id);
  const cooling = accepted.find((item) => now - item.at < cooldownMs && item.entityIds.some((id) => ids.includes(id)));
  if (cooling) return { allowed: false, reason: "cooldown", fingerprint, retry_after_ms: Math.max(0, cooldownMs - (now - cooling.at)) };

  const recent = accepted.filter((item) => now - item.at < windowMs);
  if (recent.length >= maxActions) return { allowed: false, reason: "rate_limit", fingerprint, retry_after_ms: Math.max(0, windowMs - (now - recent[0].at)) };

  return { allowed: true, reason: "ready", fingerprint, retry_after_ms: 0 };
}

export function commitAutonomousAction(action = {}, { now = Date.now() } = {}) {
  const entry = { at: now, fingerprint: actionFingerprint(action), entityIds: normalizeEntityIds(action.entity_id) };
  accepted.push(entry);
  return structuredClone(entry);
}

export function resetAutonomyBudget() { accepted.length = 0; }
