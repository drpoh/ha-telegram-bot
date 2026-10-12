import fs from "node:fs/promises";
import path from "node:path";
import { callHA } from "../mcp/executor.mjs";

const ALLOWED = new Set([
  "ha_get_overview",
  "ha_search",
  "ha_get_logs",
  "ha_get_system_health",
  "ha_get_integration",
  "ha_get_device",
  "ha_get_history",
  "ha_get_automation_traces",
]);

async function call(name, args = {}) {
  if (!ALLOWED.has(name)) {
    throw new Error(`AUDIT BLOCKED TOOL: ${name}`);
  }

  try {
    const result = await callHA(name, args);
    return {
      ok: true,
      data: result?.structuredContent ?? result,
    };
  } catch (error) {
    return {
      ok: false,
      error: error?.message ?? String(error),
    };
  }
}

export async function collectAuditV2() {
  const started = new Date().toISOString();

  const report = {
    audit_version: 2,
    mode: "read-only",
    started_at: started,
    safety: {
      service_calls_allowed: false,
      allowed_tools: [...ALLOWED],
    },
    checks: {},
  };

  const c = report.checks;

  // Основная информация HA
  c.overview = await call("ha_get_overview", {
    detail_level: "full",
  });

  // Реальные HA warnings/errors
  c.system_logs = await call("ha_get_logs", {
    source: "system",
    limit: 100,
    order: "newest",
  });

  c.error_summary = await call("ha_get_logs", {
    source: "error_log",
    structured: true,
    top_n: 100,
  });

  // System health + настоящий поиск orphan/restored entities
  c.system_health = await call("ha_get_system_health", {
    include: "repairs,config_check,dead_entities",
  });

  // Интеграции
  c.integrations = await call("ha_get_integration", {
    limit: 200,
    offset: 0,
  });

  // Zigbee2MQTT devices
  c.zigbee2mqtt_devices = await call("ha_get_device", {
    integration: "zigbee2mqtt",
    detail_level: "full",
    limit: 200,
  });

  // ESPHome devices
  c.esphome_devices = await call("ha_get_device", {
    integration: "esphome",
    detail_level: "full",
    limit: 200,
  });

  // Состояния
  c.unavailable = await call("ha_search", {
    query: "",
    state_filter: "unavailable",
    limit: 500,
    include_hidden: true,
  });

  c.unknown = await call("ha_search", {
    query: "",
    state_filter: "unknown",
    limit: 500,
    include_hidden: true,
  });

  c.automations = await call("ha_search", {
    query: "",
    domain_filter: "automation",
    limit: 500,
    include_hidden: true,
  });

  c.scripts = await call("ha_search", {
    query: "",
    domain_filter: "script",
    limit: 500,
    include_hidden: true,
  });

  report.finished_at = new Date().toISOString();

  const dir = path.resolve("data/audits");
  await fs.mkdir(dir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `ha-audit-v2-${stamp}.json`;
  const filepath = path.join(dir, filename);

  await fs.writeFile(
    filepath,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  return { filepath, filename, report };
}
