// Privacy-safe MCP operational logging: no raw request arguments, entity IDs,
// conversation contents, returned state attributes, history or access tokens.
const isObj = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const safeCount = x => Array.isArray(x) ? x.length : null;
export function summarizeMcpRequest(name) {
  return { tool: typeof name === 'string' && /^ha_[a-z_]+$/.test(name) ? name : 'other' };
}
export function summarizeMcpResponse(name, result) {
  const body = result?.structuredContent ?? result;
  const data = isObj(body?.data) ? body.data : body;
  const summary = { tool: summarizeMcpRequest(name).tool, error: result?.isError === true };
  if (name === 'ha_get_history') {
    const entities = safeCount(data?.entities);
    summary.entityCount = entities;
    summary.recordCount = Array.isArray(data?.entities)
      ? data.entities.reduce((n, e) => n + (Array.isArray(e?.states) ? e.states.length
        : Array.isArray(e?.statistics) ? e.statistics.length : 0), 0)
      : null;
  } else if (name === 'ha_search') {
    summary.entityCount = safeCount(data?.entities);
  }
  return summary;
}
