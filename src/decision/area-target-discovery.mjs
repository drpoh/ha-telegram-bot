// Generic read-only inventory. NEVER interpret area membership as permission to actuate.
const DOMAINS = ['light', 'switch'];
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

export async function discoverAreaTargets({
  areaId, areaName, callTool, lightIds = [], excludedLightIds = [], switchLightIds = [], maxEntities = 100,
} = {}) {
  if (typeof areaId !== 'string' || !areaId.trim() ||
      typeof areaName !== 'string' || !areaName.trim() ||
      typeof callTool !== 'function' || !Array.isArray(lightIds) || !Array.isArray(excludedLightIds) ||
      !lightIds.every(id => typeof id === 'string' && id.startsWith('light.')) ||
      !excludedLightIds.every(id => typeof id === 'string' && id.startsWith('light.')) ||
      new Set([...lightIds, ...excludedLightIds]).size !== lightIds.length + excludedLightIds.length ||
      !Array.isArray(switchLightIds) ||
      !switchLightIds.every(id => typeof id === 'string' && id.startsWith('switch.')) ||
      new Set(switchLightIds).size !== switchLightIds.length ||
      !Number.isInteger(maxEntities) || maxEntities < 1 || maxEntities > 100) {
    return { allowed: false, status: 'invalid_discovery_request' };
  }
  try {
    const all = [];
    for (const domain of DOMAINS) {
      const result = await callTool('ha_search', {
        query: '', area_filter: areaId, domain_filter: domain, limit: maxEntities,
        include_hidden: false, result_fields: ['entity_id', 'domain', 'area', 'state'],
      });
      const d = result?.structuredContent ?? result;
      if (d?.success !== true || d.partial !== false || d.entity_has_more !== false ||
          !Number.isInteger(d.entity_total_matches) || !Array.isArray(d.entities) ||
          d.entities.length !== d.entity_total_matches || d.entities.length > maxEntities) {
        return { allowed: false, status: 'incomplete_area_inventory' };
      }
      if (d.entities.some(e => !e || e.domain !== domain ||
          typeof e.entity_id !== 'string' || !e.entity_id.startsWith(domain + '.') ||
          e.area !== areaName)) {
        return { allowed: false, status: 'area_membership_unverified' };
      }
      all.push(...d.entities);
    }
    const ids = all.map(e => e.entity_id);
    if (new Set(ids).size !== ids.length) return { allowed: false, status: 'duplicate_entities' };
    if (switchLightIds.some(id => !ids.includes(id))) return { allowed: false, status: 'switch_not_in_area' };
    const discoveredLights = all.filter(e => e.domain === 'light').map(e => e.entity_id);
    if (discoveredLights.length !== lightIds.length + excludedLightIds.length ||
        discoveredLights.some(id => !lightIds.includes(id) && !excludedLightIds.includes(id))) {
      return { allowed: false, status: 'unclassified_lights' };
    }
    const selected = all.filter(e => lightIds.includes(e.entity_id) || switchLightIds.includes(e.entity_id));
    if (!selected.length) return { allowed: false, status: 'no_light_targets' };
    const available = [];
    const unavailable = [];
    for (const e of selected) {
      const res = await callTool('ha_get_state', { entity_id: e.entity_id });
      const d = res?.structuredContent ?? res;
      const state = d?.data ?? d;
      if (state?.entity_id !== e.entity_id || !own(state, 'state') || typeof state.state !== 'string') {
        return { allowed: false, status: 'state_unverified' };
      }
      (['on', 'off'].includes(state.state) ? available : unavailable).push(e.entity_id);
    }
    if (unavailable.length) return { allowed: false, status: 'unavailable_targets', unavailable, available };
    return { allowed: true, status: 'verified_read_only', entityIds: available };
  } catch {
    return { allowed: false, status: 'discovery_failed' };
  }
}
