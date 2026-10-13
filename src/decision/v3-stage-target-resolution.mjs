// Pure Stage 2 selector: outputs candidates for review, NEVER write authority.
// Input registry is a trusted complete inventory fixture, not LLM assertions.
const idOk=s=>typeof s==='string'&&/^light\.[a-z0-9_]+$/.test(s);
const normalize=s=>s.normalize('NFKC').trim().toLocaleLowerCase('ru-RU').replace(/ё/g,'е').replace(/\s+/g,' ');
const deny=reason=>({status:'denied',reason,authorized:false});
export function resolveStageLight({snapshot,name,areaId,now=Date.now(),maxAgeMs=30000}={}){
 if(!snapshot||snapshot.complete!==true||snapshot.partial!==false||snapshot.has_more!==false||
  snapshot.next_offset!=null||!Array.isArray(snapshot.entities)||
  !Number.isSafeInteger(snapshot.capturedAt)||!Number.isSafeInteger(now)||
  now<snapshot.capturedAt||!Number.isSafeInteger(maxAgeMs)||maxAgeMs<1||maxAgeMs>30000||
  now-snapshot.capturedAt>maxAgeMs)return deny('stale_or_incomplete_registry');
 if(typeof name!=='string'||!name.trim()||typeof areaId!=='string'||!areaId.trim())return deny('invalid_request');
 const seen=new Set();
 for(const e of snapshot.entities){
  if(!idOk(e?.entityId)||typeof e.name!=='string'||!e.name.trim()||
   typeof e.areaId!=='string'||!e.areaId.trim()||
   typeof e.deviceId!=='string'||!e.deviceId.trim()||
   typeof e.disabled!=='boolean'||typeof e.available!=='boolean'||seen.has(e.entityId))return deny('invalid_registry');
  seen.add(e.entityId);
 }
 const q=normalize(name);
 const matches=snapshot.entities.filter(e=>e.areaId===areaId&&(normalize(e.name)===q||e.entityId===name));
 if(matches.length!==1)return deny(matches.length?'ambiguous_target':'target_not_found');
 const e=matches[0];
 if(e.disabled||!e.available)return deny('target_disabled_or_unavailable');
 return {status:'candidate',authorized:false,entityId:e.entityId,deviceId:e.deviceId,areaId:e.areaId};
}
