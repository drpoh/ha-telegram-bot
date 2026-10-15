// Validate every stored scene target against fresh, complete HA area membership.
// Read-only dependency injection; no service actions or SQLite writes.
const DOMAINS=['light','media_player','select','input_select'];
export async function discoverSceneAreaEntities(areaId, callTool) {
 if(typeof areaId!=='string'||!areaId.trim()||typeof callTool!=='function')
   return {allowed:false,status:'invalid_discovery_request',ids:[]};
 const ids=[];
 for(const domain of DOMAINS) {
   let result;
   try {
     result=await callTool('ha_search',{
       area_filter:areaId,domain_filter:domain,limit:100,include_hidden:false,
       result_fields:['entity_id','domain','area'],fields:['entities','entity_has_more']
     });
   } catch {
     return {allowed:false,status:'area_search_failed',ids:[]};
   }
   const body=result?.structuredContent??result;
   const data=body?.data??body;
   if(result?.isError===true||data?.success===false||!Array.isArray(data?.entities))
     return {allowed:false,status:'area_search_invalid',ids:[]};
   if(data.entity_has_more===true)
     return {allowed:false,status:'area_search_truncated',ids:[]};
   for(const entity of data.entities) {
     if(typeof entity?.entity_id!=='string'||entity.entity_id.split('.')[0]!==domain)
       return {allowed:false,status:'area_search_domain_mismatch',ids:[]};
     if(entity.area_id && entity.area_id!==areaId)
       return {allowed:false,status:'area_search_scope_mismatch',ids:[]};
     ids.push(entity.entity_id);
   }
 }
 return {allowed:true,status:'verified_area_membership',ids:[...new Set(ids)]};
}
