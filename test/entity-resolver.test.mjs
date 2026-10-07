import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveKnownDevice,
} from "../src/home/entity-resolver.mjs";

test("resolves kitchen main light", () => {
  const device = resolveKnownDevice(
    "Включи свет на кухне"
  );

  assert.ok(device);
  assert.equal(
    device.entity_id,
    "light.kukhnia_svet"
  );
  assert.equal(device.domain, "light");
});

test("resolves kitchen light state phrase", () => {
  const device = resolveKnownDevice(
    "Какое состояние света на кухне?"
  );

  assert.ok(device);
  assert.equal(
    device.entity_id,
    "light.kukhnia_svet"
  );
});

test("resolves living room backlight separately", () => {
  const device = resolveKnownDevice("Включи гостиную подсветку");

  assert.ok(device);
  assert.equal(device.entity_id, "light.podsvetka");
});

test("resolves living room spot separately", () => {
  const device = resolveKnownDevice("Выключи гостиная спот");

  assert.ok(device);
  assert.equal(device.entity_id, "light.podsvetka_2");
});

test("unknown device returns null", () => {
  const device = resolveKnownDevice(
    "Включи свет на Марсе"
  );

  assert.equal(device, null);
});
