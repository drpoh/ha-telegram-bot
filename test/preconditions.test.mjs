import test from "node:test";
import assert from "node:assert/strict";
import { checkActionPreconditions, PRECONDITION_STATUS } from "../src/decision/preconditions.mjs";

test("ready when fresh state differs from target", async () => {
  const result = await checkActionPreconditions({ domain: "light", service: "turn_off", entity_id: "light.test", readState: async () => ({ state: "on" }) });
  assert.equal(result.status, PRECONDITION_STATUS.READY);
  assert.equal(result.allowed, true);
  assert.equal(result.entities[0].freshness, "live");
  assert.match(result.entities[0].observed_at, /^\d{4}-/);
});

test("noop when target state is already satisfied", async () => {
  const result = await checkActionPreconditions({ domain: "light", service: "turn_off", entity_id: "light.test", readState: async () => ({ state: "off" }) });
  assert.equal(result.status, PRECONDITION_STATUS.NOOP);
  assert.equal(result.allowed, false);
});

test("blocks when fresh state cannot be obtained", async () => {
  const result = await checkActionPreconditions({ domain: "light", service: "turn_on", entity_id: "light.test", readState: async () => { throw new Error("offline"); } });
  assert.equal(result.status, PRECONDITION_STATUS.BLOCKED);
});

test("checks every entity", async () => {
  const states = { "light.a": "off", "light.b": "on" };
  const result = await checkActionPreconditions({ domain: "light", service: "turn_off", entity_id: ["light.a", "light.b"], readState: async (id) => ({ state: states[id] }) });
  assert.equal(result.status, PRECONDITION_STATUS.READY);
  assert.equal(result.entities.length, 2);
});

test("unsupported service is not approved", async () => {
  const result = await checkActionPreconditions({ domain: "light", service: "toggle", entity_id: "light.test", readState: async () => ({ state: "off" }) });
  assert.equal(result.status, PRECONDITION_STATUS.UNSUPPORTED);
  assert.equal(result.allowed, false);
});
