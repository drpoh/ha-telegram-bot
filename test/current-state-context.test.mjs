import test from "node:test";
import assert from "node:assert/strict";

import { isReadStateRequest } from "../src/ai/agent.mjs";

test("detects read-only state requests", () => {
  assert.equal(isReadStateRequest("Какое состояние света на кухне?"), true);
  assert.equal(isReadStateRequest("Свет на кухне включён?"), true);
  assert.equal(isReadStateRequest("Работает ли свет в ванной?"), true);
});

test("does not prefetch state for control commands", () => {
  assert.equal(isReadStateRequest("Включи свет на кухне"), false);
  assert.equal(isReadStateRequest("Выключи свет на кухне"), false);
  assert.equal(isReadStateRequest("Переключи свет на кухне"), false);
});


test("detects known sensor value requests", () => {
  assert.equal(isReadStateRequest("Какая температура в сауне?"), true);
  assert.equal(isReadStateRequest("Сколько градусов в сауне?"), true);
  assert.equal(isReadStateRequest("Сколько сейчас градусов в сауне?"), true);
});
