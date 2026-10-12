// Scope is an authorization boundary independent of the LLM proposal.
// Only exact, explicitly matched configured aliases may authorize multiple targets.
function normalized(value) {
  return String(value || '').toLocaleLowerCase().replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim();
}

function mentionedAliases(text, device) {
  const input = ` ${normalized(text)} `;
  return (device.aliases || []).some(alias => input.includes(` ${normalized(alias)} `));
}

export function checkRequestScope({ userText = '', device = null, devices = [], toolName, args = {} } = {}) {
  if (toolName !== 'ha_call_service') return { allowed: true, status: 'not_applicable' };
  const text = normalized(userText);
  const plural = /(?:^|\s)(?:все|весь|всю|оба|обе|несколько|и|также|плюс)(?=\s|$)/u.test(text);
  const known = [device, ...devices].filter(Boolean);
  const matched = [...new Map(known.filter(item => item.entity_id && mentionedAliases(text, item)).map(item => [item.entity_id, item])).values()];
  if (!matched.length) return { allowed: true, status: 'not_applicable' };
  if (plural && matched.length < 2) return { allowed: false, status: 'multi_target_unresolved' };
  const ids = Array.isArray(args.entity_id) ? args.entity_id : String(args.entity_id || '').split(',');
  const targets = ids.map(id => String(id).trim()).filter(Boolean);
  const allowed = targets.length > 0 && targets.every(id => matched.some(item => item.entity_id === id && item.domain === args.domain));
  return { allowed, status: allowed ? 'matched' : 'out_of_scope', expected: matched.map(item => item.entity_id) };
}
