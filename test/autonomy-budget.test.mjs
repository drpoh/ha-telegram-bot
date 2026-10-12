import test from "node:test";
import assert from "node:assert/strict";
import { actionFingerprint, checkAutonomyBudget, commitAutonomousAction, resetAutonomyBudget } from "../src/policy/autonomy-budget.mjs";

const action = { domain: "light", service: "turn_off", entity_id: "light.one" };

test.beforeEach(() => resetAutonomyBudget());

test("fingerprint is stable across entity ordering", () => {
  assert.equal(actionFingerprint({ ...action, entity_id: ["light.two", "light.one"] }), actionFingerprint({ ...action, entity_id: "light.one,light.two" }));
});

test("exact retry is blocked by deduplication", () => {
  commitAutonomousAction(action, { now: 1000 });
  const gate = checkAutonomyBudget(action, { now: 2000 });
  assert.equal(gate.allowed, false);
  assert.equal(gate.reason, "duplicate");
});

test("different action on same entity is blocked during cooldown", () => {
  commitAutonomousAction(action, { now: 1000 });
  const gate = checkAutonomyBudget({ ...action, service: "turn_on" }, { now: 2000 });
  assert.equal(gate.allowed, false);
  assert.equal(gate.reason, "cooldown");
});

test("rate limit bounds autonomous actions", () => {
  for (let i = 0; i < 6; i++) commitAutonomousAction({ ...action, entity_id: `light.${i}` }, { now: 1000 + i });
  const gate = checkAutonomyBudget({ ...action, entity_id: "light.next" }, { now: 2000 });
  assert.equal(gate.allowed, false);
  assert.equal(gate.reason, "rate_limit");
});

test("action is allowed after dedupe cooldown and rate windows", () => {
  commitAutonomousAction(action, { now: 1000 });
  assert.equal(checkAutonomyBudget(action, { now: 70000 }).allowed, true);
});
