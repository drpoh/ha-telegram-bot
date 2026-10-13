// Pure validation for a future read-only HA area discovery step.
// Never use unverified LLM-supplied area membership to authorize a service call.
export function validateAreaLightScope({ areaId, areaName, searchResult, states = [], requestedIds = [] } = {}) {
  const data = searchResult?.structuredContent ?? searchResult;
  if (!areaId || !data || data.success === false || data.partial === true ||
      data.entity_has_more !== false || !Number.isInteger(data.entity_total_matches)) {
    return { allowed: false, status: 'incomplete_area_inventory' };
  }
  const entities = data.entities;
  if (!Array.isArray(entities) || !entities.length || entities.length !== data.entity_total_matches || entities.length > 100) {
    return { allowed: false, status: 'incomplete_area_inventory' };
  }
  const ids = entities.map(e => e?.entity_id);
  const normalizeArea = value => String(value || '').trim().toLocaleLowerCase();
  const acceptedArea = new Set([areaId, areaName].filter(Boolean).map(normalizeArea));
  if (new Set(ids).size !== ids.length || entities.some(e => !e?.entity_id?.startsWith('light.') || e.domain !== 'light' || !acceptedArea.has(normalizeArea(e.area)))) {
    return { allowed: false, status: 'area_membership_unverified' };
  }
  const stateMap = new Map(states.map(s => [s?.entity_id, s]));
  if (states.length !== ids.length || ids.some(id => !stateMap.has(id) || ['unknown', 'unavailable'].includes(stateMap.get(id)?.state))) {
    return { allowed: false, status: 'state_unverified' };
  }
  const requested = Array.isArray(requestedIds) ? requestedIds : [requestedIds];
  if (!requested.length || requested.some(id => !ids.includes(id))) return { allowed: false, status: 'target_out_of_area' };
  return { allowed: true, status: 'verified', entityIds: ids };
}
