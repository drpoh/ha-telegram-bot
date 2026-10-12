import { getMemory, setMemory, deleteMemory } from "../db/database.mjs";

const MEMORY_KEY = "decisionAudit";
const MAX_ENTRIES = 100;
const DEFAULT_RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;
let entries = [];
let persistenceDbPath;

function persist() {
  if (!entries.length) {
    deleteMemory(MEMORY_KEY, persistenceDbPath);
    return;
  }
  setMemory(MEMORY_KEY, entries, persistenceDbPath);
}

export function loadDecisionAudit({ dbPath } = {}) {
  persistenceDbPath = dbPath;
  const saved = getMemory(MEMORY_KEY, persistenceDbPath);
  entries = Array.isArray(saved) ? saved.slice(-MAX_ENTRIES) : [];
  return entries.length;
}

export function rememberDecisionAudit({
  shadow,
  source,
  authorized,
  at = Date.now(),
} = {}) {
  if (!shadow?.proposal) return null;

  const entry = {
    id: crypto.randomUUID(),
    at,
    source: source || null,
    action: shadow.proposal.action || null,
    entity_id: shadow.proposal.args?.entity_id ?? null,
    outcome: shadow.outcome || null,
    policy: shadow.policy?.level || null,
    authorized: Boolean(authorized),
    behavioral_downgrade: Boolean(shadow.behavioralDowngrade),
    execution: authorized ? "pending" : "blocked",
    precondition: null,
    verification: null,
  };

  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES);
  persist();
  return structuredClone(entry);
}

export function getDecisionAudit(limit = 20) {
  return structuredClone(entries.slice(-Math.max(0, limit)));
}

export function recordDecisionPrecondition(id, precondition) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return null;
  entry.precondition = precondition?.status ?? null;
  if (precondition?.allowed === false) entry.execution = "blocked";
  persist();
  return structuredClone(entry);
}

export function failDecisionAudit(id, error = null) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return null;
  entry.execution = "failed";
  entry.verification = null;
  entry.error = error ? String(error?.message || error).slice(0, 160) : null;
  persist();
  return structuredClone(entry);
}

export function completeDecisionAudit(id, { result } = {}) {
  const entry = entries.find((item) => item.id === id);
  if (!entry) return null;

  const content = result?.structuredContent ?? result;
  const failed = result?.isError === true || content?.success === false;
  entry.execution = failed ? "failed" : "completed";
  entry.verification = result?.verification?.status ?? null;
  persist();
  return structuredClone(entry);
}

function summarize(items) {
  const summary = { total: items.length, approve: 0, suggest: 0, confirm: 0, deny: 0, authorized: 0 };
  for (const entry of items) {
    if (Object.hasOwn(summary, entry.outcome)) summary[entry.outcome] += 1;
    if (entry.authorized) summary.authorized += 1;
  }
  return summary;
}

export function getDecisionAuditSummary({
  now = Date.now(),
  recentWindowMs = DEFAULT_RECENT_WINDOW_MS,
} = {}) {
  const recentSince = now - Math.max(0, recentWindowMs);
  const recent = entries.filter((entry) => entry.at >= recentSince && entry.at <= now);

  return {
    ...summarize(entries),
    recent_window_ms: recentWindowMs,
    recent: summarize(recent),
  };
}

export function clearDecisionAudit() {
  entries = [];
  persist();
}

export function setDecisionAuditPersistence(dbPath) {
  persistenceDbPath = dbPath;
}

export { MAX_ENTRIES, DEFAULT_RECENT_WINDOW_MS };
