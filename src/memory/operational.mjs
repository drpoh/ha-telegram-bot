import {
  getMemory,
  setMemory,
  deleteMemory,
} from "../db/database.mjs";

const MEMORY_KEY = "operationalActions";
const MAX_ENTRIES = 50;
let entries = [];
let persistenceDbPath;

function clone(value) {
  return structuredClone(value);
}

function persist() {
  if (!entries.length) {
    deleteMemory(MEMORY_KEY, persistenceDbPath);
    return;
  }
  setMemory(MEMORY_KEY, entries, persistenceDbPath);
}

export function loadOperationalMemory({ dbPath } = {}) {
  persistenceDbPath = dbPath;
  const saved = getMemory(MEMORY_KEY, persistenceDbPath);
  entries = Array.isArray(saved) ? saved.slice(-MAX_ENTRIES) : [];
  return entries.length;
}

export function rememberOperationalAction({
  name,
  args = {},
  result,
  at = Date.now(),
} = {}) {
  if (!name) return null;

  const content = result?.structuredContent ?? result;
  const entry = {
    at,
    name,
    domain: args?.domain ?? null,
    service: args?.service ?? null,
    entity_id: args?.entity_id ?? null,
    accepted: result?.isError !== true && content?.success !== false,
    verification: result?.verification?.status ?? null,
    expected_state: result?.verification?.expectedState ?? null,
    observed_state: result?.verification?.observedState ?? null,
    entities: Array.isArray(result?.verification?.entities)
      ? result.verification.entities.map((item) => ({
          entity_id: item.entityId,
          status: item.status,
          observed_state: item.observedState ?? null,
        }))
      : null,
  };

  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries = entries.slice(-MAX_ENTRIES);
  persist();
  return clone(entry);
}

export function getOperationalMemory() {
  return clone(entries);
}

export function clearOperationalMemory() {
  entries = [];
  persist();
}

export function setOperationalMemoryPersistence(dbPath) {
  persistenceDbPath = dbPath;
}

export { MAX_ENTRIES };


export function getOperationalContextForEntity(entityId, limit = 3) {
  if (!entityId) return [];

  return entries
    .filter((entry) => {
      const ids = Array.isArray(entry.entity_id)
        ? entry.entity_id
        : String(entry.entity_id || "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);
      return ids.includes(entityId);
    })
    .slice(-Math.max(0, limit))
    .map((entry) => ({
      at: entry.at,
      service: entry.service,
      accepted: entry.accepted,
      verification: entry.verification,
      expected_state: entry.expected_state,
      observed_state: entry.observed_state,
      entities: entry.entities,
    }));
}
