import test from "node:test";
import assert from "node:assert/strict";
import { classifyRisk } from "../src/policy/risk.mjs";

test("read-only operations are R0", () => assert.equal(classifyRisk({ domain: "sensor", stateChanging: false }), "R0"));
test("common comfort domains have generic risk defaults", () => {
  assert.equal(classifyRisk({ domain: "light", service: "turn_on" }), "R1");
  assert.equal(classifyRisk({ domain: "climate", service: "set_temperature" }), "R2");
});
test("access and security services are higher risk", () => {
  assert.equal(classifyRisk({ domain: "cover", service: "open_cover" }), "R3");
  assert.equal(classifyRisk({ domain: "lock", service: "unlock" }), "R4");
  assert.equal(classifyRisk({ domain: "alarm_control_panel", service: "alarm_disarm" }), "R4");
});
test("unknown state-changing domains fail conservative", () => assert.equal(classifyRisk({ domain: "custom_domain", service: "activate" }), "R3"));
test("deterministic config may override generic risk", () => assert.equal(classifyRisk({ domain: "switch", service: "turn_on", riskOverride: "R1" }), "R1"));
