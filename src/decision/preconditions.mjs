import { FRESHNESS } from "../context/freshness.mjs";
import { expectedStateForService } from "./verifier.mjs";

export const PRECONDITION_STATUS = Object.freeze({
  READY: "ready",
  NOOP: "noop",
  BLOCKED: "blocked",
  UNSUPPORTED: "unsupported",
});

function entityIds(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(values.map((id) => String(id).trim()).filter(Boolean))];
}

function extractState(result) {
  const content = result?.structuredContent ?? result;
  const data = content?.data ?? content;
  return data?.state ?? data?.data?.state ?? data?.entity?.state ?? null;
}

export async function checkActionPreconditions({ domain, service, entity_id, readState } = {}) {
  const expectedState = expectedStateForService(domain, service);
  const ids = entityIds(entity_id);

  if (!expectedState || !ids.length) {
    return { status: PRECONDITION_STATUS.UNSUPPORTED, allowed: false, expectedState, entities: [] };
  }
  if (typeof readState !== "function") {
    return { status: PRECONDITION_STATUS.BLOCKED, allowed: false, expectedState, entities: [] };
  }

  const entities = [];
  for (const entityId of ids) {
    let state = null;
    try {
      state = extractState(await readState(entityId));
    } catch {
      state = null;
    }
    entities.push({
      entityId,
      state,
      freshness: state !== null ? FRESHNESS.LIVE : FRESHNESS.UNKNOWN,
      observed_at: state !== null ? new Date().toISOString() : null,
    });
  }

  if (entities.some((item) => item.freshness !== FRESHNESS.LIVE)) {
    return { status: PRECONDITION_STATUS.BLOCKED, allowed: false, expectedState, entities };
  }
  if (entities.every((item) => item.state === expectedState)) {
    return { status: PRECONDITION_STATUS.NOOP, allowed: false, expectedState, entities };
  }

  return { status: PRECONDITION_STATUS.READY, allowed: true, expectedState, entities };
}

export async function checkContextPreconditions(preconditions = [], { readState } = {}) {
  if (!Array.isArray(preconditions) || preconditions.length === 0) {
    return { status: PRECONDITION_STATUS.READY, allowed: true, conditions: [] };
  }
  if (typeof readState !== "function") {
    return { status: PRECONDITION_STATUS.BLOCKED, allowed: false, conditions: [] };
  }

  const conditions = [];
  for (const condition of preconditions) {
    const entityId = String(condition?.entity_id || "").trim();
    const expected = condition?.state;
    let state = null;
    try {
      state = entityId ? extractState(await readState(entityId)) : null;
    } catch {
      state = null;
    }
    const freshness = state !== null ? FRESHNESS.LIVE : FRESHNESS.UNKNOWN;
    conditions.push({ entityId, expected, state, freshness, matched: state !== null && state === expected });
  }

  const allowed = conditions.length === preconditions.length && conditions.every((item) => item.matched && item.freshness === FRESHNESS.LIVE);
  return { status: allowed ? PRECONDITION_STATUS.READY : PRECONDITION_STATUS.BLOCKED, allowed, conditions };
}
