import { resolveStrictArea } from './strict-area-resolver.mjs';

// Authoritative read-only HA area lookup. No permissive substring fallback.
export async function resolveLiveStrictArea({ query, callTool, aliases = {} } = {}) {
 if (typeof callTool !== 'function') return { ok:false, status:'invalid_area_request' };
 try {
  const response=await callTool('ha_list_floors_areas',{
   fields:['floors','unassigned_areas'],area_fields:['area_id','name'],
  });
  const data=response?.structuredContent ?? response;
  if(data?.success!==true || !Array.isArray(data.floors) ||
      !Array.isArray(data.unassigned_areas) || data.partial===true ||
      data.has_more===true) return {ok:false,status:'area_registry_unverified'};
  const areas=[];
  for(const floor of data.floors){
   if(!floor || !Array.isArray(floor.areas)) return {ok:false,status:'area_registry_unverified'};
   areas.push(...floor.areas);
  }
  areas.push(...data.unassigned_areas);
  return resolveStrictArea({query,areas,aliases});
 } catch {return {ok:false,status:'area_lookup_failed'};}
}
