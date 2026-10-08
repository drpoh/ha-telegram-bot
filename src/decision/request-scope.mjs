// A known, singular target is an authorization boundary, not merely an LLM hint.
// Ambiguous, plural, and multi-target requests require a separate resolution path.
export function checkRequestScope({ userText = '', device = null, toolName, args = {} } = {}) {
  if (toolName !== 'ha_call_service' || !device?.entity_id) return { allowed: true, status: 'not_applicable' };
  const text = String(userText).toLowerCase();
  if (/(?:^|\s)(?:все|весь|всю|оба|обе|несколько|и|также|плюс)(?=\s|$)/iu.test(text)) {
    return { allowed: true, status: 'multi_target_unresolved' };
  }
  const ids = Array.isArray(args.entity_id) ? args.entity_id : String(args.entity_id || '').split(',');
  const targets = ids.map(id => String(id).trim()).filter(Boolean);
  const allowed = targets.length === 1 && targets[0] === device.entity_id && args.domain === device.domain;
  return { allowed, status: allowed ? 'matched' : 'out_of_scope', expected: device.entity_id };
}
