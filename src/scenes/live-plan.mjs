import { planAiScene } from "./planner.mjs";
import { verifyLiveAreaLighting } from "../decision/live-area-lighting.mjs";

// Read-only preview: a scene never grants permission to execute.
export async function verifyScenePlan({scene,areaQuery,configPath,callTool,maxReadDurationMs=5000,now=Date.now}={}){
 if(typeof callTool!=="function" || typeof now!=="function" || !Number.isFinite(maxReadDurationMs) || maxReadDurationMs<=0 || maxReadDurationMs>30000 || !scene || !Array.isArray(scene.entities))
  return {ok:false,status:"invalid_scene_request",actions:[]};
 // For now only lights have a trusted reviewed per-installation classification.
 // Fail closed on all other domains instead of assuming area membership.
 if(scene.entities.some(e=>typeof e?.entity_id!=="string" || !e.entity_id.startsWith("light.")))
  return {ok:false,status:"unsupported_scene_membership",actions:[]};
 const started=now();
 const timedRead=async(name,args)=>{
  if(now()-started>maxReadDurationMs) throw Error("Read-only evidence expired");
  const result=await callTool(name,args);
  if(now()-started>maxReadDurationMs) throw Error("Read-only evidence expired");
  return result;
 };
 const evidence=await verifyLiveAreaLighting({areaQuery,configPath,callTool:timedRead});
 if(now()-started>maxReadDurationMs) return {ok:false,status:"scene_evidence_expired",actions:[]};
 if(!evidence.allowed) return {ok:false,status:evidence.status,actions:[]};
 const plan=planAiScene(scene,{expectedAreaId:evidence.areaId});
 if(!plan.ok) return plan;
 const approved=new Set(evidence.entityIds);
 if(plan.actions.some(action=>!approved.has(action.args.entity_id)))
  return {ok:false,status:"scene_entity_out_of_scope",actions:[]};
 if(now()-started>maxReadDurationMs) return {ok:false,status:"scene_evidence_expired",actions:[]};
 return {...plan,status:"verified_read_only_plan_not_authorized"};
}
