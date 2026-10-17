// Interpret ha_search pagination without treating a zero-result search as a full registry audit.
export function assessSearchCoverage(payload) {
  const data = payload?.data ?? payload;
  if (!data || data.success !== true || !Array.isArray(data.entities)) {
    return { complete: false, reason: "invalid_result" };
  }
  if (data.partial === true || data.entity_has_more === true || data.has_more === true) {
    return { complete: false, reason: "more_results" };
  }
  const total = data.entity_total_matches;
  const offset = data.offset ?? 0;
  if (!Number.isSafeInteger(total) || !Number.isSafeInteger(offset) || offset < 0) {
    return { complete: false, reason: "unverified_total" };
  }
  if (offset + data.entities.length < total) {
    return { complete: false, reason: "incomplete_page" };
  }
  // Complete only for the particular search query/filter, never for the HA registries.
  return { complete: true, reason: "search_page_complete" };
}
