import { verifyLiveAreaLighting } from "./live-area-lighting.mjs";
import { authorizeConfirmedAction } from "./confirmed-action-gate.mjs";

// Never trust caller-provided allowed entity arrays. The trusted, local reviewed
// map and live HA inventory are resolved again for each confirmation attempt.
// Preview/test-only: not connected to the running Telegram agent.
export async function authorizeConfirmedAreaLight({
 action,actor,expectedAction,policy,areaQuery,configPath,callTool,
 maxEvidenceDurationMs=5000,now=Date.now,
}={}){
 const deny=status=>({allowed:false,status});
 if(typeof areaQuery!=="string" || !areaQuery.trim() || typeof configPath!=="string" ||
    typeof callTool!=="function" || typeof now!=="function" ||
    !Number.isFinite(maxEvidenceDurationMs) || maxEvidenceDurationMs<=0 || maxEvidenceDurationMs>30000)
   return deny("untrusted_scope_request");
 const begin=now();
 const checkedTool=async(name,args)=>{
  if(now()-begin>maxEvidenceDurationMs)throw Error("scope_expired");
  const result=await callTool(name,args);
  if(now()-begin>maxEvidenceDurationMs)throw Error("scope_expired");
  return result;
 };
 let evidence;
 try{
  evidence=await verifyLiveAreaLighting({areaQuery,configPath,callTool:checkedTool});
 }catch{return deny("scope_lookup_failed");}
 if(now()-begin>maxEvidenceDurationMs)return deny("scope_expired");
 if(evidence?.allowed!==true || evidence.status!=="verified_read_only")
  return deny(evidence?.status||"scope_unverified");
 // Until individual-light request intent is separately verified, only a scene
 // with exactly one classified eligible light may be authorized in this fixture.
 if(evidence.entityIds?.length!==1 || evidence.entityIds[0]!==action?.args?.entity_id)
   return deny("scope_target_mismatch");
 const readState=id=>checkedTool("ha_get_state",{entity_id:id});
 const result=await authorizeConfirmedAction({
  action,actor,expectedAction,policy,allowedEntityIds:[...evidence.entityIds],readState,
 });
 if(now()-begin>maxEvidenceDurationMs)return deny("scope_expired");
 return result;
}
