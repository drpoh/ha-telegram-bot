import { authorizeAiSceneOperation } from './authorization.mjs';
import { discoverSceneAreaEntities } from './area-membership.mjs';

// Builds a permission decision for a proposed scene operation. Pure apart from
// injected read-only discovery; does not dispatch scene mutations or device calls.
export async function planAiSceneOperation({
 toolName, args={}, source, area, scene=null, callTool
}={}) {
 const core={toolName,args,source,area,scene};
 if(toolName!=='ai_scene_run') return authorizeAiSceneOperation(core);
 if(source!=='user_explicit') return {allowed:false,status:'explicit_user_required'};
 if(!area?.area_id || !scene || scene.area_id!==area.area_id)
   return {allowed:false,status:'scene_not_in_area'};
 const discovery=await discoverSceneAreaEntities(area.area_id,callTool);
 if(!discovery.allowed) return {allowed:false,status:discovery.status};
 return authorizeAiSceneOperation({...core,verifiedAreaEntityIds:discovery.ids});
}
