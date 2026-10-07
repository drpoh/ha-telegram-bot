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
    at,
    source: source || null,
    action: shadow.proposal.action || null,
    entity_id: shadow.proposal.args?.entity_id ?? null,
    outcome: shadow.outcome || null,
    policy: shadow.policy?.level || null,
    authorized: Boolean(authorized),
    behavioral_downgrade: Boolean(shadow.behavioralDowngrade),
  };

  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES);
  persist();
  return structuredClone(entry);
}

export function getDecisionAudit(limit = 20) {
  return structuredClone(entries.slice(-Math.max(0, limit)));
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

export { MAX_ENTRIES, DEFAULT_RECENT_WINDOW_MS };
