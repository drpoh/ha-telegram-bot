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
    entities.push({ entityId, state, fresh: state !== null });
  }

  if (entities.some((item) => !item.fresh)) {
    return { status: PRECONDITION_STATUS.BLOCKED, allowed: false, expectedState, entities };
  }
  if (entities.every((item) => item.state === expectedState)) {
    return { status: PRECONDITION_STATUS.NOOP, allowed: false, expectedState, entities };
  }

  return { status: PRECONDITION_STATUS.READY, allowed: true, expectedState, entities };
}
