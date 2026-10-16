import { statfsSync } from "node:fs";
import { resolve } from "node:path";
import { executeSql } from "../db/database.mjs";
import { isMcpConnected } from "../mcp/client.mjs";
import { getQueueStatus } from "../utils/queue.mjs";
import { getBehaviorAuditSnapshot } from "../learning/corrections.mjs";
import { getDecisionAuditSummary } from "../decision/audit.mjs";

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];

  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);

  return parts.join(" ");
}

export function getHealthStatus() {
  return {
    mcp: isMcpConnected(),
    queue: getQueueStatus(),
    uptime: formatUptime(process.uptime()),
    pid: process.pid,
    node: process.version,
    memoryMb: Math.round(process.memoryUsage().rss / 1048576),
    behavioral: {
      corrections: getBehaviorAuditSnapshot(),
    },
    decisions: getDecisionAuditSummary(),
  };
}

export function getLocalDiagnostics() {
  let database = "ошибка", scenes = null;
  try {
    const r = executeSql("PRAGMA quick_check;");
    database = r === "ok" ? "OK" : "проверка не пройдена";
    if (database === "OK") scenes = Number(executeSql("SELECT count(*) FROM ai_scenes;"));
  } catch { database = "недоступна"; }
  let diskFreeGb = null;
  try {
    const disk = statfsSync(resolve(process.env.HA_BOT_DB_PATH || "data/bot.db"));
    diskFreeGb = Math.round(disk.bavail * disk.bsize / 1073741824 * 10) / 10;
  } catch { /* unavailable filesystem info */ }
  return { database, scenes, diskFreeGb };
}
