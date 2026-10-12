// Data-only registry acquisition. The caller must supply an independently
// authorized COMPLETE entity registry; ha_search is never a substitute.
export async function acquireAssistTargetRegistry({readRegistry,now=Date.now(),timeoutMs=2500}={}){
 const deny=reason=>({success:false,complete:false,reason});
 if(typeof readRegistry!=='function'||!Number.isFinite(now)||
   !Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)
  return deny('invalid_registry_adapter');
 let timer;
 try{
  const raw=await Promise.race([
   Promise.resolve().then(()=>readRegistry({readOnly:true})),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),timeoutMs);})
  ]);
  if(raw?.success!==true||raw?.complete!==true||raw?.partial===true||
     raw?.has_more===true||raw?.next_offset!=null||
     !Array.isArray(raw?.entities)||!Number.isFinite(raw.capturedAt)||
     raw.capturedAt>now||now-raw.capturedAt>30000||
     !Number.isSafeInteger(raw.entityCount)||raw.entityCount!==raw.entities.length)
    return deny('unverified_entity_registry');
  const ids=new Set();const entities=[];
  for(const e of raw.entities){
   if(typeof e?.entityId!=='string'||!/^light\.[a-z0-9_]+$/.test(e.entityId)||
      typeof e.areaId!=='string'||!e.areaId||
      typeof e.deviceId!=='string'||!e.deviceId||
      typeof e.available!=='boolean'||typeof e.disabled!=='boolean'||ids.has(e.entityId))
    return deny('invalid_or_duplicate_registry_member');
   ids.add(e.entityId);
   entities.push({entityId:e.entityId,areaId:e.areaId,deviceId:e.deviceId,
    available:e.available,disabled:e.disabled});
  }
  return {success:true,complete:true,partial:false,capturedAt:raw.capturedAt,entities};
 }catch{return deny('registry_read_failed');}
 finally{if(timer!==undefined)clearTimeout(timer);}
}
