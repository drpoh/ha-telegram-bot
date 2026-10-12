// Offline read-target evidence; never authorizes an MCP call or actuation.
export function verifyAssistReadTarget({snapshot,entityId,areaId,now=Date.now(),maxAgeMs=30000}={}){
 const deny=reason=>({allowed:false,reason});
 if(!Number.isFinite(now)||!Number.isSafeInteger(maxAgeMs)||maxAgeMs<1||maxAgeMs>30000||
  !snapshot||snapshot.success!==true||snapshot.complete!==true||snapshot.partial===true||
  snapshot.has_more===true||snapshot.next_offset!=null||
  !Array.isArray(snapshot.entities)||!Number.isFinite(snapshot.capturedAt)||
  now<snapshot.capturedAt||now-snapshot.capturedAt>maxAgeMs||
  (snapshot.entityCount!==undefined&&
   (!Number.isSafeInteger(snapshot.entityCount)||snapshot.entityCount!==snapshot.entities.length)))
  return deny('incomplete_or_stale_entity_registry');
 if(typeof entityId!=='string'||!/^light\.[a-z0-9_]+$/.test(entityId)||
  typeof areaId!=='string'||!areaId.trim())return deny('invalid_target');
 const seen=new Set();
 for(const entity of snapshot.entities){
  if(typeof entity?.entityId!=='string'||!/^light\.[a-z0-9_]+$/.test(entity.entityId)||
   typeof entity.areaId!=='string'||!entity.areaId.trim()||
   typeof entity.deviceId!=='string'||!entity.deviceId.trim()||
   typeof entity.available!=='boolean'||typeof entity.disabled!=='boolean'||
   seen.has(entity.entityId))
   return deny('invalid_or_duplicate_registry_member');
  seen.add(entity.entityId);
 }
 const entity=snapshot.entities.find(e=>e.entityId===entityId);
 if(!entity)return deny('missing_or_ambiguous_target');
 if(entity.areaId!==areaId||entity.disabled||!entity.available)
  return deny('target_area_or_availability_mismatch');
 return {allowed:true,entityId,deviceId:entity.deviceId,status:'read_target_verified_only'};
}
