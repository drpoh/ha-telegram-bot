// Pure, fail-closed authorization for local AI-scene operations.
// This module never reads Home Assistant, writes SQLite or calls a service.
const MUTATIONS = new Set(['ai_scene_capture','ai_scene_run','ai_scene_delete']);
const READS = new Set(['ai_scene_list']);
const SAFE_DOMAINS = new Set(['light','media_player','select','input_select']);
function validName(value) {
 return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 100;
}
export function authorizeAiSceneOperation({toolName,args={},source,area,scene=null,verifiedAreaEntityIds=null}={}) {
 if (!MUTATIONS.has(toolName) && !READS.has(toolName)) return {allowed:false,status:'unknown_tool'};
 if (!area?.area_id || !area?.name) return {allowed:false,status:'unresolved_area'};
 if (READS.has(toolName)) return {allowed:true,status:'read_only'};
 if (source!=='user_explicit') return {allowed:false,status:'explicit_user_required'};
 if (!validName(args.name) || !validName(args.area)) return {allowed:false,status:'missing_scene_identity'};
 // The LLM-supplied room name is never sufficient on its own.
 // A previously independently resolved and matched area must be carried by the dispatcher.
 if (typeof area.requestedArea !== 'string' || area.requestedArea.trim().toLocaleLowerCase('ru-RU') !== args.area.trim().toLocaleLowerCase('ru-RU'))
   return {allowed:false,status:'area_not_bound_to_request'};
 if (toolName==='ai_scene_capture') return {allowed:true,status:'capture_authorized_for_area'};
 if (!scene || scene.area_id!==area.area_id) return {allowed:false,status:'scene_not_in_area'};
 if (toolName==='ai_scene_delete') return {allowed:true,status:'delete_local_scene_only'};
 if (!Array.isArray(verifiedAreaEntityIds) || !verifiedAreaEntityIds.length) return {allowed:false,status:'unverified_scene_entities'};
 const known=new Set(verifiedAreaEntityIds);
 if (!Array.isArray(scene.entities) || !scene.entities.length) return {allowed:false,status:'empty_scene'};
 for (const entity of scene.entities) {
   const id=entity?.entity_id;
   if(typeof id!=='string'||!known.has(id)||!SAFE_DOMAINS.has(id.split('.')[0])) return {allowed:false,status:'scene_target_out_of_scope'};
 }
 return {allowed:true,status:'validated_scene_targets'};
}
