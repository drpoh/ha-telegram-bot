import test from "node:test";
import assert from "node:assert/strict";

import {
  clearDecisionAudit,
  getDecisionAudit,
  getDecisionAuditSummary,
  rememberDecisionAudit,
} from "../src/decision/audit.mjs";

test.beforeEach(() => clearDecisionAudit());

function shadow(outcome = "suggest", level = "suggest") {
  return {
    proposal: {
      action: "light.turn_on",
      args: { entity_id: "light.test" },
    },
    outcome,
    policy: { level },
  };
}

test("stores compact decision audit without raw prompt or payload", () => {
  const entry = rememberDecisionAudit({
    shadow: shadow("approve", "auto_safe"),
    source: "autonomous",
    authorized: true,
    at: 123,
  });

  assert.deepEqual(entry, {
    at: 123,
    source: "autonomous",
    action: "light.turn_on",
    entity_id: "light.test",
    outcome: "approve",
    policy: "auto_safe",
    authorized: true,
    behavioral_downgrade: false,
  });
});

test("summarizes policy outcomes and authorization", () => {
  rememberDecisionAudit({ shadow: shadow("approve", "auto_safe"), source: "autonomous", authorized: true });
  rememberDecisionAudit({ shadow: shadow("suggest", "suggest"), source: "autonomous", authorized: false });
  rememberDecisionAudit({ shadow: shadow("confirm", "confirm"), source: "user_explicit", authorized: false });
  rememberDecisionAudit({ shadow: shadow("deny", "deny"), source: "user_explicit", authorized: false });

  assert.deepEqual(getDecisionAuditSummary(), {
    total: 4,
    approve: 1,
    suggest: 1,
    confirm: 1,
    deny: 1,
    authorized: 1,
  });
  assert.equal(getDecisionAudit(2).length, 2);
});
