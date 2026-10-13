import test from "node:test";
import assert from "node:assert/strict";

import { decide, DECISION_OUTCOMES } from "../src/decision/engine.mjs";

test("no proposed action remains observe-only", () => {
  const decision = decide({ reason: "Nothing to change" });

  assert.equal(decision.outcome, DECISION_OUTCOMES.OBSERVE);
  assert.equal(decision.executable, false);
  assert.equal(decision.policy.allowed, false);
});

test("unknown actions default to suggest and never execute", () => {
  const decision = decide({
    action: "light.turn_off",
    policyKey: "light.kitchen",
    confidence: 0.9,
  });

  assert.equal(decision.outcome, DECISION_OUTCOMES.SUGGEST);
  assert.equal(decision.executable, false);
});

test("confirm policy requires confirmation and is not executable", () => {
  const decision = decide(
    { action: "climate.set_temperature", policyKey: "climate.sauna" },
    { "climate.sauna": "confirm" }
  );

  assert.equal(decision.outcome, DECISION_OUTCOMES.CONFIRM);
  assert.equal(decision.policy.requiresConfirmation, true);
  assert.equal(decision.executable, false);
});

test("deny policy blocks a proposal", () => {
  const decision = decide(
    { action: "lock.unlock", policyKey: "lock.front_door" },
    { "lock.front_door": "deny" }
  );

  assert.equal(decision.outcome, DECISION_OUTCOMES.DENY);
  assert.equal(decision.executable, false);
});

test("auto_safe can be approved by policy but does not execute by itself", () => {
  const decision = decide(
    { action: "light.turn_off", policyKey: "light.hall" },
    { "light.hall": "auto_safe" }
  );

  assert.equal(decision.outcome, DECISION_OUTCOMES.APPROVE);
  assert.equal(decision.executable, true);
  assert.equal(decision.policy.allowed, true);
});

test("auto_safe denies services outside the entity allowlist", () => {
  const decision = decide(
    { action: "light.toggle", policyKey: "light.hall" },
    {
      entities: {
        "light.hall": {
          level: "auto_safe",
          services: ["turn_on", "turn_off"],
        },
      },
    }
  );

  assert.equal(decision.policy.level, "auto_safe");
  assert.equal(decision.policy.allowed, false);
  assert.equal(decision.outcome, DECISION_OUTCOMES.DENY);
  assert.equal(decision.executable, false);
});


test("risk class is independent from autonomy level", () => {
  const decision = decide(
    { action: "light.turn_on", policyKey: "light.hall", args: { domain: "light", service: "turn_on" } },
    { "light.hall": "suggest" }
  );
  assert.equal(decision.policy.risk, "R1");
  assert.equal(decision.outcome, DECISION_OUTCOMES.SUGGEST);
});

test("entity policy can override generic risk without changing autonomy", () => {
  const decision = decide(
    { action: "switch.turn_on", policyKey: "switch.harmless", args: { domain: "switch", service: "turn_on" } },
    { entities: { "switch.harmless": { level: "suggest", risk: "R1" } } }
  );
  assert.equal(decision.policy.risk, "R1");
  assert.equal(decision.executable, false);
});
