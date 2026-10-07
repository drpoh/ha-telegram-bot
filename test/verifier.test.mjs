import test from "node:test";
import assert from "node:assert/strict";

import {
  expectedStateForService,
  VERIFICATION_STATUS,
  verifyActionState,
} from "../src/decision/verifier.mjs";

test("confirms when telemetry reaches expected state", async () => {
  const states = ["off", "on"];
  const result = await verifyActionState({
    serviceResult: { structuredContent: { success: true } },
    entityId: "light.test",
    expectedState: "on",
    readState: async () => ({ structuredContent: { data: { state: states.shift() } } }),
    attempts: 3,
    intervalMs: 0,
  });

  assert.equal(result.status, VERIFICATION_STATUS.CONFIRMED);
  assert.equal(result.observedState, "on");
  assert.equal(result.attempts, 2);
});

test("successful service with stale telemetry remains pending", async () => {
  const result = await verifyActionState({
    serviceResult: { structuredContent: { success: true, verified_state: "off" } },
    entityId: "light.test",
    expectedState: "off",
    readState: async () => ({ structuredContent: { data: { state: "on" } } }),
    attempts: 3,
    intervalMs: 0,
  });

  assert.equal(result.status, VERIFICATION_STATUS.PENDING);
  assert.equal(result.serviceAccepted, true);
  assert.equal(result.observedState, "on");
  assert.equal(result.attempts, 3);
});

test("service error is failed without polling", async () => {
  let reads = 0;
  const result = await verifyActionState({
    serviceResult: { isError: true },
    entityId: "light.test",
    expectedState: "on",
    readState: async () => { reads++; },
  });

  assert.equal(result.status, VERIFICATION_STATUS.FAILED);
  assert.equal(result.serviceAccepted, false);
  assert.equal(reads, 0);
});

test("unknown expected state is pending, not falsely confirmed", async () => {
  const result = await verifyActionState({
    serviceResult: { structuredContent: { success: true } },
    entityId: "climate.test",
    expectedState: null,
    readState: async () => ({ state: "heat" }),
  });

  assert.equal(result.status, VERIFICATION_STATUS.PENDING);
  assert.equal(result.attempts, 0);
});

test("maps deterministic light and switch services to expected state", () => {
  assert.equal(expectedStateForService("light", "turn_on"), "on");
  assert.equal(expectedStateForService("light", "turn_off"), "off");
  assert.equal(expectedStateForService("switch", "turn_on"), "on");
  assert.equal(expectedStateForService("switch", "turn_off"), "off");
  assert.equal(expectedStateForService("light", "toggle"), null);
});
