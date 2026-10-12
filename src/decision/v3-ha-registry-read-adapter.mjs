import {assessTwoPassRegistry} from './v3-registry-double-read.mjs';

// INJECTED TRANSPORT ONLY. Does not connect to HA, hold credentials, or grant permission.
// The caller must authenticate/pin the HA endpoint independently before injecting request.
const COMMANDS=Object.freeze([
 ['entities','config/entity_registry/list'],
 ['devices','config/device_registry/list'],
 ['areas','config/area_registry/list'],
]);
const fail=reason=>({ready:false,authorization:false,reason});

function validateLinks(snapshot){
 const devices=new Map(snapshot.devices.map(d=>[d.id,d]));
 const areas=new Set(snapshot.areas.map(a=>a.area_id));
 for(const d of snapshot.devices){
  if(d.area_id!=null && !areas.has(d.area_id))return false;
  if(d.parent_device_id!=null){
   if(typeof d.parent_device_id!=='string'||d.parent_device_id===d.id||!devices.has(d.parent_device_id))return false;
   let current=d,visited=new Set([d.id]);
   while(current.parent_device_id!=null){
    if(visited.has(current.parent_device_id))return false;
    visited.add(current.parent_device_id);
    current=devices.get(current.parent_device_id);
    if(!current)return false;
   }
  }
 }
 for(const e of snapshot.entities){
  if(e.device_id!=null&&!devices.has(e.device_id))return false;
  if(e.area_id!=null&&!areas.has(e.area_id))return false;
 }
 return true;
}

export async function inspectHaRegistryReadOnly({request,timeoutMs=5000,maxEntries=10000}={}){
 if(typeof request!=='function'||!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>10000||
    !Number.isSafeInteger(maxEntries)||maxEntries<1||maxEntries>50000)return fail('invalid_adapter_options');
 let expired=false;
 const read=async()=>{
  const result={};
  for(const [name,type] of COMMANDS){
   if(expired)throw Error('registry_read_expired');
   const raw=await request(Object.freeze({type}));
   if(expired)throw Error('registry_read_expired');
   if(!Array.isArray(raw)||raw.length>maxEntries)return null;
   result[name]=raw;
  }
  return result;
 };
 let timer;
 try{
  const answer=await Promise.race([
   (async()=>{const first=await read();if(!first)return fail('invalid_registry_response');
    const second=await read();if(!second)return fail('invalid_registry_response');
    const comparison=assessTwoPassRegistry({first,second});
    if(!comparison.stable)return fail(comparison.reason);
    if(!validateLinks(first)||!validateLinks(second))return fail('invalid_registry_relationship');
    return {ready:false,authorization:false,status:'read_only_review',reason:'trusted_source_and_owner_policy_required',hashes:comparison.hashes};})(),
   new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(Error('timeout'));},timeoutMs);}),
  ]);
  return answer;
 }catch{return fail('registry_transport_failure');}
 finally{expired=true;if(timer!==undefined)clearTimeout(timer);}
}
