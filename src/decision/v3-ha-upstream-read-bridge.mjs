// Narrow injected bridge to official home-assistant-js-websocket Connection.
// No package import or network connection here. The owner of `connection`
// must independently verify TLS, credentials and origin before any live use.
import {inspectHaRegistryReadOnly} from './v3-ha-registry-read-adapter.mjs';
const TYPES=new Set(['config/entity_registry/list','config/device_registry/list','config/area_registry/list']);
export async function inspectViaUpstreamConnection({connection,timeoutMs=5000,maxEntries=10000,maxResponseBytes=2097152}={}){
 const fail=reason=>({ready:false,authorization:false,reason});
 if(!connection||typeof connection.sendMessagePromise!=='function')return fail('invalid_upstream_connection');
 if(!Number.isSafeInteger(maxResponseBytes)||maxResponseBytes<1024||maxResponseBytes>16777216)
  return fail('invalid_response_size_limit');
 // Never queue a read across an upstream reconnect: its registry freshness is lost.
 if(connection.connected!==true || connection.closeRequested===true || !connection.socket)
  return fail('upstream_not_connected');
 const initialSocket=connection.socket;
 const healthy=()=>connection.connected===true && connection.closeRequested!==true && connection.socket===initialSocket;
 return inspectHaRegistryReadOnly({
  timeoutMs,maxEntries,
  request:async command=>{
   if(!command||Object.keys(command).length!==1||!TYPES.has(command.type))throw Error('non_registry_command');
   if(!healthy())throw Error('upstream_connection_changed');
   const result=await connection.sendMessagePromise({type:command.type});
   if(!healthy())throw Error('upstream_connection_changed');
   // Post-receive bound only: actual WebSocket frame limits belong to trusted socket setup.
   if(Buffer.byteLength(JSON.stringify(result),'utf8')>maxResponseBytes)throw Error('registry_response_oversize');
   return result;
  },
 });
}

// Offline wiring boundary for a separately authenticated, short-lived official
// Connection. The trusted caller supplies the factory; this does NOT establish
// TLS or credential provenance. Always close, never retain for reconnect/replay.
export async function inspectOneShotRegistryConnection({createConnected,connectTimeoutMs=3000,closeTimeoutMs=1000,...readOptions}={}){
 const deny=reason=>({ready:false,authorization:false,reason});
 if(typeof createConnected!=='function'||!Number.isSafeInteger(connectTimeoutMs)||connectTimeoutMs<1||connectTimeoutMs>10000||
    !Number.isSafeInteger(closeTimeoutMs)||closeTimeoutMs<1||closeTimeoutMs>10000)
  return deny('invalid_one_shot_options');
 let connection,expired=false,timer;
 try{
  connection=await Promise.race([
   Promise.resolve().then(()=>createConnected()).then(async created=>{
    if(expired){try{await created?.close?.();}catch{/* no authority */}throw Error('late_connection');}
    return created;
   }),
   new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(Error('connection_timeout'));},connectTimeoutMs);}),
  ]);
  if(expired)return deny('connection_timeout');
  if(typeof connection?.close!=='function')return deny('invalid_one_shot_connection');
  return await inspectViaUpstreamConnection({connection,...readOptions});
 }catch{return deny('connection_failed_or_timed_out');}
 finally{
  if(timer!==undefined)clearTimeout(timer);
  if(connection && typeof connection.close==='function'){
   let closeTimer;
   try{await Promise.race([Promise.resolve().then(()=>connection.close()),new Promise(resolve=>{closeTimer=setTimeout(resolve,closeTimeoutMs);})]);}
   catch{/* fail closed */}finally{clearTimeout(closeTimer);}
  }
 }
}
