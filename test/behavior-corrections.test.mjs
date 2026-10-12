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

  const signal = getBehaviorCorrectionSignal("light.test", "turn_on", {
    now: 12000,
  });
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

  assert.deepEqual(getBehaviorAuditSnapshot({ now: 12000 }), [{
    entity_id: "light.test",
    corrections: 2,
    last_correction_at: 11000,
    last_autonomous_service: "turn_on",
    last_correction_service: "turn_off",
    services: { turn_on: { corrections: 2, last_correction_at: 11000, autonomy_reduced: true } },
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


test("risk signal is service-specific", () => {
  for (const [base, service, correction] of [
    [1000, "turn_on", "turn_off"],
    [10000, "turn_off", "turn_on"],
  ]) {
    observeBehaviorAction({
      source: "autonomous", domain: "light", service,
      entity_id: "light.test", at: base,
    });
    observeBehaviorAction({
      source: "user_explicit", domain: "light", service: correction,
      entity_id: "light.test", at: base + 1000,
    });
  }

  assert.equal(getBehaviorCorrectionSignal("light.test", "turn_on", { now: 12000 }).corrections, 1);
  assert.equal(getBehaviorCorrectionSignal("light.test", "turn_off", { now: 12000 }).corrections, 1);
  assert.equal(getBehaviorCorrectionSignal("light.test", "turn_on", { now: 12000 }).should_reduce_autonomy, false);
});

test("risk signal ignores corrections outside horizon", () => {
  for (const base of [1000, 10000]) {
    observeBehaviorAction({
      source: "autonomous", domain: "light", service: "turn_on",
      entity_id: "light.test", at: base,
    });
    observeBehaviorAction({
      source: "user_explicit", domain: "light", service: "turn_off",
      entity_id: "light.test", at: base + 1000,
    });
  }

  const signal = getBehaviorCorrectionSignal("light.test", "turn_on", {
    now: 100000,
    horizonMs: 1000,
  });
  assert.equal(signal.corrections, 0);
  assert.equal(signal.should_reduce_autonomy, false);
});


test("audit downgrade matches service-specific policy signal", () => {
  for (const [base, service, correction] of [[1000, "turn_on", "turn_off"], [10000, "turn_off", "turn_on"]]) {
    observeBehaviorAction({ source: "autonomous", domain: "light", service, entity_id: "light.test", at: base });
    observeBehaviorAction({ source: "user_explicit", domain: "light", service: correction, entity_id: "light.test", at: base + 1000 });
  }
  const audit = getBehaviorAuditSnapshot({ now: 12000 })[0];
  assert.equal(audit.corrections, 2);
  assert.equal(audit.services.turn_on.autonomy_reduced, false);
  assert.equal(audit.services.turn_off.autonomy_reduced, false);
  assert.equal(audit.autonomy_reduced, false);
});

test("audit ignores expired corrections for active downgrade", () => {
  for (const base of [1000, 10000]) {
    observeBehaviorAction({ source: "autonomous", domain: "light", service: "turn_on", entity_id: "light.test", at: base });
    observeBehaviorAction({ source: "user_explicit", domain: "light", service: "turn_off", entity_id: "light.test", at: base + 1000 });
  }
  const audit = getBehaviorAuditSnapshot({ now: 100000, horizonMs: 1000 })[0];
  assert.equal(audit.corrections, 2);
  assert.equal(audit.services.turn_on.corrections, 0);
  assert.equal(audit.autonomy_reduced, false);
});
