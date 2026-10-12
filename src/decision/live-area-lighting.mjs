import { resolveLiveStrictArea } from '../home/live-strict-area.mjs';
import { loadLightingClassification, resolveReviewedClassification } from './lighting-classification.mjs';
import { discoverAreaTargets } from './area-target-discovery.mjs';

// Read-only orchestration: live HA identity -> locally reviewed map -> live HA inventory.
// Never accepts entity lists supplied by the AI model; never calls ha_call_service.
export async function verifyLiveAreaLighting({areaQuery, configPath, callTool}={}) {
  if(typeof callTool!=='function') return {allowed:false,status:'invalid_discovery_request'};
  const resolved=await resolveLiveStrictArea({query:areaQuery,callTool});
  if(!resolved.ok) return {allowed:false,status:resolved.status};
  const loaded=await loadLightingClassification({path:configPath});
  if(!loaded.ok) return {allowed:false,status:loaded.status};
  const reviewed=resolveReviewedClassification(loaded,resolved.area.area_id,resolved.area.name);
  if(!reviewed.ok) return {allowed:false,status:reviewed.status};
  const c=reviewed.classification;
  const discovered=await discoverAreaTargets({
    areaId:c.areaId,areaName:c.areaName,lightIds:c.lightIds,
    excludedLightIds:c.excludedLightIds,switchLightIds:c.switchLightIds,callTool,
  });
  if(!discovered.allowed) return {allowed:false,status:discovered.status};
  return {allowed:true,status:'verified_read_only',areaId:c.areaId,areaName:c.areaName,entityIds:discovered.entityIds};
}
