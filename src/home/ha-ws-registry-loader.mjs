// Transport-independent, offline-testable read-only HA registry loader.
// Caller supplies an already authenticated HA JS WebSocket connection.
// Does not create credentials, sockets, timers in background or HA writes.
import {HA_REGISTRY_READ_COMMANDS,validateHAWebSocketResults} from './ha-ws-registry-snapshot.mjs';
const names=['floors','areas','devices','entities','labels'];
const failure=(reason,section,completed)=>Object.freeze({
 status:'unverified',reason,section,completed,
 complete:false,authorizesRead:false,authorizesWrite:false
});
const isArray=x=>Array.isArray(x);
export async function readHARegistrySnapshot(connection,{timeoutMs=10000}={}){
 if(typeof connection?.sendMessagePromise!=='function')return failure('missing_connection',null,0);
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<500||timeoutMs>30000)
  return failure('invalid_timeout',null,0);
 const responses={};
 for(let i=0;i<HA_REGISTRY_READ_COMMANDS.length;i++){
  const command=HA_REGISTRY_READ_COMMANDS[i];
  let timer;
  try{
   const data=await Promise.race([
    connection.sendMessagePromise({type:command}),
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('bounded_timeout')),timeoutMs);})
   ]);
   if(!isArray(data))return failure('invalid_registry_response',names[i],i);
   // sendMessagePromise returns the WebSocket RESULT payload, not the
   // low-level {id,type,success,result} envelope.
   responses[names[i]]={success:true,result:data};
  }catch{
   // No error text or HA response is logged, since it may contain identifiers.
   return failure('read_failed',names[i],i);
  }finally{clearTimeout(timer);}
 }
 const catalog=validateHAWebSocketResults(responses);
 if(catalog.status!=='offline_snapshot_normalized')
  return failure(catalog.reason??'validation_failed',catalog.section??null,5);
 return Object.freeze({
  status:'validated_snapshot',complete:true,completed:5,
  counts:catalog.counts,entities:catalog.entities,
  areas:catalog.areas,floors:catalog.floors,devices:catalog.devices,
  authorizesRead:false,authorizesWrite:false
 });
}
// Only for status reporting. No entity IDs, location names, labels or raw data.
export function summarizeHARegistryRead(snapshot){
 if(snapshot?.status!=='validated_snapshot')
  return {status:'unverified',reason:snapshot?.reason??'unavailable',
   section:snapshot?.section??null,completed:snapshot?.completed??0,
   authorizesRead:false,authorizesWrite:false};
 return {status:'validated_snapshot',completed:5,
  counts:snapshot.counts,authorizesRead:false,authorizesWrite:false};
}
