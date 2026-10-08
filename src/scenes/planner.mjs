// Pure, read-only plan. This module never calls HA, changes policy, or executes actions.
// A successful plan is NOT authorization to execute it.
const VALID_ID=/^(light|media_player|select|input_select)\.[a-z0-9_]+$/;
function fail(reason){return {ok:false,status:reason,actions:[]};}
export function planAiScene(scene,{expectedAreaId}={}){
 if(!scene || !Array.isArray(scene.entities) || !scene.entities.length) return fail("empty_or_invalid_scene");
 if(typeof scene.area_id!=="string" || !scene.area_id || !expectedAreaId || scene.area_id!==expectedAreaId) return fail("unverified_area");
 const actions=[],seen=new Set();
 for(const entity of scene.entities){
  const id=entity?.entity_id;
  if(typeof id!=="string" || !VALID_ID.test(id) || seen.has(id)) return fail("invalid_or_duplicate_entity");
  seen.add(id);
  const domain=id.split(".")[0],state=entity.state;
  const attributes=entity.attributes ?? {};
  if(!attributes || typeof attributes!=="object" || Array.isArray(attributes)) return fail("invalid_attributes");
  if(state==="unknown" || state==="unavailable") return fail("unavailable_state");
  if(domain==="light"){
   if(!["on","off"].includes(state)) return fail("unsupported_light_state");
   const args={domain,service:state==="on"?"turn_on":"turn_off",entity_id:id};
   if(Object.hasOwn(attributes,"brightness")){
    if(state!=="on" || !Number.isInteger(attributes.brightness) || attributes.brightness<0 || attributes.brightness>255) return fail("invalid_brightness");
    args.brightness=attributes.brightness;
   }
   actions.push({name:"ha_call_service",args});
  }else if(domain==="media_player"){
   if(!["on","off"].includes(state)) return fail("unsupported_media_state");
   actions.push({name:"ha_call_service",args:{domain,service:state==="on"?"turn_on":"turn_off",entity_id:id}});
   if(Object.hasOwn(attributes,"volume_level")){
    if(state!=="on" || typeof attributes.volume_level!=="number" || !Number.isFinite(attributes.volume_level) || attributes.volume_level<0 || attributes.volume_level>1) return fail("invalid_volume");
    actions.push({name:"ha_call_service",args:{domain,service:"volume_set",entity_id:id,volume_level:attributes.volume_level}});
   }
  }else{
   const option=attributes.option ?? state;
   if(typeof option!=="string" || !option.trim()) return fail("invalid_option");
   actions.push({name:"ha_call_service",args:{domain,service:"select_option",entity_id:id,option}});
  }
 }
 return {ok:true,status:"plan_only_not_authorized",area_id:scene.area_id,actions};
}
