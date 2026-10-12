// Strict, side-effect-free area identity resolution for future actuation.
// Do not map a sub-room name (e.g. "Ванная") to a shared HA area automatically.
const norm = x => String(x ?? '').toLocaleLowerCase('ru-RU')
  .replace(/ё/g,'е').replace(/\s+/g,' ').trim();

export function resolveStrictArea({query, areas, aliases = {}} = {}) {
  if (typeof query !== 'string' || !query.trim() || !Array.isArray(areas))
    return {ok:false,status:'invalid_area_request'};
  const key=norm(query);
  const valid=areas.filter(a=>a && typeof a.area_id==='string' &&
    typeof a.name==='string' && a.area_id.trim() && a.name.trim());
  if (valid.length !== areas.length ||
      new Set(valid.map(a=>norm(a.area_id))).size !== valid.length)
    return {ok:false,status:'invalid_area_registry'};
  const direct=valid.filter(a=>norm(a.area_id)===key || norm(a.name)===key);
  if (direct.length!==1) {
    if (direct.length>1) return {ok:false,status:'ambiguous_area'};
    // The alias registry must be maintained and independently reviewed by the operator.
    if (Object.getPrototypeOf(aliases)!==Object.prototype &&
        Object.getPrototypeOf(aliases)!==null)
      return {ok:false,status:'invalid_alias_registry'};
    const ids=Object.entries(aliases).filter(([alias])=>norm(alias)===key)
      .map(([,id])=>id);
    if(ids.length!==1) return {ok:false,status:ids.length?'ambiguous_area':'area_not_found'};
    const matches=valid.filter(a=>a.area_id===ids[0]);
    if(matches.length!==1) return {ok:false,status:'alias_target_unverified'};
    return {ok:true,status:'reviewed_alias',area:matches[0]};
  }
  return {ok:true,status:'exact_area',area:direct[0]};
}
