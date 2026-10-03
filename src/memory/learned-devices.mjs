import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const DB_PATH = resolve("data/bot.db");

function sqlString(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  return `'${String(value).replaceAll("'", "''")}'`;
}

function runSql(sql, json = false) {
  const args = json
    ? ["-json", DB_PATH, sql]
    : ["-batch", "-noheader", DB_PATH, sql];

  return execFileSync("sqlite3", args, {
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  }).trim();
}

export function rememberLearnedDevice(
  alias,
  entityId,
  domain,
  friendlyName = null
) {
  runSql(`
    INSERT INTO learned_devices (
      alias,
      entity_id,
      domain,
      friendly_name,
      use_count,
      updated_at
    )
    VALUES (
      ${sqlString(alias.toLowerCase().trim())},
      ${sqlString(entityId)},
      ${sqlString(domain)},
      ${sqlString(friendlyName)},
      1,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT(alias) DO UPDATE SET
      entity_id = excluded.entity_id,
      domain = excluded.domain,
      friendly_name = excluded.friendly_name,
      use_count = learned_devices.use_count + 1,
      updated_at = CURRENT_TIMESTAMP;
  `);
}

export function getLearnedDevices() {
  const output = runSql(`
    SELECT
      alias,
      entity_id,
      domain,
      friendly_name,
      use_count,
      updated_at
    FROM learned_devices
    ORDER BY use_count DESC, updated_at DESC;
  `, true);

  return output ? JSON.parse(output) : [];
}

export function findLearnedDevice(text) {
  const normalized = text
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .trim();

  const devices = getLearnedDevices();

  return (
    devices.find(
      (device) =>
        normalized.includes(device.alias)
    ) || null
  );
}
