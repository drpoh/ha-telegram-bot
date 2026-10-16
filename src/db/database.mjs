import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const DEFAULT_DB_PATH = resolve(process.env.HA_BOT_DB_PATH || "data/bot.db");

function runSql(sql, dbPath = DEFAULT_DB_PATH) {
  mkdirSync(dirname(dbPath), { recursive: true });

  return execFileSync(
    "sqlite3",
    [
      "-batch",
      "-noheader",
      "-cmd",
      ".timeout 5000",
      dbPath,
      sql,
    ],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024,
    }
  ).trim();
}

export function initDatabase(dbPath = DEFAULT_DB_PATH) {
  runSql(`
    PRAGMA journal_mode=WAL;

    CREATE TABLE IF NOT EXISTS conversation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_conversation_created ON conversation(created_at);

    CREATE TABLE IF NOT EXISTS learned_devices (
      alias TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      domain TEXT NOT NULL,
      friendly_name TEXT,
      use_count INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_learned_entity ON learned_devices(entity_id);

    CREATE TABLE IF NOT EXISTS devices (
      alias TEXT PRIMARY KEY,
      entity_id TEXT NOT NULL,
      domain TEXT,
      friendly_name TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

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

export function executeSql(sql, dbPath = DEFAULT_DB_PATH) {
  return runSql(sql, dbPath);
}

export function escapeSql(value) {
  return sqlString(value);
}
