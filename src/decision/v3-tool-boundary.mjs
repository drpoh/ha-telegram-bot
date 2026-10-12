import {checkHaIndependence} from "./ha-independence-guard.mjs";

// V3-only execution perimeter. Do not install over the running v2 executor.
// Unlisted MCP tools, including all ha_config_* mutators, are denied.
const READ_TOOLS=new Set(["ha_search","ha_get_state","ha_get_overview","ha_list_floors_areas"]);
export function checkV3ToolBoundary({name,args}={}){
 if(typeof name!=="string")return {allowed:false,status:"unknown_tool"};
 if(READ_TOOLS.has(name))return {allowed:true,status:"read_only"};
 if(name!=="ha_call_service")return {allowed:false,status:"tool_not_allowlisted"};
 const independent=checkHaIndependence({name,args});
 if(!independent.allowed)return independent;
 if(args?.domain!=="light" || !["turn_on","turn_off"].includes(args?.service) ||
   typeof args?.entity_id!=="string" || !/^light\.[a-z0-9_]+$/.test(args.entity_id) ||
   Object.keys(args).some(key=>!["domain","service","entity_id"].includes(key)))
  return {allowed:false,status:"service_not_allowlisted"};
 // A boundary pass is not authorization: independent actor/policy and HA target
 // preconditions must also pass before any approved execution.
 return {allowed:true,status:"eligible_for_separate_authorization"};
}
export async function callV3GuardedTool({name,args,callTool,authorized=false}={}){
 const check=checkV3ToolBoundary({name,args});
 if(!check.allowed)return {status:"denied",reason:check.status};
 if(name==="ha_call_service" && authorized!==true)
  return {status:"denied",reason:"authorization_required"};
 if(typeof callTool!=="function")return {status:"denied",reason:"missing_tool_client"};
 return callTool(name,args);
}
