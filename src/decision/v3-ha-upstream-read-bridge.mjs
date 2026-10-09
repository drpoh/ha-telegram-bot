// Narrow injected bridge to official home-assistant-js-websocket Connection.
// No package import or network connection here. The owner of `connection`
// must independently verify TLS, credentials and origin before any live use.
import {inspectHaRegistryReadOnly} from './v3-ha-registry-read-adapter.mjs';
const TYPES=new Set(['config/entity_registry/list','config/device_registry/list','config/area_registry/list']);
export async function inspectViaUpstreamConnection({connection,timeoutMs=5000,maxEntries=10000}={}){
 const fail=reason=>({ready:false,authorization:false,reason});
 if(!connection||typeof connection.sendMessagePromise!=='function')return fail('invalid_upstream_connection');
 return inspectHaRegistryReadOnly({
  timeoutMs,maxEntries,
  request:async command=>{
   if(!command||Object.keys(command).length!==1||!TYPES.has(command.type))throw Error('non_registry_command');
   return connection.sendMessagePromise({type:command.type});
  },
 });
}
