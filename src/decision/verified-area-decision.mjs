// Pure authorization boundary for an already verified, read-only area inventory.
// Never infer an area from an LLM suggestion or treat inventory as policy approval.
export function checkVerifiedAreaDecision({
  discovery, areaResolved = false, userRequestedArea = false,
  toolName, args = {},
} = {}) {
  if (toolName !== 'ha_call_service') return { allowed: true, status: 'not_applicable' };
  if (!userRequestedArea) return { allowed: true, status: 'not_applicable' };
  if (areaResolved !== true || discovery?.allowed !== true ||
      discovery?.status !== 'verified_read_only' || !Array.isArray(discovery.entityIds) ||
      discovery.entityIds.length === 0 ||
      new Set(discovery.entityIds).size !== discovery.entityIds.length) {
    return { allowed: false, status: 'area_not_verified' };
  }
  const ids = Array.isArray(args.entity_id) ? args.entity_id :
    typeof args.entity_id === 'string' ? args.entity_id.split(',').map(x => x.trim()) : [];
  if (!['turn_on', 'turn_off'].includes(args.service) ||
      !['light', 'switch'].includes(args.domain) || ids.length === 0 ||
      ids.some(id => typeof id !== 'string' || !id.startsWith(args.domain + '.') ||
        !discovery.entityIds.includes(id)) || new Set(ids).size !== ids.length) {
    return { allowed: false, status: 'area_target_mismatch' };
  }
  // Mixed-domain batches cannot be passed as a single HA service call.
  // Strict equality prevents a model from quietly executing a subset of a room request.
  if (ids.length !== discovery.entityIds.length ||
      discovery.entityIds.some(id => !ids.includes(id))) {
    return { allowed: false, status: 'partial_area_action' };
  }
  return { allowed: true, status: 'verified_area_scope' };
}
