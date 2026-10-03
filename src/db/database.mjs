import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_DB_PATH = resolve("data/bot.db");

function runSql(sql, dbPath = DEFAULT_DB_PATH) {
  mkdirSync(dirname(dbPath), { recursive: true });

  return execFileSync(
    "sqlite3",
    ["-batch", "-noheader", dbPath, sql],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024,
    }
  ).trim();
}

export function initDatabase(dbPath = DEFAULT_DB_PATH) {
  runSql(`
    PRAGMA journal_mode=WAL;

    CREATE TABLE IF NOT EXISTS memory (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `, dbPath);
}

export function setMemory(key, value, dbPath = DEFAULT_DB_PATH) {
  const json = JSON.stringify(value);

  runSql(`
    INSERT INTO memory (key, value, updated_at)
    VALUES (
      ${sqlString(key)},
      ${sqlString(json)},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP;
  `, dbPath);
}

export function getMemory(key, dbPath = DEFAULT_DB_PATH) {
  const result = runSql(`
    SELECT value
    FROM memory
    WHERE key = ${sqlString(key)}
    LIMIT 1;
  `, dbPath);

  if (!result) {
    return null;
  }

  return JSON.parse(result);
}

export function deleteMemory(key, dbPath = DEFAULT_DB_PATH) {
  runSql(`
    DELETE FROM memory
    WHERE key = ${sqlString(key)};
  `, dbPath);
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}
