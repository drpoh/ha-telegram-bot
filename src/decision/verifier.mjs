export const VERIFICATION_STATUS = Object.freeze({
  CONFIRMED: "confirmed",
  PENDING: "pending",
  FAILED: "failed",
});

function extractState(result) {
  const content = result?.structuredContent ?? result;
  const data = content?.data ?? content;
  return data?.state ?? data?.data?.state ?? data?.entity?.state ?? null;
}

function serviceSucceeded(result) {
  if (result?.isError === true) return false;
  const content = result?.structuredContent ?? result;
  if (content?.success === false) return false;
  return true;
}

export async function verifyActionState({
  serviceResult,
  entityId,
  expectedState,
  readState,
  attempts = 3,
  intervalMs = 250,
} = {}) {
  if (!serviceSucceeded(serviceResult)) {
    return {
      status: VERIFICATION_STATUS.FAILED,
      serviceAccepted: false,
      expectedState,
      observedState: null,
      attempts: 0,
    };
  }

  if (!entityId || !expectedState || typeof readState !== "function") {
    return {
      status: VERIFICATION_STATUS.PENDING,
      serviceAccepted: true,
      expectedState: expectedState ?? null,
      observedState: null,
      attempts: 0,
    };
  }

  let observedState = null;
  let usedAttempts = 0;
  const maxAttempts = Math.max(1, Math.floor(attempts));

  for (let index = 0; index < maxAttempts; index++) {
    usedAttempts++;
    try {
      observedState = extractState(await readState(entityId));
    } catch {
      observedState = null;
    }

    if (observedState === expectedState) {
      return {
        status: VERIFICATION_STATUS.CONFIRMED,
        serviceAccepted: true,
        expectedState,
        observedState,
        attempts: usedAttempts,
      };
    }

    if (index + 1 < maxAttempts && intervalMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return {
    status: VERIFICATION_STATUS.PENDING,
    serviceAccepted: true,
    expectedState,
    observedState,
    attempts: usedAttempts,
  };
}

export async function verifyActionStates({
  serviceResult,
  entityIds = [],
  expectedState,
  readState,
  attempts = 3,
  intervalMs = 250,
} = {}) {
  const ids = [...new Set(entityIds)].filter(Boolean);
  if (!ids.length) {
    return verifyActionState({
      serviceResult,
      expectedState,
      readState,
      attempts,
      intervalMs,
    });
  }

  const entities = [];
  for (const entityId of ids) {
    entities.push({
      entityId,
      ...(await verifyActionState({
        serviceResult,
        entityId,
        expectedState,
        readState,
        attempts,
        intervalMs,
      })),
    });
  }

  const status = entities.some((item) => item.status === VERIFICATION_STATUS.FAILED)
    ? VERIFICATION_STATUS.FAILED
    : entities.every((item) => item.status === VERIFICATION_STATUS.CONFIRMED)
      ? VERIFICATION_STATUS.CONFIRMED
      : VERIFICATION_STATUS.PENDING;

  return {
    status,
    serviceAccepted: entities.every((item) => item.serviceAccepted),
    expectedState: expectedState ?? null,
    observedState: entities.length === 1 ? entities[0].observedState : null,
    attempts: entities.length === 1 ? entities[0].attempts : null,
    entities,
  };
}

export function expectedStateForService(domain, service) {
  if (domain === "light" || domain === "switch") {
    if (service === "turn_on") return "on";
    if (service === "turn_off") return "off";
  }
  return null;
}
