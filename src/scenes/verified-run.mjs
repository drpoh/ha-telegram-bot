// Execute an already authorized and area-verified lighting scene.
// Callers MUST run planAiSceneOperation before this function.
// No silent success: confirm each light's observed post-action state.
export async function applyVerifiedLightScene(scene, callTool) {
 if(!scene || !Array.isArray(scene.entities) || scene.entities.length===0 || typeof callTool!=='function')
   return {success:false,blocked:true,outcome:'invalid_scene'};
 // Phase one: reject unsupported saved states before touching a device.
 for(const item of scene.entities) {
   if(!/^light\.[a-z0-9_]+$/.test(item?.entity_id||'') ||
       !['on','off'].includes(item.state))
     return {success:false,blocked:true,outcome:'unsupported_scene_entity'};
 }
 let confirmed=0;
 for(const entity of scene.entities) {
   const args={domain:'light',service:entity.state==='on'?'turn_on':'turn_off',entity_id:entity.entity_id};
   const brightness=entity.attributes?.brightness;
   if(entity.state==='on' && Number.isInteger(brightness) && brightness>=0 && brightness<=255)
     args.brightness=brightness;
   let result;
   try { result=await callTool('ha_call_service',args); }
   catch {return {success:false,partial:confirmed>0,confirmed,outcome:'service_failed'};}
   const content=result?.structuredContent??result;
   const data=content?.data??content;
   if(result?.isError || content?.success===false || data?.success===false || result?.blocked)
     return {success:false,partial:confirmed>0,confirmed,outcome:'service_rejected'};
   // Explicit readback is mandatory even if a service reports acceptance.
   let current;
   try {current=await callTool('ha_get_state',{entity_id:entity.entity_id});}
   catch{return {success:false,partial:confirmed>0,confirmed,outcome:'state_unverified'};}
   const body=current?.structuredContent??current;
   const d=body?.data??body;
   const state=d?.entity_id===entity.entity_id?d:d?.state?.entity_id===entity.entity_id?d.state:d?.entity?.entity_id===entity.entity_id?d.entity:null;
   if(!state || state.state!==entity.state)
     return {success:false,partial:confirmed>0,confirmed,outcome:'state_unverified'};
   confirmed++;
 }
 return {success:true,confirmed,entities:scene.entities.length};
}
