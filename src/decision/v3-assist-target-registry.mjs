// Offline registry evidence only. Never infers membership from names/transcripts.
export function verifyAssistReadTarget({snapshot,entityId,areaId,now=Date.now(),maxAgeMs=30000}={}){
 if(!snapshot||snapshot.success!==true||snapshot.complete!==true||snapshot.partial===true||
  !Array.isArray(snapshot.entities)||!Number.isFinite(snapshot.capturedAt)||
  !Number.isFinite(now)||now<snapshot.capturedAt||now-snapshot.capturedAt>maxAgeMs)
  return {allowed:false,reason:'incomplete_or_stale_entity_registry'};
 if(typeof entityId!=='string'||!/^light\.[a-z0-9_]+$/.test(entityId)||
    typeof areaId!=='string'||!areaId)return {allowed:false,reason:'invalid_target'};
 const matches=snapshot.entities.filter(e=>e?.entityId===entityId);
 if(matches.length!==1)return {allowed:false,reason:'missing_or_ambiguous_target'};
 const entity=matches[0];
 if(entity.areaId!==areaId||entity.disabled===true||entity.available!==true||
    typeof entity.deviceId!=='string'||!entity.deviceId)
  return {allowed:false,reason:'target_area_or_availability_mismatch'};
 return {allowed:true,entityId,deviceId:entity.deviceId,status:'read_target_verified_only'};
}
