import { validateAreaLightScope } from './area-scope.mjs';

// Read-only discovery. No service calls, authorization or execution here.
export async function discoverAreaLights({ areaId, areaName, callTool, maxEntities = 100 } = {}) {
  if (!areaId || typeof callTool !== 'function') return { allowed: false, status: 'invalid_discovery_request' };
  try {
    const searchResult = await callTool('ha_search', {
      query: '', area_filter: areaId, domain_filter: 'light', limit: maxEntities,
      include_hidden: false,
      result_fields: ['entity_id', 'domain', 'area', 'state'],
    });
    const data = searchResult?.structuredContent ?? searchResult;
    if (!data || data.success === false || data.partial === true || data.entity_has_more !== false ||
        !Number.isInteger(data.entity_total_matches) || !Array.isArray(data.entities) ||
        data.entities.length !== data.entity_total_matches || data.entities.length === 0 || data.entities.length > maxEntities) {
      return { allowed: false, status: 'incomplete_area_inventory' };
    }
    const states = [];
    for (const entity of data.entities) {
      if (typeof entity?.entity_id !== 'string' || !entity.entity_id.startsWith('light.')) {
        return { allowed: false, status: 'area_membership_unverified' };
      }
      const stateResult = await callTool('ha_get_state', { entity_id: entity.entity_id });
      const stateData = stateResult?.structuredContent ?? stateResult;
      const state = stateData?.data ?? stateData;
      if (state?.entity_id !== entity.entity_id) return { allowed: false, status: 'state_unverified' };
      states.push(state);
    }
    return validateAreaLightScope({ areaId, areaName, searchResult, states, requestedIds: data.entities.map(e => e.entity_id) });
  } catch {
    return { allowed: false, status: 'discovery_failed' };
  }
}
