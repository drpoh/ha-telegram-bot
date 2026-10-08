// Test-only registry acquisition boundary. No direct HA credentials, network,
// or service calls. Production integration must provide a proven read-only adapter.
export async function acquireSatelliteRegistrySnapshot({readRegistry,now=Date.now(),timeoutMs=2000}={}){
 if(typeof readRegistry!=="function" || !Number.isFinite(now) ||
  !Number.isSafeInteger(timeoutMs) || timeoutMs<1 || timeoutMs>10000)
  return {success:false,complete:false,reason:"invalid_registry_adapter"};
 let timer;
 try{
  const result=await Promise.race([
   Promise.resolve().then(()=>readRegistry({readOnly:true})),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error("timeout")),timeoutMs);}),
  ]);
  if(!result || result.success!==true || result.complete!==true ||
   result.partial===true || result.has_more===true || result.next_offset!=null ||
   !Array.isArray(result.devices) || !Number.isFinite(result.capturedAt) ||
   result.capturedAt>now || now-result.capturedAt>30000)
   return {success:false,complete:false,reason:"unverified_registry_completeness"};
  const ids=new Set(),satellites=new Set(),devices=[];
  for(const d of result.devices){
   if(typeof d?.deviceId!=="string" || !d.deviceId ||
    typeof d?.satelliteId!=="string" || !d.satelliteId ||
    typeof d?.areaId!=="string" || !d.areaId ||
    typeof d.available!=="boolean" || typeof d.disabled!=="boolean" ||
    ids.has(d.deviceId) || satellites.has(d.satelliteId))
    return {success:false,complete:false,reason:"invalid_or_ambiguous_device"};
   ids.add(d.deviceId);satellites.add(d.satelliteId);
   devices.push({deviceId:d.deviceId,satelliteId:d.satelliteId,areaId:d.areaId,
    available:d.available,disabled:d.disabled});
  }
  return {success:true,complete:true,partial:false,capturedAt:result.capturedAt,devices};
 }catch{return {success:false,complete:false,reason:"registry_read_failed"};}
 finally{if(timer!==undefined)clearTimeout(timer);}
}
