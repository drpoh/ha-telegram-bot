import test from "node:test";
import assert from "node:assert/strict";

import { decide } from "../src/decision/engine.mjs";
import {
  ACTION_SOURCES,
  applyBehaviorDowngrade,
  enforceActionSource,
} from "../src/policy/engine.mjs";

function decision(policy = {}) {
  return decide(
    {
      action: "light.turn_off",
      policyKey: "light.hall",
    },
    policy
  );
}

test("explicit user command preserves existing execution path", () => {
  const gate = enforceActionSource(
    decision(),
    ACTION_SOURCES.USER_EXPLICIT
  );

  assert.equal(gate.authorized, true);
  assert.equal(gate.source, ACTION_SOURCES.USER_EXPLICIT);
});

test("explicit user command respects confirm policy", () => {
  const gate = enforceActionSource(
    decision({ "light.hall": "confirm" }),
    ACTION_SOURCES.USER_EXPLICIT
  );

  assert.equal(gate.authorized, false);
  assert.match(gate.reason, /confirm/);
});

test("explicit user command respects deny policy", () => {
  const gate = enforceActionSource(
    decision({ "light.hall": "deny" }),
    ACTION_SOURCES.USER_EXPLICIT
  );

  assert.equal(gate.authorized, false);
  assert.match(gate.reason, /deny/);
});

test("explicit auto-safe command remains authorized", () => {
  const gate = enforceActionSource(
    decision({ "light.hall": "auto_safe" }),
    ACTION_SOURCES.USER_EXPLICIT
  );

  assert.equal(gate.authorized, true);
});

test("autonomous action defaults to blocked suggest", () => {
  const gate = enforceActionSource(
    decision(),
    ACTION_SOURCES.AUTONOMOUS
  );

  assert.equal(gate.authorized, false);
  assert.match(gate.reason, /suggest/);
});

test("autonomous confirm action remains blocked", () => {
  const gate = enforceActionSource(
    decision({ "light.hall": "confirm" }),
    ACTION_SOURCES.AUTONOMOUS
  );

  assert.equal(gate.authorized, false);
});

test("autonomous deny action remains blocked", () => {
  const gate = enforceActionSource(
    decision({ "light.hall": "deny" }),
    ACTION_SOURCES.AUTONOMOUS
  );

  assert.equal(gate.authorized, false);
});

test("autonomous auto_safe action is authorized", () => {
  const gate = enforceActionSource(
    decision({ "light.hall": "auto_safe" }),
    ACTION_SOURCES.AUTONOMOUS
  );

  assert.equal(gate.authorized, true);
});


test("repeated corrections downgrade autonomous auto-safe to suggest", () => {
  const original = decision({ "light.hall": "auto_safe" });
  const downgraded = applyBehaviorDowngrade(original, {
    entity_id: "light.hall",
    corrections: 2,
    should_reduce_autonomy: true,
  });
  const gate = enforceActionSource(downgraded, ACTION_SOURCES.AUTONOMOUS);

  assert.equal(downgraded.outcome, "suggest");
  assert.equal(downgraded.executable, false);
  assert.equal(downgraded.policy.behavioralDowngrade, true);
  assert.equal(gate.authorized, false);
});

test("behavior signal never upgrades suggest policy", () => {
  const original = decision();
  const evaluated = applyBehaviorDowngrade(original, {
    corrections: 5,
    should_reduce_autonomy: true,
  });

  assert.equal(evaluated.outcome, "suggest");
  assert.equal(evaluated.executable, false);
  assert.equal(evaluated.policy.behavioralDowngrade, undefined);
});

test("single correction does not downgrade auto-safe", () => {
  const original = decision({ "light.hall": "auto_safe" });
  const evaluated = applyBehaviorDowngrade(original, {
    corrections: 1,
    should_reduce_autonomy: false,
  });

  assert.equal(evaluated.outcome, "approve");
  assert.equal(evaluated.executable, true);
});
