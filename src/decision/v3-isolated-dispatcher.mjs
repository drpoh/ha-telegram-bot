import {queueConfirmedAction} from "../utils/queue.mjs";
import {checkV3ToolBoundary} from "./v3-tool-boundary.mjs";
import {authorizeConfirmedAreaLight} from "./trusted-confirmed-area.mjs";
import {verifyConfirmedLightResult} from "./confirmed-result-verification.mjs";

// Test/reference adapter only; intentionally NOT connected to the live bot.
// No caller-supplied authorized:boolean, allowedEntityIds, or arbitrary tool name.
export function createIsolatedV3ConfirmationDispatcher({
 trustedPolicy,reviewedConfigPath,originalUserText,areaQuery,
 discoverTool,simulatedService,now,
}={}){
 if(typeof discoverTool!=="function" || typeof simulatedService!=="function")
  throw Error("missing_isolated_dependencies");
 return async function dispatch({userId,chatId}={}){
  return queueConfirmedAction({userId,chatId},{
   authorize:async(action,actor)=>{
    if(!checkV3ToolBoundary({name:action?.name,args:action?.args}).allowed)return false;
    const result=await authorizeConfirmedAreaLight({
     action,expectedAction:action,actor,policy:trustedPolicy,
     userText:originalUserText,areaQuery,configPath:reviewedConfigPath,
     callTool:discoverTool,now,
    });
    return result.allowed===true;
   },
   execute:async(name,args)=>{
    const action={name,args};
    if(!checkV3ToolBoundary(action).allowed)return {isError:true,verification:{status:"failed"}};
    const serviceResult=await simulatedService(name,args);
    const verification=await verifyConfirmedLightResult({
     action,serviceResult,
     readState:entity_id=>discoverTool("ha_get_state",{entity_id}),
    });
    return {serviceResult,verification:{status:verification.verified?"confirmed":
      verification.status==="service_not_accepted"?"failed":"pending",detail:verification.status}};
   },
  });
 };
}
