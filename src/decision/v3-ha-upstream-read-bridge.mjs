// Narrow injected bridge to official home-assistant-js-websocket Connection.
// No package import or network connection here. The owner of `connection`
// must independently verify TLS, credentials and origin before any live use.
import {inspectHaRegistryReadOnly} from './v3-ha-registry-read-adapter.mjs';
const TYPES=new Set(['config/entity_registry/list','config/device_registry/list','config/area_registry/list']);
export async function inspectViaUpstreamConnection({connection,timeoutMs=5000,maxEntries=10000}={}){
 const fail=reason=>({ready:false,authorization:false,reason});
 if(!connection||typeof connection.sendMessagePromise!=='function')return fail('invalid_upstream_connection');
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
   return result;
  },
 });
}
