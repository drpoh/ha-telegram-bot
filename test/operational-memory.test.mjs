import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";

import { initDatabase } from "../src/db/database.mjs";
import {
  MAX_ENTRIES,
  clearOperationalMemory,
  getOperationalMemory,
  getOperationalContextForEntity,
  loadOperationalMemory,
  rememberOperationalAction,
  setOperationalMemoryPersistence,
} from "../src/memory/operational.mjs";

const dbPath = "/tmp/ha-telegram-bot-operational-test.db";

function cleanup() {
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = dbPath + suffix;
    if (existsSync(file)) rmSync(file);
  }
}

test.beforeEach(() => {
  cleanup();
  initDatabase(dbPath);
  setOperationalMemoryPersistence(dbPath);
  clearOperationalMemory();
});

test.afterEach(() => {
  clearOperationalMemory();
  cleanup();
});

test("stores compact action outcome and reloads it", () => {
  rememberOperationalAction({
    name: "ha_call_service",
    args: { domain: "light", service: "turn_on", entity_id: "light.test" },
    result: {
      structuredContent: { success: true, noisy: "not persisted" },
      verification: {
        status: "confirmed",
        expectedState: "on",
        observedState: "on",
      },
    },
    at: 1234,
  });

  assert.deepEqual(getOperationalMemory(), [{
    at: 1234,
    name: "ha_call_service",
    domain: "light",
    service: "turn_on",
    entity_id: "light.test",
    accepted: true,
    verification: "confirmed",
    expected_state: "on",
    observed_state: "on",
    entities: null,
  }]);

  setOperationalMemoryPersistence(dbPath);
  assert.equal(loadOperationalMemory({ dbPath }), 1);
  assert.equal(getOperationalMemory()[0].verification, "confirmed");
});

test("keeps only bounded recent entries", () => {
  for (let i = 0; i < MAX_ENTRIES + 5; i++) {
    rememberOperationalAction({
      name: "ha_call_service",
      args: { domain: "light", service: "turn_on", entity_id: `light.test_${i}` },
      result: { structuredContent: { success: true } },
      at: i,
    });
  }

  const saved = getOperationalMemory();
  assert.equal(saved.length, MAX_ENTRIES);
  assert.equal(saved[0].entity_id, "light.test_5");
  assert.equal(saved.at(-1).entity_id, `light.test_${MAX_ENTRIES + 4}`);
});


test("stores compact per-entity verification for multi-entity action", () => {
  rememberOperationalAction({
    name: "ha_call_service",
    args: {
      domain: "light",
      service: "turn_off",
      entity_id: ["light.one", "light.two"],
    },
    result: {
      structuredContent: { success: true },
      verification: {
        status: "pending",
        expectedState: "off",
        entities: [
          { entityId: "light.one", status: "confirmed", observedState: "off" },
          { entityId: "light.two", status: "pending", observedState: "on" },
        ],
      },
    },
    at: 2222,
  });

  const entry = getOperationalMemory()[0];
  assert.deepEqual(entry.entities, [
    { entity_id: "light.one", status: "confirmed", observed_state: "off" },
    { entity_id: "light.two", status: "pending", observed_state: "on" },
  ]);
});


test("returns only bounded operational context for requested entity", () => {
  for (const [at, entityId] of [
    [1, "light.one"],
    [2, "light.two"],
    [3, "light.one"],
    [4, "light.one"],
  ]) {
    rememberOperationalAction({
      name: "ha_call_service",
      args: { domain: "light", service: "turn_on", entity_id: entityId },
      result: { structuredContent: { success: true } },
      at,
    });
  }

  const context = getOperationalContextForEntity("light.one", 2);
  assert.equal(context.length, 2);
  assert.deepEqual(context.map((item) => item.at), [3, 4]);
  assert.equal(context.some((item) => "name" in item), false);
});
