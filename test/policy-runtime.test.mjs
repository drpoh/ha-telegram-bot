import test from "node:test";
import assert from "node:assert/strict";

import { decide } from "../src/decision/engine.mjs";
import {
  ACTION_SOURCES,
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
