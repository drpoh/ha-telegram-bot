import fs from "node:fs/promises";
import path from "node:path";
import { callHA } from "../mcp/executor.mjs";

const ALLOWED_TOOLS = new Set([
  "ha_get_overview",
  "ha_search",
  "ha_get_state",
]);

async function safeCall(name, args = {}) {
  if (!ALLOWED_TOOLS.has(name)) {
    throw new Error(`Audit blocked MCP tool: ${name}`);
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

async function search(query, options = {}) {
  return safeCall("ha_search", {
    query,
    limit: 500,
    include_hidden: true,
    ...options,
  });
}

export async function collectAudit() {
  const startedAt = new Date().toISOString();

  const checks = {};

  // Общая картина HA
  checks.overview = await safeCall("ha_get_overview");

  // Проблемные состояния
  checks.unavailable = await search("", {
    state_filter: "unavailable",
  });

  checks.unknown = await search("", {
    state_filter: "unknown",
  });

  // Основные исполняемые сущности
  checks.automations = await search("", {
    domain_filter: "automation",
  });

  checks.scripts = await search("", {
    domain_filter: "script",
  });

  // Интеграции/устройства, представляющие особый интерес
  checks.esphome = await search("ESPHome");
  checks.zigbee = await search("Zigbee");
  checks.zigbee2mqtt = await search("Zigbee2MQTT");

  const report = {
    audit_version: 1,
    mode: "read-only",
    started_at: startedAt,
    finished_at: new Date().toISOString(),
    safety: {
      allowed_mcp_tools: [...ALLOWED_TOOLS],
      service_calls_allowed: false,
    },
    checks,
  };

  const dir = path.resolve("data/audits");
  await fs.mkdir(dir, { recursive: true });

  const stamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const filename = `ha-audit-${stamp}.json`;
  const filepath = path.join(dir, filename);

  await fs.writeFile(
    filepath,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  return {
    filepath,
    filename,
    report,
  };
}
