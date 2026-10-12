// Read-only, bounded overview. The caller supplies an authenticated read API and
// explicit entity IDs; this code cannot issue HA service calls or discover grants.
const lightId=id=>typeof id==='string'&&/^light\.[a-z0-9_]+$/.test(id);
export async function summarizeOnLights({entityIds,readState,maxTargets=20}={}){
 const deny=reason=>({status:'unavailable',reason,authorization:false,actualWrite:false});
 if(!Array.isArray(entityIds)||entityIds.length<1||entityIds.length>maxTargets||
    !Number.isSafeInteger(maxTargets)||maxTargets<1||maxTargets>50||
    entityIds.some(id=>!lightId(id))||new Set(entityIds).size!==entityIds.length||
    typeof readState!=='function')return deny('invalid_read_scope');
 const on=[],off=[];
 for(const id of entityIds){
  let state;
  try{state=await readState(id);}catch{return deny('read_failed');}
  if(state?.entity_id!==id||!['on','off'].includes(state.state))return deny('incomplete_or_mismatched_state');
  (state.state==='on'?on:off).push(id);
 }
 return {status:'complete',authorization:false,actualWrite:false,checked:entityIds.length,on,off,
  text:on.length?`Включено (${on.length} из ${entityIds.length}): ${on.join(', ')}.`:`Все ${entityIds.length} проверенных светильников выключены.`};
}
