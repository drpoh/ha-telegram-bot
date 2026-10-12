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

function findEntity(data, entityId) {
  return data?.entities?.find((item) => item.entity_id === entityId)
    ?? data?.entities?.[0]
    ?? null;
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
    allPages = false,
    maxRecords = 5000,
  } = {}
) {
  if (!entityId || typeof entityId !== "string") {
    throw new TypeError("entityId is required");
  }

  const pageLimit = Math.min(Math.max(Number(limit) || 200, 1), 1000);
  const recordLimit = Math.min(Math.max(Number(maxRecords) || 5000, 1), 10000);
  const states = [];
  let offset = 0;
  let period = null;
  let totalCount = null;
  let hasMore = false;

  do {
    const args = {
      entity_ids: entityId,
      source: "history",
      start_time: startTime,
      minimal_response: minimalResponse,
      significant_changes_only: significantChangesOnly,
      limit: Math.min(pageLimit, recordLimit - states.length),
      offset,
      order,
    };

    if (endTime) args.end_time = endTime;

    const result = await callHA("ha_get_history", args);
    const data = unwrapData(result);
    const entity = findEntity(data, entityId);

    if (!entity) {
      return { entityId, states: [], period: data?.period ?? null, totalCount: 0, hasMore: false };
    }

    states.push(...(entity.states ?? []));
    period = entity.period ?? data?.period ?? period;
    totalCount = entity.total_count ?? totalCount;
    hasMore = Boolean(entity.has_more);
    offset = entity.next_offset ?? (offset + (entity.count ?? entity.states?.length ?? 0));

    if (!allPages || !hasMore || states.length >= recordLimit || args.limit <= 0) break;
  } while (true);

  return {
    entityId,
    states: states.slice(0, recordLimit),
    period,
    totalCount,
    hasMore: hasMore && states.length < (totalCount ?? Infinity),
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
  const entity = findEntity(data, entityId);

  return {
    entityId,
    statistics: entity?.statistics ?? [],
    period,
    unit: entity?.unit_of_measurement ?? null,
  };
}

export async function getHistoryFact(entityId, options = {}) {
  const history = await fetchEntityHistory(entityId, options);
  return buildHistoryFact(entityId, history.states, {
    startTime: history.period?.start ?? null,
    endTime: history.period?.end ?? null,
  });
}
