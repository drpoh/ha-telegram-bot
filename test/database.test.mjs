import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  rmSync,
} from "node:fs";

import {
  initDatabase,
  setMemory,
  getMemory,
  deleteMemory,
} from "../src/db/database.mjs";

const dbPath = "/tmp/ha-telegram-bot-test.db";

function cleanup() {
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = dbPath + suffix;
    if (existsSync(file)) {
      rmSync(file);
    }
  }
}

test("SQLite persistent memory", () => {
  cleanup();
  initDatabase(dbPath);

  setMemory(
    "lastControlled",
    {
      domain: "light",
      entities: ["light.kukhnia_svet"],
    },
    dbPath
  );

  assert.deepEqual(
    getMemory("lastControlled", dbPath),
    {
      domain: "light",
      entities: ["light.kukhnia_svet"],
    }
  );

  deleteMemory("lastControlled", dbPath);

  assert.equal(
    getMemory("lastControlled", dbPath),
    null
  );

  cleanup();
});
