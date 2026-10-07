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

export function expectedStateForService(domain, service) {
  if (domain === "light" || domain === "switch") {
    if (service === "turn_on") return "on";
    if (service === "turn_off") return "off";
  }
  return null;
}
