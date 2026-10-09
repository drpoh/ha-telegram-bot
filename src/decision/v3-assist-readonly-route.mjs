import {createIsolatedAssistAdapter} from './v3-isolated-assist-adapter.mjs';
import {verifySatelliteRegistryBinding} from './v3-satellite-registry-binding.mjs';
import {checkV3ToolBoundary} from './v3-tool-boundary.mjs';

// Offline/read-only route; a trusted transport must supply satelliteId. No actuator path.
export function createAssistReadonlyRoute({knownSatellites=[],review,registrySnapshot,clock=Date.now,readTool}={}){
 const adapter=createIsolatedAssistAdapter({knownSatellites,clock});
 return Object.freeze({
  async handle({satelliteId,transcript,toolName='ha_get_state',entityId}={}){
   const ingress=adapter.receive({satelliteId,transcript});
   if(!ingress.accepted)return {status:'denied',reason:'invalid_ingress'};
   const binding=verifySatelliteRegistryBinding({review,satelliteId,snapshot:registrySnapshot,now:clock()});
   if(!binding.allowed)return {status:'denied',reason:binding.reason};
   if(toolName!=='ha_get_state' || typeof entityId!=='string' || !/^light\.[a-z0-9_]+$/.test(entityId))
    return {status:'denied',reason:'read_scope_only'};
   if(!checkV3ToolBoundary({name:toolName,args:{entity_id:entityId}}).allowed)
    return {status:'denied',reason:'tool_boundary'};
   if(typeof readTool!=='function')return {status:'denied',reason:'no_read_client'};
   // Binding verifies the satellite's identity/area, not the target's authorization.
   // Return a review plan only: HA entity target must be verified separately.
   return {status:'review',reason:'target_registry_authorization_required',
    source:'assist',satelliteId,deviceId:binding.deviceId,areaId:binding.areaId,
    requestedTool:toolName,entityId};
  },
 });
}
