import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";

import { initDatabase } from "../src/db/database.mjs";
import {
  clearBehaviorCorrections,
  clearBehaviorCorrectionsForEntity,
  getBehaviorCorrections,
  getBehaviorCorrectionSignal,
  getBehaviorAuditSnapshot,
  loadBehaviorCorrections,
  observeBehaviorAction,
  setBehaviorCorrectionPersistence,
} from "../src/learning/corrections.mjs";

const dbPath = "/tmp/ha-telegram-bot-corrections-test.db";

function cleanup() {
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = dbPath + suffix;
    if (existsSync(file)) rmSync(file);
  }
}

test.beforeEach(() => {
  cleanup();
  initDatabase(dbPath);
  setBehaviorCorrectionPersistence(dbPath);
  clearBehaviorCorrections();
});

test.afterEach(() => {
  clearBehaviorCorrections();
  cleanup();
});

test("learns quick explicit reversal of autonomous action", () => {
  observeBehaviorAction({
    source: "autonomous",
    domain: "light",
    service: "turn_on",
    entity_id: "light.test",
    at: 1000,
  });
  const detected = observeBehaviorAction({
    source: "user_explicit",
    domain: "light",
    service: "turn_off",
    entity_id: "light.test",
    at: 5000,
  });

  assert.equal(detected.length, 1);
  assert.equal(detected[0].delay_ms, 4000);
  assert.equal(detected[0].autonomous_service, "turn_on");
});

test("does not learn explicit-to-explicit reversal", () => {
  observeBehaviorAction({
    source: "user_explicit",
    domain: "light",
    service: "turn_on",
    entity_id: "light.test",
    at: 1000,
  });
  observeBehaviorAction({
    source: "user_explicit",
    domain: "light",
    service: "turn_off",
    entity_id: "light.test",
    at: 2000,
  });
  assert.deepEqual(getBehaviorCorrections(), []);
});

test("does not learn reversal outside time window", () => {
  observeBehaviorAction({
    source: "autonomous",
    domain: "light",
    service: "turn_on",
    entity_id: "light.test",
    at: 1000,
  });
  observeBehaviorAction({
    source: "user_explicit",
    domain: "light",
    service: "turn_off",
    entity_id: "light.test",
    at: 200000,
  });
  assert.deepEqual(getBehaviorCorrections(), []);
});

test("persists correction history across restart-style load", () => {
  observeBehaviorAction({
    source: "autonomous",
    domain: "light",
    service: "turn_on",
    entity_id: "light.test",
    at: 1000,
  });
  observeBehaviorAction({
    source: "user_explicit",
    domain: "light",
    service: "turn_off",
    entity_id: "light.test",
    at: 2000,
  });

  assert.equal(loadBehaviorCorrections({ dbPath }), 1);
  assert.equal(getBehaviorCorrections("light.test", 1)[0].correction_service, "turn_off");
});


test("risk signal requires repeated corrections before reducing autonomy", () => {
  for (const base of [1000, 10000]) {
    observeBehaviorAction({
      source: "autonomous",
      domain: "light",
      service: "turn_on",
      entity_id: "light.test",
      at: base,
    });
    observeBehaviorAction({
      source: "user_explicit",
      domain: "light",
      service: "turn_off",
      entity_id: "light.test",
      at: base + 1000,
    });
  }

  const signal = getBehaviorCorrectionSignal("light.test");
  assert.equal(signal.corrections, 2);
  assert.equal(signal.should_reduce_autonomy, true);
});


test("audit snapshot exposes correction counts and downgrade state", () => {
  for (const base of [1000, 10000]) {
    observeBehaviorAction({
      source: "autonomous",
      domain: "light",
      service: "turn_on",
      entity_id: "light.test",
      at: base,
    });
    observeBehaviorAction({
      source: "user_explicit",
      domain: "light",
      service: "turn_off",
      entity_id: "light.test",
      at: base + 1000,
    });
  }

  assert.deepEqual(getBehaviorAuditSnapshot(), [{
    entity_id: "light.test",
    corrections: 2,
    last_correction_at: 11000,
    last_autonomous_service: "turn_on",
    last_correction_service: "turn_off",
    autonomy_reduced: true,
  }]);
});


test("operator reset removes corrections only for selected entity", () => {
  for (const entityId of ["light.one", "light.two"]) {
    observeBehaviorAction({
      source: "autonomous",
      domain: "light",
      service: "turn_on",
      entity_id: entityId,
      at: 1000,
    });
    observeBehaviorAction({
      source: "user_explicit",
      domain: "light",
      service: "turn_off",
      entity_id: entityId,
      at: 2000,
    });
  }

  assert.equal(clearBehaviorCorrectionsForEntity("light.one"), 1);
  assert.equal(getBehaviorCorrections("light.one").length, 0);
  assert.equal(getBehaviorCorrections("light.two").length, 1);
  assert.equal(clearBehaviorCorrectionsForEntity("light.unknown"), 0);
});
