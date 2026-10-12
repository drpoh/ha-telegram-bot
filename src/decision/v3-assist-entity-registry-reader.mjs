// Strict fixture interface for future authoritative HA entity-registry transport.
// Caller must independently prove provenance and global snapshot completeness.
export async function acquireAssistEntityRegistry({readRegistry,now=Date.now(),timeoutMs=2000}={}){
 const deny=reason=>({success:false,complete:false,reason});
 if(typeof readRegistry!=='function'||!Number.isFinite(now)||!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)
  return deny('invalid_reader');
 let timer;
 try{
  const raw=await Promise.race([
   Promise.resolve().then(()=>readRegistry({readOnly:true})),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),timeoutMs);}),
  ]);
  if(raw?.success!==true||raw?.complete!==true||raw.partial===true||raw.has_more===true||
     raw.next_offset!=null||!Array.isArray(raw.entities)||
     !Number.isSafeInteger(raw.entityCount)||raw.entityCount!==raw.entities.length||
     !Number.isFinite(raw.capturedAt)||raw.capturedAt>now||now-raw.capturedAt>30000)
   return deny('unverified_completeness_or_freshness');
  const seen=new Set(),entities=[];
  for(const entry of raw.entities){
   if(typeof entry?.entityId!=='string'||!/^light\.[a-z0-9_]+$/.test(entry.entityId)||
      typeof entry.areaId!=='string'||!entry.areaId||typeof entry.deviceId!=='string'||!entry.deviceId||
      typeof entry.available!=='boolean'||typeof entry.disabled!=='boolean'||seen.has(entry.entityId))
    return deny('invalid_or_duplicate_entity');
   seen.add(entry.entityId);
   entities.push({entityId:entry.entityId,areaId:entry.areaId,deviceId:entry.deviceId,available:entry.available,disabled:entry.disabled});
  }
  return {success:true,complete:true,partial:false,capturedAt:raw.capturedAt,entities};
 }catch{return deny('registry_read_failed');}
 finally{if(timer!==undefined)clearTimeout(timer);}
}
