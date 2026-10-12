import { evaluatePolicy, AUTONOMY_LEVELS } from "../policy/engine.mjs";
import { checkActionPreconditions, PRECONDITION_STATUS } from "./preconditions.mjs";

// Strict reference gate for isolated confirmation tests only.
// No HA service execution, policy loading, or confirmation consumption.
export async function authorizeConfirmedAction({
 action, actor, expectedAction, policy, allowedEntityIds, readState,
} = {}) {
 const denied=(status)=>({allowed:false,status});
 if(!actor || actor.userId==null || actor.chatId==null) return denied("missing_actor");
 if(!action || action.name!=="ha_call_service" || !action.args ||
    action.args.domain!=="light" ||
    !["turn_on","turn_off"].includes(action.args.service) ||
    typeof action.args.entity_id!=="string" ||
    !/^light\.[a-z0-9_]+$/.test(action.args.entity_id))
   return denied("unsupported_action");
 if(!expectedAction || expectedAction.name!==action.name ||
    JSON.stringify(expectedAction.args)!==JSON.stringify(action.args))
   return denied("action_changed");
 if(!Array.isArray(allowedEntityIds) || allowedEntityIds.length!==1 ||
    allowedEntityIds[0]!==action.args.entity_id) return denied("scope_unverified");
 if(!policy || typeof policy!=="object") return denied("missing_policy");
 const p=evaluatePolicy({
   action:"light."+action.args.service,
   policyKey:action.args.entity_id,
   args:action.args,
 },policy);
 // A confirmation must satisfy an explicit CONFIRM level. Never treat
 // a previous consent as permission for a changed/denied/autonomous action.
 if(p.level!==AUTONOMY_LEVELS.CONFIRM || p.serviceAllowed!==true)
   return denied("policy_not_confirmable");
 const strictReadState=async(entityId)=>{
  if(typeof readState!=="function") throw Error("Missing state reader");
  const response=await readState(entityId);
  const content=response?.structuredContent ?? response;
  const data=content?.data ?? content;
  if(data?.entity_id!==entityId || !["on","off"].includes(data?.state))
    throw Error("Unverified state identity");
  return {data:{entity_id:data.entity_id,state:data.state}};
 };
 const pre=await checkActionPreconditions({...action.args,readState:strictReadState});
 if(pre.status!==PRECONDITION_STATUS.READY || pre.allowed!==true)
   return denied("preconditions_not_ready");
 return {allowed:true,status:"authorized_pre_execution_only"};
}
