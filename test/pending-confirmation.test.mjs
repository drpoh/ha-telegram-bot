import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, rmSync } from "node:fs";

import { initDatabase } from "../src/db/database.mjs";

import {
  cancelPendingConfirmation,
  clearPendingConfirmations,
  consumePendingConfirmation,
  createPendingConfirmation,
  peekPendingConfirmation,
  loadPendingConfirmations,
  setPendingConfirmationPersistence,
} from "../src/decision/pending-confirmation.mjs";

const dbPath = "/tmp/ha-telegram-bot-pending-test.db";

function cleanupDb() {
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = dbPath + suffix;
    if (existsSync(file)) rmSync(file);
  }
}

test.beforeEach(() => {
  cleanupDb();
  initDatabase(dbPath);
  setPendingConfirmationPersistence(dbPath);
  clearPendingConfirmations();
});

test.afterEach(() => {
  clearPendingConfirmations();
  cleanupDb();
});

function makeAction() {
  return {
    name: "ha_call_service",
    args: {
      domain: "lock",
      service: "unlock",
      entity_id: "lock.front_door",
    },
  };
}

test("pending confirmation is scoped to user and chat", () => {
  createPendingConfirmation({ userId: 1, chatId: 10, action: makeAction(), now: 1000 });

  assert.ok(peekPendingConfirmation({ userId: 1, chatId: 10, now: 1001 }));
  assert.equal(peekPendingConfirmation({ userId: 2, chatId: 10, now: 1001 }), null);
  assert.equal(peekPendingConfirmation({ userId: 1, chatId: 11, now: 1001 }), null);
});

test("consume is one-time and returns the exact stored action", () => {
  const action = makeAction();
  const created = createPendingConfirmation({ userId: 1, chatId: 10, action, now: 1000 });
  action.args.entity_id = "lock.changed_after_store";

  const consumed = consumePendingConfirmation({
    userId: 1,
    chatId: 10,
    token: created.token,
    now: 1001,
  });

  assert.equal(consumed.action.name, "ha_call_service");
  assert.equal(consumed.action.args.entity_id, "lock.front_door");
  assert.equal(consumePendingConfirmation({ userId: 1, chatId: 10, now: 1002 }), null);
});

test("expired confirmation cannot be consumed", () => {
  createPendingConfirmation({ userId: 1, chatId: 10, action: makeAction(), ttlMs: 50, now: 1000 });

  assert.equal(consumePendingConfirmation({ userId: 1, chatId: 10, now: 1050 }), null);
  assert.equal(peekPendingConfirmation({ userId: 1, chatId: 10, now: 1051 }), null);
});

test("missing or wrong token does not consume pending action", () => {
  const created = createPendingConfirmation({ userId: 1, chatId: 10, action: makeAction(), now: 1000 });

  assert.equal(
    consumePendingConfirmation({ userId: 1, chatId: 10, now: 1001 }),
    null
  );
  assert.equal(
    consumePendingConfirmation({ userId: 1, chatId: 10, token: "wrong", now: 1002 }),
    null
  );
  assert.equal(
    consumePendingConfirmation({ userId: 1, chatId: 10, token: created.token, now: 1003 })?.token,
    created.token
  );
});

test("pending confirmation survives process-style memory reset", () => {
  const created = createPendingConfirmation({ userId: 1, chatId: 10, action: makeAction(), now: 1000 });

  clearPendingConfirmations({ persist: false });
  assert.equal(peekPendingConfirmation({ userId: 1, chatId: 10, now: 1001 }), null);

  assert.equal(loadPendingConfirmations({ now: 1001, dbPath }), 1);
  const restored = peekPendingConfirmation({ userId: 1, chatId: 10, now: 1002 });
  assert.equal(restored.token, created.token);
  assert.equal(restored.action.args.entity_id, "lock.front_door");

  assert.equal(
    consumePendingConfirmation({ userId: 1, chatId: 10, token: created.token, now: 1003 })?.token,
    created.token
  );

  clearPendingConfirmations({ persist: false });
  assert.equal(loadPendingConfirmations({ now: 1004, dbPath }), 0);
});

test("expired persisted confirmation is discarded on load", () => {
  createPendingConfirmation({ userId: 1, chatId: 10, action: makeAction(), ttlMs: 50, now: 1000 });
  clearPendingConfirmations({ persist: false });

  assert.equal(loadPendingConfirmations({ now: 1050, dbPath }), 0);
  assert.equal(peekPendingConfirmation({ userId: 1, chatId: 10, now: 1051 }), null);
});

test("cancel removes pending confirmation", () => {
  createPendingConfirmation({ userId: 1, chatId: 10, action: makeAction(), now: 1000 });
  assert.equal(cancelPendingConfirmation({ userId: 1, chatId: 10 }), true);
  assert.equal(peekPendingConfirmation({ userId: 1, chatId: 10, now: 1001 }), null);
});
