import test from "node:test";
import assert from "node:assert/strict";

import {
  cancelPendingConfirmation,
  clearPendingConfirmations,
  consumePendingConfirmation,
  createPendingConfirmation,
  peekPendingConfirmation,
} from "../src/decision/pending-confirmation.mjs";

test.beforeEach(() => clearPendingConfirmations());

const action = {
  name: "ha_call_service",
  args: {
    domain: "lock",
    service: "unlock",
    entity_id: "lock.front_door",
  },
};

test("pending confirmation is scoped to user and chat", () => {
  createPendingConfirmation({ userId: 1, chatId: 10, action, now: 1000 });

  assert.ok(peekPendingConfirmation({ userId: 1, chatId: 10, now: 1001 }));
  assert.equal(peekPendingConfirmation({ userId: 2, chatId: 10, now: 1001 }), null);
  assert.equal(peekPendingConfirmation({ userId: 1, chatId: 11, now: 1001 }), null);
});

test("consume is one-time and returns the exact stored action", () => {
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
  createPendingConfirmation({ userId: 1, chatId: 10, action, ttlMs: 50, now: 1000 });

  assert.equal(consumePendingConfirmation({ userId: 1, chatId: 10, now: 1050 }), null);
  assert.equal(peekPendingConfirmation({ userId: 1, chatId: 10, now: 1051 }), null);
});

test("missing or wrong token does not consume pending action", () => {
  const created = createPendingConfirmation({ userId: 1, chatId: 10, action, now: 1000 });

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

test("cancel removes pending confirmation", () => {
  createPendingConfirmation({ userId: 1, chatId: 10, action, now: 1000 });
  assert.equal(cancelPendingConfirmation({ userId: 1, chatId: 10 }), true);
  assert.equal(peekPendingConfirmation({ userId: 1, chatId: 10, now: 1001 }), null);
});
