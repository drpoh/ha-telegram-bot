import { callHA } from "../mcp/executor.mjs";
import { buildHistoryFact } from "./analyzer.mjs";

function unwrapData(result) {
  return (
    result?.structuredContent?.data ??
    result?.structuredContent ??
    result?.data ??
    result ??
    {}
  );
}

export async function fetchEntityHistory(
  entityId,
  {
    startTime = "24h",
    endTime = null,
    limit = 200,
    order = "asc",
    minimalResponse = true,
    significantChangesOnly = true,
  } = {}
) {
  if (!entityId || typeof entityId !== "string") {
    throw new TypeError("entityId is required");
  }

  const args = {
    entity_ids: entityId,
    source: "history",
    start_time: startTime,
    minimal_response: minimalResponse,
    significant_changes_only: significantChangesOnly,
    limit: Math.min(Math.max(Number(limit) || 200, 1), 1000),
    order,
  };

  if (endTime) args.end_time = endTime;

  const result = await callHA("ha_get_history", args);
  const data = unwrapData(result);
  const entity = data?.entities?.find((item) => item.entity_id === entityId)
    ?? data?.entities?.[0];

  return {
    entityId,
    states: entity?.states ?? [],
    period: entity?.period ?? data?.period ?? null,
    raw: data,
  };
}

export async function fetchEntityStatistics(
  entityId,
  {
    startTime = "30d",
    endTime = null,
    period = "day",
    statisticTypes = ["mean", "min", "max"],
    limit = 100,
  } = {}
) {
  if (!entityId || typeof entityId !== "string") {
    throw new TypeError("entityId is required");
  }

  const args = {
    entity_ids: entityId,
    source: "statistics",
    start_time: startTime,
    period,
    statistic_types: statisticTypes,
    limit: Math.min(Math.max(Number(limit) || 100, 1), 1000),
  };

  if (endTime) args.end_time = endTime;

  const result = await callHA("ha_get_history", args);
  const data = unwrapData(result);
  const entity = data?.entities?.find((item) => item.entity_id === entityId)
    ?? data?.entities?.[0];

  return {
    entityId,
    statistics: entity?.statistics ?? [],
    period,
    unit: entity?.unit_of_measurement ?? null,
    raw: data,
  };
}

export async function getHistoryFact(entityId, options = {}) {
  const history = await fetchEntityHistory(entityId, options);
  return buildHistoryFact(entityId, history.states, {
    startTime: history.period?.start ?? null,
    endTime: history.period?.end ?? null,
  });
}
