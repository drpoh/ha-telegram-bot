import test from "node:test";
import assert from "node:assert/strict";
import { initDatabase } from "../src/db/database.mjs";

import {
  clearDecisionAudit,
  completeDecisionAudit,
  getDecisionAudit,
  getDecisionAuditSummary,
  rememberDecisionAudit,
  setDecisionAuditPersistence,
} from "../src/decision/audit.mjs";

const TEST_DB = "/tmp/ha-telegram-bot-decision-audit-test.db";
initDatabase(TEST_DB);
setDecisionAuditPersistence(TEST_DB);

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

  assert.equal(typeof entry.id, "string");
  assert.deepEqual({ ...entry, id: "<id>" }, {
    id: "<id>",
    at: 123,
    source: "autonomous",
    action: "light.turn_on",
    entity_id: "light.test",
    outcome: "approve",
    policy: "auto_safe",
    authorized: true,
    behavioral_downgrade: false,
    execution: "pending",
    verification: null,
  });
});

test("links authorized decision to execution verification", () => {
  const entry = rememberDecisionAudit({
    shadow: shadow("approve", "auto_safe"),
    source: "autonomous",
    authorized: true,
  });

  const completed = completeDecisionAudit(entry.id, {
    result: { verification: { status: "confirmed" } },
  });

  assert.equal(completed.execution, "completed");
  assert.equal(completed.verification, "confirmed");
  assert.equal(getDecisionAudit(1)[0].verification, "confirmed");
});

test("blocked decision never enters pending execution", () => {
  const entry = rememberDecisionAudit({
    shadow: shadow("suggest", "suggest"),
    source: "autonomous",
    authorized: false,
  });

  assert.equal(entry.execution, "blocked");
  assert.equal(entry.verification, null);
});

test("summarizes lifetime buffer and recent decision window", () => {
  const now = 200_000_000;
  const day = 24 * 60 * 60 * 1000;

  rememberDecisionAudit({ shadow: shadow("approve", "auto_safe"), source: "autonomous", authorized: true, at: now - day - 1 });
  rememberDecisionAudit({ shadow: shadow("suggest", "suggest"), source: "autonomous", authorized: false, at: now - 1000 });
  rememberDecisionAudit({ shadow: shadow("confirm", "confirm"), source: "user_explicit", authorized: false, at: now - 500 });
  rememberDecisionAudit({ shadow: shadow("deny", "deny"), source: "user_explicit", authorized: false, at: now });

  assert.deepEqual(getDecisionAuditSummary({ now }), {
    total: 4,
    approve: 1,
    suggest: 1,
    confirm: 1,
    deny: 1,
    authorized: 1,
    recent_window_ms: day,
    recent: {
      total: 3,
      approve: 0,
      suggest: 1,
      confirm: 1,
      deny: 1,
      authorized: 0,
    },
  });
  assert.equal(getDecisionAudit(2).length, 2);
});
