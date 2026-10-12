// Read-only validation of ONE explicitly named switch used as a room light.
// This does not authorize other switches in the area or execute services.
export async function discoverNamedAreaLightSwitch({ areaName, entityId, callTool } = {}) {
  if (typeof areaName !== 'string' || !areaName.trim() ||
      typeof entityId !== 'string' || !entityId.startsWith('switch.') ||
      typeof callTool !== 'function') {
    return { allowed: false, status: 'invalid_discovery_request' };
  }
  try {
    const response = await callTool('ha_search', {
      query: '', area_filter: areaName, domain_filter: 'switch',
      limit: 100, include_hidden: false,
      result_fields: ['entity_id', 'domain', 'area', 'state'],
    });
    const data = response?.structuredContent ?? response;
    if (!data || data.success !== true || data.partial !== false ||
        data.entity_has_more !== false || !Number.isInteger(data.entity_total_matches) ||
        !Array.isArray(data.entities) || data.entities.length !== data.entity_total_matches ||
        data.entities.length > 100) {
      return { allowed: false, status: 'incomplete_area_inventory' };
    }
    const ids = data.entities.map(e => e?.entity_id);
    if (new Set(ids).size !== ids.length ||
        data.entities.some(e => typeof e?.entity_id !== 'string' ||
          e.domain !== 'switch' || !e.entity_id.startsWith('switch.') ||
          e.area !== areaName) ||
        !ids.includes(entityId)) {
      return { allowed: false, status: 'area_membership_unverified' };
    }
    const result = await callTool('ha_get_state', { entity_id: entityId });
    const raw = result?.structuredContent ?? result;
    const state = raw?.data ?? raw;
    if (state?.entity_id !== entityId || !['on', 'off'].includes(state?.state)) {
      return { allowed: false, status: 'state_unverified' };
    }
    return { allowed: true, status: 'verified', entityIds: [entityId] };
  } catch {
    return { allowed: false, status: 'discovery_failed' };
  }
}
