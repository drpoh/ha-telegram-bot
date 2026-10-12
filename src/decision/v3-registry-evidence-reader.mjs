import {normalizeLightingRegistry,verifyLightingRegistryDigest} from "./v3-registry-drift-check.mjs";

// Isolated read-only adapter contract. No external caller or AI-supplied evidence is trusted.
export async function acquireLightingEvidence({reader,expectedSha256,now=Date.now(),timeoutMs=2500}={}){
 const deny=reason=>({ready:false,reason,authorization:false});
 if(typeof reader!=="function"||!Number.isFinite(now)||!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000)
  return deny("invalid_reader");
 let timer;
 try{
  const raw=await Promise.race([
   Promise.resolve().then(()=>reader({readOnly:true})),
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error("timeout")),timeoutMs);})
  ]);
  if(raw?.success!==true||raw?.complete!==true||raw?.partial===true||
     raw?.has_more===true||raw?.next_offset!=null||
     !Number.isFinite(raw?.capturedAt)||raw.capturedAt>now||now-raw.capturedAt>30000)
   return deny("unverified_freshness_or_completeness");
  if(!Number.isSafeInteger(raw.entityCount)||raw.entityCount!==raw.entities?.length||
     !Number.isSafeInteger(raw.deviceCount)||raw.deviceCount!==raw.devices?.length||
     !Number.isSafeInteger(raw.areaCount)||raw.areaCount!==raw.areas?.length)
   return deny("unverified_registry_counts");
  const evidence=normalizeLightingRegistry(raw);
  if(!evidence.ok)return deny(evidence.reason);
  const comparison=verifyLightingRegistryDigest(evidence,expectedSha256);
  if(!comparison.valid)return deny(comparison.reason);
  return {ready:false,reason:"owner_and_transport_approval_required",sha256:evidence.sha256,authorization:false};
 }catch{return deny("registry_read_failed");}
 finally{if(timer!==undefined)clearTimeout(timer);}
}
