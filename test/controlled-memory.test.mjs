import test from "node:test";
import assert from "node:assert/strict";

import {
  rememberControlledMany,
  getLastControlled,
  clearControlledMemory,
} from "../src/memory/controlled.mjs";

test("stores controlled entity", () => {
  clearControlledMemory();

  rememberControlledMany(
    "light",
    ["light.kukhnia_svet"]
  );

  const memory = getLastControlled();

  assert.equal(memory.domain, "light");
  assert.deepEqual(
    memory.entities,
    ["light.kukhnia_svet"]
  );
});

test("removes duplicate entities", () => {
  clearControlledMemory();

  rememberControlledMany("light", [
    "light.kukhnia_svet",
    "light.kukhnia_svet",
  ]);

  assert.deepEqual(
    getLastControlled().entities,
    ["light.kukhnia_svet"]
  );
});

test("clear removes controlled memory", () => {
  rememberControlledMany(
    "light",
    ["light.kukhnia_svet"]
  );

  clearControlledMemory();

  assert.deepEqual(
    getLastControlled(),
    {
      domain: null,
      entities: [],
    }
  );
});
