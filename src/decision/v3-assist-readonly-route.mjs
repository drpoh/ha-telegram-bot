import {createIsolatedAssistAdapter} from './v3-isolated-assist-adapter.mjs';
import {verifySatelliteRegistryBinding} from './v3-satellite-registry-binding.mjs';
import {verifyAssistReadTarget} from './v3-assist-target-registry.mjs';
import {checkV3ToolBoundary} from './v3-tool-boundary.mjs';

// Offline/read-only route; a trusted transport must supply satelliteId. No actuator path.
export function createAssistReadonlyRoute({knownSatellites=[],review,registrySnapshot,entityRegistrySnapshot,clock=Date.now,readTool}={}){
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
   const target=verifyAssistReadTarget({snapshot:entityRegistrySnapshot,entityId,areaId:binding.areaId,now:clock()});
   if(!target.allowed)return {status:'denied',reason:target.reason};
   if(typeof readTool!=='function')return {status:'denied',reason:'no_read_client'};
   // Binding verifies the satellite's identity/area, not the target's authorization.
   // Return a review plan only: HA entity target must be verified separately.
   return {status:'review',reason:'read_plan_only_not_executed',
    source:'assist',satelliteId,deviceId:binding.deviceId,areaId:binding.areaId,
    requestedTool:toolName,entityId};
  },
 });
}
