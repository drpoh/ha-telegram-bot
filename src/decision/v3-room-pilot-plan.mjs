// Owner-selected room pilot plan: review-only. No automatic grants.
export function inspectRoomPilotPlan({roomAreaId,roomEntities,registryEntities}={}){
 const deny=reason=>({ready:false,authorized:false,reason});
 if(typeof roomAreaId!=='string'||!/^[a-z0-9_]{1,80}$/.test(roomAreaId)||
  !Array.isArray(roomEntities)||roomEntities.length===0||
  !Array.isArray(registryEntities))return deny('incomplete_room_selection');
 if(new Set(roomEntities).size!==roomEntities.length)return deny('duplicate_targets');
 const index=new Map(registryEntities.map(e=>[e.id,e]));
 if(new Set(registryEntities.map(e=>e.id)).size!==registryEntities.length)return deny('ambiguous_registry');
 for(const id of roomEntities){
  if(typeof id!=='string'||!/^light\.[a-z0-9_]+$/.test(id)||
   id==='light.ves_svet'||id==='light.ves_svet_2')return deny('unsafe_target');
  const item=index.get(id);
  if(!item||item.areaId!==roomAreaId||item.disabled===true||
   item.platform==='browser_mod'||item.platform==='group')return deny('unverified_room_target');
 }
 return {ready:false,authorized:false,reason:'owner_must_review_exact_room_and_grants',
  candidate:{roomAreaId,entityIds:[...roomEntities].sort(),default:'deny',services:['turn_on','turn_off'],confirmation:'telegram_each_action'}};
}
