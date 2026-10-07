import {
  getMemory,
  setMemory,
  deleteMemory,
} from "../db/database.mjs";

const MEMORY_KEY = "behaviorCorrections";
const DEFAULT_WINDOW_MS = 120_000;
const MAX_CORRECTIONS = 50;
const DEFAULT_SIGNAL_HORIZON_MS = 30 * 24 * 60 * 60 * 1000;

let recentActions = new Map();
let corrections = [];
let persistenceDbPath;

function entityIds(value) {
  return (Array.isArray(value) ? value : String(value || "").split(","))
    .map((id) => String(id).trim())
    .filter(Boolean);
}

function oppositeService(service) {
  if (service === "turn_on") return "turn_off";
  if (service === "turn_off") return "turn_on";
  return null;
}

function persist() {
  if (!corrections.length) {
    deleteMemory(MEMORY_KEY, persistenceDbPath);
    return;
  }
  setMemory(MEMORY_KEY, corrections, persistenceDbPath);
}

export function loadBehaviorCorrections({ dbPath } = {}) {
  persistenceDbPath = dbPath;
  const saved = getMemory(MEMORY_KEY, persistenceDbPath);
  corrections = Array.isArray(saved) ? saved.slice(-MAX_CORRECTIONS) : [];
  recentActions = new Map();
  return corrections.length;
}

export function observeBehaviorAction({
  source,
  domain,
  service,
  entity_id,
  at = Date.now(),
  windowMs = DEFAULT_WINDOW_MS,
} = {}) {
  const opposite = oppositeService(service);
  const ids = entityIds(entity_id);
  if (!opposite || !ids.length) return [];

  const detected = [];
  for (const entityId of ids) {
    const previous = recentActions.get(entityId);
    if (
      previous &&
      previous.source === "autonomous" &&
      source === "user_explicit" &&
      previous.domain === domain &&
      previous.service === opposite &&
      at - previous.at >= 0 &&
      at - previous.at <= windowMs
    ) {
      const correction = {
        at,
        entity_id: entityId,
        domain,
        autonomous_service: previous.service,
        correction_service: service,
        delay_ms: at - previous.at,
      };
      corrections.push(correction);
      detected.push(structuredClone(correction));
    }

    recentActions.set(entityId, { source, domain, service, at });
  }

  if (corrections.length > MAX_CORRECTIONS) {
    corrections = corrections.slice(-MAX_CORRECTIONS);
  }
  if (detected.length) persist();
  return detected;
}

export function getBehaviorCorrections(entityId = null, limit = 10) {
  const filtered = entityId
    ? corrections.filter((item) => item.entity_id === entityId)
    : corrections;
  return structuredClone(filtered.slice(-Math.max(0, limit)));
}

export function clearBehaviorCorrections() {
  recentActions = new Map();
  corrections = [];
  persist();
}

export function setBehaviorCorrectionPersistence(dbPath) {
  persistenceDbPath = dbPath;
}

export { DEFAULT_WINDOW_MS, DEFAULT_SIGNAL_HORIZON_MS, MAX_CORRECTIONS };


export function getBehaviorCorrectionSignal(
  entityId,
  service = null,
  {
    limit = 5,
    now = Date.now(),
    horizonMs = DEFAULT_SIGNAL_HORIZON_MS,
  } = {}
) {
  const cutoff = now - Math.max(0, horizonMs);
  const recent = corrections
    .filter((item) =>
      item.entity_id === entityId &&
      (!service || item.autonomous_service === service) &&
      item.at >= cutoff &&
      item.at <= now
    )
    .slice(-Math.max(0, limit));

  return {
    entity_id: entityId || null,
    service: service || null,
    corrections: recent.length,
    last_correction_at: recent.at(-1)?.at ?? null,
    horizon_ms: horizonMs,
    should_reduce_autonomy: recent.length >= 2,
  };
}


export function getBehaviorAuditSnapshot({ now = Date.now(), horizonMs = DEFAULT_SIGNAL_HORIZON_MS } = {}) {
  const grouped = new Map();
  for (const item of corrections) {
    const current = grouped.get(item.entity_id) || {
      entity_id: item.entity_id,
      corrections: 0,
      last_correction_at: null,
      last_autonomous_service: null,
      last_correction_service: null,
      services: {},
      autonomy_reduced: false,
    };
    current.corrections++;
    current.last_correction_at = item.at;
    current.last_autonomous_service = item.autonomous_service;
    current.last_correction_service = item.correction_service;
    grouped.set(item.entity_id, current);
  }

  for (const current of grouped.values()) {
    const services = [...new Set(corrections.filter((item) => item.entity_id === current.entity_id).map((item) => item.autonomous_service))];
    for (const service of services) {
      const signal = getBehaviorCorrectionSignal(current.entity_id, service, { now, horizonMs });
      current.services[service] = {
        corrections: signal.corrections,
        last_correction_at: signal.last_correction_at,
        autonomy_reduced: signal.should_reduce_autonomy,
      };
    }
    current.autonomy_reduced = Object.values(current.services).some((service) => service.autonomy_reduced);
  }

  return [...grouped.values()].sort((a, b) => (b.last_correction_at || 0) - (a.last_correction_at || 0));
}


export function clearBehaviorCorrectionsForEntity(entityId) {
  const normalized = String(entityId || "").trim();
  if (!normalized) return 0;

  const before = corrections.length;
  corrections = corrections.filter((item) => item.entity_id !== normalized);
  recentActions.delete(normalized);
  const removed = before - corrections.length;
  if (removed) persist();
  return removed;
}
